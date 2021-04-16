let currentTabGroupVersion = 1.2;
let currentActiveTab;

$(document).ready(function () {
    currentActiveTab = $("section.is-active");
    extractSettingsFromStorage();
    getAllSavedGroups();
    initSaveNewGroupEvents();
    initMenuEvents();
    initFilters();
    selectAllCheckboxInit();
    initSearchFilterActivation();
});

function initSearchFilterActivation() {
    $(".search-filter").on("click", function () {
        $(this).find("input").focus()
    })
}

function supportOldVersion() {
    chrome.storage.sync.get("tabGroupVersion", function (result) {
        if (result === undefined || result.length <= 0 || currentTabGroupVersion !== result.tabGroupVersion) {
            refactorChromeStorage();
        }
    });
    setTimeout(function () {

    }, 1000)

}

function refactorChromeStorage() {
    chrome.storage.sync.get("tabGroups", function (result) {
        let newGroups = [];
        $.each(result.tabGroups, function (index, oldGroup) {
            $.each(oldGroup, function (oldGroupName, oldGroupLinks) {
                let links = [];
                oldGroupLinks.split(",")
                    .forEach(function (oldLink) {
                        links.push(urlToLinkObject(oldLink))
                    });
                newGroups.push(new SavedGroup().init1(oldGroupName, links))
            })
        });
        chrome.storage.largeSync.set({"tabGroups": newGroups}, function () {


        });
    });
    chrome.storage.sync.set({"tabGroupVersion": currentTabGroupVersion}, function () {
        window.location.reload()
    });
}

function urlToLinkObject(url) {
    let link;
    $.ajax({
        async: false,
        url: url,
        complete: function (data) {
            let title = data.responseText
                .match(/<title[^>]*>([^<]+)<\/title>/)[1]
                .trim();
            let icon = "http://www.google.com/s2/favicons?domain=" + url;
            link = new Link().init1(title, url, icon)
        }
    });
    return link;
}


function initSortable() {
    let $sortableList = $("#saved-group-list");
    sortable($sortableList, {
        items: 'div.saved-group-wrapper,:not(.saved-group-links-list)',
        forcePlaceholderSize: true,
        placeholderClass: 'my-placeholder fade'
    })[0].addEventListener('sortupdate', reorderSavedGroupsEventHandler);
}

function initLinkListSortable() {
    let $sortableLinkList = $(".saved-group-links-list-sortable");
    $sortableLinkList.each(function (i, elem) {
        sortable(elem, {
            items: ':not(.add-new-link),div.link-list-row',
            forcePlaceholderSize: true,
            placeholderClass: 'my-placeholder fade'
        })[0].addEventListener('sortupdate', reorderLinkListEventHandler)
    })
    //TODO add connection with other link lists (in future)
}

let reorderLinkListEventHandler = function (event, ui) {
    let sortableLinkList = $(event.target);
    let sortableParentGroup = sortableLinkList.parents('.saved-group-wrapper');
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let savedGroups = extractSavedGroup(result);
        let groupName = $(sortableParentGroup).find(".saved-group-name").attr("title");

        $.each(savedGroups, function () {
            if (this.name === groupName) {
                let linksElements = $(sortableLinkList).find(".link-list-row");
                let order = 0;
                let savedGroupLinks = this.links;
                $.each(linksElements, function (i, linkElem) {
                    let linkElementHolder = $(linkElem).find(".link-list-name")
                    let linkElementLink = linkElementHolder.attr("href");
                    $.each(savedGroupLinks, function (i, savedLink) {
                        if (savedLink.link === linkElementLink) {
                            savedLink.order = order
                        }
                    });
                    order++;
                });
                this.links = savedGroupLinks;
            }
        });
        chrome.storage.largeSync.set({"tabGroups": savedGroups}, function () {
        });
    });

};

let reorderSavedGroupsEventHandler = function (event, ui) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let $sortableList = $("#saved-group-list");
        let savedGroups = extractSavedGroup(result);
        let listElements = $sortableList.children();
        let order = 0;
        listElements.each(function (index, elem) {
            let groupName = $(elem).find(".saved-group-name").attr("title");
            $.each(savedGroups, function () {
                if (this.name === groupName) {
                    this.order = order;
                }
            });
            order++;
        });
        chrome.storage.largeSync.set({"tabGroups": savedGroups}, function () {
        });
    });
};

function openChromeTabsTab() {
    toggleTopMenuActionButton();
    switchActiveTab($("#chrome-tabs-tab"));

    filterSavedGroup("");
    let $savedGroupWrapper = $("#save-new-group-wrapper");
    $savedGroupWrapper.show();
    chrome.windows.getAll({populate: true}, getAllOpenChromeTabs);
}

function openSavedGroups() {
    toggleTopMenuActionButton();
    switchActiveTab($("#saved-group-tab"));

    filterTabList("");
    let $savedGroupWrapper = $("#save-new-group-wrapper");
    getAllSavedGroups();
    $savedGroupWrapper.hide();
    cleanAllActiveFieldsOnTabListSection()
}

function openSettings() {
    let currentTabName = currentActiveTab.attr("id");
    if (currentTabName !== "chrome-tabs-tab") {
        toggleTopMenuActionButton();
    }
    switchActiveTab($("#setting-tab"));
    filterSavedGroup("");

    componentHandler.upgradeDom();
    initSettingsValues();

    cleanAllActiveFieldsOnTabListSection()
}

function switchActiveTab(activeTab) {
    let activeTabName = activeTab.attr("id");
    $("section").each(function (index, tabElement) {
        let tabName = $(tabElement).attr("id");
        if (tabName === activeTabName) {
            $(tabElement).addClass("is-active")
        } else {
            $(tabElement).removeClass("is-active")
        }
    });
    currentActiveTab = $("section.is-active");
}

function toggleTopMenuActionButton() {
    $("#add-group").toggle();
    $("#backward-to-main").toggle()
}

//TODO maybe use dynamic events
// extract all sections from html
// use class: 'toggle-menu-buttons' to switch buttons
// use 'header-name' attr to set name of section
function initMenuEvents() {
    $("#add-group").on("click", function () {
        $("#header-text").text("Opened Tabs");
        openChromeTabsTab();
    });
    $("#backward-to-main").on("click", function () {
        $("#header-text").text("Saved Groups");
        openSavedGroups();
    });
    $("#settings-menu-button").on("click", function () {
        $("#header-text").text("Settings");
        openSettings();
    });
}

function initFilters() {
    $("#saved-group-filter").on("keyup", function () {
        filterSavedGroup($(this).val());
    });
    $("#tabs-filter").on("keyup", function () {
        filterTabList($(this).val());
    })
}

function initSaveNewGroupEvents() {
    $(".save-new-group").on("click", saveNewGroup);
    $(".group-name").on('keydown', function (e) {
        if (e.which === 13) {
            saveNewGroup();
        }
    });
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}
