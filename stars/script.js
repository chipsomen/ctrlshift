import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
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

camera.position.set(20, 20, 20);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 30, 30),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffe38f,
        emissiveIntensity: 1.5
    })
);
scene.add(sun);
const starClasses = [
    {
        type: "O",
        luminosity: "30,000 - 1,000,000 Solar Luminosities",
        temp: ">30,000K (Extremely Hot)",
        size: "Very Large",
        lifespan: "Short (<10M)",
        color: 0x0000FF
    },
    {
        type: "B",
        luminosity: "25 - 30,000 Solar Luminosities",
        temp: "10,000K - 30,000K (Hot)",
        size: "Large",
        lifespan: "Moderate (10M - 100M)",
        color: 0x9ACD32 
    },
    {
        type: "A",
        luminosity: "5 - 25 Solar Luminosities",
        temp: "7,500K - 10,000K (Hot)",
        size: "Medium to Large",
        lifespan: "Moderate (100M - 1B)",
        color: 0xFFFF00 
    },
    {
        type: "F",
        luminosity: "1.5 - 5 Solar Luminosities",
        temp: "6,000K - 7,500K (Hot)",
        size: "Medium",
        lifespan: "Long (1B - 10B)",
        color: 0xFFA500
    },
    {
        type: "G",
        luminosity: "0.6 - 1.5 Solar Luminosities",
        temp: "5,000K - 6,000K (Moderate)",
        size: "Medium",
        lifespan: "Long (10B+)",
        color: 0xFFD700
    },
    {
        type: "K",
        luminosity: "0.08 - 0.6 Solar Luminosities",
        temp: "3,500K - 5,000K (Cool)",
        size: "Small to Medium",
        lifespan: "Very Long (10B+)",
        color: 0xFFA07A 
    },
    {
        type: "M",
        luminosity: "0.01 - 0.08 Solar Luminosities",
        temp: "<3,500K (Cool)",
        size: "Small",
        lifespan: "Extremely Long (100B+)",
        color: 0xFF0000 
    }
];
let index = 0;

function showNextStar() {
    const star = starClasses[index];
    document.getElementById("classification").querySelectorAll("p")[0].innerText = `Spectral Type: ${star.type}`;
    document.getElementById("classification").querySelectorAll("p")[1].innerText = `Luminosity: ${star.luminosity}`;
    document.getElementById("classification").querySelectorAll("p")[2].innerText = `Temperature: ${star.temp}`;
    document.getElementById("classification").querySelectorAll("p")[3].innerText = `Size: ${star.size}`;
    document.getElementById("classification").querySelectorAll("p")[4].innerText = `Lifespan: ${star.lifespan}`;
    sun.material.emissive.set(star.color)
    index = (index + 1) % starClasses.length;
    console.log(sun.material)

}

document.getElementById('nextStar').addEventListener('click', () => {
    showNextStar();
})


const animate = () => {
    composer.render();
    requestAnimationFrame(animate)
};

animate();

// window resizing
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});