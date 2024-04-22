import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
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
const assetLoader = new GLTFLoader().setPath('../models/stars/');
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

camera.position.set(30, 30, 30);

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


// HTML JavaScript
const starClasses = [
    {
        type: "O",
        description: "Type O stars are extremely hot and very large, with temperatures exceeding 30,000K. They exhibit luminosities ranging from 30,000 to 1,000,000 times that of the Sun. These stars have short lifespans, typically lasting less than 10 million years. They appear bluish-white in color.",
        luminosity: "30,000 - 1,000,000 L\u2609",
        temp: ">30,000K (Extremely Hot)",
        size: "Very Large (> 6 R\u2609)",
        lifespan: "Short (<10M)",
        color: 0x524fff
    },
    {
        type: "B",
        description: "B-Type stars are hot and large, with temperatures ranging from 10,000K to 30,000K. They have luminosities between 25 and 30,000 times that of the Sun. These stars have moderate lifespans, typically lasting between 10 million and 100 million years. They appear blue in color.",
        luminosity: "25 - 30,000 L\u2609",
        temp: "10,000K - 30,000K (Hot)",
        size: "Large (2 - 6 R\u2609)",
        lifespan: "Moderate (10M - 100M)",
        color: 0x5AB4FF 
    },
    {
        type: "A",
        description: "A-Type stars are hot and medium to large in size, with temperatures ranging from 7,500K to 10,000K. They have luminosities between 5 and 25 times that of the Sun. These stars have moderate lifespans, typically lasting between 100 million and 1 billion years. They appear white in color.",
        luminosity: "5 - 25 L\u2609",
        temp: "7,500K - 10,000K (Hot)",
        size: "Medium to Large (1 - 2 R\u2609)",
        lifespan: "Moderate (100M - 1B)",
        color: 0xFFFFFF 
    },
    {
        type: "F",
        description: "F-Type stars are hot and medium in size, with temperatures ranging from 6,000K to 7,500K. They have luminosities between 1.5 and 5 times that of the Sun. These stars have long lifespans, typically lasting between 1 billion and 10 billion years. They appear yellowish-white in color.",
        luminosity: "1.5 - 5 L\u2609",
        temp: "6,000K - 7,500K (Hot)",
        size: "Medium (0.8 - 1 R\u2609)",
        lifespan: "Long (1B - 10B)",
        color: 0xFFEF94
    },
    {
        type: "G",
        description: "G-Type stars are moderate in size, with temperatures ranging from 5,000K to 6,000K. They have luminosities between 0.6 and 1.5 times that of the Sun. These stars have long lifespans, typically lasting over 10 billion years. They appear yellow in color.",
        luminosity: "0.6 - 1.5 L\u2609",
        temp: "5,000K - 6,000K (Moderate)",
        size: "Medium (0.6 - 0.8 R\u2609)",
        lifespan: "Long (10B+)",
        color: 0xFFD700
    },
    {
        type: "K",
        description: "K-Type stars are small to medium in size, with temperatures ranging from 3,500K to 5,000K. They have luminosities between 0.08 and 0.6 times that of the Sun. These stars have very long lifespans, typically lasting over 10 billion years. They appear orange in color.",
        luminosity: "0.08 - 0.6 L\u2609",
        temp: "3,500K - 5,000K (Cool)",
        size: "Small to Medium (0.3 - 0.6 R\u2609)",
        lifespan: "Very Long (10B+)",
        color: 0xFFA07A 
    },
    {
        type: "M",
        description: "M-Type stars are small in size, with temperatures below 3,500K. They have luminosities less than 0.08 times that of the Sun. These stars have extremely long lifespans, typically lasting over 100 billion years. They appear red in color.",
        luminosity: "0.01 - 0.08 L\u2609",
        temp: "<3,500K (Cool)",
        size: "Small (< 0.3 R\u2609)",
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
    document.getElementById('desc').innerText = star.description
    sun.material.emissive.set(star.color)
    index = (index + 1) % starClasses.length;
    console.log(sun.material)

}

let activeGlossary = false;
function toggleGlossary(){
    let glossary = document.getElementById("glossaryBox");
    let outerButton = document.querySelector('#glossary .clickOuter');
    let innerButton = document.querySelector('#glossary .clickInner');

    if (!activeGlossary){
        glossary.style.visibility = "visible";
        glossary.style.opacity = 1;
        outerButton.style.rotate = '-225deg';
        innerButton.style.transform = 'scale(0.5)';
        innerButton.style.opacity = 1;
        innerButton.style.rotate = '90deg';
    } else if (activeGlossary) {
        outerButton.style.rotate = '';
        innerButton.style.transform = '';
        innerButton.style.opacity = '';
        innerButton.style.rotate = '';
        glossary.style.opacity = 0;
    }
    activeGlossary = !activeGlossary;
}

function showUI(){
    let databox = document.querySelector("#classification");
    if (databox.style.opacity == 0){
        databox.style.visibility = "visible";
        databox.style.opacity = 1;
    } else {
        databox.style.opacity = 0;
    }
}

function awaitTransitionEnd(e, el){
    if (e.propertyName === 'opacity'){
        if (el.style.opacity === '0'){
            el.style.visibility = 'hidden';
        }
    }
}

function revealButtons(){
    const hidden = document.getElementsByClassName('gone');
    for (let i = 0; i < hidden.length; i++){
        hidden[i].style.visibility = "visible";
        hidden[i].style.opacity = 1;
    }
    document.getElementById('popup').style.display = 'none'
}

document.getElementById('go').addEventListener('click', revealButtons);
document.getElementById('menu').addEventListener('click', showUI);
document.getElementById('nextStar').addEventListener('click', showNextStar);
document.getElementById('classification').addEventListener('transitionend', (e) => {
    awaitTransitionEnd(e, document.getElementById('classification'));
});
document.getElementById('glossaryButton').addEventListener('click', toggleGlossary);
document.getElementById("glossaryBox").addEventListener('transitionend', (e) => {
    awaitTransitionEnd(e, document.getElementById("glossaryBox"));
}) 

// Animation Loop
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