import * as THREE from 'three';

class CubeObjectExample {
    constructor(width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        this.cube = new THREE.Mesh(geometry, material);
    }

    animate() {
        // Adicione lógica de animação aqui
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
}

export { CubeObjectExample };