function saveNewGroup() {
    let isAddingNewLink = $("#adding-new-link-to-group").val();
    let links = getSelectedTabs();
    let groupName = $("#group-name").val();
    if (!isGroupNameValid(groupName)) {
        return;
    }
    if (isAddingNewLink === "true") {
        addNewLinkToGroup(links, groupName);
        return;
    }
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let groupsList = extractSavedGroup(result);
        if (isGroupWithSuchNameExist(groupsList, groupName)) {
            return
        }
        let savedGroup = new SavedGroup().init2(groupName, links, null);
        groupsList.push(savedGroup);
        chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {
            openSavedGroups();
            disableSaveGroupButton();
            window.scrollTo(0, 0);
            $("#header-text").text("Saved Groups");
            backgroundJsPort.postMessage("RELOAD_CONTEXT_MENU");
        })
    });
    if (globalSettings.closeTabsOnSaveGroup) {
        let tabsToClose = $.map(links, function (link) {
            return parseInt(link.id)
        });
        chrome.tabs.remove(tabsToClose, function () {
            //callback
        });
    }
}

function addNewLinkToGroup(links, groupName) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let groupsList = extractSavedGroup(result);
        groupsList.forEach(function (group) {
            if (group.name === groupName) {
                group.links = $.merge(group.links, links);
            }
        });
        chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {
            openSavedGroups();
            disableSaveGroupButton();
            window.scrollTo(0, 0);
        })
    })
}

function cleanAllActiveFieldsOnTabListSection() {
    let $groupNameInput = $("#group-name");
    $(".tab-row.is-selected").removeClass("is-selected");
    $groupNameInput.val('');
    $groupNameInput.parents(".group-name-wrapper").removeClass("is-dirty");
    $groupNameInput.parents(".group-name-wrapper").removeClass("is-invalid");
    $groupNameInput.parents(".group-name-wrapper").removeClass('is-focused');
    $groupNameInput.removeAttr("disabled", "disabled");
    document.querySelector("#select-all-tab-rows").MaterialCheckbox.uncheck();
    $("#adding-new-link-to-group").val("false");
    disableSaveGroupButton()
}

function isGroupNameValid(groupName) {
    if (isBlank(groupName)) {
        showAddinGroupError("Group name can't be empty");
        return false;
    }
    return true;
}

function isGroupWithSuchNameExist(groupsList, groupName) {
    let exist = false;
    if (groupsList.length > 0) {
        groupsList.forEach(function (group) {
            if (groupName === group.name) {
                showAddinGroupError("Group with such name already exist");
                exist = true;
            }
        });
    }
    return exist;
}

function getAllSavedGroups() {
    let $savedGroups = $("#saved-group-list");
    $savedGroups.empty();
    hideNotFound();
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let savedGroups = extractSavedGroup(result);
        if (savedGroups.length < 1) {
            showNotFound();
        }
        savedGroups.sort(function (a, b) {
            return ((a.order < b.order) ? -1 : ((a.order > b.order) ? 1 : 0))
        });
        let i = 0;
        savedGroups.forEach(function (group) {
            group.links.sort(function (a, b) {
                return ((a.order < b.order) ? -1 : ((a.order > b.order) ? 1 : 0))
            });
            let groupTemplate = getSavedGroupTemplate(group, i++);
            $savedGroups.append($(groupTemplate));
        });
        initGroupEvents();
        initSortable();
        initLinkListSortable();
    });

}

function getSavedGroupTemplate(group, count) {
    let groupTemplate = $("#saved-group-template").clone();
    groupTemplate.removeAttr("id");
    groupTemplate.removeAttr("hidden");
    let $savedGroupName = groupTemplate
        .find(".saved-group-name");
    $savedGroupName.text(group.name);
    $savedGroupName.attr("id", group.name);
    $savedGroupName.attr("title", group.name);

    createGroupMoreMenu(count).forEach(function (menu) {
        groupTemplate.find(".more-menu-wrapper").append(menu)
    });

    prepareSavedGroupLinksList(groupTemplate.find(".saved-group-links-list-sortable"), group.links);
    return groupTemplate;
}

