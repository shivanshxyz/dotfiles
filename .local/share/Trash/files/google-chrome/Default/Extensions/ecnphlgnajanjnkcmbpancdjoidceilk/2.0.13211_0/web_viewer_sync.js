var autoload = localStorage.getItem("notable.settings.autoload");
var fileSchemeRequestDisabled = localStorage.getItem("notable.settings.fileSchemeRequestDisabled");
var kami_user;

try {
  kami_user = JSON.parse(localStorage.getItem('notable.user'))
} catch {}

function onSettingsUpdated(settings) {
  var keys = ['autoload', 'fileSchemeRequestDisabled'];
  for (var index in keys) {
    var key = keys[index];
    localStorage.setItem('notable.settings.' + key, settings[key]);
    window[key] = settings[key].toString();
  }
}

function onUserUpdated(user) {
  kami_user = user; 
  var user_string = JSON.stringify(user);
  localStorage.setItem('notable.user', user_string);

  // Save the session to the user store
  var chrome_storage = chrome.storage;
  if (chrome_storage != null) {
    var sync = chrome_storage.sync;
    sync.set({'notable.user': user});
  }
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (typeof request !== 'object') {
    return;
  }

  if ('settings' in request) {
    onSettingsUpdated(request['settings']);
  } else if ('user' in request) {
    onUserUpdated(request['user']);
  }
});
