String.prototype.repeat = function(length) {
    return Array(length + 1).join(this);
};

var generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    // append user-id to database
    $.ajax({
        type: "POST",
        url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?action=R&uid=' + uuid),
        success: function(status) {
            if (status && status.length) {
                console.log("@@@@@ User registration success! @@@@@");
            }
        }
    })

    return uuid;
};


var rank = 0;
var userRank = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // check content type
    if (request.action == 'A') {
        $.ajax({
            type: request.method,
            url: request.url,
            async: true
        }).done(function(message, text, jqXHR) {
            var type = jqXHR.getResponseHeader('Content-Type').split(";")[0];
            if (type == "text/html") {
                sendResponse({ status: "YES" });
                rank = request.rank + 1;
            } else {
                console.log("%%%%%%%% Cannot open type: " + type + " %%%%%%%%");
                sendResponse({ status: "NO" });
            }
        })
    } else if (request.action == 'R') {
        // check if rerank feature is on
        sendResponse({ status: popupSettings.rerank })
    } else if (request.action == 'U') {
        // to download reranking data
        $.ajax({
            type: "POST",
            url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?uid=' + popupSettings.uuid + '&action=U'),
            dataType: 'json',
            // request.data is like [snippet1, snippet2, ...]
            data: { json: request.data },
            success: function(data) {
                // data.rank is a json object, parse it in content.js
                sendResponse({ data: data.rank });
            }
        })
    }
    return true;
})

var toEightDigits = function(n) {
    var s = n.toString;
    return "0".repeat(8 - s.length) + s;
}

var requestHandlers = {
    global_set_store: function(data, callback, sender) {
        store.set(data.key, data.value);
    },
    global_get_store: function(data, callback, sender) {
        callback(store.get(data.key));
    },
    loginfo: function(data, callback, sender) {
        console.log(sender.tab.url, data.text);
    },
    closeme: function(data, callback, sender) {
        chrome.tabs.remove(sender.tab.id);
    },
    ajax_post: function(data, callback, sender) {
        $.ajax({
            type: 'POST',
            url: data.url,
            data: data.data,
            dataType: "json",
            success: function(result) {
                callback({ success: true, data: result });
            },
            error: function() {
                callback({ success: false });
            }
        });
    },
    ajax_get: function(data, callback, sender) {
        $.ajax({
            type: 'GET',
            url: data.url,
            success: function(result) {
                callback({ success: true, data: result });
            },
            error: function() {
                callback({ success: false });
            }
        });
    },
    query_generator: function(data, callback, sender) {
        if (popupSettings.started) {
            userRank = data.index + 1;
            $.ajax({
                type: 'POST',
                url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?action=UC&query=' + data.keyword + '&click=' + userRank + '&url=' + data.url + '&content=' + data.title + '&uid=' + popupSettings.uuid + '&snip=' + data.content),
                success: function(status) {
                    if (status && status.length) {
                        console.log("@@@@@ user click post success! @@@@@");
                    }
                }
            })
        }
    }
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    requestHandlers[request.handler](request, sendResponse, sender);
});


/**
 * data storage
 */

// part 1: global setting including offswitch, user_id and starting date
var popupSettings = store.get('popupSettings') || {
    started: true,
    rerank: true,
    uuid: generateUUID(),
    date: new Date()
}

if (store.get('popupSettings') == undefined) {
    var popupSettings = {
        started: true,
        rerank: true,
        uuid: generateUUID(),
        date: new Date()
    };
    // save new user-id to database!


} else {
    var popupSettings = store.get('popupSettings');
}

var savePopupSettings = function() {
    store.set('popupSettings', popupSettings);
    console.log("+++++++++++ GLOBAL VARIABLES SET ++++++++++");
    console.log("+ " + store.get('popupSettings').started + " ".repeat((40 - store.get('popupSettings').started.toString().length)) + "+");
    console.log("+ " + store.get('popupSettings').rerank + " ".repeat((40 - store.get('popupSettings').rerank.toString().length)) + "+");
    console.log("+ " + store.get('popupSettings').uuid + " ".repeat(4) + "+");
    console.log("+ " + store.get('popupSettings').date + " ".repeat(16) + "+");
    console.log("+++++++++++ GLOBAL VARIABLES SET ++++++++++");
}

savePopupSettings();

if (!popupSettings.uuid) {
    popupSettings.uuid = generateUUID();
    savePopupSettings();
}

// part 2: save topic history, for visualization.html
var userTopics = store.get('userTopics') || {};
var generatedTopics = store.get('generatedTopics') || {};

var saveTopics = function() {
    store.set('userTopics', userTopics);
    store.set('generatedTopics', generatedTopics);
}

var addTopic = function(topicCollection, topic) {
    if (topicCollection.hasOwnProperty(topic)) {
        topicCollection[topic] += 1;
    } else {
        topicCollection[topic] = 1;
    }
    saveTopics();
}

saveTopics();

// part 3: save topic history, for popup.html
var last_user_topic = store.get('lut') || undefined;
var last_generated_topics = store.get('lgt') || [];

