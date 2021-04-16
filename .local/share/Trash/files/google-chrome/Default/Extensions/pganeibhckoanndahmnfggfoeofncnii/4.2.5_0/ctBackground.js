/*	Cold Turkey Blocker Chrome Extension v4.2
	Copyright (c) 2020 Cold Turkey Software Inc.
*/

var port;
var statsTimer;
var doubleCheckTimer;

var version = 1;

var statsEnabled = false;
var statsEnabledIncognito = false;
var statsActive = true;
var isPro = false;
var ignoreIncognito = false;
var forceAllowFile = false;
var blockInactive = false;
var blockCharity = false;
var blockEmbedded = false;
var statsStrict = false;
var firstMessage = true;
var totalEntries = 0;
var paused = "";
var unlockedTabs = {};

/* Version-specific Variables */
var counter = 0;
var diffBlockList = [];
var diffExceptList = [];
var diffTitleList = [];
var currentBlockList = [];
var currentExceptionList = [];
var currentTitleList = [];
var addableBlocks = [];
var blockListInfo = {};

/* Initialization */
try {
	port = chrome.extension.connectNative('com.coldturkey.coldturkey');
	port.onDisconnect.addListener(function() {
		currentBlockList = [];
		currentExceptionList = [];
		window.clearInterval(statsTimer);
	});
	doubleCheckTimer = window.setInterval(doubleCheck, 5000);
} catch (e) {
	console.log('Error starting Cold Turkey Blocker extension.');
}

