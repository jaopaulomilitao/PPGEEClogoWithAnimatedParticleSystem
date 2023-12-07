import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { ModeloMerge } from './factories/ModeloMerge.mjs';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


export function lerp(x, y, a) {
    return (1 - a) * x + a * y;
}

export function scalePercent(start, end, scrollPercent) {
    return (scrollPercent - start) / (end - start);
}

export function combineBuffer(model, bufferName) {

    let count = 0;

    model.traverse(function (child) {

        if (child.isMesh) {

            const buffer = child.geometry.attributes[bufferName];

            count += buffer.array.length;

        }

    });

    const combined = new Float32Array(count);

    let offset = 0;

    model.traverse(function (child) {

        if (child.isMesh) {

            const buffer = child.geometry.attributes[bufferName];

            combined.set(buffer.array, offset);
            offset += buffer.array.length;

        }

    });

    return new THREE.BufferAttribute(combined, 3);

}

export function createMesh(positions, scene, clonemeshes, scale, x, y, z, color) {

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positions.clone());
    geometry.setAttribute('initialPosition', positions.clone());

    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const clones = [

        // [6000, 0, - 4000],
        // [5000, 0, 0],
        // [1000, 0, 5000],
        // [1000, 0, - 5000],
        // [4000, 0, 2000],
        // [- 4000, 0, 1000],
        // [- 5000, 0, - 5000],

        [0, 0, 0]

    ];

    for (let i = 0; i < clones.length; i++) {

        const c = (i < clones.length - 1) ? 0x252525 : color;

        let mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.1, color: c }));
        mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

        mesh.position.x = x + clones[i][0];
        mesh.position.y = y + clones[i][1];
        mesh.position.z = z + clones[i][2];

        parent.add(mesh);

        clonemeshes.push({ mesh: mesh, speed: 0.5 + Math.random() });
    }

    meshes.push({
        mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor(200 + 200 * Math.random()),
        start: Math.floor(100 + 200 * Math.random()),
    });

}

export async function criarAnimacao(enderecoModelo1, enderecoModelo2, cena, camera, renderer, scaleFirst = 10, scaleSecond = 10) {

    let gu = {
        time: { value: 0 }
    };

    let amount = 50000, modelParent = new THREE.Object3D();
    let g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Array(amount * 3).fill(0), 3));

    let pu = {
        morphRatio: { value: 1 }
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://threejs.org/examples/jsm/libs/draco/gltf/');

    // Carregue o primeiro modelo
    const loader1 = new GLTFLoader();
    loader1.setDRACOLoader(dracoLoader);
    loader1.setPath('assets/models/car/'); // Caminho para o primeiro modelo

    const gltf1 = await loader1.loadAsync(enderecoModelo1); // Use o primeiro endereço
    gltf1.scene.updateMatrixWorld(true);
    const model1 = new THREE.Mesh(mergeModel(gltf1.scene, scaleFirst));

    // Carregue o segundo modelo
    const loader2 = new GLTFLoader();
    loader2.setDRACOLoader(null);
    loader2.setPath('assets/models/avengers_logo/'); // Caminho para o segundo modelo
    const gltf2 = await loader2.loadAsync(enderecoModelo2); // Use o segundo endereço
    gltf2.scene.updateMatrixWorld(true);
    const model2 = new THREE.Mesh(mergeModel(gltf2.scene, scaleSecond));

    // g.setAttribute("positionStart", pointification(model2, amount));
    // g.setAttribute("positionEnd", pointification(model1, amount));

    g.setAttribute("rotDir", new THREE.Float32BufferAttribute(new Array(amount).fill().map(p => Math.random() < 0.5 ? -1 : 1), 1));

    modelParent.add(
        new THREE.Points(
            g,
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.05,
                onBeforeCompile: shader => {
                    shader.uniforms.morphRatio = pu.morphRatio;
                    shader.vertexShader = `
            uniform float morphRatio;
            attribute vec3 positionStart;
            attribute vec3 positionEnd;
            attribute float rotDir;

            mat2 rot2d(float a){ return mat2(cos(a), sin(a), -sin(a), cos(a));}
            ${shader.vertexShader}
          `.replace(
                        `#include <begin_vertex>`,
                        `#include <begin_vertex>
              
              vec3 pStart = positionStart;
              vec3 pEnd = positionEnd;
              
              float distRatio = sin(morphRatio * PI);
              
              vec3 pos = mix(pStart, pEnd, morphRatio);
              pos.xz *= rot2d(PI2 * morphRatio);
              transformed = pos + normalize(pos) * distRatio * 2.5;
            `
                    );
                }
            })
        )
    );

    let clock = new THREE.Clock();
    let t = 0;
    let duration = 5; // Defina a duração desejada da animação em segundos
    let animacaoConcluida = false;
    let animacaoIniciada = false;

    g.setAttribute("positionStart", pointification(model2, amount));
    g.setAttribute("positionEnd", pointification(model1, amount));

    let primeiroIniciando = false; // Declare a flag fora da função renderizar

    function renderizar() {
        if (animacaoIniciada) {
            if (!animacaoConcluida) {
                if (!primeiroIniciando) {
                    // As duas linhas seguintes serão chamadas apenas uma vez
                    g.setAttribute("positionStart", pointification(model1, amount));
                    g.setAttribute("positionEnd", pointification(model2, amount));
                    primeiroIniciando = true;
                }

                let dt = clock.getDelta();
                t += dt;
                pu.morphRatio.value = Math.sin(t / duration * Math.PI * 0.5); // Normaliza o tempo para [0, 1]
                gu.time.value = t;

                renderer.render(cena, camera);

                if (t >= duration) {
                    animacaoConcluida = true;
                    // Adicione qualquer código adicional que você deseja executar quando a animação terminar
                }
            }
        } else {
            renderer.render(cena, camera);
            primeiroIniciando = false;
        }
    }


    function animate() {
        requestAnimationFrame(animate);
        renderizar();
    }

    // Renderiza o modelo inicial antes de iniciar a animação
    renderer.render(cena, camera);

    animate();

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

    function pointification(mesh, amount) {
        let mss = new MeshSurfaceSampler(mesh).build();
        let pointsData = [];
        let v = new THREE.Vector3();
        for (let i = 0; i < amount; i++) {
            mss.sample(v);
            v.toArray(pointsData, i * 3);
        }
        return new THREE.Float32BufferAttribute(pointsData, 3);
    }
    // Função para iniciar a animação quando chamada
    function iniciarAnimacao() {
        if (!animacaoIniciada) {
            animacaoIniciada = true;
            t = 0;
            animacaoConcluida = false;
            animate();
        }
    }

    // Retorna o objeto com a função iniciarAnimacao
    return { iniciarAnimacao, modelParent };
}
