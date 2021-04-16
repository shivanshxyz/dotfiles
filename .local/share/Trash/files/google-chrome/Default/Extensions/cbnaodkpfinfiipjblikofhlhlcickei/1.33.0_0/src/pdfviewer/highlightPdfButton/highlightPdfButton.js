var HighlightPdfButton = function (wrapperId) {
  this._BUTTON_ID = "gistnote-highlight-pdf-button";
  this._BUTTON_HTML = "src/pdfviewer/highlightPdfButton/highlight-pdf-button.html";
  this._VIEWER_URL = chrome.extension.getURL("src/pdfviewer/web/viewer.html");
  this._$buttonEl = null;

  if (!$("#" + this._BUTTON_ID).length) {
    var buttonWrapper = $("<div>", {
      id: this._BUTTON_ID,
    });
    buttonWrapper.appendTo(wrapperId);
    buttonWrapper.load(
      chrome.extension.getURL(this._BUTTON_HTML),
      function () {
        this._$buttonEl = $(".switch-pdf-viewer-button");
        this._bindEvents();
      }.bind(this)
    );
  }
};

HighlightPdfButton.prototype = {
  _getViewerURL: function (pdf_url) {
    return this._VIEWER_URL + "?file=" + pdf_url;
  },

  _buttonClickListener: function () {
    chrome.storage.local.get("onboarding", function (val) {
      chrome.storage.local.set({
        onboarding: Object.assign({}, val, { pdfArrow: true }),
      });
    });
    MessageSender.sendOpenPdfViewerMessage();
  },

  _bindEvents: function () {
    this._$buttonEl.on("click.weava", this._buttonClickListener.bind(this));
  },

  show: function () {
    if (!this._$buttonEl || !this._$buttonEl[0]) {
      console.warn("PDF button not exist");
      return;
    }
    this._$buttonEl[0].style.setProperty("display", "block", "important");
  },

  hide: function () {
    if (!this._$buttonEl || !this._$buttonEl[0]) {
      console.warn("PDF button not exist");
      return;
    }
    // this._$buttonEl[0].style.setProperty('display', 'none', 'important');
  },
};
