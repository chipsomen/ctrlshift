import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

// initialize renderer and settings
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// initialize scenes and passes
const scene = new THREE.Scene();
const stars = '../images/skybox.png';
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 75000);
const worldAmbience = new THREE.AmbientLight(0x999999);
scene.add(worldAmbience);
const planets = {};
const assetLoader = new GLTFLoader().setPath('../models/solarsystem/');
const textureLoader = new THREE.CubeTextureLoader();
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
const outputPass = new OutputPass();
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.6,
    0.1,
    0.1
);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);
composer.renderToScreen = true;

const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: {value: null},
            bloomTexture: {value: composer.renderTarget2.texture}
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
    }), 'baseTexture'
);

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000})
const materials = {};

function nonBloomed(obj){
    if (obj.isMesh && bloomLayer.test(obj.layers) === false){
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}

function restoreMaterial(obj){
    if (materials[obj.uuid]){
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}


// initialize camera and objects
camera.position.set(0, 12000, 0);

const axesHelper = new THREE.AxesHelper(800);
scene.add(axesHelper);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
const pointLight = new THREE.PointLight(0xFFFFFF, 5, 20000, 0);
scene.add(pointLight);
const PLH = new THREE.PointLightHelper(pointLight);
scene.add(PLH);
window.createImageBitmap = undefined;


function planetConstructor(size, planetType, pos, tilt, axial){
    assetLoader.load(`${planetType}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(size*5, size*5, size*5);
        model.position.x = pos;
        model.rotateZ = axial * Math.PI/180;
        console.log(`loaded ${planetType}`);
        if (planetType == 'earth') {
            model.children[0].material.emissiveIntensity = 10;
            // assetLoader.load(`clouds.glb`, (gltf) => {
            //     const cloud = gltf.scene;
            //     cloud.scale.set(size*5, size*5, size*5);
            //     cloud.position.x = pos;
            //     cloud.rotateZ = axial * Math.PI/180;
            //     cloud.children[0].material.color = 0xFFFFFF;
            //     model.add(cloud);
            //     console.log(cloud);
            // });
        };

        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(pos, 3, 8, 100),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
            })
        );
        orbit.rotateX(Math.PI/2 + tilt);
        orbit.rotateZ(Math.PI/2 - tilt);
        scene.add(orbit);

        const planetObj = new THREE.Object3D();
        planetObj.add(model);
        planetObj.rotateZ = tilt;
        scene.add(planetObj);

        planets[planetType] = {obj: model, anchor: planetObj, orbit: orbit};
        Load.updateProgress();
    }, null, (err) => {
        console.error(err);
    });
}

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(125, 30, 30),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffe38f,
        emissiveIntensity: 0.15
    })
);
sun.layers.toggle(BLOOM_SCENE);

// load planets
const Load = {count: 0};
Load.checkProgress = () => {
    if (Load.count == 1){
        let seconds = 1;
        let lScreen = document.getElementsByClassName('loader-container')[0];

        lScreen.style.transition = `opacity ${seconds}s ease`;
        lScreen.style.opacity = 0;
        setTimeout(() => {
            lScreen.style.display = "none";
            document.getElementsByClassName('container')[0].style.display = 'flex';
        }, seconds * 1000);
    }
}
Load.updateProgress = () => {
    Load.count++
    Load.checkProgress();
}

planetConstructor(5, 'mercury', 500, 0.001, 0);
planetConstructor(15, 'venus', 1000, -0.001, 177.4);
planetConstructor(20, 'earth', 1500, 0.002, 23.4);
planetConstructor(10, 'mars', 2000, 0.001, 25.2);
planetConstructor(45, 'jupiter', 3000, -0.0015, 3.1);
planetConstructor(40, 'saturn', 3750, 0.003, 26.7);
planetConstructor(22, 'uranus', 4250, 0.001, 97.8);
planetConstructor(22, 'neptune', 4750,-0.0025, 28.3);

scene.add(sun);

// mouse detection
const raycaster = new THREE.Raycaster();
const mousePos = new THREE.Vector2();
mousePos.x = 100; mousePos.y = 100;
window.addEventListener('mousemove', function(e){
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (e.clientY / window.innerHeight) * 2 + 1;
});
let target;

for (let i = 0; i < document.getElementsByClassName('card').length; i++){
    document.getElementsByClassName('card')[i].addEventListener('click', (e) => {
        setTarget(document.getElementsByClassName('card')[i].id)
    });
}

function setTarget(id){
    target = id;
    for (const object in planets){
        planets[object].orbit.material.color.set(0x222222)
    }
    planets[id].orbit.material.color.set(0xFFFFFF)
}


const animate = () => {
    raycaster.setFromCamera(mousePos, camera);
    if (target && planets[target]){
        const worldPos = new THREE.Vector3();
        planets[target].obj.getWorldPosition(worldPos);

        camera.position.set(0,0,0);
        const scaleFactor = 0.95;
        const angle = Math.atan2(worldPos.z, worldPos.x);
        const radius = Math.sqrt(Math.pow(worldPos.x, 2) + Math.pow(worldPos.z, 2)) * scaleFactor;
        let x1 = radius * Math.cos(angle - Math.PI/16) - Math.PI/8; let y1 = radius * Math.sin(angle - Math.PI/16);
        // if (worldPos.x/Math.abs(worldPos.x) !== x1/Math.abs(x1)){
        //     x1 *= -1;
        // }
        // if (worldPos.z/Math.abs(worldPos.z) !== y1/Math.abs(y1)){
        //     y1 *= -1;
        // }
        worldPos.set(x1, 30, y1);
        camera.position.set(worldPos.x, worldPos.y, worldPos.z);
        camera.lookAt(planets[target].obj.getWorldPosition(new THREE.Vector3()));
        camera.updateMatrix();
    }

    // animation
    sun.rotateY(0.001);
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

    scene.traverse(nonBloomed);
    composer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();
    requestAnimationFrame(animate);
};

animate();

// window resizing
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    finalComposer.setSize(window.innerWidth, window.innerHeight);
});
console.log('completed')