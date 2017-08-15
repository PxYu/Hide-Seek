'use strict';

Highcharts.createElement('link', {
    href: 'https://fonts.googleapis.com/css?family=Dosis:400,600',
    rel: 'stylesheet',
    type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);


var bgp = chrome.extension.getBackgroundPage();

var userData = function() {
    var temp = bgp.userTopics;
    var arr = [];
    $.each(temp, function(key, value) {
        if (value > 0) {
            arr.push({ name: key, y: value });
        }
    })
    return arr;
}

var generatedData = function() {
    var temp = bgp.generatedTopics;
    var arr = [];
    $.each(temp, function(key, value) {
        if (value > 0) {
            arr.push({ name: key, y: value });
        }
    })
    return arr;
}

var option1 = {
    chart: {
        type: 'pie',
        options3d: {
            enabled: true,
            alpha: 45
        }
    },
    title: {
        text: 'Topical Distribution of Your Queries'
    },
    plotOptions: {
        pie: {
            innerSize: 100,
            depth: 45
        }
    },
    series: [{
        name: 'Topics',
        colorByPoint: true,
        // data: [{
        //     name: 'sports',
        //     y: 30
        // }, {
        //     name: 'business',
        //     y: 25
        // }, {
        //     name: 'culture',
        //     y: 20
        // }, {
        //     name: 'politics',
        //     y: 15
        // }, {
        //     name: 'others',
        //     y: 10
        // }]
        data: userData()
    }]
}

var option2 = {
    chart: {
        type: 'pie',
        options3d: {
            enabled: true,
            alpha: 45
        }
    },
    title: {
        text: 'Topical Distribution of Generated Queries'
    },
    plotOptions: {
        pie: {
            innerSize: 100,
            depth: 45
        }
    },
    series: [{
        name: 'Topics',
        colorByPoint: true,
        // data: [{
        //     name: 'sports',
        //     y: 30
        // }, {
        //     name: 'business',
        //     y: 25
        // }, {
        //     name: 'culture',
        //     y: 20
        // }, {
        //     name: 'politics',
        //     y: 15
        // }, {
        //     name: 'others',
        //     y: 10
        // }]
        data: generatedData()
    }]
}

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

$(function() {
    $("#start-date").html(store.get('popupSettings').date.slice(0, 10));
    $("#user-id").html(store.get('popupSettings').uuid);
    if (userData().length > 0) {
        var chart1 = Highcharts.chart('container', Highcharts.merge(option1, theme));
        var chart2 = Highcharts.chart('container2', Highcharts.merge(option2, theme));
    } else {
        alert("Make your first google search with Hide & Seek before checking reports!")
    }
});