import * as THREE from 'three';
import { CubeObjectExample } from './factories/CubeObject.mjs';

let scene, camera, renderer, cubeObject;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cubeObject = new CubeObjectExample(2, 2, 2, cubeMaterial);
    scene.add(cubeObject.cube);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    cubeObject.animate();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
