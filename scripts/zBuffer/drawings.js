"use strict";


class drawings {
}
class edges {
}
class vector {
}

drawings.drawingObject = function (canvas, context, projection = getDiag(1, 1, 0, 1)) {
    this.context = context;
    this.canvas = canvas;
    this.projection = projection;

    this.clearCanvas = function (context, canvas) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Метод отрисовки формы с заданной общей проекцией и смещением
     * @param shape форма для отрисовки
     * @param sightLine направление, относительно которого общитываются видимые грани формы
     * @param offset смещение данной формы относитьельно нуля координат
     */
    this.drawShape = function (shape, sightLine = [0, 0, 1], offset = getTransfer(200, 200, 200)) {

        sightLine = vector.euclidToEquable(sightLine);
        sightLine = vector.transformMatrix(sightLine, getRx(45));
        sightLine = vector.transformMatrix(sightLine, getRy(45));
        sightLine = vector.transformMatrix(sightLine, getRz(45));
        sightLine = vector.equableToEuclid(sightLine);
        var drawingShape = shape.buildVisibleShape(sightLine[0]);


        drawingShape = edges.euclidToEquable(drawingShape);
        drawingShape = edges.transformMatrix(drawingShape, getDiag(5, 5, 5, 1));
        drawingShape = edges.transformMatrix(drawingShape, getRx(45));
        drawingShape = edges.transformMatrix(drawingShape, getRy(45));
        drawingShape = edges.transformMatrix(drawingShape, getRz(45));
        drawingShape = edges.transformMatrix(drawingShape, offset);
        drawingShape = edges.transformMatrix(drawingShape, this.projection);
        drawingShape = edges.equableToEuclid(drawingShape);

        this.context.beginPath();
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        drawingShape.forEach(function (item) {
            context.moveTo(item[0][0], item[0][1]);
            context.lineTo(item[1][0], item[1][1]);
            context.stroke();
        });
    }

}

/**
 * Класс полигон, состоящий из точек формата [x,y,z]
 * @param nodes набор из трех точек [x,y,z]
 */
drawings.Polygon = function (nodes, name) {
    this.name = name;
    this.nodes = nodes;
    // A = y1 (z2 - z3) + y2 (z3 - z1) + y3 (z1 - z2)
    // let a = mat3.fromValues(1, nodes[1][0], nodes[2][0], 1, nodes[1][1], nodes[2][1], 1, nodes[1][2], nodes[2][2]);
    // this.A = mat3.determinant(a);
    this.A = nodes[0][1] * (nodes[1][2] - nodes[2][2]) +
        nodes[1][1] * (nodes[2][2] - nodes[0][2]) +
        nodes[2][1] * (nodes[0][2] - nodes[1][2]);


    // B = z1 (x2 - x3) + z2 (x3 - x1) + z3 (x1 - x2)
    // let b = mat3.fromValues(nodes[0][0], 1, nodes[0][2], nodes[1][0], 1, nodes[1][2], nodes[2][0], 1, nodes[2][2]);
    // this.B = mat3.determinant(b);
    this.B = nodes[0][2] * (nodes[1][0] - nodes[2][0]) +
        nodes[1][2] * (nodes[2][0] - nodes[0][0]) +
        nodes[2][2] * (nodes[0][0] - nodes[1][0]);

    // C = x1 (y2 - y3) + x2 (y3 - y1) + x3 (y1 - y2)
    // let c = mat3.fromValues(nodes[0][0], nodes[0][1], 1, nodes[1][0], nodes[1][1], 1, nodes[2][0], nodes[2][1], 1);
    // this.C = mat3.determinant(c);
    this.C = nodes[0][0] * (nodes[1][1] - nodes[2][1]) +
        nodes[1][0] * (nodes[2][1] - nodes[0][1]) +
        nodes[2][0] * (nodes[0][1] - nodes[1][1]);

    // - D = x1 (y2 z3 - y3 z2) + x2 (y3 z1 - y1 z3) + x3 (y1 z2 - y2 z1)
    // let d = mat3.fromValues(nodes[0][0], nodes[0][1], nodes[0][2], nodes[1][0], nodes[1][1], nodes[1][2], nodes[2][0], nodes[2][1], nodes[2][2]);
    // this.D = mat3.determinant(d);
    this.D = nodes[0][0] * (nodes[1][1] * nodes[2][2] - nodes[2][1] * nodes[1][2]) +
        nodes[1][0] * (nodes[2][1] * nodes[0][2] - nodes[0][1] * nodes[2][2]) +
        nodes[2][0] * (nodes[0][1] * nodes[1][2] - nodes[1][1] * nodes[0][2]);


    /**
     * Метод  получения стороны, с которой лежит точка
     * @param point точка [x,y,z], для которой определяется с какой стороны находится плоскость
     * @returns {number} значение {-1,0,1} - 0 если точка принадлежит плоскости
     */
    this.getAlignSide = function (point) {
        return Math.sign(point[0] * this.A + point[1] * this.B + point[2] * this.C + this.D);
    }

    /**
     * Метод смены направления основного вектора нормали
     */
    this.reverseNormalVector = function () {
        this.A = -this.A;
        this.B = -this.B;
        this.C = -this.C;
        this.D = -this.D;
    }

    /**
     * Метод получения угла заданного вектора к плоскости
     * @param vector заданный вектор [x,y,z]
     * @returns {Number} угол в радианах
     */
    this.getAngleTo = function (vector) {
        let normal = vec3.fromValues(this.A, this.B, this.C);
        //vec3.normalize(normal, normal);
        let income = vec3.fromValues(vector[0], vector[1], vector[2])
        //vec3.normalize(income, income);
        return vec3.dot(normal, income) / (vec3.length(normal) * vec3.length(income));
    }

}

