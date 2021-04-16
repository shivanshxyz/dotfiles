document.addEventListener("DOMContentLoaded", function() {
	if (document.getElementById("menu") != null && document.getElementById("urls") != null && document.getElementById("lists-addable") != null) {
		document.getElementById("urls").innerText = "";
		document.getElementById("lists-addable").innerText = "";
		
		document.getElementById("open-blocker").addEventListener('click', function() {
			chrome.runtime.sendMessage({ command: "open-blocker" }, function(response) {
				this.close();
			});
		});
		document.getElementById("add-block").addEventListener('click', function() {
			chrome.runtime.sendMessage({ command: "add-block", block: document.getElementById("lists-addable").value, url: document.getElementById("urls").value }, function(response) { 
				this.close();
			});
		});
		document.getElementById("badge-data").addEventListener('change', function(element) {
			chrome.runtime.sendMessage({ command: "setBadgeData", badge: element.target.value });
		});
		
		chrome.runtime.sendMessage({ command: "listBlocks" }, function(response) {
			if (response.paused != "") {
				var pausedSplit = response.paused.split(",");
				var pauseEnd = new Date(pausedSplit[0], pausedSplit[1]-1, pausedSplit[2], pausedSplit[3], pausedSplit[4], pausedSplit[5]);
				var diffMins = Math.round((((pauseEnd - (new Date())) % 86400000) % 3600000) / 60000);
				document.getElementById("item-count").innerText = diffMins.toString() + " min remaining of your pause!";
			} else {
				document.getElementById("item-count").innerText = response.itemCount.toString() + ' item(s) being blocked right now. ';
			}
			response.addableBlocks.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			}).forEach(function(blockName) {
				var lists = document.getElementById("lists-addable");
				var option = document.createElement("option");
				if (blockName.length >= 40) {
					option.text = blockName.substring(0,37) + "...";
				} else {
					option.text = blockName;
				}
				option.value = blockName;
				lists.add(option);
				if (response.version >= 5) {
					var breaks = document.getElementById("badge-data");
					var option = document.createElement("option");
					if (blockName.length >= 40) {
						option.text = blockName.substring(0,31) + "... break";
					} else {
						option.text = blockName + " breaks";
					}
					option.value = blockName;
					breaks.add(option);
				}
			});
		});
		chrome.runtime.sendMessage({ command: "getBadgeData" }, function(response) {
			if (response.badge == "hidden" || response.badge == "total") {
				document.getElementById("badge-data").value = response.badge;
			} else {
				for (i = 0; i < document.getElementById("badge-data").length; ++i) {
					if (document.getElementById("badge-data").options[i].value == response.badge) {
						document.getElementById("badge-data").value = response.badge;
						return;
					}
				}
				document.getElementById("badge-data").value = "hidden";
			}
		});
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			switch (request.command) {
				case "urls":
					request.urls.forEach(function(activeUrl) {
						var urls = document.getElementById("urls");
						var option = document.createElement("option");
						if (activeUrl.length >= 40) {
							option.text = activeUrl.substring(0,37) + "...";
						} else {
							option.text = activeUrl;
						}
						option.value = activeUrl;
						urls.add(option);
					});
					sendResponse({ response: true });
					break;
			}
		});
		chrome.runtime.sendMessage({ command: "getURLs" }, function(response) { });
	}
});