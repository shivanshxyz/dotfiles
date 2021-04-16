function getSelectedTabs() {
    let selectedTabsRow = $(".tab-row.is-selected")
        .map(function () {
            let link = new Link().init1(
                $(this).find(".tab-id").val(),
                $(this).find(".tab-text").attr("title"),
                $(this).find(".tab-url").val(),
                $(this).find(".tab-image").attr("src")
            );
            return link
        });
    return selectedTabsRow;
}

function addSelectTabRowEvent() {
    $(".tab-row").on("click", function () {
        let checkBox = $(this).find(".mdl-checkbox")[0];
        if ($(this).find(".mdl-checkbox").hasClass("is-checked")) {
            checkBox.MaterialCheckbox.uncheck();
        } else {
            checkBox.MaterialCheckbox.check();
        }
        $(this).toggleClass("is-selected");
        disableSaveGroupButton();
        checkCheckAllIfAllRowsSelected();
    })
}

function initWindowCollapseExpandEvents() {
    $(".window-header-row").on("click", function (event) {
        let clickedElement = $(event.target);
        if (clickedElement.hasClass("mdl-checkbox__ripple-container") || clickedElement.hasClass("mdl-checkbox__input")) {
            return;
        }
        let $chromeTabs = $($(this).parents("table").find(".window-tabs-list-wrapper")[0]);
        if ($chromeTabs.hasClass("collapsed")) {
            $chromeTabs.removeClass("collapsed");
            $chromeTabs.show(300);
        } else {
            $chromeTabs.addClass("collapsed");
            $chromeTabs.hide(100)
        }
    })
}

function checkCheckAllIfAllRowsSelected() {
    //TODO fix here
    if ($("#tab-list .mdl-checkbox:not(.is-checked)").length <= 0) {
        document.querySelector("#select-all-tab-rows").MaterialCheckbox.check();
    } else {
        document.querySelector("#select-all-tab-rows").MaterialCheckbox.uncheck();
    }
}

function selectAllCheckboxInit() {
    $("#select-all-tab-rows input").change(selectAll)
    //TODO add if click on header
    // $(".window-header-row").on("click", function () {
    //     $('#select-all-tab-rows input').click();
    // });
}

function selectAll() {
    let allCheckBox = $(this).parents("table").find("tbody").find(".mdl-checkbox");
    let isChecked = $('#select-all-tab-rows input').is(":checked");

    let notCheckedCheckBox = [];
    allCheckBox.each(function (index, box) {
        if (!$(box).hasClass("is-checked")) {
            notCheckedCheckBox.push(box)
        }
    });
    if (!isChecked) {
        allCheckBox.each(function (index, box) {
            $(box).parents(".tab-row").removeClass("is-selected");
            $(box)[0].MaterialCheckbox.uncheck();
        });
    } else {
        notCheckedCheckBox.forEach(function (box) {
            $(box)[0].MaterialCheckbox.check();
            $(box).parents(".tab-row").addClass("is-selected");
        });
    }
    disableSaveGroupButton()
}

function disableSaveGroupButton() {
    let selectedRows = $(".tab-row.is-selected");
    if (selectedRows.length > 0) {
        $(".save-new-group").removeAttr("disabled")
    } else {
        $(".save-new-group").attr("disabled", "disabled")
    }
}

function appendTabImagesToWindowNamePanel() {
    $(".window-tabs-container").each(function (idx, elem) {
        let imagesToAppend = "";
        $(elem).find(".tab-image").not(".window-image").slice(0, 7).each(function (idx2, img) {
            let newImg = $(img).clone();
            newImg.addClass("window-preview-image");
            imagesToAppend += newImg[0].outerHTML;
        });
        $($(elem).find(".window-additional-images")[0]).append(imagesToAppend)
    })
}

