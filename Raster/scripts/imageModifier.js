//https://habrahabr.ru/post/145816/
"use strict";

let imageObj;
let context;
let gistogrammData = [];

$(function () {
    context = document.getElementById('ImagePreviewer').getContext('2d');

    imageObj = new Image();

    imageObj.onload = function () {
        let canvas = document.getElementById('ImagePreviewer');
        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        context.drawImage(imageObj, 0, 0);
        analyseImage()
    };

    imageObj.src = 'originalImage.jpg';
});

function analyseImage() {
    let data = context.getImageData(0, 0, imageObj.width, imageObj.height).data
    foreach (function (elem) {
        
    })
}

function onChangeBrightness(value) {

}
function onChangeSaturation(value) {

}
function onChangeHue(value) {

}