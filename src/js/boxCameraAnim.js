import * as THREE from 'three';
import {
  FBXLoader
} from 'three/examples/jsm/loaders/FBXLoader';
import {
  Euler
} from 'three';

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
    this.clock = new THREE.Clock();

    let textures = [];
    const textureLoader = new THREE.CubeTextureLoader();
    const texture = textureLoader
      .setPath(`/textures/night/`)
      .load([
        'px.png', 'nx.png',
        'py.png', 'ny.png',
        'pz.png', 'nz.png',
      ]);
    scene.background = texture;

    this.setCamera();
    this.setLight();
    this.setModels();
    this.setControls();
    this.setEvent();
  }

  setCamera() {
    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
    this.scene.add(camera);

    this.camera = camera;
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight('#fff', 0.5);
    const pointLight = new THREE.PointLight('#fff', 1);
    pointLight.position.set(0, 5, 3);
    pointLight.lookAt(0, 0, 0);
    this.scene.add(ambientLight, pointLight);

    this.light = pointLight;
  }

  setControls() {
    const _PI_2 = Math.PI / 2;
    const _euler = new Euler(0, 0, 0, 'YXZ');

    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    this.pointerSpeed = 1.0;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    _euler.setFromQuaternion(this.camera.quaternion);

    _euler.y -= movementX * 0.002 * this.pointerSpeed;
    _euler.x -= movementY * 0.002 * this.pointerSpeed;

    _euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, _euler.x));

    this.camera.quaternion.setFromEuler(_euler);
  }

  setModels() {
    // FBX
    this.mixers = [];
    const fbxLoader = new FBXLoader();
    fbxLoader.setPath('models/');
    fbxLoader.load('box-camera-move.fbx', (object) => {
      object.traverse(c => {
        c.castShadow = true;
      });

      /* 카메라 수정 소스 */
      const targetAnimationTrack = object.animations[0].tracks[1];
      const quaternion = new THREE.Quaternion();
      const quaternionToFix = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -Math.PI / 2
      );
      targetAnimationTrack.times.forEach(function (time, index) {
        const valueIndex = index * 4;
        quaternion.set(
          targetAnimationTrack.values[valueIndex],
          targetAnimationTrack.values[valueIndex + 1],
          targetAnimationTrack.values[valueIndex + 2],
          targetAnimationTrack.values[valueIndex + 3]
        );
        quaternion.multiply(quaternionToFix);
        targetAnimationTrack.values[valueIndex] = quaternion.x;
        targetAnimationTrack.values[valueIndex + 1] = quaternion.y;
        targetAnimationTrack.values[valueIndex + 2] = quaternion.z;
        targetAnimationTrack.values[valueIndex + 3] = quaternion.w;
      });
      /* 카메라 수정 소스 끝 */

      this.cameraModel = object.children[0];

      object.mixer = new THREE.AnimationMixer( this.camera );
      this.mixer = object.mixer;

      const anim = object.mixer.clipAction(object.animations[0]);
      anim.play();
      this.mixer.setTime(0);
      anim.paused = true;

      this.anim = anim;
      this.animDuration = object.animations[0].duration;

      this.scene.add(object);
    })
  }

  setEvent() {
    this.cameraBeforeQuaternion = new THREE.Quaternion();
    this.cameraAfterQuaternion = new THREE.Quaternion();

    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.isControls = true;
      this.cameraBeforeQuaternion = this.camera.quaternion.clone();
    });

    this.renderer.domElement.addEventListener('mouseup', (e) => {
      this.isControls = false;
      this.cameraAfterQuaternion = this.camera.quaternion.clone();

      if ( !this.cameraAfterQuaternion.equals(this.cameraBeforeQuaternion) ) {
        this.isControlsMoved = true;
      }
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (!this.isControls) return;

      this.setControls();
    })

    let timeLine = 0;
    this.renderer.domElement.addEventListener('wheel', (e) => {
      this.isWheeling = true;
      if ( this.isControlsMoved ) return;

      timeLine += e.wheelDelta * 0.0001;
      if ( timeLine > this.animDuration ) {
          timeLine = 0;
      } else if ( timeLine < 0 ) {
          timeLine = this.animDuration;
      }

      this.anim.paused = false;
      this.mixer.setTime(timeLine);
      this.anim.paused = true;

      this.isWheeling = false;
    })
  }

  update() {
    let delta = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(delta);

      if ( this.isControlsMoved && this.isWheeling ){
        this.cameraAfterQuaternion.rotateTowards(this.cameraBeforeQuaternion, 0.03);
        this.camera.quaternion.copy(this.cameraAfterQuaternion);

        if ( this.cameraAfterQuaternion.equals(this.cameraBeforeQuaternion) ) {
          this.isControlsMoved = false;
        }
      }

      // if ( !this.cameraAfterQuaternion.equals(this.cameraBeforeQuaternion) ) {
      //   this.cameraAfterQuaternion.rotateTowards(this.cameraBeforeQuaternion, 0.01);
      //   this.camera.quaternion.copy(this.cameraAfterQuaternion);

      //   console.log( this.cameraAfterQuaternion, this.camera.quaternion );
      // }

      // console.log( this.cameraModel.position )

      // const cameraQuaternion = this.cameraModel.quaternion.clone();
      // this.camera.position.copy(this.cameraModel.position.multiplyScalar(0.01));
      // this.camera.quaternion.copy(cameraQuaternion);
    }
  }

  render() {
    this.update();

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
