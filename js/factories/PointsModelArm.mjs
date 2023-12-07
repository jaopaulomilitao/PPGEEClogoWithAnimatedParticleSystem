import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { createMesh, combineBuffer } from '../utils.mjs';

class PointsModelArm {

    constructor(url, scene, clonemeshes) {
        this.scale = 0.01;
        const loader = new OBJLoader();

        loader.load(url, function (object) {

            const positions = combineBuffer(object, 'position');

            createMesh(positions, scene, clonemeshes, 200, 0, 0, -300, 0x2A5270);
        });

        parentArm = new THREE.Object3D();
        scene.add(parentArm);

        parentArm.scale.set(this.scale, this.scale, this.scale);


    }

    animate() {
    }

    
}

export { PointsModelArm };