function createGroupMoreMenu(count) {
    let button = document.createElement('button');
    let icon = document.createElement('i');
    let list = document.createElement('ul');
    let items = [
        {name: 'Rename', classes: 'saved-group-rename', icon: 'edit'},
        {name: 'Delete', classes: 'saved-group-remove', icon: 'delete'}
    ];
    icon.textContent = 'more_vert';

    Object.assign(button, {
        className: 'mdl-button mdl-js-button mdl-button--icon',
        id: 'group-more-menu-' + count
    });
    Object.assign(icon, {className: 'material-icons saved-group-options'});
    Object.assign(list, {
        className: 'mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect group-options-menu'
    });
    button.appendChild(icon);

    list.setAttribute('for', 'group-more-menu-' + count);
    for (let item of items) {
        let listItem = document.createElement('li');
        let itemIcon = document.createElement('i');

        itemIcon.textContent = item.icon;
        Object.assign(itemIcon, {className: "material-icons service-menu-button"});
        listItem.append(itemIcon);

        listItem.appendChild(document.createTextNode(item.name));
        Object.assign(listItem, {className: 'mdl-menu__item ' + item.classes});
        list.appendChild(listItem);
    }
    return [button, list];
}


function prepareSavedGroupLinksList($linksListElement, links) {

    jQuery.each(links, function (index, link) {
        let linksListRowTemplate = $("#link-list-row-template").clone();
        linksListRowTemplate.removeAttr("id");
        linksListRowTemplate.removeAttr("hidden");
        linksListRowTemplate.find(".links-list-image").attr("src", link.icon);
        linksListRowTemplate.find(".link-list-name").text(link.name);
        linksListRowTemplate.find(".link-list-name").attr("title", link.link);
        linksListRowTemplate.find(".link-list-name").attr("href", link.link);

        $linksListElement.append(linksListRowTemplate)
    });

}

function showNotFound() {
    $("#SavedTabs").find(".search-filter").hide();
    $(".not-found").show();
}

function hideNotFound() {
    $("#SavedTabs").find(".search-filter").show();
    $(".not-found").hide();
}

function initGroupEvents() {
    initRemoveGroupEvent();
    initRenameGroupEvent();
    initSaveGroupEvent();
    initShowLinksListCollapseExpandEvent();
    initRemoveFromLinkListEvent();
    initAddNewLinkToGroupButton();
}

function initShowLinksListCollapseExpandEvent() {
    $('.saved-group-wrapper').on('click', function (event) {
        let clickedElement = $(event.target);
        let clickedElementClasses = clickedElement.attr("class").split(' ');
        const elementsNotClickableOnGroupPanel = [
            "saved-group-options",
            "saved-group-open-in-new",
            "link-list-row",
            "link-list-name-wrap",
            "link-list-remove",
            "links-list-image",
            "saved-group-options",
            "saved-group-rename",
            "service-menu-button"
        ];
        let isNameEditableClicked = clickedElement.hasClass("saved-group-name") && clickedElement.attr("contenteditable");
        if (!elementsNotClickableOnGroupPanel.some(r => clickedElementClasses.indexOf(r) >= 0)
            && !isNameEditableClicked) {
            let $linkList = $(this).find(".saved-group-links-list");

            let $linkListArrow = $(this).find(".saved-group-link-list-arrow:visible");
            if ($linkListArrow.hasClass("expand")) {
              showLinksList($linkListArrow, $linkList)
            } else {
               hideLinksList($linkListArrow, $linkList)
            }
            componentHandler.upgradeDom();
        }
    });
}

function showLinksList($linkListArrow, $linkList) {
    $linkListArrow.parents(".collapse-expand-wrapper").find(".collapse-wrapper").show();
    $linkListArrow.parents(".expand-wrapper").hide();
    $linkList.show(300);
}

function hideLinksList($linkListArrow, $linkList) {
    $linkListArrow.parents(".collapse-expand-wrapper").find(".expand-wrapper").show();
    $linkListArrow.parents(".collapse-wrapper").hide();
    $linkList.hide(100)
}

function initAddNewLinkToGroupButton() {
    $(".add-new-link").on("click", function () {
        openChromeTabsTab();
        let $groupNameInput = $("#group-name");
        let groupName = $(this).parents(".saved-group-wrapper").find(".saved-group-name").attr("title");
        $groupNameInput.attr("disabled", "disabled");
        $groupNameInput.val(groupName).parent().addClass('is-focused');
        $("#adding-new-link-to-group").val("true")
    })
}

function initRemoveFromLinkListEvent() {
    $('.link-list-remove').on("click", function () {
        let currentRow = $($(this).parents(".link-list-row"));
        let groupRow = $(this).parents(".saved-group-wrapper");
        let groupName = groupRow.find(".saved-group-name").attr("title");
        currentRow.hide(100, function () {
            if (!groupRow.find(".link-list-row").is(":visible")) {
                groupRow.hide(100);
                removeGroup(groupName, groupRow)
            }
        });
        let url = currentRow.find("a").attr("href");
        removeOneLinkFromSavedGroup(url);
    })
}

