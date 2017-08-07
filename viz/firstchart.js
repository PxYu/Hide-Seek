var option1 = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Topical Distribution of Your Queries'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Topics',
        colorByPoint: true,
        data: [{
            name: 'sports',
            y: 30
        }, {
            name: 'business',
            y: 25
        }, {
            name: 'culture',
            y: 20
        }, {
            name: 'politics',
            y: 15
        }, {
            name: 'others',
            y: 10
        }]
    }]
}

var option2 = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Topical Distribution of Generated Queries'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Topics',
        colorByPoint: true,
        data: [{
            name: 'sports',
            y: 30
        }, {
            name: 'business',
            y: 25
        }, {
            name: 'culture',
            y: 20
        }, {
            name: 'politics',
            y: 15
        }, {
            name: 'others',
            y: 10
        }]
    }]
}

var theme1 = {
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

var theme2 = {
    colors: ['#f45b5b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
        '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'
    ],
    chart: {
        backgroundColor: null,
        style: {
            fontFamily: 'Signika, serif'
        }
    },
    title: {
        style: {
            color: 'black',
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    subtitle: {
        style: {
            color: 'black'
        }
    },
    tooltip: {
        borderWidth: 0
    },
    legend: {
        itemStyle: {
            fontWeight: 'bold',
            fontSize: '13px'
        }
    },
    xAxis: {
        labels: {
            style: {
                color: '#6e6e70'
            }
        }
    },
    yAxis: {
        labels: {
            style: {
                color: '#6e6e70'
            }
        }
    },
    plotOptions: {
        series: {
            shadow: true
        },
        candlestick: {
            lineColor: '#404048'
        },
        map: {
            shadow: false
        }
    },

    // Highstock specific
    navigator: {
        xAxis: {
            gridLineColor: '#D0D0D8'
        }
    },
    rangeSelector: {
        buttonTheme: {
            fill: 'white',
            stroke: '#C0C0C8',
            'stroke-width': 1,
            states: {
                select: {
                    fill: '#D0D0D8'
                }
            }
        }
    },
    scrollbar: {
        trackBorderColor: '#C0C0C8'
    },

    // General
    background2: '#E0E0E8'

};

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

$(function() {
    // $("#start-date").html("2017-01-01");
    // $("#user-id").html("e5cd-5fbd-4106-93a7");
    $("#start-date").html(store.get('popupSettings').date);
    $("#user-id").html(store.get('popupSettings').uuid);
    // var dt = new Date().toJSON().slice(0, 10);
    // console.log(store.get('popupSettings').date);
    // console.log(store.get('popupSettings').uuid);
    console.log("hello");
    var chart1 = Highcharts.chart('container', Highcharts.merge(option1, theme2));
    var chart2 = Highcharts.chart('container2', Highcharts.merge(option2, theme2));
});