"use strict";

class CanvasController {
    constructor(canvas, imagesrc = null, canvasName) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.image = new Image();
        this.average = [0, 0, 0, 0];

        if (imagesrc != null) {
            this.image.onload = function () {
                ctx =

                this.canvas.width = this.width;
                this.canvas.height = this.height;
                this.context.drawImage(this, 0, 0);
                this.originalData = this.getData(this.context);
            };
            this.image.src = imagesrc;

        }
    }

    onLoadImage() {

    };

    getData() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setData(data) {
        this.context.putImageData(data, 0, 0);
    }

    reset() {
        this.context.drawImage(this.image, 0, 0);
    }

    getPixelStatistics(operation) {
        let data = this.getData();
        let px = data.data;
        let len = px.length;
        let barChartData = [];

        for (let i = 0; i < 256; i++)
            barChartData[i] = 0

        let size = this.canvas.width * this.canvas.height;

        for (let i = 0; i < len; i += 4) {
            let brightness = operation(px[0], px[i + 1], px[i + 2], px[i + 3]);
            barChartData[brightness] += 1;
        }
        return barChartData;
    }

    appendPixelOperation(operation, factor) {
        let olddata = this.getData();
        let oldpx = olddata.data;
        let newdata = this.context.createImageData(olddata);
        let newpx = newdata.data;
        let res = [];
        let len = newpx.length;

        for (let i = 0; i < len; i += 4) {
            res = operation(oldpx[i], oldpx[i + 1], oldpx[i + 2], oldpx[i + 3], factor, i);
            newpx[i] = res[0];
            newpx[i + 1] = res[1];
            newpx[i + 2] = res[2];
            newpx[i + 3] = res[3];
        }
        this.setData(imageContext, newdata);
    }

    setAverages() {
        let data = this.getData();
        let px = data.data;
        let len = px.length;
        let size = imageCanvas.width * imageCanvas.height;

        for (let i = 0; i < len; i += 4) {
            averages[0] += px[i] / size;
            averages[1] += px[i + 1] / size;
            averages[2] += px[i + 2] / size;
            averages[3] += px[i + 3] / size;

        }
    }
}


window.onload = function () {
    let imageCanvas = new CanvasController(document.getElementById("ImageCanvas"), "originalImage.jpg");
    let barChartCanvas = new CanvasController(document.getElementById("ImageCanvas"), "originalImage.jpg");

    drawBarChart(imageCanvas)
};


function drawBarChart(barChartData, canvasController, width = 300, height = 300, color = "#FF0000") {
    let pos = 0;
    barChartContext.clearRect(0, 0, width, height);
    barChartContext.strokeStyle = color;
    barChartData.forEach(function (item) {
        canvasController.context.beginPath();
        canvasController.context.moveTo(0, pos);
        canvasController.context.lineTo(item / 50, pos++);
        canvasController.context.stroke();
    });
}

function brightnessAverage(r, g, b, a) {
    return r * 0.229 + g * 0.586 + b * 0.114
}

// function analyse(avgFunc) {
//     let data = getData(imageContext);
//     let px = data.data;
//     let len = px.length;
//     let barChartData = [];
//
//     for (let i = 0; i < 256; i++)
//         barChartData[i] = 0
//
//     let size = imageCanvas.width * imageCanvas.height;
//
//     for (let i = 0; i < 256; i++)
//         barChartData[i] = 0
//
//     for (let i = 0; i < len; i += 4) {
//         let brightness = Math.round(avgFunc(px[0], px[i + 1], px[i + 2], px[i + 3]));
//         barChartData[brightness] += 1;
//     }
//     drawBarChart(barChartData);
// }
//
// function setAverages(avgFunc) {
//     let data = getData(imageContext);
//     let px = data.data;
//     let len = px.length;
//     let size = imageCanvas.width * imageCanvas.height;
//
//
//     for (let i = 0; i < len; i += 4) {
//         //
//
//         let brightness = Math.round(avgFunc(px[0], px[i + 1], px[i + 2], px[i + 3]));
//         averages[0] += px[i] / size;
//         averages[1] += px[i + 1] / size;
//         averages[2] += px[i + 2] / size;
//         averages[3] += px[i + 3] / size;
//
//     }
// }
//
//
// getData = function (context) {
//     return context.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
// };
//
// setData = function (context, data) {
//     return context.putImageData(data, 0, 0);
// };
//
// reset = function () {
//     imageContext.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
//     originalData = getData(imageContext);
// };

function transform(fn, factor) {
    let olddata = originalData;
    let oldpx = olddata.data;
    let newdata = imageContext.createImageData(olddata);
    let newpx = newdata.data;
    let res = [];
    let len = newpx.length;
    for (let i = 0; i < len; i += 4) {
        res = fn(oldpx[i], oldpx[i + 1], oldpx[i + 2], oldpx[i + 3], factor, i);
        newpx[i] = res[0];
        newpx[i + 1] = res[1];
        newpx[i + 2] = res[2];
        newpx[i + 3] = res[3];
    }
    setData(imageContext, newdata);
    analyse(brightnessAverage);
}

function onChange_gamma(value) {
    transform(function (r, g, b, a, factor, index) {
        return [
            Math.pow(r / 255, factor) * 255,
            Math.pow(g / 255, factor) * 255,
            Math.pow(b / 255, factor) * 255,
            255
        ];
    }, value)
}

function onChange_contrast(value) {
    transform(function (r, g, b, a, factor, index) {
        r = factor * (r - averages[0]) + averages[0];
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        g = factor * (g - averages[1]) + averages[1];
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        b = factor * (b - averages[2]) + averages[2];
        if (b > 255) b = 255;
        if (b < 0) b = 0;
        return [r, g, b, 255];
    }, value)
}

function onChange_noise(value) {
    transform(function (r, g, b, a, factor, index) {
        var rand = (0.5 - Math.random()) * factor;
        return [r + rand, g + rand, b + rand, 255];
    }, value);
    for (i = 0; i < Math.random() * value * 10; i++) {
        imageContext.beginPath();
        imageContext.moveTo(Math.random() * imageCanvas.width, Math.random() * imageCanvas.height);
        imageContext.lineTo(Math.random() * imageCanvas.width, Math.random() * imageCanvas.height);
        imageContext.stroke();
    }

}

function onClick_reset(value) {
    reset();
}

function onClick_negtive(value) {
    transform(function (r, g, b, a, factor, index) {
        return [255 - r, 255 - g, 255 - b, 255];
    }, value)
}
function onChange_binarize(value) {
    transform(function (r, g, b, a, factor, index) {
        if (brightnessAverage(r, g, b, a) > value)
            return [255, 255, 255, 255];
        else
            return [0, 0, 0, 255];
    }, value)

}

//
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
