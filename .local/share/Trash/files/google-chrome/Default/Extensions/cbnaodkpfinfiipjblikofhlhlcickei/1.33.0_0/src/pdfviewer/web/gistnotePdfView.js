// scroll -> toolbar hides
var didScroll;
var lastScrollTop = 0;
var delta = 5; // scroll difference

var viewerContainerListener = function (e) {
  didScroll = true;
};

var cancelDropdownMenuListener = function ($checkbox, $dropdownMenu) {
  $checkbox.prop("checked", false);
  $dropdownMenu.removeClass("dropdown-menu-show");
};

var scrollChecker = function (
  $toolbar,
  navbarHeight,
  $scrollContainer,
  $outlineCheckbox,
  $outlineDropdownMenu,
  $gistnoteAccountCheckbox,
  $gistnoteAccountDropdownMenu
) {
  var _hasScrolledHelper = function ($toolbar, navbarHeight, $scrollContainer) {
    var st = $scrollContainer.scrollTop();

    if (Math.abs(lastScrollTop - st) <= delta) {
      return;
    }

    if (st > lastScrollTop && st > navbarHeight) {
      $toolbar.addClass("toolbar-move-up");
      cancelDropdownMenuListener($outlineCheckbox, $outlineDropdownMenu);
      cancelDropdownMenuListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    } else {
      $toolbar.removeClass("toolbar-move-up");
    }

    lastScrollTop = st;
  };

  if (didScroll) {
    _hasScrolledHelper($toolbar, navbarHeight, $scrollContainer);
    didScroll = false;
  }
};

var dropdownButtonListener = function ($dropdownCheckbox, $dropdownMenu) {
  var checked = !$dropdownCheckbox.is(":checked"); // checkbox not updated yet
  if (checked) {
    $dropdownMenu.addClass("dropdown-menu-show");
    return;
  }
  $dropdownMenu.removeClass("dropdown-menu-show");
};

