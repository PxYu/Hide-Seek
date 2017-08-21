'use strict';

//extra css style
Highcharts.createElement('link', {
    href: 'https://fonts.googleapis.com/css?family=Dosis:400,600',
    rel: 'stylesheet',
    type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

//theme of the topic demonstration
var theme = Highcharts.theme = {
    colors: ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
        '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'
    ],
    chart: {
        backgroundColor: null,
        style: {
            fontFamily: 'Dosis, sans-serif'
        }
    },
    title: {
        style: {
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }
    },
    tooltip: {
        borderWidth: 0,
        backgroundColor: 'rgba(219,219,216,0.8)',
        shadow: false
    },
    legend: {
        itemStyle: {
            fontWeight: 'bold',
            fontSize: '13px'
        }
    },
    xAxis: {
        gridLineWidth: 1,
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    yAxis: {
        minorTickInterval: 'auto',
        title: {
            style: {
                textTransform: 'uppercase'
            }
        },
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    plotOptions: {
        candlestick: {
            lineColor: '#404048'
        }
    },
    // General
    background2: '#F0F0EA'
};



var bgp = chrome.extension.getBackgroundPage();
var userTopics = bgp.userTopics;
var generatedTopics = bgp.generatedTopics;

console.log(userTopics);
console.log(Object.keys(userTopics).length);

var removeUnderscore = function(string) {
    return string.replace(/_/g, ' ');
}

var parseFirstLevelTopic = function(datatype) {
    var arr = {};
    var keyword = "";
    $.each(datatype, function(key, value) {
        keyword = key.split("/")[1];
        if (arr.hasOwnProperty(keyword)) {
            arr[keyword] += value;
        } else {
            arr[keyword] = value;
        }
    })
    return arr;
}

var parseSecondLevelTopic = function(prev, datatype) {
    var arr = {};
    var curTopic = "";
    $.each(datatype, function(key, value) {
        if (key.split("/")[1] == prev) {
            curTopic = key.split("/")[2];
            if (arr.hasOwnProperty(curTopic)) {
                arr[curTopic] += value;
            } else {
                arr[curTopic] = value;
            }
        }
    })
    return arr;
}

var parseThirdLevelTopic = function(prev, datatype) {
    var arr = {};
    var curtopic = "";
    $.each(datatype, function(key, value) {
        if ((key.split("/")[1] + "-" + key.split("/")[2]) == prev) {
            curtopic = key.split("/")[3];
            if (arr.hasOwnProperty(curtopic)) {
                arr[curtopic] += value;
            } else {
                arr[curtopic] = value;
            }
        }
    })
    return arr;
}

var getSeries = function(datatype) {
    var arr = [];
    var data = [];
    if (datatype == "user") {
        $.each(parseFirstLevelTopic(userTopics), function(key, value) {
            console.log(key, value);
            data.push({ name: removeUnderscore(key), y: value, drilldown: key });
        })
        arr.push({ id: "toplevel", colorByPoint: true, name: "Top-level Topics", data: data });
    } else if (datatype == "generated") {
        $.each(parseFirstLevelTopic(generatedTopics), function(key, value) {
            data.push({ name: removeUnderscore(key), y: value, drilldown: key });
        })
        arr.push({ id: "toplevel", colorByPoint: true, name: "Top-level Topics", data: data });
    }
    //sort the data
    arr.forEach(function(name) {
        name.data.sort(function(a, b) {
            if (a.y < b.y) {
                return 1;
            } else if (a.y > b.y) {
                return -1;
            }
            return 0;
        });
    });
    return arr;
}

var getDrilldown = function(datatype) {
    var arr = [];
    var data = [];
    var data2 = [];
    if (datatype == "user") {
        $.each(parseFirstLevelTopic(userTopics), function(key, value) {
            data = [];
            $.each(parseSecondLevelTopic(key, userTopics), function(k, v) {
                data.push({ name: removeUnderscore(k), y: v, drilldown: key + "-" + k });
                data2 = [];
                // console.log(parseThirdLevelTopic(key + "-" + k, userTopics));
                $.each(parseThirdLevelTopic(key + "-" + k, userTopics), function(kk, vv) {
                    data2.push({ name: removeUnderscore(kk), y: vv });
                })
                arr.push({ id: key + "-" + k, colorByPoint: true, name: removeUnderscore(k), data: data2 });
            })
            arr.push({ id: key, colorByPoint: true, name: removeUnderscore(key), data: data });
        });
    } else if (datatype == "generated") {
        $.each(parseFirstLevelTopic(generatedTopics), function(key, value) {
            data = [];
            $.each(parseSecondLevelTopic(key, generatedTopics), function(k, v) {
                data.push({ name: removeUnderscore(k), y: v, drilldown: key + "-" + k });
                data2 = [];
                $.each(parseThirdLevelTopic(key + "-" + k, generatedTopics), function(kk, vv) {
                    data2.push({ name: removeUnderscore(kk), y: vv });
                })
                arr.push({ id: key + "-" + k, colorByPoint: true, name: removeUnderscore(k), data: data2 });
            })
            arr.push({ id: key, colorByPoint: true, name: removeUnderscore(key), data: data });
        });
    }
    //sort the data
    arr.forEach(function(name) {
        name.data.sort(function(a, b) {
            if (a.y < b.y) {
                return 1;
            } else if (a.y > b.y) {
                return -1;
            }
            return 0;
        });
    });
    return arr;
}

var userdatapie = {
    chart: {
        type: 'pie'
    },
    title: {
        text: "topic distribution of your queries."
    },
    subtitle: {
        text: 'Click the slices to view sub-topics.'
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.y}'
            }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> time(s)<br/>'
    },
    series: getSeries("user"),
    drilldown: {
        series: getDrilldown("user")
    }
}

var userdatacolumn = {
    chart: {
        type: 'column'
    },
    title: {
        text: "topic distribution of your queries."
    },
    subtitle: {
        text: 'Click the columns to view sub-topics.'
    },
    xAxis: {
        type: 'category',
        title: {
            text: 'NAME OF TOPIC(S)'
        }
    },
    yAxis: {
        allowDecimals: false,
        title: {
            text: 'number of time(s)'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.y}'
            }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> time(s)<br/>'
    },
    series: getSeries("user"),
    drilldown: {
        series: getDrilldown("user")
    }
}

