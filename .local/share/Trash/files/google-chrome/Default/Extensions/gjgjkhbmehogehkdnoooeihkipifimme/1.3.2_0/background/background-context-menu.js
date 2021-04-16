chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg === "RELOAD_CONTEXT_MENU") {
            refreshContextMenu()
        }
    });
});
let parentContextMenu = chrome.contextMenus.create({
    title: "Add to group",
    contexts: ["page", "link"],  // ContextType
});
let contextMenuChild = [];
refreshContextMenu();

function refreshContextMenu() {
    chrome.storage.largeSync.get(["tabGroups"], function (chromeResult) {
        contextMenuChild.forEach(function (child) {
            chrome.contextMenus.remove(child);
        });
        contextMenuChild = [];
        if (undefined !== chromeResult.tabGroups && chromeResult.tabGroups.length > 0) {
            chromeResult.tabGroups.forEach(function (elem) {
                contextMenuChild.push(
                    chrome.contextMenus.create({
                        "title": elem.name,
                        "parentId": parentContextMenu,
                        "onclick": function (tab, link) {
                            addNewLinkToGroup(
                                {
                                    name: link.title,
                                    link: link.url,
                                    icon: link.favIconUrl
                                },
                                elem.name
                            )
                        }
                    })
                );
            });
        }
    });
}

function addNewLinkToGroup(link, groupName) {
    chrome.storage.largeSync.get(["tabGroups"], function (chromeResult) {
        chromeResult.tabGroups.forEach(function (group) {
            if (group.name === groupName) {
                let linksAsList = Array.from(group.links);
                linksAsList.push(link);
                group.links = linksAsList;
            }
        });
        chrome.storage.largeSync.set({"tabGroups": chromeResult.tabGroups}, function () {

        })
    })
}