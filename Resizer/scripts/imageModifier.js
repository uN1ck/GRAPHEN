//http://www.phpied.com/files/canvas/pixels.html
//http://esate.ru/uroki/OpenGL/uroki-OpenGL-c-sharp/primenenie-graficheskih-filtrov-opengl-vvedenie/
"use strict";

class CanvasController {
    constructor(canvas, imagesrc = null) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.image = new Image();

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
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.context.drawImage(this.image, 0, 0);
    }

    appendScaleingOperation(operation, coef) {
        this.reset();

        let olddata = this.getData();
        let oldpx = olddata.data;
        let oldwidth = this.image.width;
        this.canvas.width = this.image.width * coef;
        this.canvas.height = this.image.height * coef;

        let newdata = this.context.createImageData(this.image.width * coef, this.image.height * coef);
        let newpx = newdata.data;

        let res = null;
        let len = newpx.length;
        let newwidth = this.canvas.width;
        let height = this.canvas.height;

        for (let i = 0; i < len; i += 4) {
            res = operation(oldpx, 1 / coef, i / 4, newwidth, oldwidth);
            if (res != null) {
                newpx[i] = res[0];
                newpx[i + 1] = res[1];
                newpx[i + 2] = res[2];
                newpx[i + 3] = res[3];
            }
        }
        this.setData(newdata);
        //alert("Operation DONE!");
    }

}

/**
 * ====================================================================================
 */

let imageCanvas;

window.onload = function () {
    imageCanvas = new CanvasController(document.getElementById("ImageCanvas"), "originalImage.jpg");
};


/**
 * ====================================================================================
 */


function nearestNeighbourResizer(data, coef, i, newwidth, oldwidth) {

    let pixel = [0, 0, 0, 0];
    let x = i % newwidth;
    let y = Math.floor(i / newwidth);
    let newx = Math.round(x * coef);
    let newy = Math.round(y * coef);

    let resultIndex = (newx + newy * oldwidth) * 4;

    pixel = [data[resultIndex], data[resultIndex + 1], data[resultIndex + 2], data[resultIndex + 3]];

    return pixel;
}

function bilinearResizer(data, coef, i, newwidth, oldwidth) {

    let pixel = [0, 0, 0, 0];
    let ox = i % newwidth;
    let oy = Math.floor(i / newwidth);

    let nx = Math.round(ox * coef);
    let ny = Math.round(oy * coef);

    let ltpx = ((nx - 1) + (ny - 1) * oldwidth) * 4;
    let rtpx = ((nx + 1) + (ny - 1) * oldwidth) * 4;
    let lbpx = ((nx - 1) + (ny + 1) * oldwidth) * 4;
    let rbpx = ((nx + 1) + (ny + 1) * oldwidth) * 4;

    pixel = [
        (data[ltpx] + data[rtpx] + data[lbpx] + data[rbpx]) / 4,
        (data[ltpx + 1] + data[rtpx + 1] + data[lbpx + 1] + data[rbpx + 1]) / 4,
        (data[ltpx + 2] + data[rtpx + 2] + data[lbpx + 2] + data[rbpx + 2]) / 4,
        (data[ltpx + 3] + data[rtpx + 3] + data[lbpx + 3] + data[rbpx + 3]) / 4
    ];

    return pixel;
}

function onChange_resizeNearestNeighbour(value) {
    imageCanvas.appendScaleingOperation(nearestNeighbourResizer, value);
}


function onChange_resizeBilinear(value) {
    imageCanvas.appendScaleingOperation(bilinearResizer, value);
}

function onClick_reset(value) {
    imageCanvas.reset();

}
