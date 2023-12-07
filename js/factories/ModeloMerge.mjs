// modeloMerge.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export class ModeloMerge {
    constructor(enderecoModelo1, enderecoModelo2, cena, camera, renderer, scaleFirst = 10, scaleSecond = 10) {
        this.enderecoModelo1 = enderecoModelo1;
        this.enderecoModelo2 = enderecoModelo2;
        this.cena = cena;
        this.camera = camera;
        this.renderer = renderer;
        this.scaleFirst = scaleFirst;
        this.scaleSecond = scaleSecond;
        this.scrollPercent = 0;

        this.init();
        this.animate();
    }

    async init() {
        await this.criarAnimacao();
    }

    async criarAnimacao() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://threejs.org/examples/jsm/libs/draco/gltf/');

        const loader1 = new GLTFLoader();
        loader1.setDRACOLoader(dracoLoader);
        loader1.setPath('assets/models/car/');
        const gltf1 = await loader1.loadAsync(this.enderecoModelo1);
        gltf1.scene.updateMatrixWorld(true);
        this.model1 = new THREE.Mesh(mergeModel(gltf1.scene, this.scaleFirst));

        const loader2 = new GLTFLoader();
        loader2.setDRACOLoader(null);
        loader2.setPath('assets/models/avengers_logo/');
        const gltf2 = await loader2.loadAsync(this.enderecoModelo2);
        gltf2.scene.updateMatrixWorld(true);
        this.model2 = new THREE.Mesh(mergeModel(gltf2.scene, this.scaleSecond));

        this.cena.add(this.model1);
        this.cena.add(this.model2);
    }

    animate() {
        let clock = new THREE.Clock();
        let t = 0;

        this.renderer.setAnimationLoop(() => {
            let dt = clock.getDelta();
            t += dt;
            this.pu.morphRatio.value = Math.sin(t * 0.5) * 0.5 + 0.5
            this.gu.time.value = t;
            this.renderer.render(this.cena, this.camera);
        });
    }

    setScaleFirst(scale) {
        this.scaleFirst = scale;
        // Atualizar o tamanho do modelo ou realizar outras ações conforme necessário
    }

    setScaleSecond(scale) {
        this.scaleSecond = scale;
        // Atualizar o tamanho do modelo ou realizar outras ações conforme necessário
    }

    // Adicione outros métodos conforme necessário
}

function mergeModel(model, scale = 8) {
    let gs = [];
    model.traverse(child => {
        if (child.isMesh) {
            let g = child.geometry.clone().toNonIndexed();
            for (let a in g.attributes) {
                if (a != "position") g.deleteAttribute(a);
            }
            g.applyMatrix4(child.matrixWorld);
            gs.push(g);
        }
    })
    return mergeGeometries(gs).center().scale(scale, scale, scale);
}