var generateddatapie = {
    chart: {
        type: 'pie'
    },
    title: {
        text: "topic distribution of generated queries."
    },
    subtitle: {
        text: 'Click the slices to view sub-topics.'
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.y}'
            }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> time(s)<br/>'
    },
    series: getSeries("generated"),
    drilldown: {
        series: getDrilldown("generated")
    }
}

var generateddatacolumn = {
    chart: {
        type: 'column'
    },
    title: {
        text: "topic distribution of generated queries."
    },
    subtitle: {
        text: 'Click the columns to view sub-topics.'
    },
    xAxis: {
        type: 'category',
        title: {
            text: 'NAME OF TOPIC(S)'
        }
    },
    yAxis: {
        allowDecimals: false,
        title: {
            text: 'number of time(s)'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.y}'
            }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> time(s)<br/>'
    },
    series: getSeries("generated"),
    drilldown: {
        series: getDrilldown("generated")
    }
}

var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean bibendum erat ac justo sollicitudin, quis lacinia ligula fringilla. Pellentesque hendrerit, nisi vitae posuere condimentum, lectus urna accumsan libero, rutrum commodo mi lacus pretium erat. Phasellus pretium ultrices mi sed semper. Praesent ut tristique magna. Donec nisl tellus, sagittis ut tempus sit amet, consectetur eget erat. Sed ornare gravida lacinia. Curabitur iaculis metus purus, eget pretium est laoreet ut. Quisque tristique augue ac eros malesuada, vitae facilisis mauris sollicitudin. Mauris ac molestie nulla, vitae facilisis quam. Curabitur placerat ornare sem, in mattis purus posuere eget. Praesent non condimentum odio. Nunc aliquet, odio nec auctor congue, sapien justo dictum massa, nec fermentum massa sapien non tellus. Praesent luctus eros et nunc pretium hendrerit. In consequat et eros nec interdum. Ut neque dui, maximus id elit ac, consequat pretium tellus. Nullam vel accumsan lorem.';

var parseWordCloudData = function(text) {
    return text
        .split(',').join('') // remove commas
        .split('.').join('') // remove periods
        .split(' ') // split into words
        .reduce(function(arr, word) {
            var obj = arr.find(function(obj) {
                return obj.name === word;
            });
            if (obj) {
                obj.weight += 1;
            } else {
                obj = {
                    name: word,
                    weight: 1
                };
                arr.push(obj);
            }
            return arr;
        }, []);
}

var drawWordCloud = function() {
    var h = $("#concontainerer").height();
    var w = $("#concontainerer").width() * 0.5;
    var wc1 = {
        chart: {
            width: w,
            height: h
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '{point.name}</span>: <b>{point.weight}</b> time(s)<br/>'
        },
        series: [{
            name: "WORD CLOUD",
            type: 'wordcloud',
            data: parseWordCloudData(text)
        }],
        title: {
            text: 'Wordcloud of Lorem Ipsum'
        }
    };
    var wc2 = {
        chart: {
            width: w,
            height: h
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '{point.name}</span>: <b>{point.weight}</b> time(s)<br/>'
        },
        series: [{
            name: "WORD CLOUD",
            type: 'wordcloud',
            data: parseWordCloudData(text)
        }],
        title: {
            text: 'Wordcloud of Lorem Ipsum'
        }
    };
    Highcharts.chart('container', Highcharts.merge(wc1, theme));
    Highcharts.chart('container2', Highcharts.merge(wc2, theme));
}

$("#tabTopic").click(function(evt) {
    $("#button").show();
    // tab action
    var tablinks = $(".tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
    var chart1 = Highcharts.chart('container', Highcharts.merge(userdatapie, theme));
    var chart2 = Highcharts.chart('container2', Highcharts.merge(generateddatapie, theme));
})

$("#tabWordCloud").click(function(evt) {
    $("#button").hide();
    // tab action
    var tablinks = $(".tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";

    drawWordCloud();
})

$(function() {
    $("#start-date").html(store.get('popupSettings').date.slice(0, 10));
    $("#user-id").html(store.get('popupSettings').uuid);
    if (Object.keys(userTopics).length > 0) {
        $("#tabTopic").click();
        //var chart1 = Highcharts.chart('container', Highcharts.merge(userdatapie, theme));
        //var chart2 = Highcharts.chart('container2', Highcharts.merge(generateddatapie, theme));
    } else {
        alert("Make your first google search with Hide & Seek before checking reports!")
        $("button").hide();
    }
    var count = 0;
    $("#button").click(function() {
        if (count % 2 == 0) {
            $("#button").html("View Pie Chart");
            var chart1 = Highcharts.chart('container', Highcharts.merge(userdatacolumn, theme));
            var chart2 = Highcharts.chart('container2', Highcharts.merge(generateddatacolumn, theme));
            count += 1;
        } else {
            $("#button").html("View Column Chart");
            var chart1 = Highcharts.chart('container', Highcharts.merge(userdatapie, theme));
            var chart2 = Highcharts.chart('container2', Highcharts.merge(generateddatapie, theme));
            count += 1;
        }
    })
});