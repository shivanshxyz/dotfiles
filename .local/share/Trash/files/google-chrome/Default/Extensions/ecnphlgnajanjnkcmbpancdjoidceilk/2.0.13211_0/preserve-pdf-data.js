/*
Copyright 2015 Mozilla Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* globals chrome, getHeaderFromHeaders */
/* exported getReferer */

'use strict';
/**
 * This file collects request headers for every http(s) request, and temporarily
 * stores the request headers in a dictionary. Upon completion of the request
 * (success or failure), the headers are discarded.
 * pdfHandler.js will call saveReferer(details) when it is about to redirect to
 * the viewer. Upon calling saveReferer, the Referer header is extracted from
 * the request headers and saved.
 */

// Remembers the request headers for every http(s) page request for the duration
// of the request.
var g_requestHeaders = {};
// g_documentData[tabId][frameId] = referrer of PDF frame.
var g_documentData = {};

(function() {
  var requestFilter = {
    urls: ['*://*/*'],
    types: ['main_frame', 'sub_frame']
  };
  chrome.webRequest.onSendHeaders.addListener(function(details) {
    g_requestHeaders[details.requestId] = details.requestHeaders;
  }, requestFilter, ['requestHeaders', 'extraHeaders']);
  chrome.webRequest.onBeforeRedirect.addListener(forgetHeaders, requestFilter);
  chrome.webRequest.onCompleted.addListener(forgetHeaders, requestFilter);
  chrome.webRequest.onErrorOccurred.addListener(forgetHeaders, requestFilter);
  function forgetHeaders(details) {
    delete g_requestHeaders[details.requestId];
  }
})();

/**
 * @param {object} details - onHeadersReceived event data.
 * @param {boolean} saved - whether to lookup saved document data.
 */
function getReferer(details, saved) {
  return getDocumentData(details, 'referer');
}

/**
 * @param {object} details - onHeadersReceived event data.
 * @param {boolean} saved - whether to lookup saved document data.
 */
function getContentDisposition(details, saved) {
  return getDocumentData(details, 'content-disposition');
}

/**
 * @param {object} details - onHeadersReceived event data.
 * @param {string} name - the name of the piece of data to retrieve.
 * @param {boolean} saved - whether to lookup saved document data.
 */
function getDocumentData(details, name, saved) {
  if (!details.requestId) {
    var tab = g_documentData[details.tabId];
    var frame = tab && tab[details.frameId];
    return frame && frame[name];
  }

  var referer = g_requestHeaders[details.requestId] &&
      getHeaderFromHeaders(g_requestHeaders[details.requestId], name);

  return referer && referer.value;
}

/**
 * @param {object} details - onHeadersReceived event data.
 */
function saveDocumentData(details) {
  var referer = g_requestHeaders[details.requestId] &&
      getHeaderFromHeaders(g_requestHeaders[details.requestId], 'referer');
  var cd = getHeaderFromHeaders(details.responseHeaders, 'content-disposition');

  if (!g_documentData[details.tabId]) {
    g_documentData[details.tabId] = {};
  }
  g_documentData[details.tabId][details.frameId] = {
    'referer': referer && referer.value,
    'content-disposition': cd && cd.value
  };
}

chrome.tabs.onRemoved.addListener(function(tabId) {
  delete g_documentData[tabId];
});
