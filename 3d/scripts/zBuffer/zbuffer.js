"use strict";

var canvas = null;
var context = null;

var p2olygons = [
    new drawings.Polygon([[0, 0, 0], [0, 20, 0], [20, 0, 0]]),
    new drawings.Polygon([[0, 0, 0], [0, 20, 0], [10, 10, 10]]),
    new drawings.Polygon([[0, 0, 0], [20, 0, 0], [10, 10, 10]]),
    new drawings.Polygon([[20, 0, 0], [0, 20, 0], [10, 10, 10]])
];


var polygons = [
    new drawings.Polygon([[0, 0, 0], [0, 10, 0], [10, 0, 0]], "b1"),
    new drawings.Polygon([[0, 0, 0], [0, 10, 0], [0, 0, 10]], "b2"),
    new drawings.Polygon([[0, 0, 0], [10, 0, 0], [0, 0, 10]], "b3"),

    new drawings.Polygon([[0, 0, 0], [0, 10, 0], [10, 0, 0]], "b4"),
    new drawings.Polygon([[0, 0, 0], [0, 10, 0], [0, 0, 10]], "b5"),
    new drawings.Polygon([[0, 0, 0], [10, 0, 0], [0, 0, 10]], "b6"),
];


var ShapeCube = new drawings.Shape(polygons, [10, 10, 5]);

window.onload = function initializeContext() {
    canvas = document.getElementById("mainCanvas");
    context = canvas.getContext("2d");

    let dob = new drawings.drawingObject(canvas, context);
    dob.drawShape(ShapeCube);

    if (context == undefined)
        alert("No context!");

}