/* Chrome Event Listeners */
chrome.browserAction.disable();
port.onMessage.addListener(function(list) {

	if (typeof list.version == 'string') {
		version = parseInt(list.version);
	} else if (typeof list.version == 'number') {
		version = list.version;		
	}
	if (version == 1) {
		port.postMessage('counter@' + counter + '@@Chrome');
		counter = 0;
	}
	if (version >= 2) {
		if (typeof list.statsEnabled != 'undefined' && list.statsEnabled == 'true'){
			statsEnabled = true;
		} else {
			statsEnabled = false;
		}
		if (typeof list.statsEnabledIncognito != 'undefined' && list.statsEnabledIncognito == 'true'){
			statsEnabledIncognito = true;
		} else {
			statsEnabledIncognito = false;
		}
		if (typeof list.isPro != 'undefined' && (list.isPro == 'true' || list.isPro == 'pro' || list.isPro == 'trial')) {
			isPro = true;
		}
		if (typeof list.ignoreIncognito != 'undefined' && list.ignoreIncognito == 'true') {
			ignoreIncognito = true;
		}
	}
	if (version >= 4) {
		if (typeof list.forceAllowFile != 'undefined' && list.forceAllowFile == 'true'){
			forceAllowFile = true;
		} else {
			forceAllowFile = false;
		}
		if (typeof list.blockInactive != 'undefined' && list.blockInactive == 'true'){
			blockInactive = true;
		} else {
			blockInactive = false;
		}
		if (typeof list.blockCharity != 'undefined' && list.blockCharity == 'true'){
			blockCharity = true;
		} else {
			blockCharity = false;
		}
		if (typeof list.blockEmbedded != 'undefined' && list.blockEmbedded == 'true'){
			blockEmbedded = true;
		} else {
			blockEmbedded = false;
		}
		if (typeof list.statsStrict != 'undefined' && list.statsStrict == 'true'){
			statsStrict = true;
		} else {
			statsStrict = false;
		}
		if (typeof list.paused != 'undefined' && list.paused != 'false'){
			paused = list.paused;
		} else {
			paused = "";
		}
	}
	if (version >= 1 && version <= 3) {
		if (typeof list.blockList != 'undefined' && list.blockList != ''){
			var thisList = list.blockList.split(/(?<!\\)@/g);
			for(var i=0; i < thisList.length; i++) {
				thisList[i] = thisList[i].replace(/\\/g, '');
				thisList[i] = thisList[i].replace(/\.\*/g, "*");
			}
			diffBlockList = thisList.diff(currentBlockList);
			currentBlockList = thisList.slice();
		} else {
			diffBlockList = [];
			currentBlockList = [];
		}
		if (typeof list.exceptionList != 'undefined' && list.exceptionList != '') {
			var thisList = list.exceptionList.split(/(?<!\\)@/g);
			for(var i=0; i < thisList.length; i++) {
				thisList[i] = thisList[i].replace(/\\/g, '');
				thisList[i] = thisList[i].replace(/\.\*/g, "*");
			}
			diffExceptList = thisList.diff(currentExceptionList);
			currentExceptionList = thisList.slice();
		} else {
			diffExceptList = [];
			currentExceptionList = [];
		}
		if (diffBlockList.length > 0 || diffExceptList.length > 0) {
			diffBlockList = [];
			diffExceptList = [];
			checkOpenTabs();
		}
	}
	if (version == 4) {
		if (typeof list.blockList != 'undefined' && list.blockList != ''){
			var thisList = list.blockList.split(/(?<!\\)@/g);
			for(var i=0; i < thisList.length; i++) {
				thisList[i] = thisList[i].replace(/\\/g, '');
			}
			diffBlockList = thisList.diff(currentBlockList);
			currentBlockList = thisList.slice();
		} else {
			diffBlockList = [];
			currentBlockList = [];
		}
		if (typeof list.exceptionList != 'undefined' && list.exceptionList != '') {
			var thisList = list.exceptionList.split(/(?<!\\)@/g);
			for(var i=0; i < thisList.length; i++) {
				thisList[i] = thisList[i].replace(/\\/g, '');
			}
			diffExceptList = thisList.diff(currentExceptionList);
			currentExceptionList = thisList.slice();
		} else {
			diffExceptList = [];
			currentExceptionList = [];
		}
		if (typeof list.titleList != 'undefined' && list.titleList != ''){
			var thisList = list.titleList.split(/(?<!\\)@/g);
			for(var i=0; i < thisList.length; i++) {
				thisList[i] = thisList[i].replace(/\\/g, '');
			}
			diffTitleList = thisList.diff(currentTitleList);
			currentTitleList = thisList.slice();
		} else {
			diffTitleList = [];
			currentTitleList = [];
		}
		if (typeof list.addableBlocks != 'undefined' && list.addableBlocks != ''){
			addableBlocks = list.addableBlocks.match(/(\\.|[^@])+/g);
			for(var i=0; i < addableBlocks.length; i++) {
				addableBlocks[i] = addableBlocks[i].replace(/\\/g, '');
			}
		} else {
			addableBlocks = [];
		}
		if (diffBlockList.length > 0 || diffExceptList.length > 0 || diffTitleList.length > 0) {
			diffBlockList = [];
			diffExceptList = [];
			diffTitleList = [];
			checkOpenTabs();
		}
		totalEntries = currentBlockList.length + currentTitleList.length;
		chrome.browserAction.enable();
		updateBadge();
	}
	if (version == 5) {
		if (typeof list.blockListInfo != 'undefined' && JSON.stringify(blockListInfo) != JSON.stringify(list.blockListInfo)) {
			var entryCount = 0;
			blockListInfo = list.blockListInfo;
			for (let [blockId, block] of Object.entries(blockListInfo.blocks)) {
				entryCount = entryCount + block.blockList.length + block.titleList.length;
			}
			totalEntries = entryCount;
			checkOpenTabs();
			chrome.browserAction.enable();
			updateBadge();
		}
	}
	
	if (firstMessage) {
		
		firstMessage = false;
		
		if (version >= 4) {
			upgradeSettingsv4Tov5();
			statsTimer = window.setInterval(statsCheckv4Tov5, 2000);
		} else {
			statsTimer = window.setInterval(statsCheckv1Tov3, 1000);
		}
		
		allowIncognito();
		if (forceAllowFile) {
			allowFile();
		}
		
	}

});
chrome.runtime.setUninstallURL('https://getcoldturkey.com/support/extensions/chrome/?reason=uninstall');
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.command) {
		case "checkBlockUrl": 
			sendResponse({ version: version, block: checkBlockUrl(request.site, true, sender.tab.id), isPro: isPro, blockEmbedded: blockEmbedded, blockCharity: blockCharity });
			break;
		case "checkBlockTitle": 
			sendResponse({ version: version, block: checkBlockTitle(request.title, request.site, true, sender.tab.id), isPro: isPro, blockEmbedded: blockEmbedded, blockCharity: blockCharity });
			break;
		case "listBlocks":
			sendResponse({ version: version, addableBlocks: listBlocks(), itemCount: totalEntries, paused: paused });
			break;
		case "getURLs":
			sendResponse({ result: true });
			getURLs();
			break;
		case "getBadgeData": 
			sendResponse({ badge: localStorage.getItem("badge-data") });
			break;
		case "setBadgeData":
			setBadge(request.badge);
			break;
		case "unlockTab": 
			unlockTab(sender.tab.id, request.blockId);
			break;
		case "open-blocker":
			sendResponse({ result: true });
			openBlocker();
			break;
		case "add-block":
			sendResponse({ result: true });
			addBlock(request.block, request.url);
			break;
		case "pause":
			sendResponse({ result: true });
			pause(request.key);
			break;
	}
});
chrome.tabs.onActivated.addListener(function() {
	checkOpenTabs();
});
chrome.idle.setDetectionInterval(150);
chrome.idle.onStateChanged.addListener(function stateChanged(state) {
	if (state === "active") {
		statsActive = true;
	} else {
		statsActive = false;
	}
});