function getAllOpenChromeTabs(winData) {
    $("#tab-list").empty();

    let windowLinks = extractLinksFromWindowData(winData);
    windowLinks.forEach(function (window) {
        $("#tab-list")
            .append(getWindowTableTemplate(window));
        componentHandler.upgradeAllRegistered();
    });

    appendTabImagesToWindowNamePanel();
    selectAllCheckboxInit();
    checkCheckAllIfAllRowsSelected();
    addSelectTabRowEvent();
    initWindowCollapseExpandEvents();
}

function extractLinksFromWindowData(winData) {
    let windowLinks = [];
    for (let i in winData) {
        let winTabs = winData[i].tabs;
        let totTabs = winTabs.length;
        let links = [];
        for (let j = 0; j < totTabs; j++) {
            if (globalSettings.ignorePinnedTabs && winTabs[j].pinned) {
                continue;
            }
            links.push(new Link().init1(winTabs[j].id, winTabs[j].title, winTabs[j].url, winTabs[j].favIconUrl))
        }
        let windowNumber = (parseInt(i) + 1);
        windowLinks.push({windowName: "Window " + windowNumber, links: links})
    }
    return windowLinks;
}

function getWindowTableTemplate(window) {
    let windowTableTBody = $("<tbody/>");
    window.links.forEach(function (link) {
        windowTableTBody
            .append(getTabTemplate(link))
            .addClass("window-tabs-list-wrapper collapsed");
    });
    return $("<table/>").addClass("mdl-data-table mdl-js-data-table window-tabs-container").append(
        $("<thead/>").append(
            $("<tr/>").append(
                $("<th/>").append(
                    $("<label/>").attr({id: "select-all-tab-rows"}).addClass("mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect").append(
                        $("<input/>").attr({type: "checkbox"}).addClass("mdl-checkbox__input")
                    )
                )
            ).append(
                $("<th/>").append(
                    $("<img/>")
                        .addClass("tab-image window-image")
                        .attr({"src": "../images/google-chrome-icon-6.png"})
                ).addClass("tab-image-table-row")
            ).append(
                $("<th/>")
                // .attr({colspan : 2})
                    .addClass("tab-text-head")
                    .text(window.windowName)
                    .append(
                        $("<span/>")
                            .addClass("window-additional-images")
                    )
            ).addClass("window-header-row cursor-pointer hover-grey")
        )
    ).append(
        windowTableTBody
    );
}

function getTabTemplate(link) {
    let tabRow = $("<tr/>").addClass("tab-row");
    tabRow.append(
        $("<td/>").append(
            $("<lable/>")
                .addClass("mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect")
                .append(
                    $("<input/>")
                        .attr({type: "checkbox"})
                        .addClass("mdl-checkbox__input select-all-tab-rows")
                )
        )
    );
    tabRow.append(
        $("<td/>").append(
            $("<img/>")
                .addClass("tab-image")
                .attr({src: link.icon})
        )
    );
    tabRow.append(
        $("<td/>")
            .attr({title: link.name})
            .addClass("tab-text")
            .text(link.name)
    );
    tabRow.append(
        $("<input/>")
            .attr({hidden: "hidden"})
            .addClass("tab-url")
            .val(link.link)
    );
    tabRow.append(
        $("<input/>")
            .attr({hidden: "hidden"})
            .addClass("tab-id")
            .val(link.id)
    );
    componentHandler.upgradeDom();
    componentHandler.upgradeAllRegistered();
    return tabRow;
}


function filterTabList(text) {
    let $tabs = $(".tab-row").not("#tab-template");
    if (null !== text && text.length > 0) {
        $tabs.each(function () {
            let tabName = $(this).find(".tab-text").text().toLowerCase();
            if (tabName.indexOf(text.toLowerCase()) < 0) {
                $(this).attr("hidden", "hidden");
            } else {
                $(this).removeAttr("hidden");
            }
        })
    } else {
        $("#tabs-filter").val("");
        $tabs.each(function () {
            $(this).removeAttr("hidden");
        })
    }
}
