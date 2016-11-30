//http://www.phpied.com/files/canvas/pixels.html
//http://esate.ru/uroki/OpenGL/uroki-OpenGL-c-sharp/primenenie-graficheskih-filtrov-opengl-vvedenie/
"use strict";

class CanvasController {
    constructor(canvas, imagesrc = null) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.image = new Image();
        this.average = [0, 0, 0, 0];

        if (imagesrc != null) {
            this.image.onload = function () {
                canvas.width = this.width;
                canvas.height = this.height;
                canvas.getContext('2d').drawImage(this, 0, 0);

            };
            this.image.src = imagesrc;
        }
    }

    getData() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setData(data) {
        this.context.putImageData(data, 0, 0);
    }

    reset() {
        this.context.drawImage(this.image, 0, 0);
        this.setAverages();
    }

    getPixelStatistics(operation) {
        this.setAverages();
        let data = this.getData();
        let px = data.data;
        let len = px.length;
        let barChartData = [];

        for (let i = 0; i < 256; i++)
            barChartData[i] = 0

        let size = this.canvas.width * this.canvas.height;

        for (let i = 0; i < len; i += 4) {
            let brightness = operation(px[i], px[i + 1], px[i + 2], px[i + 3]);
            barChartData[brightness] += 1;
        }
        return barChartData;
    }

    appendOperation(operation, value) {
        let olddata = this.getData();
        let oldpx = olddata.data;
        let newdata = this.context.createImageData(olddata);
        let newpx = newdata.data;

        let res = null;
        let len = newpx.length;
        let width = this.canvas.scrollWidth;
        let height = this.canvas.scrollHeight;

        for (let i = 0; i < len; i += 4) {
            res = operation(oldpx, value, i, width, height, this.average);
            if (res != null) {
                newpx[i] = res[0];
                newpx[i + 1] = res[1];
                newpx[i + 2] = res[2];
                newpx[i + 3] = res[3];
            }
        }
        this.setData(newdata);
        alert("Operation DONE!");
    }

    setAverages() {
        this.average = [0, 0, 0, 0];
        let data = this.getData();
        let px = data.data;
        let len = px.length;
        let size = this.canvas.width * this.canvas.height;

        for (let i = 0; i < len; i += 4) {
            this.average[0] += px[i] / size;
            this.average[1] += px[i + 1] / size;
            this.average[2] += px[i + 2] / size;
            this.average[3] += px[i + 3] / size;
        }
    }
}

/**
 * ====================================================================================
 */

let imageCanvas;
let barChartCanvas;

window.onload = function () {
    imageCanvas = new CanvasController(document.getElementById("ImageCanvas"), "originalImage.jpg");
    //barChartCanvas = new CanvasController(document.getElementById("BarChartCanvas"));
};

document.addEventListener("DOMcontentLoaded", function () {
    drawBarChart(imageCanvas, barChartCanvas);
});

/**
 * ====================================================================================
 */

function drawBarChart(imageCanvas, barChartCanvas, color = "#FF0000") {
    let pos = 0;
    barChartCanvas.context.clearRect(0, 0, barChartCanvas.canvas.width, barChartCanvas.canvas.height);
    barChartCanvas.context.strokeStyle = color;
    imageCanvas.getPixelStatistics(brightnessAverage).forEach(function (item) {
        barChartCanvas.context.beginPath();
        barChartCanvas.context.moveTo(0, pos);
        barChartCanvas.context.lineTo(item / 50, pos++);
        barChartCanvas.context.stroke();
    });
}


function uniformFileter(data, value, i, width, height, average) {

    let N = value;
    let X = i % width;
    let Y = Math.floor(i / width);

    let filtered = [data[i], data[i + 1], data[i + 2], data[i + 3]];

    for (let x = 0; x < N * 4; x += 4) {
        for (let y = 0; y < N * 4; y += 4) {
            filtered[0] += data[x + y * width + i];
            filtered[1] += data[x + y * width + 1 + i];
            filtered[2] += data[x + y * width + 2 + i];
            filtered[3] += data[x + y * width + 3 + i];
        }
    }

    for (let k = 0; k < 4; k++)
        filtered[k] /= N * N;

    return filtered;
}

