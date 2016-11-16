//https://habrahabr.ru/post/145816/
"use strict";

let imageObj;
let imageContext;
let barChartData = [];
let iletmageOperation;
let barChartContext;
let averages = [0, 0, 0, 0];
let imageObjSource = 'originalImage.jpg';

/// Метод загрузки документа
$(function () {

    barChartContext = document.getElementById('barChartPreviewer').getContext('2d');
    imageContext = document.getElementById('ImagePreviewer').getContext('2d');
    imageObj = new Image();

    imageObj.onload = function () {
        let canvas = document.getElementById('ImagePreviewer');
        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        imageContext.drawImage(imageObj, 0, 0);
        analyseImage()
    };

    imageObj.src = imageObjSource;
});

function analyseImage(imageContext, imageObj) {
    let data = imageContext.getImageData(0, 0, imageObj.width, imageObj.height).data;
    let size = imageObj.width * imageObj.height;
    let dataLen = data.length;
    for (let i = 0; i < 256; i++)
        barChartData[i] = 0

    for (let i = 0; i < dataLen; i += 4) {
        let brightness = Math.round(data[i] * 0.229 + data[i + 1] * 0.586 + data[i + 2] * 0.114);
        averages[0] += data[i] / size;
        averages[1] += data[i + 1] / size;
        averages[2] += data[i + 2] / size;
        averages[3] += data[i + 3] / size;

        barChartData[brightness] += 1;
    }

    function drawbarChart(color = "#FF0000") {
        let pos = 0;
        let coef = imageObj.width * imageObj.height;


        barChartContext.strokeStyle = color;
        barChartData.forEach(function (item) {
            barChartContext.beginPath();
            barChartContext.moveTo(0, pos);
            barChartContext.lineTo(item / coef * 3000, pos++);
            barChartContext.stroke();
        });
    }
    drawbarChart();
}


