//Класс одного грфического объекта
//Содержит мтеод отрисовки
var _OriginalModel = {};
_OriginalModel.vertexes = [];
_OriginalModel.vertexElementsCount = 3;
_OriginalModel.linking = [];
_OriginalModel.linkingType = null;

_OriginalModel.drawSelf = function (gl, shaderProgram) {
    // установка буфера вершин
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexes), gl.STATIC_DRAW);
    vertexBuffer.itemSize = 3;

    // создание буфера индексов
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.linking), gl.STATIC_DRAW);
    indexBuffer.numberOfItems = this.linking.length;

    //Отрисовка объекта
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexElementsCount, gl.FLOAT, false, 0, 0);
    gl.drawElements(gl.LINES, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);

    //Очистка буферов
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

