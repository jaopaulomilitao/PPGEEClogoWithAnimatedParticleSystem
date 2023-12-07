import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { createMesh, combineBuffer } from '../utils.mjs';

class PointsModel {

    constructor(url, scene, clonemeshes) {
        const loader = new OBJLoader();

        loader.load(url, function (object) {

            const positions = combineBuffer(object, 'position');

            createMesh(positions, scene, clonemeshes, 200, 0, 0, -300, 0x2A5270);
        });

        parent = new THREE.Object3D();
        scene.add(parent);

        parent.scale.set(0.5,0.5,0.5);

    }

    animate() {
    }

    
}

export { PointsModel };