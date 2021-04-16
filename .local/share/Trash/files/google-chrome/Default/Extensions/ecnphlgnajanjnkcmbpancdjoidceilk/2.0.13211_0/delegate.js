// Handle messages from the background downloader
chrome.extension.onMessage.addListener(function (request) {
  if (!request || !request.background_downloader) {
    return
  }

  const event = request.background_downloader
  delete request.background_downloader

  switch (event) {
    case "progress":
      request["kami-extension-file-load-progress"] = true
      window.parent.postMessage(request, request.origin)
      break

    // This message could be passed directly to the frontend where it would download the blob URL.
    // Download the blob URL here to keep the interface to the frontend unchanged for now.
    case "loaded":
      downloadAndTransferFile(request)
      break

    case "error":
      request["kami-extension-file-load-error"] = true
      window.parent.postMessage(request, request.origin)
      break

    // Respond to pings to keep active downloads running
    case "ping":
      chrome.extension.sendMessage(chrome.runtime.id, {
        background_downloader: "pong",
        id: request.id,
      })
      break
  }
})

// This could be done by the frontend instead of the extension.
// It is done here to keep the interface to the frontend unchanged for now.
async function downloadAndTransferFile(request) {
  const response = await fetch(request.data_url)
  if (!response.ok) {
    window.parent.postMessage(
      {
        "kami-extension-file-load-error": true,
        id: request.id,
        url: request.url,
        error: `${response.status}: ${response.statusText}`,
      },
      request.origin
    )
  }

  const data = await response.arrayBuffer()

  // Tell the background page we no longer need the data url so it can be revoked
  chrome.extension.sendMessage(chrome.runtime.id, {
    background_downloader: "destroy",
    id: request.id,
  })

  // Use a message channel to transfer without copying
  const messageChannel = new MessageChannel()

  // Once the frontend is ready, send the PDF
  messageChannel.port1.onmessage = function (event) {
    if (event.data === "ready") {
      messageChannel.port1.postMessage(data, [data])
    }
  }

  // Tell the viewer the nature of the message & give them a port to communicate
  window.parent.postMessage(
    {
      "kami-extension-pdf-transfer": true,
      id: request.id,
      url: request.url,
    },
    request.origin,
    [messageChannel.port2]
  )
}

window.addEventListener("unload", function () {
  chrome.extension.sendMessage(chrome.runtime.id, { background_downloader: "window.unload" })
})
