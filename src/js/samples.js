import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let quaternion1 = new THREE.Quaternion(0, 0, 0, 1);
let quaternion2 = new THREE.Quaternion(1, 1, 1, 1);
quaternion1.rotateTowards(quaternion2, 1);
quaternion1.rotateTowards(quaternion2, 1);
quaternion1.rotateTowards(quaternion2, 1);

console.log( quaternion1 ); 
class App {
    constructor() {
        this.initialize();
        this.render();
    }
    initialize() {
        let scene = new THREE.Scene();
        let renderer = new THREE.WebGLRenderer();

        renderer.setClearColor(0x000000, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        window.onresize = this.resize.bind(this);

        this.renderer = renderer;
        this.scene = scene;

        this.setCamera();
        this.setLight();
        this.setModels();
    }

    setModels() {

      // Box
      const boxMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
              color: 'red'
          })
      );
      boxMesh.position.set(-2, 0, 0);
      boxMesh.name = 'box';
      boxMesh.quaternion.copy( new THREE.Quaternion(1, 1, 1, 1) );
      this.scene.add(boxMesh);

      const boxMesh2 = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
              color: 'blue'
          })
      );
      boxMesh2.position.set(2, 0, 0);
      boxMesh2.name = 'box';
      boxMesh2.quaternion.copy( new THREE.Quaternion(1, 1, 1, 2) );
      this.scene.add(boxMesh2);
    }

    setCamera() {
        let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        this.scene.add(camera);

        this.camera = camera;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    setLight() {
        const ambientLight = new THREE.AmbientLight('#fff', 2);
        this.scene.add(ambientLight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        let camera = this.camera;
        let renderer = this.renderer;
        let scene = this.scene;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
}
window.onload = function () {
    new App();
};