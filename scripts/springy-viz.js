$(document).ready(function() {
    var canvas = document.getElementById("my_canvas");
    canvas.width = $("#viz").width() * 0.8;
    canvas.height = $("#viz").height();
    // canvas.width = canvas.parents("div").eq(0).width();
    // canvas.width = canvas.parents("div").eq(0).height();
});

// acquire data from background page
var bgp = chrome.extension.getBackgroundPage();
var ut = bgp.last_user_topic;
var gt = bgp.last_generated_topics;

// make a new graph
var graph = new Springy.Graph();

// make some nodes
var center = graph.newNode({ label: ut });
// var finance = graph.newNode({ label: 'Finance' });
// var politics = graph.newNode({ label: 'Politics' });
// var food = graph.newNode({ label: 'Food' })

for (var i = 0; i < gt.length; i++) {
    var node = graph.newNode({ label: gt[i] });
    graph.newEdge(center, node, { length: 0.75 });
}

// connect them with an edge
// graph.newEdge(sports, finance, { length: 0.75 });
// graph.newEdge(sports, politics, { length: 0.75 });
// graph.newEdge(sports, food, { length: 0.75 });

$('#my_canvas').springy({ graph: graph });