var saveLastTopics = function() {
    store.set('lut', last_user_topic);
    store.set('lgt', last_generated_topics);
}

saveLastTopics();

//part 4: save queries, for visualization.html
var userQueries = store.get("userQuery") || {};
var generatedQueries = store.get("generatedQuery") || {};

var saveQueries = function() {
    store.set("userQuery", userQueries);
    store.set("generatedQuery", generatedQueries);
}

var addQuery = function(queryCollection, query) {
    var splits = query.split(" ");
    $.each(splits, function(index, value) {
        if (queryCollection.hasOwnProperty(value)) {
            queryCollection[value] += 1;
        } else {
            queryCollection[value] = 1;
        }
    })
    saveQueries();
}

saveQueries();

// simulate search
var keywordsPools = [],
    simulateKeyword, simulateTab;
var simulateSearch = function() {
    if (simulateTab) {
        return;
    }

    if (!keywordsPools || !keywordsPools.length) {
        return;
    }

    simulateKeyword = keywordsPools[0];
    keywordsPools = keywordsPools.slice(1);
    console.log('simulateKeyword:');
    console.log('<<< ', simulateKeyword, ' >>>');
    chrome.tabs.create({ url: 'https://www.google.com/', active: false }, function(tab) {
        simulateTab = tab;
        setTimeout(function() {
            chrome.tabs.remove(tab.id, function() {
                if (chrome.runtime.lastError) {} else {}
            });
            if (simulateTab && simulateTab.id === tab.id) {
                simulateTab = undefined;
                simulateSearch();
            }
        }, 10 * 1000);
    });
}

// post simulation data back to database
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var title = changeInfo.title;
    if (simulateTab && simulateTab.id === tabId && changeInfo.status && changeInfo.status === 'complete') {
        // if (simulateTab && simulateTab.id === tabId && title) {
        if (tab.url.indexOf('www.google.com') == -1) {
            $.ajax({
                type: 'POST',
                url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?action=SC&query=' + simulateKeyword + '&click=' + rank + '&url=' + tab.url + '&content=' + tab.title + '&uid=' + popupSettings.uuid),
                success: function(status) {
                    if (status && status.length) {
                        console.log("&&&&& Post successful! &&&&&")
                    }
                }
            });
            try {
                chrome.tabs.remove(tab.id, function() {
                    if (chrome.runtime.lastError) {} else {}
                });
            } catch (e) {}
            if (simulateTab && simulateTab.id === tab.id) {
                simulateTab = undefined;
                simulateSearch();
            }
        }
    }
});

// check if user makes a google search every 5 seconds
setInterval(function() {
    if (!popupSettings.started) {
        return;
    }
    simulateSearch();
}, 5 * 1000);

// simulate acquiring keywords
requestHandlers.simulate_keyword = function(data, callback, sender) {
    callback({ keyword: simulateKeyword });
}


// handle the search
var lastSearch;
requestHandlers.handle_search = function(data, callback, sender) {
    var q = data.q;
    if (simulateTab && simulateTab.id === sender.tab.id) {
        return callback({ simulate: true });
    } else {
        callback({ simulate: false });
    }
    if (lastSearch != q) {
        lastSearch = q;
        if (popupSettings.started) {
            $.ajax({
                type: 'POST',
                url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?action=Q&query=' + q + '&uid=' + popupSettings.uuid + '&numcover=4'),
                success: function(keywords) {
                    last_generated_topics = [];
                    $.each(keywords, function(key, val) {
                        console.log(key + ", " + val);
                        if (key == "input") {
                            last_user_topic = val;
                            addTopic(userTopics, val);
                            addQuery(userQueries, q.replace(/[^A-Za-z0-9]/g, ' '));
                        } else {
                            keywordsPools = keywordsPools.concat(key);
                            last_generated_topics.push(val);
                            addTopic(generatedTopics, val);
                            addQuery(generatedQueries, key);
                        }
                        saveTopics();
                        saveLastTopics();
                        saveQueries();
                    });
                    // if (keywords && keywords.length) {
                    //     var jsons = JSON.parse(keywords);
                    //     console.log(jsons);
                    //     last_generated_topics = [];
                    //     $.each(jsons, function(key, value) {
                    //         if (key == "input") {
                    //             last_user_topic = value;
                    //             addTopic(userTopics, value);
                    //             addQuery(userQueries, q.replace(/[^A-Za-z0-9]/g, ' '));
                    //         } else if (key == "notopic") {
                    //             keywordsPools = keywordsPools.concat(value);
                    //             addQuery(generatedQueries, value);
                    //         } else if (key != "db") {
                    //             keywordsPools = keywordsPools.concat(key);
                    //             last_generated_topics.push(value);
                    //             addTopic(generatedTopics, value);
                    //             addQuery(generatedQueries, key);
                    //         }
                    //     })
                    //     saveTopics();
                    //     saveLastTopics();
                    //     saveQueries();
                    // } else {
                    //     console.log('no?');
                    // }
                }
            });
        }
    }
}