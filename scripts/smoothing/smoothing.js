var canvas;
var context;
var pixelsData;
var imageData;
var pointCount = 8;
var faces = 6;
var fVertex = 4;

var cubeTemp = [[5, 5, 5], [24, 5, 5], [24, 24, 5], [5, 24,5],
    [5, 5, 24], [24, 5, 24], [24, 24, 24], [5, 24, 24]];

var cube3d = [];
var cube2d = [];

var center = [];

var ctn = Math.cos(Math.atan(2.0)) / 2;
var stn = Math.sin(Math.atan(2.0)) / 2;

//��������� ����� �� ������ ����� ����
var edges = [[0, 4, 5, 1], [0, 1, 2, 3], [0, 3, 7, 4], [5, 4, 7, 6], [1, 5, 6, 2], [2, 6, 7, 3]];

//�����
var colors = [[0,100,255],[100,255,0],[255,100,0],[0,255,255],[255,0,255],[255,255,0]];

//������������ �����
var lightTemp = [];
var count = 0;

//���������� ��� ������������ canvas ����� ���������� �����
var left = 0, up = 0, bottom = 700, right = 1000;

var rotateY = function(alpha)
{
    var x, alsin = Math.sin(alpha), alcos = Math.cos(alpha);
    for (var i = 0; i < pointCount; i++) {
        //������� ����� ������
        cube3d[i].point.x -= center[0];
        cube3d[i].point.y -= center[1];
        //��������� ����� ��������� �����
        x = cube3d[i].point.x * alcos - cube3d[i].point.z * alsin;
        //��������� �������
        cube3d[i].point.z = cube3d[i].point.x * alsin + cube3d[i].point.z * alcos;
        //���������� ��������
        cube3d[i].point.x = x;
        cube3d[i].point.x += center[0];
        cube3d[i].point.y += center[1];
        //�������
        x = cube3d[i].normal.x * alcos - cube3d[i].normal.z * alsin;
        cube3d[i].normal.z = cube3d[i].normal.x * alsin + cube3d[i].normal.z * alcos;
        cube3d[i].normal.x = x;
    }
};

var rotateX = function(alpha)
{
    var y, alsin = Math.sin(alpha), alcos = Math.cos(alpha);
    for( var i = 0; i < pointCount; i++ )
    {
        cube3d[i].point.x -= center[0];
        cube3d[i].point.y -= center[1];
        y =  cube3d[i].point.y * alcos + cube3d[i].point.z * alsin;
        cube3d[i].point.z = cube3d[i].point.z * alcos - cube3d[i].point.y * alsin;
        cube3d[i].point.y = y;
        cube3d[i].point.x += center[0];
        cube3d[i].point.y += center[1];

        y = cube3d[i].normal.y * alcos + cube3d[i].normal.z * alsin;
        cube3d[i].normal.z = cube3d[i].normal.z * alcos - cube3d[i].normal.y * alsin;
        cube3d[i].normal.y = y;

    }
};

var visible = function(num)
{
    var j;
    var sum = 0;
    for (var i = 0; i < fVertex; i++) {
        j = (i == fVertex - 1) ? 0 : i + 1;
        sum += (cube2d[edges[num][i]].point.x - cube2d[edges[num][j]].point.x) * (cube2d[edges[num][i]].point.y + cube2d[edges[num][j]].point.y);
    }

    return (sum > 0)? 1:0;
};

var project = function()
{
    for( var i = 0; i < pointCount; i++ )
    {
        cube2d[i] = { point: { x: 0, y: 0 } };
        cube2d[i].point.x = Math.floor(cube3d[i].point.x - cube3d[i].point.z * ctn);
        cube2d[i].point.y = Math.floor(cube3d[i].point.y - cube3d[i].point.z * stn);

    }
};

var normalize = function(vector)
{

    var vec_length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    if( vec_length != 0 ) vector.x /= vec_length, vector.y /= vec_length, vector.z /= vec_length; else vector.x = 0, vector.y = 0, vector.z = 0;
};

var vectorSize = function(vector)
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
};

