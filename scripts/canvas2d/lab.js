"use strict"

var original2 = [
    0, 0, 3,
    2, 6, 5,
    4, 6, 5,
    6, 0, 3,
    4, 0, 3,
    3, 4, 4,
    2, 0, 3,

    0, 0, 0,
    2, 6, 3,
    4, 6, 3,
    6, 0, 0,
    4, 0, 0,
    3, 4, 2,
    2, 0, 0
];

var original = [
    0, 100, 0,
    100, 0, 0,
    0, 0, 0,
    100, 100, 0,
    0, 100, 100,
    100, 0, 100,
    0, 0, 100,
    100, 100, 100
];


window.onload = function () {
    var canvas = document.getElementById("mainCanvas");
    var context = canvas.getContext("2d");
    if (context == undefined)
        alert("No context!");

    var Equaled = rebuildToEquable(original);
    drawIt(Equaled, context);

}

// Трансформация объекта
function transformMatrix(value, transformer) {
    value.forEach(function (item, index, value) {
        vec4.transformMat4(item, item, transformer);
    });
    return value;
}

// Отрисовка примитива
// value - обьект в однородных координатах
// context - графический контекст
function drawIt(value, context) {
    value = isometricProection(value);
    value = transformMatrix(value, getTransfer(100, 100, 100));
    value = proectTo(value);
    value = rebuildToNormal(value);


    context.beginPath();
    value.forEach(function (item, index, value) {
        value.forEach(function (target, index, value) {
            context.moveTo(item[1], item[2]);
            context.lineTo(target[1], target[2]);
        });
        context.stroke();
    });

}

// Проекция на полскость YOZ
function proectTo(value) {
    return transformMatrix(value, getDiag(0, 1, 1, 1));
}

// Изометрическая проекция в однородных координатах
function isometricProection(value) {
    value = transformMatrix(value, getRx(30));
    value = transformMatrix(value, getRy(30));
    value = transformMatrix(value, getRz(30));

    return value;
}

// Пересторойка из евклидовых векторов в однородные координаты
function rebuildToEquable(value) {
    var res = [];
    for (var i = 0; i < (value.length); i += 3) {
        var current = vec4.fromValues(value[i], value[i + 1], value[i + 2], 1);
        res.push(current);
    }
    return res;
}

// Перестройка из однгородных в евклидовы координаты
function rebuildToNormal(value) {
    var res = [];
    value.forEach(function (item, i, value) {
        var current = vec3.fromValues(item[0] / item[3], item[1] / item[3], item[2] / item[3]);
        res.push(current);
    });
    return res;
}

// Получить матрицу смещения по осям
function getTransfer(x, y, z) {
    return mat4.fromValues(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    );
}

// Получить диагональную матрицу (отражения,)
function getDiag(x, y, z, h) {
    return mat4.fromValues(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, h
    );
}

// Получить матрицу поворота по x на угол в градусах
function getRx(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        1, 0, 0, 0,
        0, Math.cos(angle), Math.sin(angle), 0,
        0, -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 0, 1
    );
}

// Получить матрицу поворота по y на угол в градусах
function getRy(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        Math.cos(angle), 0, -Math.sin(angle), 0,
        0, 1, 0, 1,
        Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1
    );
}

// Получить матрицу поворота по z на угол в градусах
function getRz(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        Math.cos(angle), Math.sin(angle), 0, 0,
        -Math.sin(angle), Math.cos(angle), 0, 1,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}