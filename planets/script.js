import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 75000);
const worldAmbience = new THREE.AmbientLight(0x222222);
scene.add(worldAmbience);
const planets = {};
const textureLoader = new THREE.TextureLoader();
const assetLoader = new GLTFLoader().setPath('../models/solarsystem/');


camera.position.set(250, 250, 250);

const axesHelper = new THREE.AxesHelper(800);
scene.add(axesHelper);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
const pointLight = new THREE.PointLight(0xFFFFFF, 10, 20000, 0);
scene.add(pointLight);
const PLH = new THREE.PointLightHelper(pointLight);
scene.add(PLH);
window.createImageBitmap = undefined; // crying

function planetConstructor(size, planetType, pos, tilt, axial){
    assetLoader.load(`${planetType}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(size*5, size*5, size*5);
        model.position.x = pos;
        model.rotateZ = axial * Math.PI/180;
        console.log(`loaded ${planetType}`);

        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(pos, 3, 8, 100),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF
            })
        );
        orbit.rotateX(Math.PI/2 + tilt);
        scene.add(orbit);

        const planetObj = new THREE.Object3D();
        planetObj.add(model);
        planetObj.rotateZ = tilt;
        scene.add(planetObj);

        planets[planetType] = {obj: model, anchor: planetObj, orbit: orbit};
    }, null, (err) => {
        console.error(err);
    });
}

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(125, 30, 30),
    new THREE.MeshStandardMaterial({
        color: 0xff6f00,
        emissive: 0xff6f00,
        emissiveIntensity: 1
    })
);

planetConstructor(5, 'mercury', 500, 0.001, 0);
planetConstructor(15, 'venus', 1000, -0.001, 177.4);
planetConstructor(20, 'earth', 1500, 0.002, 23.4);
planetConstructor(10, 'mars', 2000, 0.001, 25.2);
planetConstructor(45, 'jupiter', 3000, -0.0015, 3.1);
planetConstructor(40, 'saturn', 3750, 0.003, 26.7);
planetConstructor(22, 'uranus', 4250, 0.001, 97.8);
planetConstructor(22, 'neptune', 4750,-0.0025, 28.3);

// mercury.position.x = 500;
// venus.position.x = 1000;
// earth.position.x = 1500;
// mars.position.x = 2000;
// jupiter.position.x = 3000;
// saturn.position.x = 3750;
// uranus.position.x = 4250;
// neptune.position.x = 4750;
scene.add(sun);

const raycaster = new THREE.Raycaster();
const mousePos = new THREE.Vector2();
window.addEventListener('mousemove', function(e){
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

renderer.setAnimationLoop(() => {
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects[0]){
        if (intersects[0].object.position.x !== 0){
            camera.position.set(
                intersects[0].object.position.x * Math.cos(intersects[0].object.parent.rotation.y),
                0,
                intersects[0].object.position.x * Math.sin(intersects[0].object.parent.rotation.y)
            );
            console.log(`(${intersects[0].object.position.x * Math.cos(intersects[0].object.parent.rotation.y)},${intersects[0].object.position.x * Math.sin(intersects[0].object.parent.rotation.y)})`, intersects[0].object.parent.rotation.y)
        }
    }

    sun.rotateY(0.001);
    // planets.mercury ? planets.mercury.anchor.rotateY(0.004) : null; planets.mercury ? planets.mercury.obj.rotateY(0.002) : null;
    // planets.venus ? planets.venus.anchor.rotateY(0.003) : null; planets.venus ? planets.venus.obj.rotateY(0.002) : null;
    // planets.earth ? planets.earth.anchor.rotateY(0.0026) : null; planets.earth ? planets.earth.obj.rotateY(0.002) : null;
    // planets.mars ? planets.mars.anchor.rotateY(0.002) : null; planets.mars ? planets.mars.obj.rotateY(0.002) : null;
    // planets.jupiter ? planets.jupiter.anchor.rotateY(0.001) : null; planets.jupiter ? planets.jupiter.obj.rotateY(0.002) : null;
    // planets.saturn ? planets.saturn.anchor.rotateY(0.0007) : null; planets.saturn ? planets.saturn.obj.rotateY(0.002) : null;
    // planets.uranus ? planets.uranus.anchor.rotateY(0.0005) : null; planets.uranus ? planets.uranus.obj.rotateY(0.002) : null;
    // planets.neptune ? planets.neptune.anchor.rotateY(0.0004) : null; planets.neptune ? planets.neptune.obj.rotateY(0.002) : null;

    if (planets.mercury){
        planets.mercury.anchor.rotateY(0.004);
        planets.mercury.obj.rotateY(0.002);
    }
    if (planets.venus){
        planets.venus.anchor.rotateY(0.003);
        planets.venus.obj.rotateY(0.002);
    }
    if (planets.earth){
        planets.earth.anchor.rotateY(0.0026);
        planets.earth.obj.rotateY(0.002);
    }
    if (planets.mars){
        planets.mars.anchor.rotateY(0.002);
        planets.mars.obj.rotateY(0.002);
    }
    if (planets.jupiter){
        planets.jupiter.anchor.rotateY(0.001);
        planets.jupiter.obj.rotateY(0.002);
    }
    if (planets.saturn){
        planets.saturn.anchor.rotateY(0.0007);
        planets.saturn.obj.rotateY(0.002);
    }
    if (planets.uranus){
        planets.uranus.anchor.rotateY(0.0005);
        planets.uranus.obj.rotateY(0.002);
    }
    if (planets.neptune){
        planets.neptune.anchor.rotateY(0.0004);
        planets.neptune.obj.rotateY(0.002);
    }

    renderer.render(scene, camera);
});
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
console.log('completed')