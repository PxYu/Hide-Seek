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
                    // if (!alist[idx].href.endsWith('.pdf')) {
                    //     console.log(alist[idx]);
                    //     alist[idx].click();
                    // }
                    chrome.runtime.sendMessage({
                        method: 'HEAD',
                        action: 'A',
                        url: alist[idx].href,
                        rank: idx
                    }, function(response) {
                        //alert(responseText);
                        console.log(response.status);
                        if (response.status == "YES") {
                            alist[idx].click();
                        }
                    });
                } else {
                    // console.log("HIIIIII");
                    // $('div._NId').hide();
                    // // $('div.srg').hide();
                    // setTimeout(function() {
                    //     var items = $("div.srg div.g").toArray();
                    //     items.reverse();
                    //     $.each(items, function() {
                    //         $("div.srg").append(this);
                    //     })
                    //     $('div._NId').show();
                    // }, 2 * 1000)

                    $('<input type="button" id="rerank" value="re-rank results">').insertAfter("nobr");
                    $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "red" });
                    $("#rerank").click(function() {
                        var items = $("div.srg div.g").toArray();
                        items.reverse();
                        $.each(items, function() {
                            $("div.srg").append(this);
                        })
                    })

                    var resultList = $("#res .g .r a");
                    var hrefArray = [];
                    $.each(resultList, function(index, value) {
                        hrefArray.push(resultList[index].href);
                    })

                    $('#res .g .r a').click(function() {
                        var self = $(this);
                        var url = self.attr('href');
                        if (url.indexOf('/url?') == 0) {
                            url = decodeURIComponent(getQueryString(url, 'url'));
                        }
                        var i = 0;
                        $.each(hrefArray, function(index, value) {
                            if (hrefArray[index] == url) {
                                i = index;
                            }
                        })
                        var title = self.text();
                        var keyword = $('#lst-ib').val();

                        chrome.extension.sendRequest({
                            handler: 'query_generator',
                            url: url,
                            title: title,
                            keyword: keyword,
                            index: i
                        });
                    });
                }
            });
        }
    } else if (href === 'https://www.google.com/') {
        /**
         * simulate getting query word
         */
        chrome.extension.sendRequest({ handler: 'simulate_keyword' }, function(result) {
            if (result.keyword) {
                autoSearch(result.keyword);
            }
        });
    }
});