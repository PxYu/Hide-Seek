$(document).ready(function() {
    var canvas = document.getElementById("my_canvas");
    canvas.width = $("#viz").width() * 0.8;
    canvas.height = $("#viz").height();
    // canvas.width = canvas.parents("div").eq(0).width();
    // canvas.width = canvas.parents("div").eq(0).height();
});


// make a new graph
var graph = new Springy.Graph();

// make some nodes
var sports = graph.newNode({ label: 'Sports' });
var finance = graph.newNode({ label: 'Finance' });
var politics = graph.newNode({ label: 'Politics' });
var food = graph.newNode({ label: 'Food' })

// connect them with an edge
graph.newEdge(sports, finance, { length: 0.75 });
graph.newEdge(sports, politics, { length: 0.75 });
graph.newEdge(sports, food, { length: 0.75 });

$('#my_canvas').springy({ graph: graph });