/* Cold Turkey Blocker Methods */

function allowIncognito() {
	chrome.extension.isAllowedIncognitoAccess(function(isAllowedAccess) {
		if (!isAllowedAccess && !ignoreIncognito) {
			var detailsURL = "chrome://extensions/?id=" + chrome.i18n.getMessage("@@extension_id");
			window.setTimeout(incognitoRequired, 10000);
			chrome.tabs.create({ url: detailsURL });
			alert('Please turn on "Allow in incognito" for the Cold Turkey Blocker extension.\n\nOtherwise, Chrome will be closed during locked blocks.');
		}
	});
}

function allowFile() {
	chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
		if (!isAllowedAccess) {
			var detailsURL = "chrome://extensions/?id=" + chrome.i18n.getMessage("@@extension_id");
			window.setTimeout(fileRequired, 10000);
			chrome.tabs.create({ url: detailsURL });
			alert('Please turn on "Allow access to file URLs" for the Cold Turkey Blocker extension.\n\nOtherwise, Chrome will be closed during locked blocks.');
		}
	});
}

var incognitoRequired = function() {
	chrome.extension.isAllowedIncognitoAccess(function(isAllowedAccess) {
		if (!isAllowedAccess && !ignoreIncognito) {
			var detailsURL = "chrome://extensions/?id=" + chrome.i18n.getMessage("@@extension_id");
			chrome.management.setEnabled(chrome.i18n.getMessage("@@extension_id"), false);
			chrome.tabs.create({ url: detailsURL });
			alert('Please turn on "Allow in incognito" for the Cold Turkey Blocker extension. Then, re-enable the extension.\n\nOtherwise, Chrome will be closed during locked blocks.');
		}
	});
};

var fileRequired = function() {
	chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
		if (!isAllowedAccess) {
			var detailsURL = "chrome://extensions/?id=" + chrome.i18n.getMessage("@@extension_id");
			chrome.management.setEnabled(chrome.i18n.getMessage("@@extension_id"), false);
			chrome.tabs.create({ url: detailsURL });
			alert('Please turn on "Allow access to file URLs" for the Cold Turkey Blocker extension. Then, re-enable the extension.\n\nOtherwise, Chrome will be closed during locked blocks.');
		}
	});
};

function checkOpenTabs() {
	if (paused == "") {
		var options;
		if (blockInactive) {
			options = {};
		} else {
			options = {active: true};
		}
		chrome.tabs.query(options, function(allActiveTabs) {
			for (var i = 0; i < allActiveTabs.length; i++) {
				if (allActiveTabs[i].title != "Blocked by Cold Turkey") {
					var checkBlockUrlResponse = checkBlockUrl(allActiveTabs[i].url, false, allActiveTabs[i].id);
					if (checkBlockUrlResponse != 'false') {
						chrome.tabs.reload(allActiveTabs[i].id);
					}
					var checkBlockTitleResponse = checkBlockTitle(allActiveTabs[i].title, allActiveTabs[i].url, false, allActiveTabs[i].id);
					if (checkBlockTitleResponse != 'false') {
						chrome.tabs.reload(allActiveTabs[i].id);
					}
				}
			}
		});
	}
}

