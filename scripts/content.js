console.log('chrome_search');
$(function() {
    var href = location.href;

    /**
     * 触发事件
     * @param node
     * @param eventType
     */
    var triggerMouseEvent = function(node, eventType) {
        try {
            var clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent(eventType, true, true);
            node.dispatchEvent(clickEvent);
        } catch (e) {
            console.log('errr', node, eventType);
        }
    }
    var simulateClick = function(node) {
        triggerMouseEvent(node, "mouseover");
        triggerMouseEvent(node, "mousedown");
        triggerMouseEvent(node, "mouseup");
        triggerMouseEvent(node, "click");
    }

    var getQueryString = function(url, name) {
        var reg = new RegExp("[\?|\&]" + name + "=([^&]*)(&|$)", "i");
        var r = url.match(reg);
        if (r != null) return r[1];
        return null;
    }

    var autoSearch = function(keyword) {
        $('#lst-ib').val(keyword);
        setInterval(function() {
            $('#lst-ib').blur();
            $('#tsf').submit();
        }, 1000);
    }

    // if (href === 'https://www.google.com/') {
    //     autoSearch('apple');
    // }

    if (href.indexOf('www.google.com.hk/search') != -1 || href.indexOf('www.google.com/search') != -1) {
        var q = decodeURIComponent(getQueryString(href, 'q'));
        console.log('q', q);
        if (q) {
            chrome.extension.sendRequest({ handler: 'handle_search', q: q }, function(result) {
                console.log('result', result);

                /**
                 * 模拟搜索处理，自动点击
                 */
                if (result && result.simulate) {
                    console.log('模拟搜索处理，自动点击');
                    var alist = $('#res .g .r a');
                    var idx = Math.floor(Math.random() * alist.length);
                    // 插入检测
                    if (!alist[idx].href.endsWith('.pdf')) {
                        console.log(alist[idx]);
                        alist[idx].click();
                    }
                }
            });
        }
    } else if (href === 'https://www.google.com/') {
        /**
         * 获取模拟搜索词
         */
        chrome.extension.sendRequest({ handler: 'simulate_keyword' }, function(result) {
            if (result.keyword) {
                autoSearch(result.keyword);
            }
        });
    }
});