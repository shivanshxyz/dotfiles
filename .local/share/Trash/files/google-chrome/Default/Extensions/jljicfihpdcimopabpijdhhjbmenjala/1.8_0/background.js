var labelID;
var global = this;
var client_id = "44433400230-rhbr3plsprjkjodpth0s2hm2cnrbmcfa.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.modify";
var redirectUri = "https://jljicfihpdcimopabpijdhhjbmenjala.chromiumapp.org/oauth2";
var client_secret = "PLQECfI4JjU7nT5kqhHdsaIh";
var db = '';
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        console.log(request);

        openDB(request.authEmail).then(() => {
            if (request.function == "processFilter") {


                global.labelID = request.labelID;
                getUnsubscribeList(request.token, request.authEmail, request.query).then((response) => response.json())
                    .then(function(data) {
                        console.log(data);
                        messages = data.messages;
                        tempArray = [];
                        if (data.messages != undefined && messages.length > 0) {
                            messages.forEach(function(value, id) {
                                //console.log(value.id);
                                tempArray.push(value.id);
                            });
                            applyFilter(request.token, request.authEmail, tempArray, sendResponse);
                        } else
                            sendResponse({ response: 0 });
                    });
                return true;
            }

            if (request.function == "processEmail") {


                global.labelID = request.labelID;
                console.log(labelID);
                processEmail(request.token, request.authEmail, request.email, sendResponse);





                return true;
                // Will respond asynchronously.
            }
            if (request.function == "processShared") {

                setTimeout(function() {
                    updateDays(7);
                    sendResponse("success");
                }, 1000);

            }
            if (request.function == "processThreadCount") {


                totalThreadCounts(request.token, request.authEmail, request.labelID).then((response) => response.json()).then(function(data) {
                    showPromotion(data.threadsTotal, sendResponse);

                });





                return true;
                // Will respond asynchronously.
            }
            if (request.function == "processLabel") {



                processLabel(request.token, request.authEmail, sendResponse);





                return true;
                // Will respond asynchronously.
            }
            if (request.function == "authentication") {
                key = request.authEmail + "_refresh";
                chrome.storage.local.get([key], function(result) {
                    console.log(result);
                    if (typeof result[key] != 'undefined' && typeof result[key] != '') {
                        getAccessTokenFromRefreshToken(request.authEmail, result[key], sendResponse);
                    } else {
                        firstAuth(request.authEmail, sendResponse);
                    }
                });

                return true;
            }
        });



        return true;

    });

function firstAuth(authEmail, sendResponse) {


    var url = 'https://accounts.google.com/o/oauth2/auth' +
        '?client_id=' + client_id +
        '&response_type=code' +
        '&redirect_uri=' + redirectUri +
        '&access_type=offline' +
        '&login_hint=' + authEmail +
        '&prompt=consent' +
        '&scope=' + scopes;
    console.log(url);
    chrome.identity.launchWebAuthFlow({
        'url': url,
        "interactive": true
    }, function(redirectedTo) {
        console.log(redirectedTo);
        var token = getParameterByName("code", redirectedTo);
        // processLabel(token,authEmail,request.email);
        getRefreshAccessToken(authEmail, token, sendResponse);



    });
}