/**
 * Класс формы, состоящий из набора полигонов. Для корреткной работы требует набор полигонов и внутренюю точку фигуры.
 * Центровая точка поворачивает все вектора нормали плоскостей в ее направлении для общета видимых граней
 * @param polygons набор полигонов фигуры
 * @param centerPoint центровая точка
 */
drawings.Shape = function (polygons, centerPoint) {
    this.polygons = polygons;
    this.centerPoint = centerPoint;
    this.polygons.forEach(function (item, index, polygons) {
        if (item.getAlignSide(centerPoint) == 1)
            item.reverseNormalVector();
    });

    /**
     * Метод построения видимой формы основанный на выбранном направлении осмотра
     * @param sightLine вектор направления взгляда
     * @returns {*[]} массив сосотящий из [] - ребер
     */
    this.buildVisibleShape = function (sightLine) {
        let edges = [];


        polygons.forEach(function (item) {
            let angle = item.getAngleTo(sightLine);

            console.log(item.name, angle, "Coordinates:", item.A, item.B, item.C);

            if (Math.abs(angle) <= 0.5) {
                console.log(item.name);
                for (let i = 0; i < 3; i++) {
                    if (!( [item.nodes[i], item.nodes[(i + 1) % 3]] in edges))
                        edges.push([item.nodes[i], item.nodes[(i + 1) % 3]]);
                }
            }
        });

        return edges;
    }

}

/**
 * Метод приведения набора ребер в евклидовых координатах к набору ребер в равномерных координатах
 * @param value набор ребер в евклидовых координатах
 * @returns {Array} набор ребер в равномерных координатах
 */
edges.euclidToEquable = function (value) {
    var res = [];
    value.forEach(function (item) {
        var current = [
            vec4.fromValues(item[0][0], item[0][1], item[0][2], 1),
            vec4.fromValues(item[1][0], item[1][1], item[1][2], 1)
        ];
        res.push(current);
    });
    return res;
}

/**
 * Метод приведения набора ребер в равномерных координатах к набору ребер в евклидовых координатах
 * @param value набор ребер в равномерных координатах
 * @returns {Array} набор ребер в евклидовых координатах
 */
edges.equableToEuclid = function (value) {
    var res = [];
    value.forEach(function (item) {
        var current = [
            vec3.fromValues(item[0][0] * item[0][3], item[0][1] * item[0][3], item[0][2] * item[0][3]),
            vec3.fromValues(item[1][0] * item[1][3], item[1][1] * item[1][3], item[1][2] * item[1][3])
        ];
        res.push(current);
    });
    return res;
}

/**
 * Метод трансформации набора vec4 с помощью матрицы
 * @param value набор векторов vec4 формы
 * @param transformer матрица трансформации
 * @returns {*} набор преобразованных векторов vec4
 */
edges.transformMatrix = function (value, transformer) {
    let res = [];
    value.forEach(function (item) {
        res.push([vec4.transformMat4(item[0], item[0], transformer),
            vec4.transformMat4(item[1], item[1], transformer)]);
    });
    return res;
}

edges.normalize = function (value) {
    var res = [];
    value.forEach(function (item, i, value) {
        var current = [
            vec4.fromValues(item[0][0] / item[0][3], item[0][1] / item[0][3], item[0][2] / item[0][3], item[0][3] / item[0][3]),
            vec4.fromValues(item[1][0] / item[1][3], item[1][1] / item[1][3], item[1][2] / item[1][3], item[1][3] / item[1][3])
        ];
        res.push(current);
    });
    return res;
}


//

vector.transformMatrix = function (value, transformer) {
    let res = []
    value.forEach(function (item, index, value) {
        let buffer = vec4.create();
        res.push(vec4.transformMat4(buffer, item, transformer));
    });
    return res;
}

vector.euclidToEquable = function (value) {
    var res = [];
    for (var i = 0; i < (value.length); i += 3) {
        var current = vec4.fromValues(value[i], value[i + 1], value[i + 2], 1);
        res.push(current);
    }
    return res;
}

vector.equableToEuclid = function (value) {
    var res = [];
    value.forEach(function (item, i, value) {
        var current = vec3.fromValues(item[0] * item[3], item[1] * item[3], item[2] * item[3]);
        res.push(current);
    });
    return res;
}

vector.normalize = function (value) {
    var res = [];
    value.forEach(function (item, i, value) {
        var current = vec4.fromValues(item[0] / item[3], item[1] / item[3], item[2] / item[3], item[3] / item[3]);
        res.push(current);
    });
    return res;
}
//


function isometricProection(value) {
    value = transformMatrix(value, getRx(45));
    value = transformMatrix(value, getRy(45));
    value = transformMatrix(value, getRz(45));

    return value;
}

function getTransfer(x, y, z) {
    return mat4.fromValues(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    );
}

function getDiag(x, y, z, h) {
    return mat4.fromValues(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, h
    );
}

function getRx(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        1, 0, 0, 0,
        0, Math.cos(angle), Math.sin(angle), 0,
        0, -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 0, 1
    );
}

function getRy(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        Math.cos(angle), 0, -Math.sin(angle), 0,
        0, 1, 0, 0,
        Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1
    );
}

function getRz(angle) {
    angle = angle * Math.PI / 180;
    return mat4.fromValues(
        Math.cos(angle), Math.sin(angle), 0, 0,
        -Math.sin(angle), Math.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}