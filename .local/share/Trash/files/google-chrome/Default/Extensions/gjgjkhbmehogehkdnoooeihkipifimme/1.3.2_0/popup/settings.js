$(function () {
    addOnSettingsChangeUpdateEvents();
});

function initSettingsValues() {
    if (globalSettings.ignorePinnedTabs) {
        $('#ignore-pinned-tabs').parent()[0].MaterialSwitch.on()
    }
    if (globalSettings.closeTabsOnSaveGroup) {
        $('#close-tabs-on-save').parent()[0].MaterialSwitch.on()
    }
}

function addOnSettingsChangeUpdateEvents() {
    $(".setting-change-option").on("change", function () {
        let settings = prepareSettings();
        saveSettingsToStorage(settings);
    })
}

function prepareSettings() {
    let ignorePinnedTabs = $("#ignore-pinned-tabs").prop("checked");
    let closeTabsOnSaveGroup = $("#close-tabs-on-save").prop("checked");
    return new Settings().init(ignorePinnedTabs, closeTabsOnSaveGroup);
}

function createDefaultSettings() {
    let settings = new Settings().init(true, false);
    saveSettingsToStorage(settings);
    return settings;
}