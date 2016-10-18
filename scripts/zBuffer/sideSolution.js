window.onload = function initializeContext() {

    var container = document.createElement('div');
    document.body.appendChild(container);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    var sightLine = new THREE.Vector3(-20, 40, 50);
    renderer.setClearColor(0xEEEEEE);
    renderer.setSize(window.innerWidth, window.innerHeight);


    var axes = new THREE.AxisHelper(20);
    scene.add(axes);


    var cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    cubeGeometry.faces.forEach(function (item) {
        if (Math.abs(item.normal.angleTo(sightLine)) < Math.PI / 2) {
            item.color = new THREE.Color(0xff0000);
        } else {
            item.color = new THREE.Color(0x00ff00);
        }
    });
    var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    cubeMaterial.vertexColors = THREE.FaceColors;
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);


    cube.position.x = -10;
    cube.position.y = 10;
    cube.position.z = 10;
    scene.add(cube);

    camera.position.x = sightLine.x;
    camera.position.y = sightLine.y;
    camera.position.z = sightLine.z;
    camera.lookAt(scene.position);

    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);
};
