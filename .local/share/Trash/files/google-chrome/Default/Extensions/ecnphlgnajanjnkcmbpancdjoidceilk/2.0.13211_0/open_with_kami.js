chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === 'inject-open-with-kami-button') {
    var tabId = sender.tab.id;
    // Inject the classroom button CSS
    chrome.tabs.insertCSS(tabId, {file: 'notable/integrations/classroom/styles.css'}, function() {
      // Inject open with Kami button CSS
      chrome.tabs.insertCSS(tabId, {file: 'notable/viewer/open_with_kami.css'}, function() {
        // Load the HTML template to inject
        var templateUrl = chrome.runtime.getURL('notable/viewer/open_with_kami.html');

        var xhr = new XMLHttpRequest();
        xhr.onload = function(e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              sendResponse(xhr.responseText);
            }
          }
        };
        xhr.open('GET', templateUrl, true);
        xhr.send(null);
      });
    });
    return true;
  } else if (typeof request === 'object' && 'open-with-kami' in request) {
    var url = request['open-with-kami'];

    // Tab & frame id are used to grab the referer and content disposition data
    var details = {url: url, tabId: sender.tab.id, frameId: sender.frameId};
    details['referer'] = getReferer(details);
    details['content-disposition'] = getContentDisposition(details);

    // Pass the redirect URL back to the content script so it can redirect the window
    var redirectUrl = getViewerURL(details, 'extension_open_button');
    sendResponse(redirectUrl);
  }
});