function upgradeSettingsv4Tov5() {
	
	if (localStorage.getItem("badge-data") == null) {
		if (localStorage.getItem("hide-badge") == "true") {
			localStorage.setItem("badge-data", "hidden");
			localStorage.removeItem("hide-badge");
		} else {
			localStorage.setItem("badge-data", "total");
			localStorage.removeItem("hide-badge");
		}
	}
	
}

function updateBadge() {
	if (version == 4 && localStorage.getItem("badge-data") != "hidden") {
		if (paused != "") {
			chrome.browserAction.setBadgeText({text: "pause"});
			chrome.browserAction.setBadgeBackgroundColor({color: "#4cae4c"});
		} else if (totalEntries > 0) {
			chrome.browserAction.setBadgeText({ text: totalEntries.toString() });
			chrome.browserAction.setBadgeBackgroundColor({color: "#d9534f"});
		} else {
			chrome.browserAction.setBadgeText({ text: "0" });
			chrome.browserAction.setBadgeBackgroundColor({color: "#4cae4c"});
		}
	} else if (version == 5 && localStorage.getItem("badge-data") != "hidden") {
		if (paused != "") {
			chrome.browserAction.setBadgeText({text: "pause"});
			chrome.browserAction.setBadgeBackgroundColor({color: "#65a30d"}); //green
		} else if (localStorage.getItem("badge-data") == "total") {
			if (totalEntries > 0) {
				chrome.browserAction.setBadgeText({ text: totalEntries.toString() });
				chrome.browserAction.setBadgeBackgroundColor({color: "#DC2626"}); //red
			} else {
				chrome.browserAction.setBadgeText({ text: "0" });
				chrome.browserAction.setBadgeBackgroundColor({color: "#65a30d"}); //green
			}
		} else {
			if (blockListInfo.blocks[localStorage.getItem("badge-data")] != null) {
				var allowance = blockListInfo.blocks[localStorage.getItem("badge-data")].allowance;
				var allowanceRemaining = blockListInfo.blocks[localStorage.getItem("badge-data")].allowanceRemaining;
				var pomodoroPeriodRemaining = blockListInfo.blocks[localStorage.getItem("badge-data")].pomodoroPeriodRemaining;
				var pomodoroPeriodState = blockListInfo.blocks[localStorage.getItem("badge-data")].pomodoroPeriodState;
				
				if (allowance != "") {
					if (parseInt(allowanceRemaining, 10) > 0) {
						chrome.browserAction.setBadgeText({ text: new Date((parseInt(allowanceRemaining, 10)+60) * 1000).toISOString().substr(11, 5).replace("-", ":") });
						chrome.browserAction.setBadgeBackgroundColor({color: "#65a30d"}); //green
					} else {
						chrome.browserAction.setBadgeText({ text: "00:00" });
						chrome.browserAction.setBadgeBackgroundColor({color: "#DC2626"}); //red
					}
				} else if (pomodoroPeriodState != "") {
					chrome.browserAction.setBadgeText({ text: new Date(parseInt(pomodoroPeriodRemaining*60, 10) * 1000).toISOString().substr(11, 5).replace("-", ":") });
					if (pomodoroPeriodState == "break") {
						chrome.browserAction.setBadgeBackgroundColor({color: "#65a30d"}); //green
					} else {
						chrome.browserAction.setBadgeBackgroundColor({color: "#DC2626"}); //red
					}
				} else {
					chrome.browserAction.setBadgeText({ text: "" });
				}
			} else {
				chrome.browserAction.setBadgeText({ text: "" });
			}
		}
	} else {
		chrome.browserAction.setBadgeText({ text: "" });
	}
}

function openBlocker() {
	port.postMessage('open-blocker');
}

