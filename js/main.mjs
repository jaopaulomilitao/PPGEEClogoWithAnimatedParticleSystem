import * as THREE from 'three';
import { PointsModel } from './factories/PointsModel.mjs';
import { lerp, scalePercent, criarAnimacao } from './utils.mjs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let scene, camera, renderer, cubeObject, scrollPercent = 0, mesh, pointsModel, pointsModelArm;
let modelRocket = new THREE.Object3D();
const animationScripts = [];

mesh;

const meshes = [], clonemeshes = [];

const clock = new THREE.Clock();

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010305);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });;
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    animationScripts.push({
        start: 0,
        end: 101,
        func: () => {
            camera.position.set(0, 1, 0);
            camera.position.z = lerp(30, -600, scalePercent(0, 101, scrollPercent));
            camera.rotation.z = lerp(0, 2.02 * Math.PI, scalePercent(0, 101, scrollPercent));
            modelRocket.position.z = lerp(0, -620, scalePercent(0, 101, scrollPercent));
        },
    });

    animationScripts.push({
        start: 30,
        end: 70,
        func: () => {
            modelRocket.rotation.x = lerp(0, 2 * Math.PI, scalePercent(30, 70, scrollPercent));
        },
    });

    animationScripts.push({
        start: 0,
        end: 10,
        func: () => {
            camera.position.y = lerp(300, 0, scalePercent(0, 10, scrollPercent));
        },
    });

    const urlWorld = 'assets/models/world.obj';
    pointsModel = new PointsModel(urlWorld, scene, clonemeshes);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.intensity = 50000; // Ajuste a intensidade conforme necessário
    pointLight.position.set(-15, 210, -400);

    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // Cor da luz ambient
    ambientLight.intensity = 9;
    scene.add(ambientLight);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load('assets/models/robotic_arm.glb', function (gltf) {

        const model = gltf.scene;
        model.position.set(-15, 210, -400);
        model.scale.set(15, 15, 15);
        model.rotation.set(Math.PI / 2, Math.PI / 4, Math.PI / 2);

        // Configurar material PBR metálico
        model.traverse(child => {
            if (child.isMesh) {
                const pbrMaterial = new THREE.MeshStandardMaterial({
                    metalness: 0.8, // Defina como 1 para efeito metálico
                    roughness: 0.2, // Ajuste conforme necessário
                    map: child.material.map, // Use a textura original
                });
                child.material = pbrMaterial;
            }
        });

        scene.add(model);

        animationScripts.push({
            start: 0,
            end: 30,
            func: () => {
                model.position.x = lerp(850, -15, scalePercent(0, 30, scrollPercent));
            },
        });

        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();

        animate();

    }, undefined, function (e) {
        console.error(e);
    });

    animationScripts.push({
        start: 0,
        end: 30,
        func: () => {
            modelRocket.position.y = lerp(-100, 0, scalePercent(0, 30, scrollPercent));
        },
    });


}

const { iniciarAnimacao, modelParent } = await criarAnimacao('rocket.glb', 'logoppgeec.glb', scene, camera, renderer, 3, 13);
modelRocket = modelParent;
scene.add(modelRocket);

animationScripts.push({
    start: 80,
    end: 101,
    func: () => {
        camera.position.y = lerp(0, -2.5, scalePercent(80, 101, scrollPercent));
        iniciarAnimacao();
        pararMostrarScroll();
        // camera.position.y = lerp(450, 0, scalePercent(0, 10, scrollPercent));
    },
});

document.body.onscroll = () => {
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight ||
                document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100;

    // (document.getElementById('scrollProgress')).innerText =
    //     'Scroll Progress : ' + scrollPercent.toFixed(2);

    document.querySelector('.scrollProgressBar').style.width = scrollPercent + 'vw';
};

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func();
        }
    });
}

function pararMostrarScroll() {
    document.querySelector('.scroll-indicator').style.display = 'none';
}

function animate() {
    requestAnimationFrame(animate);
    playScrollAnimations();
    renderer.render(scene, camera);


    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mouseX * Math.PI) / 10, 0.1)
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (mouseY * Math.PI) / 10, 0.1)

    render();
}

function render() {

    // composer.render(0.01);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // composer.setSize(window.innerWidth, window.innerHeight);
}

window.scrollTo({ top: 0 });
