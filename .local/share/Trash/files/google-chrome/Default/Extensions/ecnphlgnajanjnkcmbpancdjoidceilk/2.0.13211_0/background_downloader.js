//
// Chrome event handlers
//

// Listen to messages from the frontend to start downloads
chrome.runtime.onMessageExternal.addListener(function startDownload(request, sender) {
  if (!request || !request["load-pdf-url"]) {
    return
  }

  if (!sender.tab || !sender.tab.id) {
    console.warn("Ignoring load-pdf-url request from sender with no tab id")
    return
  }

  DOWNLOADS_MANAGER.destroyOrphanedDownloads()

  const download = new Download(
    sender.tab.id,
    request["id"],
    request["load-pdf-url"],
    request["load-pdf-referer"],
    request["origin"]
  )

  DOWNLOADS_MANAGER.addDownload(download)
  download.run()
})

// Listen to messages from the content script (delegate.js)
chrome.extension.onMessage.addListener(function (request, sender) {
  if (!request || !request.background_downloader) {
    return
  }

  const event = request.background_downloader

  switch (event) {
    // Handle ping responses from the content script
    case "pong":
      console.debug(`Received '${event}'`, request.id)
      DOWNLOADS_MANAGER.onPingResponse(request.id)
      break

    // Destroy download once it has been retrieved by the content script
    case "destroy":
      console.debug(`Received '${event}'`, request.id)
      DOWNLOADS_MANAGER.destroyDownload(request.id)
      break

    // Destroy all downloads when the window unloads
    case "window.unload":
      if (!sender.tab || !sender.tab.id) {
        console.warn(`Ignoring '${event}' request from sender with no tab id`)
        return
      }

      console.log(`Received '${event}' for tab`, sender.tab.id)
      DOWNLOADS_MANAGER.destroyDownloadsForTabId(sender.tab.id)
      break
  }
})

// Destroy all downloads for a tab when it is removed.
// Note that this event is not fired when a tab crashes.
chrome.tabs.onRemoved.addListener(function (tabId) {
  console.log("Received chrome.tabs.onRemoved for tab id", tabId)
  DOWNLOADS_MANAGER.destroyDownloadsForTabId(tabId)
})

//
// Manage download jobs
//

class DownloadsManager {
  constructor() {
    this.downloads = {}
    this.totalDownloadCount = 0
  }

  addDownload(download) {
    this.downloads[download.id] = download
    this.totalDownloadCount++
  }

  destroyDownloadsForTabId(tabId) {
    for (const downloadId in this.downloads) {
      const download = this.downloads[downloadId]

      if (download.tabId === tabId) {
        this.destroyDownload(downloadId)
      }
    }
  }

  destroyOrphanedDownloads() {
    for (const downloadId in this.downloads) {
      const download = this.downloads[downloadId]

      if (download.isOrphaned) {
        this.destroyDownload(downloadId)
      }
    }
  }

  destroyDownload(downloadId) {
    const download = this.downloads[downloadId]

    if (download) {
      download.destroy()
      delete this.downloads[downloadId]
    }
  }

  onPingResponse(downloadId) {
    const download = this.downloads[downloadId]

    if (download) {
      download.pong()
    }
  }
}

const DOWNLOADS_MANAGER = new DownloadsManager()

class Download {
  constructor(tabId, id, url, referer, origin) {
    this.tabId = tabId
    this.id = id
    this.url = url
    this.referer = referer
    this.origin = origin
  }

  async run() {
    const attempts = 3

    for (let i = 1; i <= attempts; i++) {
      console.log(`Starting download attempt ${i}`, this)

      try {
        this.request = new MonitoredRequest({
          url: this.url,
          headers: this.requestHeaders,
          progressCallback: (event) => {
            this.onRequestProgress(event)
          },
        })

        const responsePromise = this.request.run()
        this.startPingTimer()
        const response = await responsePromise

        // The download should be destroyed by the caller. This is a fallback in case that does not occur.
        this.fallbackDestroyTimer = window.setTimeout(() => {
          console.warn("Fallback download destroy", this.id)
          DOWNLOADS_MANAGER.destroyOrphanedDownloads()
        }, ONE_MINUTE * 2)

        this.dataUrlCreatedAt = Date.now()
        this.dataUrl = URL.createObjectURL(response.data)

        this.sendMessageToTab({ background_downloader: "loaded", data_url: this.dataUrl })

        console.log("Download success", this.id)
        return
      } catch (error) {
        if (this.request) {
          this.request.abort()
        }

        const is403Error = error.status && error.status === 403
        const shouldRetry = i !== attempts && is403Error

        if (shouldRetry) {
          console.log(`Download attempt ${i} failed, retrying after delay ...`, error)
          await sleep(2000)
        } else {
          console.error(`Download failed after ${attempts} attempt(s)`, error, this)
          this.sendMessageToTab({ background_downloader: "error", error: error.message })
        }
      } finally {
        this.cancelPingTimer()
      }
    }
  }

