if (!Detector.webgl) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer;

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 600;
    camera.position.x = 600;

    scene = new THREE.Scene();

    var light, object;

    scene.add(new THREE.AmbientLight(0x404040));

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 0);
    scene.add(light);

    var map = new THREE.TextureLoader().load('data/three.js-master/examples/textures/UV_Grid_Sm.jpg');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    var material = new THREE.MeshLambertMaterial({map: map, side: THREE.DoubleSide});

    //
    object = new THREE.Mesh(new THREE.SphereGeometry(75, 20, 10), material);
    object.position.set(-400, 0, 200);
    scene.add(object);

    object = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 1), material);
    object.position.set(-200, 200, 200);
    scene.add(object);

    object = new THREE.Mesh(new THREE.TorusGeometry(75, 25), material);
    object.position.set(0, 200, 0);
    scene.add(object);

    object = new THREE.Mesh(new THREE.TetrahedronGeometry(75, 0), material);
    object.position.set(200, 0, 0);
    scene.add(object);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    var timer = Date.now() * 0.00005;

    camera.position.x = Math.cos(timer) * 800;
    camera.position.z = Math.sin(timer) * 800;

    camera.lookAt(scene.position);

    for (var i = 0, l = scene.children.length; i < l; i++) {

        var object = scene.children[i];

        object.rotation.x = timer * 0.5;
        object.rotation.y = timer * 1.5;

    }

    renderer.render(scene, camera);

}
