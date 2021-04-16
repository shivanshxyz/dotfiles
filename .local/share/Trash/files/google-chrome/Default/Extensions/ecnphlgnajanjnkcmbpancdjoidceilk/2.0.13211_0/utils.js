chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === 'what-is-my-tab-id') {
    sendResponse(sender.tab.id);
  }
});
