$(function () {
    initExportEvent();
    initImportEvent();
});

function initExportEvent() {
    $("#export-menu-item").on("click", function () {
        chrome.storage.largeSync.get(["tabGroups"], function (savedGroupsAsJson) {
            download("TabGroup_" + $.now() + ".json", JSON.stringify(savedGroupsAsJson))
        })
    })
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function initImportEvent() {
    let $importFileInput = $("#import-file");
    $importFileInput[0].addEventListener("change", importFile, false);
    $("#import-menu-item").on("click", function () {
        $importFileInput.click();
    });
}

function importFile(e) {
    let files = e.target.files,
        reader = new FileReader();
    reader.onload = importListener;
    reader.readAsText(files[0]);
}

function importListener() {
    let importedFile = JSON.parse(this.result);
    mergeSavedGroupExistDataWithImport(importedFile)
    $("#import-file").value = '';

}

function mergeSavedGroupExistDataWithImport(importedDataJson) {
    let importedGroupsList = extractSavedGroup(importedDataJson);
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let groupsList = extractSavedGroup(result);
        groupsList.forEach(function (group) {
            importedGroupsList.forEach(function (groupImported) {
                if (group.name === groupImported.name) {
                    groupImported.name = prepareGroupCopyName(groupImported.name);
                }
                if(groupsList.indexOf(groupImported) === -1) {
                    groupsList.push(groupImported)
                }
            });
        });
        chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {
            window.location.reload()
        })
    });
}

function prepareGroupCopyName(name) {
    let countArr = /_imported_(\d{1,3})/g.exec(name);
    if(countArr !== null && countArr.length > 0) {
        let indexString = countArr[1];
        let index = 1 + parseInt(indexString);
        return name.substr(0, name.length - indexString.length) + "" + index;
    } else {
        return "(" + name + ")_imported_1"
    }
}