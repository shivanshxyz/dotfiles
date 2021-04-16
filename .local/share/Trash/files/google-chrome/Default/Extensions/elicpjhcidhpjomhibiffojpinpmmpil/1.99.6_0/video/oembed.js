﻿
var L64Oembed = {
    isSupported: function (curTabId, url, callback) {
        chrome.tabs.sendMessage(curTabId, { id: "SP24GetOEmbedUrl" }, function (response) {
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
				return;
            //console.log(response);
			
            if (callback) {
                callback(response ? response.available : false);
            }
        });
    },
    requestAddVideo: function (curTabId, play) {
        //console.log("requestAddVideo tabID:" + curTabId);
        chrome.tabs.sendMessage(curTabId, { id: "SP24RequestOEmbedInfo", play: play }, function (response) {
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
				return;
		});
    },
}