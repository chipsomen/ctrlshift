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
const worldAmbience = new THREE.AmbientLight(0xFFFFFF, 2);
const pointLight = new THREE.PointLight(0xFFFFFF, 3, 20000, 0);
const assetLoader = new GLTFLoader().setPath('../models/telescopes/');
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
// composer.addPass(bloomPass);

// initialize objects
scene.add(worldAmbience);
scene.add(pointLight);
pointLight.position.y = 0;
pointLight.castShadow = true;

const telescope = {};
function loadTelescope(type, size, pos){
    assetLoader.load(`${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(size*5, size*5, size*5);
        model.position.set(pos[0], pos[1], pos[2])
        model.castShadow = true;
        model.receiveShadow = true;
        console.log(`loaded ${type} telescope`);
        telescope[type] = model;
        // scene.add(model);
        console.log(model);
        
    })
}

camera.position.set(30, 30, 30);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

loadTelescope('infrared', 1, [50, -50, 150]);
loadTelescope('optical', 1, [200, -50, 1200]);
loadTelescope('xray', 1, [350, -50, 1350]);
loadTelescope('radio', 1, [500, -50, 1500]);

// HTML JS
const scopeOrder = ['radio', 'optical', 'infrared', 'xray'];
let target = -1;
function setTarget(inc){
    target = (((target + inc)%scopeOrder.length )+scopeOrder.length)%scopeOrder.length
    document.getElementById('type').innerText = scopeOrder[target];
    document.getElementById('sbText').innerText = scopeData[scopeOrder[target]].description;
    document.getElementById('stText').innerText = scopeData[scopeOrder[target]].techniques;
    document.getElementById('smText').innerText = scopeData[scopeOrder[target]].model;
}
document.getElementById('inc').addEventListener('click', () => {
    setTarget(1);
});
document.getElementById('dec').addEventListener('click', () => {
    setTarget(-1);
});


const scopeData = {
    xray: {
        description: 'X-ray telescopes observe high-energy X-ray radiation emitted by objects in space, such as black holes, neutron stars, and active galactic nuclei. They reveal processes like accretion, high-temperature emissions, and the behavior of matter under extreme conditions.',
        techniques: 'X-ray telescopes use grazing incidence optics or mirrors to focus X-rays onto detectors. They often employ techniques such as focusing, collimation, and spectral analysis to study X-ray emissions.',
        model: "This is a model of the Chandra X-Ray Observatory, the world's most powerful X-ray telescope."
    },
    radio: {
        description: 'Radio telescopes observe radio waves emitted by celestial objects. They are used to study the universe at radio frequencies, revealing objects like pulsars, quasars, and the cosmic microwave background.',
        techniques: 'Radio telescopes use large parabolic dishes or arrays of antennas to collect and focus radio waves. Techniques include interferometry, aperture synthesis, and spectroscopy for analyzing radio emissions.',
        model: "This is a model of a Radio Telescope."
    },
    optical: {
        description: 'Optical telescopes observe visible light from celestial objects. They provide detailed images and spectra, allowing astronomers to study the properties, composition, and motions of astronomical objects.',
        techniques: 'Optical telescopes use lenses or mirrors to gather and focus visible light. Techniques include imaging, spectroscopy, and photometry to study the intensity, color, and composition of light from stars and galaxies.',
        model: "This is a model of the Thirty Meter Telescope, an optical telescope that is in the process of being built in Hawaii."
    },
    infrared: {
        description: 'Infrared telescopes observe infrared radiation emitted by objects in space. They can penetrate dust clouds and reveal cool objects that are otherwise difficult to observe in visible light, such as protostars and exoplanets.',
        techniques: 'Infrared telescopes use special detectors to capture infrared radiation. They employ techniques such as spectroscopy, imaging, and photometry to study the temperature, composition, and motion of infrared sources.',
        model: "This is a model of the Spitzer Space Telescope, the first telescope to detect light from an exoplanet, or a planet outside of our solar system."
    }
};


// Animation Loop
const animate = () => {
    if (target > -1 && scopeOrder[target]){
        scopeOrder.forEach(scope => {
            scene.remove(telescope[scope]);
        });
        scene.add(telescope[scopeOrder[target]]);
        const worldPos = new THREE.Vector3();
        telescope[scopeOrder[target]].getWorldPosition(worldPos);

        camera.position.set(worldPos.x - 100, worldPos.y + 20, worldPos.z - 100);
        camera.lookAt(worldPos);
        camera.updateMatrix();
    }

    if (telescope.optical){
        telescope.optical.rotateY(0.002);
    }
    if (telescope.radio){
        telescope.radio.rotateY(0.002);
    }
    if (telescope.infrared){
        telescope.infrared.rotateY(0.0001);
        telescope.infrared.rotateX(0.0001)
    }
    if (telescope.xray){
        telescope.xray.rotateY(0.0001);
        telescope.xray.rotateX(0.0001)
    }

    composer.render();
    orbit.update();
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