let Link = function () {
};
Link.prototype.init1 = function (id, name, link, icon) {
    this.id = id;
    this.name = name;
    this.link = link;
    this.icon = icon;
    this.order = null
    return this;
};

Link.prototype.init2 = function (id, name, link, icon, order) {
    this.id = id;
    this.name = name;
    this.link = link;
    this.icon = icon;
    this.order = order;
    return this;
};

let SavedGroup = function () {
};
SavedGroup.prototype.init1 = function (name, links) {
    this.name = name;
    this.links = links;
    this.order = null;
    return this;
};
SavedGroup.prototype.init2 = function (name, links, order) {
    this.name = name;
    this.links = links;
    this.order = order;
    return this;
};

let Settings = function () {
};
Settings.prototype.init = function (ignorePinnedTabs, closeTabsOnSaveGroup) {
    this.ignorePinnedTabs = ignorePinnedTabs;
    this.closeTabsOnSaveGroup = closeTabsOnSaveGroup;
    return this;
};
var backgroundJsPort = chrome.extension.connect({
    name: "Sample Communication"
});