  get requestHeaders() {
    const headers = {}

    // Add auth headers for GDrive files.
    const index = this.url.indexOf("&kami_gdrive_auth")
    if (index !== -1) {
      const authToken = this.url.slice(index + 18)
      headers["Authorization"] = `Bearer ${authToken}`
    }

    // We lack the permission to actually set the Referer header
    // As such, we set an intermediary header which the request manipulator in pdfHandler.js picks up
    if (this.referer) {
      headers["Kami-Referer"] = this.referer
    }

    return headers
  }

  startPingTimer() {
    this.ping()
    this.pingTimer = window.setInterval(() => this.ping(), 5000)
  }

  cancelPingTimer() {
    if (this.pingTimer === undefined) {
      return
    }

    window.clearInterval(this.pingTimer)
    delete this.firstPingAt
    delete this.lastPingAt
    delete this.lastPongAt
    delete this.pingTimer
  }

  ping() {
    if (this.isOrphaned) {
      DOWNLOADS_MANAGER.destroyOrphanedDownloads()
      return
    }

    console.debug("Ping download", this.id)

    if (!this.firstPingAt) {
      this.firstPingAt = Date.now()
    }

    this.lastPingAt = Date.now()
    this.sendMessageToTab({ background_downloader: "ping" })
  }

  pong() {
    this.lastPongAt = Date.now()
  }

  get isOrphaned() {
    // First ping sent, no response received
    if (this.firstPingAt && !this.lastPongAt && this.firstPingAt < Date.now() - ONE_MINUTE) {
      return true
    }

    // At least one ping response received, but no recent responses
    if (this.lastPingAt && this.lastPongAt && this.lastPongAt < this.lastPingAt - ONE_MINUTE) {
      return true
    }

    // Download completed, but not destroyed by caller in a reasonable timeframe
    if (this.dataUrlCreatedAt && this.dataUrlCreatedAt < Date.now() - ONE_MINUTE) {
      return true
    }

    return false
  }

  destroy() {
    console.log("Destroying download", this.id)

    if (this.request) {
      this.request.abort()
      delete this.request
    }

    this.cancelPingTimer()

    if (this.fallbackDestroyTimer !== undefined) {
      window.clearTimeout(this.fallbackDestroyTimer)
      delete this.fallbackDestroyTimer
    }

    if (this.dataUrl) {
      URL.revokeObjectURL(this.dataUrl)
      delete this.dataUrl
    }

    delete this.dataUrlCreatedAt
  }

  onRequestProgress(event) {
    this.sendMessageToTab({
      background_downloader: "progress",
      progress: {
        loaded: event.loaded,
        total: event.total,
      },
    })
  }

  sendMessageToTab(message) {
    chrome.tabs.sendMessage(this.tabId, {
      id: this.id,
      url: this.url,
      origin: this.origin,
      ...message,
    })
  }
}

class MonitoredRequest {
  constructor(options) {
    this.url = options.url
    this.headers = options.headers
    this.progressCallback = options.progressCallback
  }

  run() {
    // XMLHTTPRequest is used instead of fetch() because fetch() does not work with file:// URLs.
    this.xhr = new XMLHttpRequest()
    this.xhr.responseType = "blob"
    this.xhr.withCredentials = true

    return new Promise((resolve, reject) => {
      this.xhr.onload = () => {
        if (this.xhr.status >= 400) {
          const error = new Error(`Received ${this.xhr.status} response while loading file.`)
          error.status = this.xhr.status
          reject(error)
        } else {
          resolve({ data: this.xhr.response })
        }
      }

      this.xhr.onerror = () => {
        reject(new Error("Network error"))
      }

      this.xhr.onprogress = (event) => {
        this.progressCallback({ loaded: event.loaded, total: event.total })
      }

      this.xhr.open("GET", this.url)

      for (const key in this.headers) {
        this.xhr.setRequestHeader(key, this.headers[key])
      }

      this.xhr.send()
    })
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort()
      delete this.xhr
    }
  }
}

function sleep(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs)
  })
}

const ONE_MINUTE = 60 * 1000
