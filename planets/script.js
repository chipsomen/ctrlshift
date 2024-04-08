import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 75000);
const worldAmbience = new THREE.AmbientLight(0xdbdbdb);
scene.add(worldAmbience);
const textureLoader = new THREE.TextureLoader();

camera.position.set(250, 250, 250);

const axesHelper = new THREE.AxesHelper(800);
scene.add(axesHelper);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

function planetConstructor(size, color){
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 16),
        new THREE.MeshBasicMaterial({
            color: color
        })
    );
    const planetObj = new THREE.Object3D();
    planetObj.add(planet);
    scene.add(planetObj);

    return [planet, planetObj];
}


const sun = new THREE.Mesh(
    new THREE.SphereGeometry(125, 30, 30),
    new THREE.MeshBasicMaterial({
        color: 0xff6f00
    })
);

const [mercury, mercuryObj] = planetConstructor(5, 0xFFFFFF);
const [venus, venusObj] = planetConstructor(15, 0xdbeb34);
const [earth, earthObj] = planetConstructor(20, 0x4287f5);
const [mars, marsObj] = planetConstructor(10, 0xf56942);
const [jupiter, jupiterObj] = planetConstructor(45, 0xf00000);
const [saturn, saturnObj] = planetConstructor(40, 0xffbe3b);
const [uranus, uranusObj] = planetConstructor(22, 0x3bbaff);
const [neptune, neptuneObj] = planetConstructor(22, 0x4f3bff);

mercury.position.x = 500;
venus.position.x = 1000;
earth.position.x = 1500;
mars.position.x = 2000;
jupiter.position.x = 3000;
saturn.position.x = 3750;
uranus.position.x = 4250;
neptune.position.x = 4750;
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
    console.log(mercuryObj.rotation.x, mercuryObj.rotation.y, mercuryObj.rotation.z);

    sun.rotateY(0.001);
    mercuryObj.rotateY(0.004); mercury.rotateY(0.004);
    venusObj.rotateY(0.003); venus.rotateY(0.002);
    earthObj.rotateY(0.0026); earth.rotateY(0.002);
    marsObj.rotateY(0.002); mars.rotateY(0.002);
    jupiterObj.rotateY(0.001); jupiter.rotateY(0.002);
    saturnObj.rotateY(0.0007); saturn.rotateY(0.002);
    uranusObj.rotateY(0.0005); uranus.rotateY(0.002);
    neptuneObj.rotateY(0.0004); neptune.rotateY(0.002);

    renderer.render(scene, camera);
});
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});