function removeOneLinkFromSavedGroup(removeLink) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let newGroupsList = [];
        let savedGroups = extractSavedGroup(result);
        savedGroups.forEach(function (group) {
            group.links = group.links.filter(function (el) {
                return el.link !== removeLink;
            });
            newGroupsList.push(group)
        });
        chrome.storage.largeSync.set({"tabGroups": newGroupsList}, function () {
            if ($("#saved-group-list .saved-group:visible").length <= 0 && $("#saved-group-filter").val().length <= 0) {
                showNotFound();
            }
        });

    })
}

function showAddinGroupError(text) {
    let $addGroupNameWrapper = $("#save-new-group-wrapper").find(".group-name-wrapper");
    let $addGroupNameErrorField = $($addGroupNameWrapper).find(".mdl-textfield__error");
    $addGroupNameErrorField.text(text);
    $addGroupNameWrapper.addClass("is-invalid")
}

function initRemoveGroupEvent() {
    $(".saved-group-remove").on("click", function (event) {
        let $removedRow = $(this).parents(".saved-group-wrapper");
        let groupName = $removedRow.find(".saved-group-name").text();

        removeGroup(groupName, $removedRow)
    })
}

function initRenameGroupEvent() {
    $(".saved-group-rename").on("click", function (event) {
        let $savedGroupRow = $(this).parents(".saved-group-wrapper");
        let $nameHolder = $savedGroupRow.find(".saved-group-name");

        $nameHolder.attr("contenteditable", "true");
        $nameHolder.focus();
    });
    let $savedGroupName = $(".saved-group-name");
    $savedGroupName.on('keydown', function (e) {
        if (e.which === 13) {
            $(this).removeAttr("contenteditable");
        }
    });

    $savedGroupName.on('focusout', function (e) {
        renameSavedGroup($(this));
    });
}

function renameSavedGroup(element) {
    element.removeAttr("contenteditable");
    let oldName = element.attr("id");
    let newName = element.text();
    if (oldName !== newName) {
        chrome.storage.largeSync.get(["tabGroups"], function (result) {
            let groupsList = extractSavedGroup(result);
            groupsList.forEach(function (group) {
                if (group.name === oldName) {
                    group.name = newName;
                }
            });
            chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {

            })
        });
    }
    element.attr("id", newName)
}

function removeGroup(groupName, $removedRow) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        let newGroupsList = [];
        let groupsList = extractSavedGroup(result);
        groupsList.forEach(function (group) {
            if (group.name !== groupName) {
                newGroupsList.push(group)
            }
        });
        chrome.storage.largeSync.set({"tabGroups": newGroupsList}, function () {
            $removedRow.hide(100, function () {
                if ($("#saved-group-list .saved-group:visible").length <= 0 && $("#saved-group-filter").val().length <= 0) {
                    showNotFound();
                }
                backgroundJsPort.postMessage("RELOAD_CONTEXT_MENU");
            });
        });
    })
}

let windowObjectReference;

function initSaveGroupEvent() {
    $(".saved-group-open").on("click", function (event) {
        let inNewWindow = false;
        if ($(event.target).hasClass("saved-group-open-in-new")) {
            inNewWindow = true;
        }
        let $savedGroup = $(this).parents(".saved-group");
        chrome.storage.largeSync.get(["tabGroups"], function (result) {
            let groupName = $savedGroup.find(".saved-group-name").text();
            let groupsList = extractSavedGroup(result);
            groupsList.forEach(function (group) {
                if (group.name === groupName) {
                    if (inNewWindow) {
                        chrome.windows.create({height: 768, width: 1024}, function (newWindow) {
                            chrome.tabs.remove(newWindow.tabs[0].id);
                        });
                        group.links.forEach(function (link) {
                            windowObjectReference = window.open(link.link);
                        });
                    } else {
                        group.links.forEach(function (link) {
                            chrome.tabs.create({
                                url: link.link
                            });
                        });

                    }
                }
            })
        });
        componentHandler.upgradeDom();

    })
}

function filterSavedGroup(text) {
    let $savedGroups = $(".saved-group-wrapper").not("#saved-group-template");
    if (null != text && text.length > 0) {
        $savedGroups.each(function () {
            let $linkListArrow = $(this).find(".saved-group-link-list-arrow:visible");
            if (!$linkListArrow.hasClass("expand")) {
                let $linkList = $(this).find(".saved-group-links-list");
                hideLinksList($linkListArrow, $linkList)
            }
            let groupName = $(this).find(".saved-group-name").text().toLowerCase();
            if (groupName.indexOf(text.toLowerCase()) < 0) {
                $(this).attr("hidden", "hidden");
            } else {
                $(this).removeAttr("hidden");
            }
        })
    } else {
        $("#saved-group-filter").val("");
        $savedGroups.each(function () {
            $(this).removeAttr("hidden");
        })
    }
}