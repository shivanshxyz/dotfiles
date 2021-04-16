/*	Cold Turkey Blocker Chrome Extension v4.2
	Copyright (c) 2020 Cold Turkey Software Inc.
*/

chrome.runtime.sendMessage({command: "checkBlockUrl", site: window.location.href}, function(response) {
	handleResponse(response);	
});

if (window.self == window.top) {
	chrome.runtime.onMessage.addListener(function(request, sender) {
		switch (request.command) {
			case "cold-turkey-blocker-pause-error": 
				alert(request.errorMessage);
				break;
		}
	});
}

document.addEventListener("DOMContentLoaded", function(){
	chrome.runtime.sendMessage({command: "checkBlockTitle", title: window.document.title, site: window.location.href}, function(response) {
		handleResponse(response);
	});
});

window.addEventListener("message", (event) => {
	if (event.source == window && event.data && event.data.command == "cold-turkey-blocker-pause") {
		chrome.runtime.sendMessage({ command: "pause", key: event.data.key }, function(response) { } );
	}
});

function handleResponse(response) {
	
	if (response.block != 'false') {
		if (response.version <= 3) {
			if (window.self == window.top) {
				window.stop();
				var param = '';	
				param = param + (response.isPro ? '?pro=true' : '?pro=false');
				param = param + '&rand=' + Math.round(Math.random() * 10000000).toString();
				blockPage("3.0", param, "");
			}
		} else if (response.version == 4) {
			if ((window.self == window.top) || response.blockEmbedded) {
				window.stop();
				var param = '';
				param = param + ((window.self != window.top) ? '?embed=true' : '?embed=false');
				param = param + (response.isPro ? '&pro=true' : '&pro=false');
				param = param + (response.blockCharity ? '&blockCharity=true' : '&blockCharity=false');
				param = param + '&rand=' + Math.round(Math.random() * 10000000).toString();
				blockPage("4.0", param, "");
			}
		} else if (response.version == 5) {
			if ((window.self == window.top) || response.blockEmbedded) {
				window.stop();
				var param = '';
				param = param + ((window.self != window.top) ? '?embed=true' : '?embed=false');
				param = param + (response.isPro ? '&pro=true' : '&pro=false');
				param = param + (response.blockCharity ? '&blockCharity=true' : '&blockCharity=false');
				param = param + '&rand=' + Math.round(Math.random() * 10000000).toString();
				blockPage("4.2", param, {"blockId": response.block.blockId, "type": response.block.type, "rule": response.block.rule, "password": response.block.password, "randomText": response.block.randomText});
			}
		}
	}
	
}

function blockPage(version, param, reason) {
	
	encodedReason = "";
	if (reason != "") {
		encodedReason = '&reason=' + btoa(JSON.stringify(reason));
	}
	
	var iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('ctFrame.html?url=' + encodeURIComponent('https://getcoldturkey.com/blocked/' + version + "/" + param) + encodedReason);
    iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;';
	
	var tmp = document.createElement("div");
	tmp.appendChild(iframe);
	
	var blockPage = '<html><head><title>Blocked by Cold Turkey</title></head><body style="margin:0 !important;">' + tmp.innerHTML + '</body></html>';
	
	document.documentElement.innerHTML = blockPage;
	
}