var UrlUtil = {
  _EXTENSION_VIEWER_URL:
    "chrome-extension://cbnaodkpfinfiipjblikofhlhlcickei/src/webviewer/gistnoteWebViewer.html?url=",

  _onboardingPages: [
    "localhost:3000/app/onboarding",
    "localhost:3000/onboarding",
    "localhost:4200/app/onboarding",
    "www.weavatools.com/app/onboarding",
    "dev.weavatools.com/app/onboarding",
    "testing.weavatools.com/app/onboarding",
    "testing.weavatools.com/onboarding",
    "staging.weavatools.com/app/onboarding",
  ],
  _WEBAPP: "&webapp=true",
  EXTENSION_PDF_VIEWER_URL: "chrome-extension://cbnaodkpfinfiipjblikofhlhlcickei/src/pdfviewer/web/viewer.html?file=",

  buildMatchString: function (pageUrl, options) {
    var u = purl(pageUrl),
      host = u.attr("host");

    if (!options) {
      // defaults
      options = {
        scheme: true,
        query: true,
        fragment: false,
      };
    }

    // shortcut - basically the match is the entire url
    if (options.scheme && options.query && options.fragment) {
      return pageUrl;
    }
    var port = u.attr("port"),
      query = u.attr("query"),
      fragment = u.attr("fragment");
    var match = options.scheme ? u.attr("protocol") + "://" : "";
    match += host;

    // [:80]
    if (port && port.length !== 0) {
      match += ":" + port;
    }
    // /mini
    match += u.attr("path");
    // [?q=123]
    if (options.query && query && query.length !== 0) {
      match += "?" + query;
    }
    if (!options.query && options.firstQueryOnly && query.length !== 0) {
      match += "?" + query.split("&")[0];
    }
    // [#something]
    if (options.fragment && fragment && fragment.length !== 0) {
      match += "#" + fragment;
    }
    return match;
  },

  /**
   * Get the original url of a website by striping off
   *  1. the extension frame viewer if it exist (e.g. when extension is loaded in
   *  WebApp frame viewer)
   *  2. the fragment part (i.e. #something) of the website url
   *
   * Note: It will NOT stripe off the pdf viewer part
   *
   * @param url
   * @returns {*}
   */
  getOriginalUrl: function (url) {
    if (!url) return url;
    var gistUrl = url.split(this._EXTENSION_VIEWER_URL).pop();
    if (gistUrl.indexOf("washingtonpost") !== -1) {
      return this.buildMatchString(gistUrl, {
        scheme: true,
        query: false,
        fragment: false,
      });
    } else if (gistUrl.indexOf("chrome-extension://") === -1) {
      return this.buildMatchString(gistUrl, {
        scheme: true,
        query: false,
        firstQueryOnly: true,
        fragment: false,
      });
    } else {
      return this.buildMatchString(gistUrl);
    }
  },

  getOriginalUrlForPDF: function (url) {
    if (!url) return url;
    var weavaURL = this.getOriginalUrl(url);
    if (weavaURL.indexOf(this.EXTENSION_PDF_VIEWER_URL) === 0) {
      var urlObj = new URL(weavaURL);
      var fileParam = urlObj.searchParams.get("file");
      if (
        weavaURL.indexOf(this._WEBAPP) > 0 &&
        fileParam.length !== 0 &&
        fileParam.indexOf("weavatools.com") !== -1 &&
        fileParam.indexOf("pdfstorage") !== -1
      ) {
        return this.EXTENSION_PDF_VIEWER_URL + fileParam.split("?token")[0];
      } else if (/file:[\/]+/i.test(weavaURL)) {
        var fileUrl = weavaURL.split("?file=")[1].replace("&webapp=true", "");
        if (fileParam.length < fileUrl.length) {
          return this.EXTENSION_PDF_VIEWER_URL + fileUrl;
        }
      }
      return this.EXTENSION_PDF_VIEWER_URL + fileParam;
    }
    return weavaURL;
  },

  isOnboardingPage: function (url) {
    var domain = this.buildMatchString(url, {
      scheme: false,
      query: true,
      fragment: false,
    });

    for (var i = 0; i < this._onboardingPages.length; i++) {
      var page = this._onboardingPages[i];

      // domain starts with target sites (instead of including in the middle)
      if (domain.indexOf(page) === 0) {
        return true;
      }
    }
    return false;
  },
};
