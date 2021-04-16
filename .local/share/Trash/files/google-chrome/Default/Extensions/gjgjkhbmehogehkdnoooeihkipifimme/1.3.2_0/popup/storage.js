function extractSavedGroup(chromeResult) {
    let savedGroups = [];
    if (undefined !== chromeResult.tabGroups && chromeResult.tabGroups.length > 0) {
        $.each(chromeResult.tabGroups, function (key, value) {
            savedGroups.push(new SavedGroup().init2(value.name, toLinksArray(value.links), value.order))
        });
    }
    return savedGroups;
}

function saveSettingsToStorage(settings) {
    chrome.storage.largeSync.set({"tabGroupSettings": settings}, function () {
        globalSettings = settings;
    });
}

let globalSettings;

function extractSettingsFromStorage() {
    chrome.storage.largeSync.get(["tabGroupSettings"], function (result) {
        if (undefined === result.tabGroupSettings) {
            globalSettings = createDefaultSettings()
        }
        globalSettings = result.tabGroupSettings;
    });
}

function toLinksArray(links) {
    return $.map(links, function (value) {
        return new Link().init2(value.id, value.name, value.link, value.icon, value.order);
    });
}