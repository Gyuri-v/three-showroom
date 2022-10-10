import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { PreventDragClick } from '../js/PreventDragClick';
import { gsap } from 'gsap';

class App {
  constructor() {
    this.initialize();
    this.render();
  }
  initialize() {
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer();
    console.log('init');

    renderer.setClearColor(0x000000, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.onresize = this.resize.bind(this);

    this.renderer = renderer;
    this.scene = scene;

    this.meshes = [];
    this.area = 50;
    this.startTime = 0;
    this.isMouseClick = false;
    this.mousePoint = new THREE.Vector2();
    this.preventDragClick = new PreventDragClick(this.renderer.domElement);

    this.setCamera();
    // this.setControls();
    this.setLight();
    this.setModels();
    this.setRaycaster();
    this.setEvent();
  }

  setModels() {
    const planeGeometry = new THREE.BoxGeometry(this.area, this.area, 0.2);
    const planeMateroal = new THREE.MeshStandardMaterial({
      color: '#444',
      side: THREE.DoubleSide,
    });

    // floor
    const floorMesh = new THREE.Mesh(planeGeometry, planeMateroal);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.name = 'floor';
    this.meshes.push(floorMesh);
    this.scene.add(floorMesh);

    // Wall
    const wallMesh = new THREE.Mesh(planeGeometry, planeMateroal);
    wallMesh.position.set(0, this.area / 2, -this.area / 2);
    wallMesh.name = 'wall';
    this.meshes.push(wallMesh);
    this.scene.add(wallMesh);

    // Box
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1), 
      new THREE.MeshStandardMaterial({ color: 'red' })
    );
    boxMesh.position.set(-5, 2, -this.area / 2);
    boxMesh.name = 'box';
    this.meshes.push(boxMesh);
    this.scene.add(boxMesh);

    const boxMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1), 
      new THREE.MeshStandardMaterial({ color: 'blue' })
    );
    boxMesh2.position.set(-this.area / 2, 2, 5);
    boxMesh2.rotation.y = Math.PI / 2;
    boxMesh2.name = 'box';
    this.meshes.push(boxMesh2);
    this.scene.add(boxMesh2);

    const boxMesh3 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1), 
      new THREE.MeshStandardMaterial({ color: 'green' })
    );
    boxMesh3.position.set(this.area / 2, 2, 10);
    boxMesh3.rotation.y = -Math.PI / 2;
    boxMesh3.name = 'box';
    this.meshes.push(boxMesh3);
    this.scene.add(boxMesh3);

    // pointer
    const pointerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({
        color: 'crimson',
        transparent: true,
        opacity: 0.5,
      })
    );
    pointerMesh.rotation.x = -Math.PI / 2;
    pointerMesh.position.set(0, 0.11, this.area / 2 - 5);
    pointerMesh.material.transparent = true;
    this.scene.add(pointerMesh);

    this.floorMesh = floorMesh;
    this.wallMesh = wallMesh;
    this.boxMesh = boxMesh;
    this.pointerMesh = pointerMesh;

    // crosshair
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({

      })
    )
  }

  setEvent() {
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.controls.lock();
    });
    this.renderer.domElement.addEventListener('mouseup', (e) => {
      this.controls.unlock();
      if ( !this.preventDragClick.mouseMoved ) {
        this.isMouseClick = true;
        this.raycasting();
      }
    });
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      this.calcMousePoint(e);
      this.raycasting();
    });
    this.renderer.domElement.addEventListener('wheel', (e) => {
      if (e.wheelDelta > 0) {
        this.controls.moveForward(e.wheelDelta * 0.0005);
      } else {
        this.controls.moveForward(e.wheelDelta * 0.0005);
      }
    });
  }

  setCamera() {
    let camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, this.area / 2 + 5);
    this.scene.add(camera);

    this.camera = camera;
    this.setControls();
  }

  setControls() {
    const controls = new PointerLockControls(this.camera, this.renderer.domElement);

    this.controls = controls;
  }


  setLight() {
    const ambientLight = new THREE.AmbientLight('#fff', 0.5);
    const pointLight = new THREE.PointLight('#fff', 1);
    pointLight.position.set(0, 2, 1);
    this.scene.add(ambientLight, pointLight);

    this.light = pointLight;
  }

  setRaycaster() {
    const raycaster = new THREE.Raycaster();
    this.raycaster = raycaster;
  }

  calcMousePoint = function (e) {
    this.mousePoint.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mousePoint.y = -((e.clientY / this.renderer.domElement.clientHeight) * 2 - 1);
  };

  raycasting = function () {
    this.raycaster.setFromCamera(this.mousePoint, this.camera);
    this.checkIntersects();
  };

  checkIntersects = function () {
    this.intersects = this.raycaster.intersectObjects(this.meshes);
    this.pointerMesh.material.opacity = 0;

    for (const item of this.intersects) {

      if (item.object.name === "box") {
        if (this.isMouseClick) {
          this.isCameraMove = true;
          this.startTime = Date.now();

          this.cameraMovesTarget = item.object;

          let targetQuaternion = new THREE.Quaternion().copy(this.cameraMovesTarget.quaternion);
          let destinationPoint = item.object.position.clone();
          if ( targetQuaternion.x === 0 && targetQuaternion.y === 0 && targetQuaternion.z === 0 ) {
            destinationPoint.z = destinationPoint.z + 2;
          } else if ( targetQuaternion.y > 0 ) {
            destinationPoint.x = destinationPoint.x + 2;
          } else if ( targetQuaternion.y < 0 ) {
            destinationPoint.x = destinationPoint.x - 2;
          }

          let cameraMoves = new THREE.LineCurve3( this.camera.position, destinationPoint );
          this.cameraMovesPoints = cameraMoves.getSpacedPoints(100);

          this.isMouseClick = false;
        }
      }

      if (item.object.name === 'floor') {
        this.pointerMesh.material.opacity = 1;

        let destinationPoint = item.point.clone();
        destinationPoint.y = 4;

        if (this.isMouseClick) {
          this.isCameraMove = true;
          this.startTime = Date.now();

          let cameraMoves = new THREE.LineCurve3(this.camera.position, destinationPoint);
          this.cameraMovesPoints = cameraMoves.getSpacedPoints(100);

          this.isMouseClick = false;

          // gsap.to(this.camera.position, {
          //   duration: 1,
          //   x: destinationPoint.x,
          //   y: 4,
          //   z: destinationPoint.z,
          // });
        }

        this.pointerMesh.position.x = destinationPoint.x;
        this.pointerMesh.position.z = destinationPoint.z;
      }
    }
  };

  update() {

    if (this.isCameraMove) {
      let elapsed = Math.floor((Date.now() - this.startTime) / 10);


      if (elapsed < this.cameraMovesPoints.length) {
        this.camera.position.set(
          this.cameraMovesPoints[elapsed].x, 
          this.cameraMovesPoints[elapsed].y, 
          this.cameraMovesPoints[elapsed].z
        );

        if ( this.cameraMovesTarget ) {
          const cameraQuaternion = new THREE.Quaternion().copy(this.camera.quaternion);
          const targetQuaternion = new THREE.Quaternion().copy(this.cameraMovesTarget.quaternion);

          this.camera.quaternion.slerpQuaternions(cameraQuaternion, targetQuaternion, 0.05);
          console.log(elapsed, this.camera.quaternion, targetQuaternion);
          // this.camera.lookAt(this.cameraMovesTarget.position)
        }
      }

      if (elapsed > this.cameraMovesPoints.length) {
        elapsed = 0;
        this.isCameraMove = false;
        this.cameraMovesTarget = null;
      }
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
