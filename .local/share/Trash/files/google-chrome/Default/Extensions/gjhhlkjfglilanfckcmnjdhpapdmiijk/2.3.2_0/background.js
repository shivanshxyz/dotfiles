var toggle = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript( { file: 'edit.js' } );
	if(toggle%2==0){
		chrome.browserAction.setIcon({path:"edit.png"});
	}
	else{
		chrome.browserAction.setIcon({path:"noedit.png"});
	}
	toggle++;
});

/*
chrome.tabs.onUpdated.addListener(function(tab){
	chrome.browserAction.setIcon({path:"noedit.png"});
	chrome.tabs.executeScript( { file: 'off.js' } );
	toggle=0;
});

chrome.tabs.onActivated.addListener(function(tab){
	chrome.browserAction.setIcon({path:"noedit.png"});
	chrome.tabs.executeScript( { file: 'off.js' } );
	toggle=0;
});

chrome.tabs.onRemoved.addListener(function(tab){
	chrome.browserAction.setIcon({path:"noedit.png"});
	chrome.tabs.executeScript( { file: 'off.js' } );
	toggle=0;
});*/