function pause(key) {
	if (typeof key != 'undefined' && key.length == 10 && /^\d{10}$/.test(key)) {
		var req = new XMLHttpRequest();  
		req.open('GET', 'https://getcoldturkey.com/activate/activate-break.php?v=break&key='+key+'&rand=' + Math.round(Math.random() * 10000000).toString(), true); 
		req.onload = function () {
			if (req.status == 200) {
				if (req.responseText.startsWith('true')) {
					port.postMessage('pause@' + key.replace(/@/g,'\\@'));
				} else {
					sendPauseError("Sorry, this break key has already been used or isn't valid.");
				}
			} else {
				sendPauseError("Something went wrong validating your break key. Please try again.");
			}
		};
		req.send(null);
	} else {
		sendPauseError("Sorry, this isn't a valid break key.");
	}
}

function unlockTab(tabId, blockId) {
	if (typeof unlockedTabs[tabId] == 'undefined') {
		unlockedTabs[tabId] = [blockId];
	} else {
		unlockedTabs[tabId].push(blockId);
	}
	chrome.tabs.reload(tabId);
}

function setBadge(data) {
	localStorage.setItem("badge-data", data);
	updateBadge();
}

function sendPauseError(errorMessage) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {command: "cold-turkey-blocker-pause-error", errorMessage: errorMessage});  
	});
}

function addBlock(blockId, url) {
	var formattedUrl = decodeURIComponent(url).replace(/@/g,'\\@');
	if (formattedUrl.startsWith("file://")) {
		formattedUrl = formattedUrl.substring(0, formattedUrl.lastIndexOf("#"))
	} else {
		formattedUrl = formattedUrl.replace(/\/$/, "");
	}
	port.postMessage('add-block@' + blockId.replace(/@/g,'\\@') + '@' + formattedUrl);
}

function getURLs() {
	chrome.tabs.query({active: true, currentWindow: true}, function(allActiveTabs) {
		var allURLs = [];
		for (var i = 0; i < allActiveTabs.length; i++) {
			
			try {
				var temp = allActiveTabs[i].url.match(/^((http|https|ftp):\/\/)?(www\.)?(.+)\/?/);
				var url = temp[temp.length-1].replace(/\/$/, "").toLowerCase();
				if (url.includes("/") && !url.includes("//")) {
					var domains = url.split("/")[0];
					var domainsList = domains.split(".");
					allURLs.push(domains);
					if (domainsList.length > 2) {
						allURLs.push(domainsList[domainsList.length-2] + '.' + domainsList[domainsList.length-1]);
					}
				}
				allURLs.push(url);
			} catch (e) { }
			
		}
		chrome.runtime.sendMessage({ command: "urls", urls: allURLs }, function(response) { });
	});
}

function listBlocks() {
	
	if (version <= 4) {
		return addableBlocks;
	} else if (version == 5) {
		var blockListNames = [];
		for (let [blockId, block] of Object.entries(blockListInfo.blocks)) {
			blockListNames.push(blockId);
		}
		return blockListNames;
	}
}

function checkBlockUrl(site, countAsBlocked, tabId) {
	
	if (paused == "") {
		if (version >= 5) {
			return checkBlockUrlv5(site, countAsBlocked, tabId);
		} else {
			return (checkBlockUrlv1Tov4(site, countAsBlocked) ? 'true' : 'false');
		}
	} else {
		return 'false';
	}
	
}

