var OnBoardArrow = function (wrapperId) {
  this._ID = "gistnote-highlight-onboard-arrow";
  this._HTML = "src/pdfviewer/onboardArrow/onboardArrow.html";
  this._$arrowWrapper = null;

  chrome.storage.local.get(
    "onboarding",
    function (val) {
      var showArrow = val.onboarding ? val.onboarding.pdfArrow : null;
      if (!showArrow) {
        this._$arrowWrapper = $("<div>", {
          id: this._ID,
        }).appendTo(wrapperId);

        this._$arrowWrapper.load(
          chrome.extension.getURL(this._HTML),
          function () {
            this._bindListeners();
          }.bind(this)
        );
      }
    }.bind(this)
  );
};

OnBoardArrow.prototype._clickListener = function () {
  this._$arrowWrapper.hide();
  chrome.storage.local.get("onboarding", function (val) {
    chrome.storage.local.set({
      onboarding: Object.assign({}, val, { pdfArrow: true }),
    });
  });
};

OnBoardArrow.prototype._bindListeners = function () {
  this._$arrowWrapper.on("click", this._clickListener.bind(this));
};