// from viewer.js
var _getPDFFileNameFromURL = function (url) {
  var reURI = /^(?:([^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/;
  var reFilename = /[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i;
  var splitURI = reURI.exec(url);
  var suggestedFilename = reFilename.exec(splitURI[1]) || reFilename.exec(splitURI[2]) || reFilename.exec(splitURI[3]);
  if (suggestedFilename) {
    suggestedFilename = suggestedFilename[0];
    if (suggestedFilename.indexOf("%") !== -1) {
      try {
        suggestedFilename = reFilename.exec(decodeURIComponent(suggestedFilename))[0];
      } catch (e) {}
    }
  }
  return suggestedFilename || "document.pdf";
};

var displayTitleURL = function ($documentTitle, url) {
  $documentTitle.text(_getPDFFileNameFromURL(url));
};

var toggleSidebarButtonListener = function ($toggleSidebarButtonCheckbox, $sidebarOuterContainer) {
  var checked = !$toggleSidebarButtonCheckbox.is(":checked");
  if (checked) {
    $sidebarOuterContainer.addClass("sidebarOpen");
    return;
  }
  $sidebarOuterContainer.removeClass("sidebarOpen");
};

var mousePositionToolBarPositionListener = function (e, $toolbar) {
  if (e.clientY < 50) {
    $toolbar.removeClass("toolbar-move-up");
  }
};

var openDefaultPDFViewer = function () {
  if (location.search.indexOf("weavatools.com") !== -1 && location.search.indexOf("pdfstorage") !== -1) {
    alert("Weava Hosted PDF can only be viewed with our PDF viewer.");
    return;
  }
  var url = location.search.replace("?file=", "");
  url += "?forcedefault=true";
  MessageSender.sendOpenWITHDefaultPdfViewerMessage(url);
};

var disableGistnotePDFViewer = function () {
  MessageSender.sendHighlightModeSettings({
    pdf: false,
  });
  location.href = location.search.replace("?file=", "");
};

var enableGistnotePDFViewer = function () {
  MessageSender.sendHighlightModeSettings({
    pdf: true,
    highlighter: null,
  });
};

var loadPdfFromGistnote = function (checked) {
  if (checked) enableGistnotePDFViewer();
  else disableGistnotePDFViewer();
};

var initPDFCheckBox = function (autoPdf) {
  try {
    $("#pdf-highlight-mode").prop("checked", autoPdf);
  } catch (e) {
    Logger.warn("Fail to get Pdf Highlight Mode.", e);
  }
};

$(function () {
  // navbar disappear on scroll
  var $toolbar = $("#toolbar");
  var navbarHeight = $toolbar.outerHeight();
  var $scrollContainer = $("#viewerContainer");
  var $outlineCheckbox = $("#outline-checkbox");
  var $outlineButtonWrapper = $("#outline-button-wrapper");
  var $outlineDropdownMenu = $("#outline-dropdown-menu");
  var $documentTitle = $("#document-title");
  var url = document.URL;
  var $toggleSidebarButtonCheckbox = $("#toggle-sidebar-button-checkbox");
  var $sidebarOuterContainer = $("#outerContainer");
  var $gistnoteAccountCheckbox = $("#gistnote-account-checkbox");
  var $pdfHighlightModeCheckbox = $("#pdf-highlight-mode");
  var $gistnoteAccountButtonWrapper = $("#gistnote-account-button-wrapper");
  var $gistnoteAccountDropdownMenu = $("#gistnote-account-dropdown-menu");
  var $gistnotePrintButtonWrapper = $("#gistnote-print-button-wrapper");
  var $gistnotePrintDropdownMenu = $("#gistnote-print-dropdown-menu");
  var $gistnoteDownloadButtonWrapper = $("#download-button");
  var $gistnoteDownloadDropdownMenu = $("#gistnote-download-dropdown-menu");
  var $gistnotePrintCheckBox = $("#print-checkbox");
  var $gistnoteDownloadCheckBox = $("#download-checkbox");
  var $printPDF = $("#print-origin-button");
  var $viewer = $("#viewer");

  displayTitleURL($documentTitle, url);

  $scrollContainer.scroll(viewerContainerListener);

  setInterval(function () {
    scrollChecker(
      $toolbar,
      navbarHeight,
      $scrollContainer,
      $outlineCheckbox,
      $outlineDropdownMenu,
      $gistnoteAccountCheckbox,
      $gistnoteAccountDropdownMenu
    );
  }, 250);

  $outlineButtonWrapper.mouseup(function () {
    dropdownButtonListener($outlineCheckbox, $outlineDropdownMenu);
    cancelDropdownMenuListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    cancelDropdownMenuListener($gistnotePrintCheckBox, $gistnotePrintDropdownMenu);
    cancelDropdownMenuListener($gistnoteDownloadCheckBox, $gistnoteDownloadDropdownMenu);
  });

  $gistnoteAccountButtonWrapper.mouseup(function () {
    dropdownButtonListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    cancelDropdownMenuListener($outlineCheckbox, $outlineDropdownMenu);
    cancelDropdownMenuListener($gistnotePrintCheckBox, $gistnotePrintDropdownMenu);
    cancelDropdownMenuListener($gistnoteDownloadCheckBox, $gistnoteDownloadDropdownMenu);
  });

  $gistnotePrintButtonWrapper.mouseup(function () {
    dropdownButtonListener($gistnotePrintCheckBox, $gistnotePrintDropdownMenu);
    cancelDropdownMenuListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    cancelDropdownMenuListener($gistnoteDownloadCheckBox, $gistnoteDownloadDropdownMenu);
  });

  $gistnoteDownloadButtonWrapper.mouseup(function () {
    dropdownButtonListener($gistnoteDownloadCheckBox, $gistnoteDownloadDropdownMenu);
    cancelDropdownMenuListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    cancelDropdownMenuListener($gistnotePrintCheckBox, $gistnotePrintDropdownMenu);
  });

  // outline dropdown menu disappears as user clicks outside of dropdown
  $viewer.mouseup(function () {
    cancelDropdownMenuListener($outlineCheckbox, $outlineDropdownMenu);
    cancelDropdownMenuListener($gistnotePrintCheckBox, $gistnotePrintDropdownMenu);
    cancelDropdownMenuListener($gistnoteAccountCheckbox, $gistnoteAccountDropdownMenu);
    cancelDropdownMenuListener($gistnoteDownloadCheckBox, $gistnoteDownloadDropdownMenu);
  });

  $toggleSidebarButtonCheckbox.mouseup(function () {
    toggleSidebarButtonListener($toggleSidebarButtonCheckbox, $sidebarOuterContainer);
  });

  $(document).mousemove(function (e) {
    mousePositionToolBarPositionListener(e, $toolbar);
  });

  $("#open-default-viewer").mouseup(function () {
    openDefaultPDFViewer();
  });

  $("#error-open-default-viewer").mouseup(function () {
    disableGistnotePDFViewer();
  });

  $printPDF.on("mouseup", function (e) {
    if (!PDFViewerApplication.appConfig.isInsideWebApp) {
      Logger.debug("Print original PDF");
      PDFViewerApplication.pdfDocument.getData().then(function (res) {
        var b = URL.createObjectURL(new Blob([res], { type: "application/pdf" }));
        var printFrame = document.getElementById("print-iframe");
        printFrame.src = b;
        setTimeout(function () {
          printFrame.contentWindow.print();
          // ...dispose iframe and blob.
        }, 100);
      });
    } else {
      Logger.debug("Print original PDF from Web App");
      MessageSender.sendToWebAppAction("print");
    }
  });

  // $('#disable-pdf-viewer').mousedown(function () {
  //   disableGistnotePDFViewer();
  // });

  $pdfHighlightModeCheckbox.on("click", function (e) {
    e.preventDefault();
  });

  $("#load-pdf-from-gistnote").on("click", function (e) {
    var checked = !$pdfHighlightModeCheckbox[0].checked;
    $pdfHighlightModeCheckbox.prop("checked", checked);
    loadPdfFromGistnote(checked);
  });
});