function getAccessTokenFromRefreshToken(authEmail, refreshToken, sendResponse) {
    let init = {
        method: 'POST',
        async: true,
        headers: {

            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "refresh_token=" + refreshToken + "&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=" + redirectUri + "&grant_type=refresh_token",
        //body : JSON.stringify({"ids":idArray,"addLabelIds":[global.labelID]}),

    };
    console.log(init);
    return fetch(
            'https://www.googleapis.com/oauth2/v4/token',
            init)
        .then(response => response.json())
        .then(function(data) {
            if (typeof data.access_token != 'undefined' && typeof data.access_token != '') {
                sendResponse({ token: data.access_token });
            } else {
                firstAuth(authEmail, sendResponse);
            }
        });
    return true;
}

function getRefreshAccessToken(authEmail, code, sendResponse) {
    let init = {
        method: 'POST',
        async: true,
        headers: {

            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "code=" + code + "&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=" + redirectUri + "&grant_type=authorization_code",
        //body : JSON.stringify({"ids":idArray,"addLabelIds":[global.labelID]}),

    };
    console.log(init);
    return fetch(
            'https://www.googleapis.com/oauth2/v4/token',
            init)
        .then(response => response.json())
        .then(function(data) {
            key = authEmail + "_refresh";
            chrome.storage.local.set({
                [key]: data.refresh_token
            }, function() {

            });
            sendResponse({ token: data.access_token });
        });
    return true;
}


function processLabel(tokenEmail, authEmail, sendResponse) {
    console.log(authEmail);
    checkLabelExist(tokenEmail, authEmail, "HNUnsubscribe").then((response) => response.json())
        .then(function(data) {
            filterYes = 0;
            if (data.labels != null && data.labels != '') {
                for (var key of data.labels) {
                    console.log(key);
                    if (key.name == 'HNGUnsubscribe') {
                        filterYes = 1;
                        labelID = key.id;
                        sendResponse({ labelID: labelID })
                        //processEmail(tokenEmail,authEmail,email,sendResponse);

                    }

                }
                if (filterYes == 0) {
                    createLabelHNGMUnusbscribe(tokenEmail, authEmail, "HNGUnsubscribe", sendResponse);
                }

            }
        });

}

function applyFilter(token, authEmail, idArray, sendResponse) {
    let init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "ids": idArray, "removeLabelIds": ["INBOX"], "addLabelIds": [global.labelID] }),
        //body : JSON.stringify({"ids":idArray,"addLabelIds":[global.labelID]}),
        'contentType': 'json'
    };
    console.log(init);
    return fetch(
            'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/messages/batchModify?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
            init)
        .then(function(data) {

            sendResponse({ response: idArray.length });
        });
    //console.log(token);
}

function getUnsubscribeList(token, authEmail, query) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },

        'contentType': 'json'
    };
    query = encodeURIComponent(query);
   
    return fetch(
        'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/messages?maxResults=600&labelIds=INBOX&q=' + query + '&key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
        init)
}

function totalThreadCounts(token, authEmail, labelID) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },

        'contentType': 'json'
    };
    return fetch(
        'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/labels/' + labelID + '?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
        init)
}

function checkLabelExist(token, authEmail, filterName) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },

        'contentType': 'json'
    };
    return fetch(
        'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/labels?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
        init)
}

function createFilter(token, authEmail, fromVar) {
    console.log("Creating filter" + global.labelID);
    let init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "action": { "removeLabelIds": ["INBOX"], "addLabelIds": [global.labelID] }, "criteria": { "from": fromVar } }),
        'contentType': 'json'
    };
    console.log(init);
    return fetch(
        'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/settings/filters?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
        init)
    //.then((response) => response.json())
    //.then(function(data) {
    // console.log(data)
    //});
    //console.log(token);
}

function deleteFilter(token, authEmail, listID) {
    let init = {
        method: 'DELETE',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };
    fetch(

        'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/settings/filters/' + listID + '?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
        init);
}

function createLabelHNGMUnusbscribe(token, authEmail, labelName = 'HNGUnsubscribe', sendResponse) {
    let init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "labelListVisibility": "labelHide",
            "messageListVisibility": "hide",
            "name": labelName
        }),
        'contentType': 'json'
    };
    return fetch(
            'https://www.googleapis.com/gmail/v1/users/' + authEmail + '/labels?key=AIzaSyCsxHAkrMM59MGaVmvjZY_MFjYNpT3L9Yc',
            init)
        .then((response) => response.json())
        .then(function(data) {
            console.log("Creating filter");
            console.log(data);
            labelID = data.id;
            sendResponse({ labelID: labelID })
        });
    //console.log(token);
    //  chrome.identity.removeCachedAuthToken({ token: token });


}
var db;
var listID = 1;

