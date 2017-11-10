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

    if (href.indexOf('www.google.com.hk/search') != -1 || href.indexOf('www.google.com/search') != -1 || href.indexOf('www.google.ca/search') != -1 || href.indexOf('www.google.co.uk/search') != -1) {
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
                    var items = [];
                    var snippets = [];
                    var block = [];
                    var numInEachBlock = [0];

                    $.each($("div.srg"), function(index, value) {
                        console.log("=======");
                        // save the block
                        block.push($(this));
                        // save items in block in order
                        var tmpItem = $(this).find("div.g").toArray();
                        numInEachBlock.push(tmpItem.length);
                        $.each(tmpItem, function(idx, val) {
                            items.push($(this));
                        });
                        console.log(tmpItem);
                        $.each($(this).find("div.g span.st"), function(idx, val) {
                            console.log($(this));
                            snippets.push($(this).text());
                        })
                    });

                    var clone = items.slice(0);

                    chrome.runtime.sendMessage({
                        action: 'U',
                        data: snippets
                    }, function(response) {
                        var re_rank = response.data;
                        console.log(re_rank);
                        items.sort(function(a, b) {
                            return re_rank[clone.indexOf(a)] - re_rank[clone.indexOf(b)];
                        })
                    })

                    chrome.runtime.sendMessage({
                        action: 'R',
                    }, function(response) {
                        console.log(response.status);
                        // whether re-ranking switch is on
                        if (response.status) {
                            $('<input type="button" id="rerank" value="re-rank results" style="float: right">').insertAfter("nobr");
                            $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "green", "font-weight": "bold" });
                            $("#rerank").click(function() {
                                $("#rerank").attr('disabled', 'disabled');
                                $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "grey", "font-weight": "bold" });
                                var i = 0;
                                $.each(block, function() {
                                    var tmp = $(this);
                                    console.log(tmp[0]);
                                    $.each(items.slice(numInEachBlock[i], numInEachBlock[i + 1] - 1), function() {
                                        tmp[0].append(this[0]);
                                        console.log(this[0]);
                                    })
                                    i += 1;
                                });
                            });
                        } else {}
                    });

                    // send user click info
                    $('#res .g .r a').click(function() {
                        var self = $(this);
                        var url = self.attr('href');
                        if (url.indexOf('/url?') == 0) {
                            url = decodeURIComponent(getQueryString(url, 'url'));
                        }

                        var snip = $(this).parent().closest('div').find(".st").text();
                        var title = self.text();
                        var keyword = $('#lst-ib').val();

                        chrome.runtime.sendMessage({
                            action: "UC",
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
        chrome.extension.sendRequest({ handler: 'handle_search' }, function(result) {
            console.log('result', result);
            if (result && result.simulate) {
                chrome.extension.sendRequest({ handler: 'simulate_keyword' }, function(result) {
                    if (result.keyword) {
                        autoSearch(result.keyword);
                    }
                });
            } else {}

        });
    }
});