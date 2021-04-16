$(document).ready(function () {
    initLocalNames()
});

function initLocalNames() {
   $("#header-text").text(chrome.i18n.getMessage("saved_group_title"))
}