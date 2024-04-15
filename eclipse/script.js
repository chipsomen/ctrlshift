import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

// initialize renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// initialize scenes and passes
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 75000);
const worldAmbience = new THREE.AmbientLight(0x222222);
scene.add(worldAmbience);
const textureLoader = new THREE.TextureLoader();
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.6,
    0.1,
    0.1
);
composer.addPass(renderScene);
composer.addPass(bloomPass);

camera.position.set(20, 10, 0);

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(5, 30, 30),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffe38f,
        emissiveIntensity: 1.5
    })
);
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.45, 30, 30),
    new THREE.MeshBasicMaterial({
        color: 0x000000
    })
);
const moonObj = new THREE.Object3D();
moonObj.add(moon);
moonObj.rotation.x = Math.PI/4;


moon.position.set(10, 10, 0);
sun.position.set(0, 10, 0);
camera.lookAt(sun.position)
scene.add(sun)
scene.add(moonObj);

function fadeIn(el, s){
    let seconds = s;
    el.style.transition = `opacity ${seconds}s ease`;
    el.style.opacity = 1;
}

let active = false;
function toggle(){
    let toggle = document.querySelector('#playButton .infoButton .inner')
    active = !active
    if (active) {
        toggle.style.transform = "scale(0.8)";
        toggle.style['background-color'] = "rgb(255, 73, 73)";
    } else {
        toggle.style.transform = "";
        toggle.style['background-color'] = "";
    }
}

document.querySelector('#playButton .infoButton').addEventListener('click', toggle);

const animate = () => {
    let rotateSpeed = 0.005;
    let title = document.getElementById('header')
    let info = document.getElementsByClassName('infoContainer');
    if (moonObj.rotation.x - rotateSpeed > 0){
        moonObj.rotateX(-rotateSpeed);
    } else if (moonObj.rotation.x > 0){
        moonObj.rotation.x = 0;
    } else if (moonObj.rotation.x == 0 && title.style.opacity !== 0){
        fadeIn(title, 1);
        for (let i = 0; i < info.length; i++){
            fadeIn(info[i], 1)
        }
    }

    if (active){
        moonObj.rotateX(-rotateSpeed/5);
        if (moonObj.rotation.x <= -Math.PI/2){
            moonObj.rotation.x = Math.PI/2;
        }
    }

    composer.render();
    requestAnimationFrame(animate);
};

animate();

// window resizing
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});