function openDB(authEmail) {
    return new Promise(function(resolve, reject) {


        var request = indexedDB.open("HelpNinjaGoogleUnsubscribe");
        request.onerror = function(event) {
            console.log("Why didn't you allow my web app to use IndexedDB?!");
        };
        request.onupgradeneeded = function(evt) {
            console.log("openDb.onupgradeneeded");
            var store = evt.target.result.createObjectStore(
                "unsubEmailStore", { keyPath: 'id', autoIncrement: true });

            store.createIndex('authEmail', 'authEmail', { unique: false });

            store.createIndex('listID', 'listID', { unique: false });
            store.createIndex('unsubEmail', 'unsubEmail', { unique: false });
            store.createIndex('unsubEmail, authEmail', ['unsubEmail', 'authEmail']);

            var store = evt.target.result.createObjectStore(
                [authEmail], { keyPath: 'id', autoIncrement: true });

            store.createIndex('listID', 'listID', { unique: false });
            store.createIndex('unsubEmail', 'unsubEmail', { unique: false });
            store.createIndex('listCount', 'listCount', { unique: false });

            var store = evt.target.result.createObjectStore(
                "timer", { keyPath: 'id', autoIncrement: true });

            store.createIndex('time', 'time', { unique: false });

            store.createIndex('days', 'days', { unique: false });

        };
        request.onsuccess = function(event) {
            objectStoreNames = event.target.result.objectStoreNames;
            db = event.target.result;

            useDatabase(db);
            checkStoreFlag = false;
            for (i = 0; i < objectStoreNames.length; i++) {
                if (objectStoreNames[i] == authEmail) {
                    checkStoreFlag = true;
                    break;
                }
            }
            if (checkStoreFlag == true) {
                global.db = db;
                resolve();
            }
            console.log("Check Store Flag" + checkStoreFlag);
            if (checkStoreFlag == false) {
                versionVal = event.target.result.version;
                //database.close();

                console.log(versionVal + 1);
                var createDataStore = window.indexedDB.open("HelpNinjaGoogleUnsubscribe", versionVal + 1);
                console.log("opened DB");
                createDataStore.onupgradeneeded = function(evt) {
                    console.log("upgrade needed");
                    var store = evt.target.result.createObjectStore(
                        [authEmail], { keyPath: 'id', autoIncrement: true });

                    store.createIndex('listID', 'listID', { unique: false });
                    store.createIndex('unsubEmail', 'unsubEmail', { unique: false });
                    store.createIndex('listCount', 'listCount', { unique: false });

                }
                createDataStore.onsuccess = function(event) {
                    console.log("Created the new datastore");
                    db = event.target.result;
                    useDatabase(db);
                    global.db = db;
                    console.log(event.target.result);
                    resolve();
                }
            }
            //var objStore = db.createObjectStore("names", { autoIncrement : true });
            //objStore.add("david");
            console.log(db);
        };

    });

}


function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}

function processEmail(token, authEmail, email, sendResponse) {
    var store = getObjectStore("unsubEmailStore", "readonly");
    console.log("processEmail check");
    console.log(email);
    console.log(authEmail);
    var req = store.index("unsubEmail, authEmail").get([email, authEmail])
    req.onsuccess = function(event) {
        if (event.target.result == undefined) {
            addEmail(token, authEmail, email, sendResponse);
        } else {
            sendResponse("success");
        }
        return true;
    };
    req.onerror = function(event) {

        return false;
    }

}

function updateDays(days) {
    var store = getObjectStore("timer", "readwrite");
    var val = store.get(1);
    val.onsuccess = function(event) {

        var obj = { id: 1, time: event.target.result.time, days: days };
        var req = store.put(obj);
    }

}

function updateTimer(days) {
    var store = getObjectStore("timer", "readwrite");
    var val = store.get(1);
    console.log("Updating Timer");
    val.onsuccess = function(event) {
        if (event.target.result == undefined)
            days = 3;
        else
            days = event.target.result.days;
        console.log("Updating Timer days" + days);
        currentTime = +new Date();
        var obj = { id: 1, days: days, time: currentTime };
        var req = store.put(obj);
    }

}

function showPromotion(threadsTotal, sendResponse) {
    var store = getObjectStore("timer", "readonly");
    var val = store.get(1);
    var showPromotionVal = true;
    val.onsuccess = function(event) {
        if (event.target.result == undefined || event.target.result == '') {
            showPromotionVal = false;
        } else {
            days = event.target.result.days * 86400000;
            if ((+new Date() - event.target.result.time) > days)
                showPromotionVal = true;
        }
        updateTimer(3);
        showPromotionVal = true;
        sendResponse({ threadCount: threadsTotal, showPromotion: showPromotionVal })

    }
}