var lightIntense = function (point) {

    var amp = 0.9;
    var ambient = 0.8;
    var K = 0.1;
    var ks = 0.5;

    var light = {}, s = {}, lightVect = {}, pointVect = {}, normal = {};
    light.x = 0, light.y = 0, light.z = 1;
    s.x = 0, s.y = 0, s.z = 0.1;
    var n = 3;


    pointVect = { x: cube3d[point].point.x, y: cube3d[point].point.y, z: cube3d[point].point.z };
    normalize(pointVect);


    lightVect.x =  (light.x - pointVect.x);
    lightVect.y =  (light.y - pointVect.y);
    lightVect.z =  -(light.z - pointVect.z);
    normalize(lightVect);

    normal = cube3d[point].normal;


    var cosFi = lightVect.x * normal.x + lightVect.y * normal.y + lightVect.z * normal.z;

    var cosAlpha = -lightVect.x * s.x - lightVect.y * s.y - -lightVect.z * s.z;

    var d = vectorSize(lightVect);

    var val = ambient + (amp * cosFi + ks * Math.pow(cosAlpha,n) ) / (d + K);
    var res = val < 0 ? 0 : val > 1 ? 1 : val;

    return res;
};

var makeLine = function(p1,p2)
{
    var dx = Math.abs(p2.point.x - p1.point.x), dy = Math.abs(p2.point.y - p1.point.y);
    var sx = p1.point.x < p2.point.x ? 1 : -1, sy = p1.point.y < p2.point.y ? 1 : -1;
    var t, len = Math.sqrt((dx*dx + dy*dy)), dxc, dyc;
    var x = p1.point.x, y = p1.point.y, prev = -32767;

    var error = dx - dy, err;
    for (;;) {
        // ��������� ������������� � ����� �����
        dxc = p1.point.x - x, dyc = p1.point.y - y;
        t = Math.sqrt(dxc*dxc + dyc*dyc) / len;
        err = error * 2;
        if(y != prev )
        {
            lightTemp[count] = { point: { x: x, y: y }, light: 0 };

            lightTemp[count].light = (1-t) * p1.light + t * p2.light;
            count++;
        }
        prev = y;
        if(x == p2.point.x && y == p2.point.y) break;

        if(err > -dy) error -= dy, x += sx;
        if(err < dx)
        {
            lightTemp[count] = { point: { x: x, y: y }, light: 0 };
            lightTemp[count].light = (1-t) * p1.light + t * p2.light;
            count++;
            error += dx, y += sy;
        }
    }
};

var setPoint = function(pixels, x, y,color)
{

    if(x < 0 || y < 0 || x > 1000 || y > 700 ) return;
    pixels[(x + y * 1000)*4] = color.r;
    pixels[(x + y * 1000)*4 + 1] = color.g;
    pixels[(x + y * 1000)*4 + 2] = color.b;
    pixels[(x + y * 1000)*4 + 3] = color.a;
};

var min = function(a,b)
{
    return a > b ? b : a;
};
var max = function(a,b)
{
    return a < b ? b : a;
};

var fillrect = function(pixels, x1,y1, x2, y2, color)
{

    var minX = min(x1, x2);
    var minY = min(y1, y2);
    var dx = Math.abs(x2 - x1) + 1, dy = Math.abs(y2 - y1) + 1;


    for (var i = 0; i < 1000; i++) {
        for (var j = 0; j < 700; j++) {
            setPoint(pixels,i,j, color);
        }
    }
};


