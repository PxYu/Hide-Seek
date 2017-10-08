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
                    var snippets = [];
                    $.each($("#res .g").find("span.st").clone().children().remove().end(), function(idx, val) {
                        snippets.push($(this).text());
                    })
                    console.log(snippets);

                    // 2. transfer them to bgp and store rank locally
                    var re_rank = undefined;
                    chrome.runtime.sendMessage({
                        action: 'U',
                        data: snippets
                    }, function(response) {
                        re_rank = response.data;
                        // json.parse(re_rank);///
                    })

                    // insert re-ranking button
                    chrome.runtime.sendMessage({
                        action: 'R',
                    }, function(response) {
                        console.log(response.status);
                        // whether re-ranking switch is on
                        if (response.status) {
                            $('<input type="button" id="rerank" value="re-rank results" style="float: right">').insertAfter("nobr");
                            $("#rerank").removeAttr('style').css({ "font-size": "20px", "color": "green", "font-weight": "bold" });
                            $("#rerank").click(function() {
                                var items = $("div.srg div.g").toArray();
                                items.reverse();
                                $.each(items, function() {
                                    $("div.srg").append(this);
                                })
                            })
                        } else {}
                    });

                    console.log($("div._NId").parent()[0]);
                    $.each($("div._NId"), function(index, value) {
                        console.log(this);
                    });

                    // store page results
                    var resultList = $("#res .g .r a");
                    // 1. array of link objects
                    console.log(resultList);
                    // 2. array of objects' links
                    var hrefArray = [];
                    $.each(resultList, function(index, value) {
                        hrefArray.push(resultList[index].href);
                    })

                    // sent click info
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
                        var snip = snippets[i];
                        // var title = self.text();
                        // var keyword = $('#lst-ib').val();

                        chrome.extension.sendRequest({
                            handler: 'query_generator',
                            content: snip,
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
        // this page is google homepage
        chrome.extension.sendRequest({ handler: 'simulate_keyword' }, function(result) {
            if (result.keyword) {
                autoSearch(result.keyword);
            }
        });
    }
});