function medianFileter(data, value, i, width, height, average) {

    let N = value;
    let X = i % width;
    let Y = Math.floor(i / width);

    let filtered = [[], [], [], []];

    for (let x = 0; x < N * 4; x += 4) {
        for (let y = 0; y < N * 4; y += 4) {
            filtered[0].push(data[x + y * width + i]);
            filtered[1].push(data[x + y * width + 1 + i]);
            filtered[2].push(data[x + y * width + 2 + i]);
            filtered[3].push(data[x + y * width + 3 + i]);
        }
    }

    for (let k = 0; k < 4; k++)
        filtered[k].sort();


    return [filtered[0][Math.round(filtered[0].length / 2)], filtered[1][Math.round(filtered[1].length / 2)], filtered[2][Math.round(filtered[2].length / 2)], filtered[3][Math.round(filtered[3].length / 2)]];
}

function sharpen(data, value, i, width, height, average) {
    let N = 3;
    let X = i % width;
    let Y = Math.floor(i / width);
    let coef = 1.8;
    let filtered = [0, 0, 0, data[3 + i]];

    for (let x = 0; x < N * 4; x += 4) {
        for (let y = 0; y < N * 4; y += 4) {
            if (x == 4 && y == 4) coef = 1.8;
            else coef = -0.1;
            filtered[0] += coef * data[x + y * width + i];
            filtered[1] += coef * data[x + y * width + 1 + i];
            filtered[2] += coef * data[x + y * width + 2 + i];
        }
    }

    return filtered;
}

function onClick_sharpen() {
    imageCanvas.appendOperation(sharpen, 0);
    drawBarChart(imageCanvas, barChartCanvas);
}

function brightnessAverage(r, g, b, a) {
    return Math.round(r * 0.229 + g * 0.586 + b * 0.114);
}

