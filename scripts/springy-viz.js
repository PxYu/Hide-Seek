$(document).ready(function() {
    var canvas = document.getElementById("my_canvas");
    canvas.width = $("#viz").width() * 0.8;
    canvas.height = $("#viz").height();
});

// acquire data from background page
var bgp = chrome.extension.getBackgroundPage();
var ut = bgp.last_user_topic;
var gt = bgp.last_generated_topics;

if (ut == null || ut == undefined) {
    $('#viz').css("height", "50px");
    $('#viz').css("color", "grey");
    $('#viz').css("font-family", "Times New Roman");
    $('#viz').css("font-size", "16px");
    $('#viz').html("Make your first google search with Hide & Seek to see a brief report here.");
} else {
    // $('#viz').css("height", "80px");
    // make a new graph
    var graph = new Springy.Graph();

    // make some nodes
    var center = graph.newNode({ label: ut });

    for (var i = 0; i < gt.length; i++) {
        var node = graph.newNode({ label: gt[i] });
        graph.newEdge(center, node, { length: 0.75 });
    }

    $('#my_canvas').springy({ graph: graph });
}