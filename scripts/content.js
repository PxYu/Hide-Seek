$(function() {
    var href = location.href;
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

    if (href.indexOf('www.google.com.hk/search') != -1 || href.indexOf('www.google.com/search') != -1) {
        var q = decodeURIComponent(getQueryString(href, 'q'));
        console.log('q', q);
        if (q) {
            chrome.extension.sendRequest({ handler: 'handle_search', q: q }, function(result) {
                console.log('result', result);

                if (result && result.simulate) {
                    // current page is simulated
                    var alist = $('#res .g .r a');
                    var idx = Math.floor(Math.random() * alist.length);

                    // make sure random click does not trigger a download
                    chrome.runtime.sendMessage({
                        method: 'HEAD',
                        action: 'A',
                        url: alist[idx].href,
                        rank: idx
                    }, function(response) {
                        console.log(response.status);
                        if (response.status == "YES") {
                            alist[idx].click();
                        } else {}
                    });
                } else {
                    // current page is user search page

                    // upload the page to the server and download re-ranking

                    // 1. capture snippets from the page & save to array
                    // var snippets = [];
                    // // $.each($("#res .g").find("span.st").clone().children().remove().end(), function(idx, val) {
                    // $.each($("div.srg").find("div.g span.st"), function(idx, val) {
                    //     console.log($(this));
                    //     snippets.push($(this).text());
                    // })
                    // console.log(snippets);

                    var items = [];
                    var snippets = [];
                    var block = [];


                    $.each($("div.srg"), function(index, value) {
                        console.log("=======");
                        // 把block信息存起来
                        block.push($(this));
                        // 把block中条目信息存起来（顺序）
                        var tmpItem = $(this).find("div.g").toArray();
                        var clone = tmpItem.slice(0);
                        console.log(tmpItem);
                        // items.push(tmpItem);
                        var snippet = [];
                        $.each($(this).find("div.g span.st"), function(idx, val) {
                            console.log($(this));
                            snippet.push($(this).text());
                        })

                        chrome.runtime.sendMessage({
                            action: 'U',
                            data: snippet
                        }, function(response) {
                            var re_rank = response.data;
                            console.log(re_rank);
                            tmpItem.sort(function(a, b) {
                                return re_rank[clone.indexOf(a)] - re_rank[clone.indexOf(b)];
                            })
                            console.log(tmpItem);
                            items.push(tmpItem);
                        })

                    });

                    chrome.runtime.sendMessage({
                        action: 'R',
                    }, function(response) {
                        console.log(response.status);
                        // whether re-ranking switch is on
                        if (response.status) {
                            $('<input type="button" id="rerank" value="re-rank results" style="float: right">').insertAfter("nobr");
                            $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "green", "font-weight": "bold" });
                            $("#rerank").click(function() {
                                console.log($("#rerank"));
                                $("#rerank").attr('disabled', 'disabled');
                                $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "grey", "font-weight": "bold" });
                                var i = 0;
                                $.each(block, function() {
                                    var tmp = $(this);
                                    console.log(tmp[0]);

                                    $.each(items[i], function() {
                                        tmp[0].append(this);
                                        console.log(this);
                                    })
                                    i += 1;
                                });
                            })
                        } else {}
                    });

                    // sent click info
                    $('#res .g .r a').click(function() {
                        var self = $(this);
                        var url = self.attr('href');
                        if (url.indexOf('/url?') == 0) {
                            url = decodeURIComponent(getQueryString(url, 'url'));
                        }

                        var snip = $(this).parent().closest('div').find(".st").text();
                        var title = self.text();
                        var keyword = $('#lst-ib').val();

                        chrome.extension.sendRequest({
                            handler: 'query_generator',
                            content: snip,
                            url: url,
                            title: title,
                            keyword: keyword,
                            index: -1
                        });

                    });
                }
            });
        }
    } else if (href === 'https://www.google.com/') {
        // this page is google homepage
        chrome.extension.sendRequest({ handler: 'simulate_keyword' }, function(result) {
            if (result.keyword) {
                autoSearch(result.keyword);
            }
        });
    }
});