function onChange_gamma(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(function (oldpx, value, i, width, height, average) {
        let r = oldpx[i];
        let g = oldpx[i + 1];
        let b = oldpx[i + 2];
        let a = oldpx[i + 3];
        return [Math.pow(r / 255, value) * 255, Math.pow(g / 255, value) * 255, Math.pow(b / 255, value) * 255, a];
    }, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onChange_contrast(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(function (oldpx, value, i, width, height, average) {
        let r = oldpx[i];
        let g = oldpx[i + 1];
        let b = oldpx[i + 2];
        let a = oldpx[i + 3];

        r = value * (r - average[0]) + average[0];
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        g = value * (g - average[1]) + average[1];
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        b = value * (b - average[2]) + average[2];
        if (b > 255) b = 255;
        if (b < 0) b = 0;
        return [r, g, b, a];
    }, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onChange_noise(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(function (oldpx, value, i, width, height, average) {
        let rand = (0.5 - Math.random()) * value;
        let r = oldpx[i];
        let g = oldpx[i + 1];
        let b = oldpx[i + 2];
        let a = oldpx[i + 3];
        return [r + rand, g + rand, b + rand, a];
    }, value);

    for (let i = 0; i < Math.random() * value * 10; i++) {
        imageCanvas.context.beginPath();
        imageCanvas.context.moveTo(Math.random() * imageCanvas.canvas.width, Math.random() * imageCanvas.canvas.height);
        imageCanvas.context.lineTo(Math.random() * imageCanvas.canvas.width, Math.random() * imageCanvas.canvas.height);
        imageCanvas.context.stroke();
    }
    drawBarChart(imageCanvas, barChartCanvas);
}

function onClick_reset(value) {
    imageCanvas.reset();
    drawBarChart(imageCanvas, barChartCanvas);
}

function onClick_negtive(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(function (oldpx, value, i, width, height, average) {
        let r = oldpx[i];
        let g = oldpx[i + 1];
        let b = oldpx[i + 2];
        let a = oldpx[i + 3];
        return [255 - r, 255 - g, 255 - b, a];
    }, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onChange_binarize(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(function (oldpx, value, i, width, height, average) {
        let r = oldpx[i];
        let g = oldpx[i + 1];
        let b = oldpx[i + 2];
        let a = oldpx[i + 3];
        if (brightnessAverage(r, g, b, a) > value)
            return [255, 255, 255, 255];
        else
            return [0, 0, 0, 255];
    }, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onChange_uniformFilter(value) {
    imageCanvas.appendOperation(uniformFileter, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onChange_medianFilter(value) {
    imageCanvas.appendOperation(medianFileter, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

function onClick_aquaFilter(value) {
    imageCanvas.reset();
    imageCanvas.appendOperation(uniformFileter, 3);
    imageCanvas.appendOperation(sharpen, value);
    drawBarChart(imageCanvas, barChartCanvas);
}

//
// let x = i % width;
// let y = Math.floor(i / width);

// var manipuladors = [
//     {
//         name: 'rgb -> brg',
//         cb: function (r, g, b) {
//             return [b, r, g, 255];
//         }
//     },
//     {
//         name: 'rgb -> rbg',
//         cb: function (r, g, b) {
//             return [r, b, g, 255];
//         }
//     },
//     {
//         name: 'rgb -> gbr',
//         cb: function (r, g, b) {
//             return [g, b, r, 255];
//         }
//     },
//     {
//         name: 'rgb -> grb',
//         cb: function (r, g, b) {
//             return [g, r, b, 255];
//         }
//     },
//     {
//         name: 'rgb -> bgr',
//         cb: function (r, g, b) {
//             return [b, g, r, 255];
//         }
//     },
//     {
//         name: 'transparent',
//         cb: function (r, g, b, a, factor) {
//             return [r, g, b, factor];
//         },
//         factor: "value (0-255)"
//     },
//     {
//         name: 'gradient',
//         cb: function (r, g, b, a, factor, i) {
//             var total = this.original.data.length;
//             return [r, g, b, factor + 255 * (total - i) / total];
//         },
//         factor: "value (0-255)"
//     },
//     {
//         name: 'greyscale',
//         cb: function (r, g, b) {
//             var avg = 0.3 * r + 0.59 * g + 0.11 * b;
//             return [avg, avg, avg, 255];
//         }
//     },
//     {
//         name: 'sepia (lazy)',
//         cb: function (r, g, b) {
//             var avg = 0.3 * r + 0.59 * g + 0.11 * b;
//             return [avg + 100, avg + 50, avg, 255];
//         }
//     },
//     {
//         name: 'sepia 2',
//         cb: function (r, g, b) {
//             return [
//                 (r * 0.393 + g * 0.769 + b * 0.189 ) / 1.351,
//                 (r * 0.349 + g * 0.686 + b * 0.168 ) / 1.203,
//                 (r * 0.272 + g * 0.534 + b * 0.131 ) / 2.140,
//                 255
//             ];
//         }
//     },
//     {
//         name: 'gamma correct',
//         cb: function (r, g, b, a, factor) {
//             return [
//                 Math.pow(r / 255, factor) * 255,
//                 Math.pow(g / 255, factor) * 255,
//                 Math.pow(b / 255, factor) * 255,
//                 255
//             ];
//         },
//         factor: 'value(2-10), decimal OK'
//     },
//     {
//         name: 'negative',
//         cb: function (r, g, b) {
//             return [255 - r, 255 - g, 255 - b, 255];
//         }
//     },
//     {
//         name: 'no green: rgb(r, 0, b)',
//         cb: function (r, g, b) {
//             return [r, 0, b, 255];
//         }
//     },
//     {
//         name: 'max green: rgb (r, 255, b)',
//         cb: function (r, g, b) {
//             return [r, 255, b, 255];
//         }
//     },
//     {
//         name: 'only green: rgb(0, g, 0)',
//         cb: function (r, g, b) {
//             return [0, g, 0, 255];
//         }
//     },
//     {
//         name: 'max all but green: rgb (255, g, 255)',
//         cb: function (r, g, b) {
//             return [255, g, 255, 255];
//         }
//     },
//     {
//         name: 'brightness',
//         cb: function (r, g, b, a, factor) {
//             return [r + factor, g + factor, b + factor, 255];
//         },
//         factor: '(0-255)'
//     },
//     {
//         name: 'noise',
//         cb: function (r, g, b, a, factor) {
//             var rand = (0.5 - Math.random()) * factor;
//             return [r + rand, g + rand, b + rand, 255];
//         },
//         factor: '(0 - 500+)'
//     },
//     {
//         name: 'Contrast',
//         cb: function (r, g, b, a, factor) {
//             var r = factor * (r - averages[0]) + averages[0];
//             if (r > 255) r = 255;
//             if (r < 0) r = 0;
//             var g = factor * (g - averages[1]) + averages[1];
//             if (g > 255) g = 255;
//             if (g < 0) g = 0;
//             var b = factor * (b - averages[2]) + averages[2];
//             if (b > 255) b = 255;
//             if (b < 0) b = 0;
//             return [r, g, b, 255];
//         },
//         factor: '(0-5)'
//     }
// ];
//