function addEmail(token, authEmail, email, sendResponse) {
    var store = getObjectStore("unsubEmailStore", "readwrite");
    var listIDStore = getObjectStore(authEmail, "readonly");
    //var index = listIDStore.index('autoID');
    var lastID = listIDStore.openCursor(null, 'prev');
    lastID.onsuccess = function(event) {
        console.log(event.target.result);
        if (event.target.result == null) {
            createNewList(token, authEmail, email, sendResponse)
        } else if (event.target.result.value.listCount + email.length < 1730) {
            console.log(event.target.result)
            appendEmailList(token, authEmail, email, event.target.result.value, sendResponse);
        } else {
            createNewList(token,authEmail, email, sendResponse);
        }
    };

}

function createNewList(token, authEmail, email, sendResponse) {
    // oauth code for new list
    createFilter(token, authEmail, email).then((response) => response.json()).then(function(data) {
        if (data.id != undefined && data.id != '') {
            var store = getObjectStore(authEmail, "readwrite");
            console.log("creating new");
            listID = data.id;
            var obj = { unsubEmail: email, listID: listID, listCount: email.length };
            var request = store.add(obj);
            addUnsubStoreEmail(authEmail, email, listID);
            request.onsuccess = function(event) {
                sendResponse({ listID: event.target.result, unsubEmail: email });
            }
        } else
            sendResponse({ error: "error_try_again" });
    });


}

function appendEmailList(token, authEmail, email, listIDObj, sendResponse) {

    console.log('appending');

    console.log(listIDObj);
    var newEmail = listIDObj.unsubEmail + " OR " + email;
    deleteFilter(token, authEmail, listIDObj.listID);
    createFilter(token, authEmail, newEmail, listIDObj.listID).then((response) => response.json()).then(function(data) {
        if (data.id != undefined && data.id != '') {
            var store = getObjectStore(authEmail, "readwrite");
            var obj = { id: listIDObj.id, unsubEmail: newEmail, listID: data.id, listCount: newEmail.length };
            //console.log(obj);

            var req = store.put(obj);

            addUnsubStoreEmail(authEmail, email, listID);
            sendResponse({ listID: listIDObj.id, unsubEmail: newEmail });
        } else
            sendResponse({ error: "error_try_again" });
    });


}

function addUnsubStoreEmail(authEmail, email, listID) {
    var store = getObjectStore("unsubEmailStore", "readwrite");
    var obj = { unsubEmail: email, authEmail: authEmail, listID: listID };
    var req = store.put(obj)
}

function getParameterByName(name, url) {
    //if (!url) url = window.location.href;
    url = url.replace("oauth2#", "?")
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function useDatabase(db) {
    // Make sure to add a handler to be notified if another page requests a version
    // change. We must close the database. This allows the other page to upgrade the database.
    // If you don't do this then the upgrade won't happen until the user closes the tab.
    db.onversionchange = function(event) {
        db.close();
        console.log("A new version of this page is ready. Please reload or close this tab!");
    };
}

chrome.runtime.onInstalled.addListener(function (object) {
    
     chrome.tabs.query({}, function (arrayOfTabs) {
        var noTabs = 0;
           arrayOfTabs.forEach(function(tab) {

            url = tab.url;
            if(url && url.indexOf("https://mail.google.com")!==-1)
            {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab.id, {code: code});
            noTabs = 1;
            }
    
});
           if(noTabs==0)
           {
            chrome.tabs.create({url: "https://mail.google.com/"}, function (tab) {
       
            });
           }

    //var code = 'window.location.reload();';
    //chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});
});
});

/*fetch(url)
          .then(function(response) {
            sendResponse(url);
          })
          
         return true;*/
/*var url = request.url
      
         var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    console.log("Request sent" + xhr.responseText);
sendResponse({farewell: xhr.responseText});

  }
}
xhr.send();*/