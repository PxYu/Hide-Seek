function generateUUID() {
    var d = new Date().getTime();
    // var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var uuid = 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/**
 * 处理方法
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
    }
}

/**
 * 消息通信
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    requestHandlers[request.handler](request, sendResponse, sender);
});


/**
 * 全局设置
 */
var popupSettings = store.get('popupSettings') || {
    started: true,
    uuid: generateUUID(),
    date: new Date()
};
var savePopupSettings = function() {
    store.set('popupSettings', popupSettings);
    console.log("+++++++++++已设置全局变量++++++++++");
    console.log(store.get('popupSettings').started);
    console.log(store.get('popupSettings').uuid);
    console.log(store.get('popupSettings').date);
}
if (!popupSettings.uuid) {
    popupSettings.uuid = generateUUID();
    savePopupSettings();
}

/**
 * 模拟搜索
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
    // if (simulateTab && simulateTab.id === tabId && changeInfo.status && changeInfo.status === 'complete') {
    if (simulateTab && simulateTab.id === tabId && title) {
        if (tab.url.indexOf('www.google.com') == -1) {
            // console.log(popupSettings.uuid, tab.url, tab.title, simulateKeyword);
            console.log(popupSettings.uuid, tab.url, title, simulateKeyword);
            $.ajax({
                type: 'POST',
                // url: apihost + '/query?query=' + q,
                url: encodeURI(apihost + '/QueryGenerator/QueryGenerator?query=' + simulateKeyword + '&click=0&url=' + tab.url + '&content=' + tab.title + '&id=' + popupSettings.uuid),
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
    //simulateKeyword = undefined;
}

/**
 * 处理搜索
 */
var lastSearch;
requestHandlers.handle_search = function(data, callback, sender) {
    var q = data.q;
    if (simulateTab && simulateTab.id === sender.tab.id) {
        return callback({ simulate: true });
    }
    if (lastSearch != q) {
        lastSearch = q;
        if (popupSettings.started) {
            $.ajax({
                type: 'GET',
                // url: apihost + '/query?query=' + q,
                url: apihost + '/QueryGenerator/QueryGenerator?query=' + q + '&id=' + popupSettings.uuid + '&numcover=4',
                success: function(keywords) {
                    if (keywords && keywords.length) {
                        var jsons = JSON.parse(keywords);
                        console.log("=====!!!!!=====" + keywords);
                        $.each(jsons, function(key, value) {
                            if (value != "null" && value != "success") {
                                keywordsPools = keywordsPools.concat(value);
                            }
                        })
                    }
                }
            });
        }
    }
}