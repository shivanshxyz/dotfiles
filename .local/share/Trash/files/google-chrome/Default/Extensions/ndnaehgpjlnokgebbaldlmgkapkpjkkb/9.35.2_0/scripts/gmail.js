
(function () {
    'use strict';

    var inject = document.createElement('script');

    inject.src = chrome.extension.getURL('scripts/bundles/gmail.inject.bundle.js');
    inject.onload = function() {
        this.remove();
    };

    document.documentElement.appendChild(inject);
}());
