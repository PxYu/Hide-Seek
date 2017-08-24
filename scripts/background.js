function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


var rank = 0;
var userRank = 0;

//handle message

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'A') {
        $.ajax({
            type: request.method,
            url: request.url,
            async: true
        }).done(function(message, text, jqXHR) {
            var type = jqXHR.getResponseHeader('Content-Type').split(";")[0];
            console.log(type);
            if (type == "text/html") {
                sendResponse({ status: "YES" });
                rank = request.rank + 1;
            } else {
                console.log("%%%%%%%% Cannot open type: " + type + " %%%%%%%%");
                sendResponse({ status: "NO" });
            }
        })
    }
    return true;
})

/**
 * handling method
 */
var requestHandlers = {
    global_set_store: function(data, callback, sender) {
        store.set(data.key, data.value);
    },
    global_get_store: function(data, callback, sender) {
        callback(store.get(data.key));
    },
    loginfo: function(data, callback, sender) {
        console.log('打印信息', sender.tab.url, data.text);
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
        userRank = data.index + 1;
        $.ajax({
            type: 'POST',
            url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?query=' + data.keyword + '&click=' + userRank + '&url=' + data.url + '&content=' + data.title + '&id=' + popupSettings.uuid),
            success: function(status) {
                if (status && status.length) {
                    console.log("@@@@@ user click post success! @@@@@");
                }
            }
        })
    }
}

/**
 * message passing
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    requestHandlers[request.handler](request, sendResponse, sender);
});


/**
 * data storage
 */

// part 1: global setting including offswitch, user_id and starting date
var popupSettings = store.get('popupSettings') || {
    started: true,
    uuid: generateUUID(),
    date: new Date()
}

var savePopupSettings = function() {
    store.set('popupSettings', popupSettings);
    console.log("+++++++++++已设置全局变量++++++++++");
    console.log(store.get('popupSettings').started);
    console.log(store.get('popupSettings').uuid);
    console.log(store.get('popupSettings').date);
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

/**
 * simulating searches
 */
var keywordsPools = [],
    simulateKeyword, simulateTab;
var simulateSearch = function() {
    if (simulateTab) {
        return console.log('正在执行任务...');
    }

    console.log('keywordsPools', keywordsPools);
    if (!keywordsPools || !keywordsPools.length) {
        return console.log('没有执行任务...')
    }

    simulateKeyword = keywordsPools[0];
    keywordsPools = keywordsPools.slice(1);
    console.log('simulateKeyword: [[[ ', simulateKeyword, ' ]]]');
    chrome.tabs.create({ url: 'https://www.google.com/', active: false }, function(tab) {
        simulateTab = tab;
        setTimeout(function() {
            try {
                chrome.tabs.remove(tab.id);
            } catch (e) {}
            if (simulateTab && simulateTab.id === tab.id) {
                simulateTab = undefined;
                simulateSearch();
            }
        }, 10 * 1000);
    });
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var title = changeInfo.title;
    if (simulateTab && simulateTab.id === tabId && changeInfo.status && changeInfo.status === 'complete') {
        // if (simulateTab && simulateTab.id === tabId && title) {
        if (tab.url.indexOf('www.google.com') == -1) {
            // console.log(popupSettings.uuid, tab.url, title, simulateKeyword);
            console.log(popupSettings.uuid, tab.url, tab.title, simulateKeyword);
            console.log("RANKKKKKKK: " + rank);
            $.ajax({
                type: 'POST',
                url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?query=' + simulateKeyword + '&click=' + rank + '&url=' + tab.url + '&content=' + tab.title + '&id=' + popupSettings.uuid),
                success: function(status) {
                    if (status && status.length) {
                        console.log("~~~~~ Post successful! ~~~~~")
                    }
                }
            });
            try {
                chrome.tabs.remove(tab.id);
            } catch (e) {}
            if (simulateTab && simulateTab.id === tab.id) {
                simulateTab = undefined;
                simulateSearch();
            }
        }
    }
});

setInterval(function() {
    if (!popupSettings.started) {
        return;
    }
    simulateSearch();
}, 5 * 1000);

/**
 * 模拟搜索获取关键词
 */
requestHandlers.simulate_keyword = function(data, callback, sender) {
    callback({ keyword: simulateKeyword });
}

/**
 * search handling
 */
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
                type: 'GET',
                url: apihost + '/QueryGenerator/QueryGenerator?query=' + q + '&id=' + popupSettings.uuid + '&numcover=4',
                success: function(keywords) {
                    if (keywords && keywords.length) {
                        var jsons = JSON.parse(keywords);
                        console.log(jsons);
                        last_generated_topics = [];
                        $.each(jsons, function(key, value) {
                            if (key == "input") {
                                last_user_topic = value;
                                addTopic(userTopics, value);
                                addQuery(userQueries, q.replace(/[^A-Za-z0-9]/g, ' '));
                            } else if (key == "notopic") {
                                keywordsPools = keywordsPools.concat(value);
                                addQuery(generatedQueries, value);
                            } else if (key != "db") {
                                keywordsPools = keywordsPools.concat(key);
                                last_generated_topics.push(value);
                                addTopic(generatedTopics, value);
                                addQuery(generatedQueries, key);
                            }
                        })
                        saveTopics();
                        saveLastTopics();
                        saveQueries();
                    }
                }
            });
        }
    }
}