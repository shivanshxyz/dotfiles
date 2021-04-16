var params = new URLSearchParams(window.location.search);
var paramUrl = params.get('url');
var paramReason = params.get('reason');
var parsedUrl = "";
var parsedReason = {};

if (paramUrl != null) {
	parsedUrl = decodeURIComponent(paramUrl);
}
if (paramReason != null) {
	parsedReason = JSON.parse(atob(paramReason));
}

var iframe = document.createElement('iframe');
iframe.src = parsedUrl;
iframe.id = "blocker-frame";
document.body.appendChild(iframe);

window.addEventListener("message", (event) => {
	if (typeof event.data.command != 'undefined' && event.data.command == "cold-turkey-blocker-get-reason") {
		document.getElementById("blocker-frame").contentWindow.postMessage({ command: "cold-turkey-blocker-reason", reason: parsedReason }, "*");
	} else if (typeof event.data.command != 'undefined' && event.data.command == "cold-turkey-blocker-unlock-tab") {
		chrome.runtime.sendMessage({ command: "unlockTab", blockId: parsedReason.blockId });
	}
});