var guroFill=function(pixels, gr_num, pcount)
{

    var i, next, x, y, x1, x2;
    var I, I2, incr;

    count = 0;
    lightTemp = [];

    for (i = 0; i < pcount; i++) {

        next = (i != (pcount - 1)) ? i + 1 : 0;
        makeLine(cube2d[edges[gr_num][i]], cube2d[edges[gr_num][next]]);
    }

    // ��������� ����� �� Y
    lightTemp.sort(function (a, b) {
        return (a.point.y > b.point.y ? 1 : a.point.y == b.point.y ? 0 : -1);
    });


    // ����������� �����
    for (i = 0; i < count - 1; i++) {
        y = lightTemp[i].point.y;

        if (y > bottom) bottom = y;
        if (y < up) up = y;

        if (y != lightTemp[i + 1].point.y) continue;
        x1 = lightTemp[i].point.x, x2 = lightTemp[i + 1].point.x;
        I = lightTemp[i].light, I2 = lightTemp[i + 1].light;

        //������ �������������� �����
        if (x1 > x2) {
            var temp = x1;
            x1 = x2;
            x2 = temp;
            temp = I;
            I = I2;
            I2 = temp;
        }

        incr = (I2 - I) / (x2 - x1);
        if (x1 < left) left = x1;
        if (x2 > right) right = x2;
        for (x = x1; x <= x2; x++) {
            //��������� �����

            setPoint(pixels, x, y,
                {
                    "r": colors[gr_num][0] * I,
                    "g": colors[gr_num][1] * I,
                    "b": colors[gr_num][2] * I,
                    "a": 255
                }
            );
            //			SetPoint(pixels,x,y,RGB(0*(I),255*(I),0*(I)));
            I += incr; // ������������� �������������
        }
    }
};


var showCube = function(pixels)
{
    for( var j = 0; j < pointCount; j++ )
    {
        cube2d[j].light = lightIntense(j);
    }

    for(var i = 0; i < faces; i++)
    {
        if(visible(i))
        {

            guroFill(pixels,i,fVertex);

        }

    }


};

var decVect = function (t1, t2) {
    var summ = {};
    summ.x = t1.x - t2.x;
    summ.y = t1.y - t2.y;
    summ.z = t1.z - t2.z;
    return summ;
};
var a = 0;

var paint = function () {



    fillrect(pixelsData, left, up, right, bottom, { r: 0, g: 0, b: 0, a:0 });
    up = 700; bottom = 0; left = 1000; right = 0;
    project(); // �������������
    showCube(pixelsData); // �����������
    context.putImageData(imageData, 0, 0);

};


var move = function () {

    var alpha = 0.025;
    a++;
    if (a < 100)
        rotateX(alpha);
    else if (a < 200)
        rotateX(-alpha);
    else if (a < 300)
        rotateY(alpha);
    else if (a < 400) {
        rotateX(alpha);
        rotateY(alpha);
    }
    else if (a < 500) {
        rotateX(-alpha);
        rotateY(-alpha);
    }
    else if (a < 600) {
        rotateX(-alpha);
        rotateY(alpha);
    }
    else if (a < 700) {
        rotateX(alpha);
        rotateY(-alpha);
    }
    else
        rotateY(-alpha);
    if (a > 800) a = 0;
    paint();
};


$(function () {
    canvas = document.getElementById('iCanvas');
    if (canvas && canvas.getContext) {
        context = canvas.getContext('2d');
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        pixelsData = imageData.data;
        center[0] = 1000/2;
        center[1] = 700 / 2;
        console.log(center);
        for(var i=0; i < pointCount; i++)
        {
            cube3d.push({
                point: {
                    x: 0, y: 0, z: 0
                },
                normal: { x: 0, y: 0, z: 0 }
            });
            cube3d[i].point = {x:0,y:0,z:0};
            cube3d[i].point.x = cubeTemp[i][0] * 6;
            cube3d[i].point.y = cubeTemp[i][1] * 6;
            cube3d[i].point.z = cubeTemp[i][2] * 6;
            cube3d[i].point.x += center[0];
            cube3d[i].point.y += center[1];

        }
        //�������� ������� �� ���� ��������
        var v1,v2;
        for( var j = 0; j < pointCount; j++ )
        {

            for( var i=0; i < faces; i++ )
            {
                for( var k = 0; k < fVertex; k++ )
                    if( edges[i][k] == j )
                    {
                        v1 = decVect(cube3d[edges[i][0]].point,cube3d[edges[i][1]].point);
                        v2 = decVect(cube3d[edges[i][2]].point,cube3d[edges[i][1]].point);
                        cube3d[j].normal.x += v1.y * v2.z - v1.z * v2.y;
                        cube3d[j].normal.y += v1.z * v2.x - v1.x * v2.z;
                        cube3d[j].normal.z += v1.x * v2.y - v1.y * v2.x;
                    }
            }

            normalize(cube3d[j].normal);

        }
        paint();
        setInterval(move, 10);


    }
});