function checkBlockUrlv5(site, countAsBlocked, tabId) {
	
	var input = decodeURI(site);
	var domains = '';
	var initUrl = '';	
	if (input.startsWith("chrome") || input.startsWith("brave") || input.startsWith("vivaldi") || input.startsWith("https://chrome.google.com/webstore") || input.startsWith("https://getcoldturkey.com/blocked/")) {
		return 'false';
	} else if (input.startsWith("file://") || input.startsWith("chrome-extension://") || input.startsWith("moz-extension://") || input.startsWith("extension://")) {
		var lastIndex = input.lastIndexOf("#") > 0 ? input.lastIndexOf("#") : input.length;
		initUrl = input.substring(0, lastIndex).toLowerCase();
	} else {
		try {
			var arrInitUrl = input.match(/^((http|https|ftp):\/\/)?(.+)\/?/);
			initUrl = arrInitUrl[arrInitUrl.length-1].replace(/\/$/, "").toLowerCase();
			domains = initUrl.split("/")[0];
		} catch (e) {
			initUrl = input;
		}
	}
	
	for (let [blockId, block] of Object.entries(blockListInfo.blocks)) {
		if (typeof unlockedTabs[tabId] == 'undefined' || !(unlockedTabs[tabId].includes(blockId))) {
			for (var i = 0; i < block.blockList.length; i++) {
				var regexBlock = new RegExp("^(.*\\.)?" + escapeRegExp(block.blockList[i].replace(/\/$/, "").toLowerCase()) + "((\\/|\\?|\\#)(.*)?$|$)");
				if (domains.match(regexBlock) || initUrl.match(regexBlock)) {
					var reason = {"type": "url", "blockId": blockId, "rule": block.blockList[i], "password": block.password, "randomText": randomString(block.randomTextLength)};
					for (var j = 0; j < block.exceptionList.length; j++) {
						var regexAllow = new RegExp("^(.*\\.)?" + escapeRegExp(block.exceptionList[j].replace(/\/$/, "").toLowerCase()) + "((\\/|\\?|\\#)(.*)?$|$)");
						if (domains.match(regexAllow) || initUrl.match(regexAllow)) {
							reason = false;
						}
					}
					if (reason) {
						if (countAsBlocked) {
							if (statsEnabled) {
								port.postMessage('blocked@' + initUrl.replace(/@/g,'\\@'));
							}
						}
						return reason;
					}
				}
			}
		}
	}
	
	return 'false';
	
}

function checkBlockUrlv1Tov4(site, countAsBlocked) {
	
	var input = decodeURI(site);
	var domains = '';
	var initUrl = '';
	
	if (input.startsWith("chrome") || input.startsWith("brave") || input.startsWith("vivaldi") || input.startsWith("https://chrome.google.com/webstore") || input.startsWith("https://getcoldturkey.com/blocked/")) {
		return false;
	} else if (input.startsWith("file://") || input.startsWith("chrome-extension://") || input.startsWith("moz-extension://") || input.startsWith("extension://")) {
		var lastIndex = input.lastIndexOf("#") > 0 ? input.lastIndexOf("#") : input.length;
		initUrl = input.substring(0, lastIndex).toLowerCase();
	} else {
		try {
			var arrInitUrl = input.match(/^((http|https|ftp):\/\/)?(.+)\/?/);
			initUrl = arrInitUrl[arrInitUrl.length-1].replace(/\/$/, "").toLowerCase();
			domains = initUrl.split("/")[0];
		} catch (e) {
			initUrl = input;
		}
	}
	
	for (var i = 0; i < currentBlockList.length; i++) {
		var regexBlock = new RegExp("^(.*\\.)?" + escapeRegExp(currentBlockList[i].replace(/\/$/, "").toLowerCase()) + "((\\/|\\?|\\#)(.*)?$|$)");
		if (domains.match(regexBlock) || initUrl.match(regexBlock)) {
			for (var j = 0; j < currentExceptionList.length; j++) {
				var regexAllow = new RegExp("^(.*\\.)?" + escapeRegExp(currentExceptionList[j].replace(/\/$/, "").toLowerCase()) + "((\\/|\\?|\\#)(.*)?$|$)");
				if (domains.match(regexAllow) || initUrl.match(regexAllow)) {
					return false;
				}
			}
			if (countAsBlocked) {
				if (version == 1) {
					counter++;
				} else {
					if (statsEnabled) {
						port.postMessage('blocked@' + initUrl);
					}
				}
			}
			return true;
    	}
	}
	
	return false;
	
}

function checkBlockTitle(title, site, countAsBlocked, tabId) {
	
	if (paused == "") {
		if (version >= 5) {
			return checkBlockTitlev5(title, site, countAsBlocked, tabId);
		} else {
			return (checkBlockTitlev4(title, site, countAsBlocked) ? 'true' : 'false');
		}
	} else {
		return 'false';
	}
	
}

