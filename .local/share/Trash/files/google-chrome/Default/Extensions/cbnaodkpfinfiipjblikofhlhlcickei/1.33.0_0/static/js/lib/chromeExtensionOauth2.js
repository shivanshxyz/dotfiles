ChromeExtensionOauth2 = {};

ChromeExtensionOauth2.GoogleProvider = function () {
  this.options = {
    response_type: null,
    client_id: null,
    scope: null,
    redirect_uri: null,
    nonce: null,
    state: null,
    prompt: null,
    login_hint: null,
    include_granted_scopes: null,
  };
};

ChromeExtensionOauth2.GoogleProvider.prototype.set = function (key, value) {
  this.options[key] = value;
};

ChromeExtensionOauth2.GoogleProvider.prototype.buildUrl = function () {
  var url = "https://accounts.google.com/o/oauth2/v2/auth";
  var keyCount = 0;
  for (var key in this.options) {
    if (this.options[key] === null) continue;
    keyCount++;
    if (keyCount === 1) {
      url += "?" + key + "=" + this.options[key] + "&";
    } else if (keyCount === Object.keys(this.options).length) {
      url += "?" + key + "=" + this.options[key];
    } else {
      url += key + "=" + this.options[key] + "&";
    }
  }
  return url;
};

ChromeExtensionOauth2.showLoginWindowWithProvider = function (provider, callBack, cancelCallBack) {
  var url = provider.buildUrl();
  console.info(url);
  chrome.identity.launchWebAuthFlow({ url: url, interactive: true }, function (redirect_url) {
    if (redirect_url) {
      var matches = redirect_url.match(/access_token=([^&]*)/);
      var access_token = matches[1];
      callBack(access_token);
    } else {
      cancelCallBack();
    }
  });
};
