"use strict"

var canvas = null;
var context = null;
var speed = 1;
var origin = [
    //-50, 50, -50,
    50, -50, -50,
    //-50, -50, -50,
    50, 50, -50,
    -50, 50, 50,
    //50, -50, 50,
    -50, -50, 50,
    //50, 50, 50,

    -30, 30, -30,
    30, -30, -30,
    -30, -30, -30,
    30, 30, -30,
    -30, 30, 30,
    30, -30, 30,
    -30, -30, 30,
    30, 30, 30

];
var equaled = null;


window.onload = function drawImage() {
    canvas = document.getElementById("mainCanvas");
    context = canvas.getContext("2d");
    if (context == undefined)
        alert("No context!");
    submitForm();
    rotate();
}

function submitForm() {
    equaled = euclidToEquable(origin);
    equaled = transformMatrix(equaled, getDiag(
        document.getElementById("xscale").value,
        document.getElementById("yscale").value,
        document.getElementById("zscale").value, 1));
    speed = document.getElementById("speedConst").value;

}
var yc = 0;
var dir = 1;
var zc = 0;

function rotate() {
    var rotation = equaled.slice();
    var start = Date.now();


    clearInterval(timer);
    var timer = setInterval(function () {
        if (dir == 1) {
            yc += 0.01;
            zc += 0.01;
            if (yc > Math.PI * 2)
                dir = -1;
        } else {
            yc -= 0.01;
            zc -= 0.01;
            if (yc < -Math.PI * 2)
                dir = 1;
        }

        var coefy = 2 * Math.sin(yc);
        var coefz = 3 * Math.cos(zc);

        rotation = transformMatrix(equaled, getRx(speed));
        rotation = transformMatrix(rotation, getRy(speed * coefy));
        rotation = transformMatrix(rotation, getRz(speed * coefz));
        rotation = normalize(rotation);
        clearCanvas(context, canvas);
        rotation = transformMatrix(rotation, getTransfer(300, 300, 0));
        drawIt(rotation, context);
        rotation = transformMatrix(rotation, getTransfer(-300, -300, 0));

    }, 60);

}