function checkBlockTitlev5(title, site, countAsBlocked, tabId) {
	
	var input = decodeURI(site);
	var domains = '';
	var initUrl = '';	
	if (input.startsWith("chrome") || input.startsWith("brave") || input.startsWith("vivaldi") || input.startsWith("https://chrome.google.com/webstore") || input.startsWith("https://getcoldturkey.com/blocked/")) {
		return 'false';
	} else if (input.startsWith("file://") || input.startsWith("chrome-extension://") || input.startsWith("moz-extension://") || input.startsWith("extension://")) {
		var lastIndex = input.lastIndexOf("#") > 0 ? input.lastIndexOf("#") : input.length;
		initUrl = input.substring(0, lastIndex).toLowerCase();
	} else {
		try {
			var arrInitUrl = input.match(/^((http|https|ftp):\/\/)?(.+)\/?/);
			initUrl = arrInitUrl[arrInitUrl.length-1].replace(/\/$/, "").toLowerCase();
			domains = initUrl.split("/")[0];
		} catch (e) {
			initUrl = input;
		}
	}
	
	for (let [blockId, block] of Object.entries(blockListInfo.blocks)) {
		if (typeof unlockedTabs[tabId] == 'undefined' || !(unlockedTabs[tabId].includes(blockId))) {
			for (var i = 0; i < block.titleList.length; i++) {
				var regexBlock = new RegExp(("^" + escapeRegExp(block.titleList[i]) + "$").toLowerCase());
				if (regexBlock.test(title.toLowerCase())) {
					var reason = {"type": "title", "blockId": blockId, "rule": block.titleList[i], "password": block.password, "randomText": randomString(block.randomTextLength)};
					for (var j = 0; j < block.exceptionList.length; j++) {
						var regexAllow = new RegExp("^(.*\\.)?" + escapeRegExp(block.exceptionList[j].replace(/\/$/, "").toLowerCase()) + "((\\/|\\?|\\#)(.*)?$|$)");
						if (domains.match(regexAllow) || initUrl.match(regexAllow)) {
							reason = false;
						}
					}
					if (reason) {
						if (countAsBlocked) {
							if (statsEnabled) {
								port.postMessage('blocked@' + initUrl.replace(/@/g,'\\@'));
							}
						}
						return reason;
					}
				}
			}
		}
	}
	
	return 'false';
	
}

function checkBlockTitlev4(title, site, countAsBlocked) {
	
	for (var i = 0; i < currentTitleList.length; i++) {
		var regexBlock = new RegExp(("^" + escapeRegExp(currentTitleList[i]) + "$").toLowerCase());
		if (regexBlock.test(title.toLowerCase())) {
			if (countAsBlocked) {
				if (version == 1) {
					counter++;
				} else {
					if (statsEnabled) {
						if (site.startsWith('file://') || site.startsWith('chrome-extension://') || site.startsWith('moz-extension://') || site.startsWith('extension://')) {
							port.postMessage('blocked@' + decodeURIComponent(site).replace(/\#.*$/, "").replace(/@/g,'\\@'));
						} else if (site.startsWith('ftp://') || site.startsWith('http://') || site.startsWith('https://')) {
							var domainInit = decodeURIComponent(site).match(/^((ftp|http|https):\/\/)?(www\.)?(.+)\/?/);
							if (domainInit != null && typeof domainInit[domainInit.length-1] != 'undefined') {
								port.postMessage('blocked@' + domainInit[domainInit.length-1].replace(/\/$/, "").replace(/@/g,'\\@'));
							}
						}
					}
				}
			}
			return true;
    	}
	}
	
	return false;
	
}

function statsCheckv1Tov3() {
	if (statsEnabled) {
		chrome.tabs.query({lastFocusedWindow: true, active: true}, function(tabs){
			if (typeof tabs[0] != 'undefined' && typeof tabs[0].url != 'undefined' && !tabs[0].url.startsWith("chrome") && !tabs[0].url.startsWith("edge") && !tabs[0].url.startsWith("opera") && !tabs[0].url.startsWith("brave") && !tabs[0].url.startsWith("vivaldi") && !tabs[0].url.startsWith("file://") && tabs[0].title != "Blocked by Cold Turkey") {	
				try {
					chrome.windows.get(tabs[0].windowId, function(activeWindow){
						if (activeWindow.focused && (!activeWindow.incognito || activeWindow.incognito && statsEnabledIncognito) && (statsActive || activeWindow.state === 'fullscreen')) {
							var domainInit = tabs[0].url.match(/^((ftp|http|https):\/\/)?(www\.)?(.+)\/?/);
							var domains = domainInit[domainInit.length-1].replace(/\/$/, "").split("/")[0];
							port.postMessage('stats@' + domains);
						}
					});
				} catch (e) {
				}
			}
		});		
	}
}

function statsCheckv4Tov5() {
	if (statsEnabled) {
		try {
			var activeTabId = -1;
			chrome.windows.getLastFocused(function (lastActiveWindow) {
				chrome.tabs.query({lastFocusedWindow: true, active: true}, function (tabs) {
					tabs.forEach(function (tab) {
						if ((tab.active && tab.title != "Blocked by Cold Turkey") && (!lastActiveWindow.incognito || (lastActiveWindow.incognito && statsEnabledIncognito)) && (statsStrict || lastActiveWindow.state == 'fullscreen' || ((statsActive || RegExp(/^https:\/\/(www\.)?(youtube\.com\/watch.*|netflix\.com\/watch.*|dailymotion\.com\/video.*)/).test(tab.url)) && lastActiveWindow.focused))) {
							
							activeTabId = tab.id;
							
							port.postMessage('titleStats@' + tab.title.replace(/@/g,'\\@'));
							
							if (tab.url.startsWith('file://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://') || tab.url.startsWith('extension://')) {
								var formattedUrl = decodeURIComponent(tab.url).replace(/\#.*$/, "").replace(/@/g,'\\@');
								port.postMessage('stats@' + formattedUrl);
							} else if (tab.url.startsWith('ftp://') || tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
								var domainInit = decodeURIComponent(tab.url).match(/^((ftp|http|https):\/\/)?(www\.)?(.+)\/?/);
								if (domainInit != null && typeof domainInit[domainInit.length-1] != 'undefined') {
									port.postMessage('stats@' + domainInit[domainInit.length-1].replace(/\/$/, "").replace(/\#.*$/, "").replace(/@/g,'\\@'));
								}
							}
							
						}
					});
				});
			});
			if (statsStrict) {
				chrome.tabs.query({}, function (tabs) {
					tabs.forEach(function (tab) {
						if (tab.id != activeTabId && tab.title != "Blocked by Cold Turkey" && (!tab.incognito || (tab.incognito && statsEnabledIncognito))) {
							
							port.postMessage('titleStrictStats@' + tab.title.replace(/@/g,'\\@'));
							
							if (tab.url.startsWith('file://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://') || tab.url.startsWith('extension://')) {
								var formattedUrl = decodeURIComponent(tab.url).replace(/\#.*$/, "").replace(/@/g,'\\@');
								port.postMessage('statsStrict@' + formattedUrl);
							} else if (tab.url.startsWith('ftp://') || tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
								var domainInit = decodeURIComponent(tab.url).match(/^((ftp|http|https):\/\/)?(www\.)?(.+)\/?/);
								if (domainInit != null && typeof domainInit[domainInit.length-1] != 'undefined') {
									port.postMessage('strictStats@' + domainInit[domainInit.length-1].replace(/\/$/, "").replace(/\#.*$/, "").replace(/@/g,'\\@'));
								}
							}
							
						}
					});
				});
			}
		} catch (e) {}
	}
}

function doubleCheck() {
	checkOpenTabs();
}

/* Tools */

function randomString(len) {
	if (isNaN(parseInt(len))) {
		return "";
	}
	var chars = "12346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
	var rndStr = '';
	for (var i=0; i<parseInt(len); i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		rndStr += chars.substring(rnum,rnum+1);
	}
	return rndStr;
}

function escapeRegExp(str) {
	var initStr = str.replace(/[\-\[\]\/\{\}\(\)\+\?\^\$\|]/g, "\\$&");
	var regexStr = initStr.replace(/\./g, "\\.").replace(/\*/g, ".*");
	return regexStr;
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};