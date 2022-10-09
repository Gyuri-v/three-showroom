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
    // this.isCameraMove = false;
    this.mousePoint = new THREE.Vector2();
    this.preventDragClick = new PreventDragClick(this.renderer.domElement);

    this.setCamera();
    this.setLight();
    this.setModels();
    this.setRaycaster();
    this.setEvent();
  }

  setModels() {
    let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    let cubeMaterial = new THREE.MeshNormalMaterial();
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);

    this.cube = cube;
    this.scene.add(cube);

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
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 'red' }));
    boxMesh.position.set(-5, 2, -this.area / 2);
    boxMesh.name = 'box';
    this.meshes.push(boxMesh);
    this.scene.add(boxMesh);

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
  }

  setEvent() {
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      if (this.preventDragClick.mouseMoved) return;

      this.isMouseClick = true;
      this.raycasting();
      this.controls.lock();
    });
    this.renderer.domElement.addEventListener('mouseup', (e) => {
      this.isMouseClick = false;
      this.controls.unlock();
    });
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      this.calcMousePoint(e);
      this.raycasting();
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

    const canvas = this.renderer.domElement;

    canvas.addEventListener('wheel', (e) => {
      if (e.wheelDelta > 0) {
        controls.moveForward(e.wheelDelta * 0.0005);
      } else {
        controls.moveForward(e.wheelDelta * 0.0005);
      }
    });

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

  raycasting = function () {
    this.raycaster.setFromCamera(this.mousePoint, this.camera);
    this.checkIntersects();
  };

  calcMousePoint = function (e) {
    this.mousePoint.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mousePoint.y = -((e.clientY / this.renderer.domElement.clientHeight) * 2 - 1);
  };

  checkIntersects = function () {
    this.intersects = this.raycaster.intersectObjects(this.meshes);
    this.pointerMesh.material.opacity = 0;

    for (const item of this.intersects) {
      // box intersects
      // if (item.object.name === "box") {
      //   if (this.isMouseClick) {
      //     this.isCameraMove = true;
      //     this.startTime = Date.now();

      //     let destinationPoint = item.object.position.clone();
      //     destinationPoint.z = destinationPoint.z + 2;

      //     let destinationHalfPoint = item.object.position.clone();
      //     destinationHalfPoint.z = this.camera.position.z + (item.object.position.z - this.camera.position.z) / 2;

      //     let cameraMoves = new THREE.QuadraticBezierCurve3(
      //       this.camera.position,
      //       destinationHalfPoint,
      //       destinationPoint
      //     );
      //     this.cameraMovesPoints = cameraMoves.getSpacedPoints(100);
      //     this.cameraMovesTarget = item.object.position;

      //     this.isMouseClick = false;
      //   }
      // }

      // floor intersects
      if (item.object.name === 'floor') {
        this.pointerMesh.material.opacity = 1;

        let destinationPoint = item.point.clone();
        destinationPoint.y = 4;

        // console.log(item);

        // console.log(destinationPoint);

        if (this.isMouseClick) {
          this.isCameraMove = true;
          this.startTime = Date.now();

          // gsap.to(this.controls.getDirection, {
          //   duration: 1,
          // });

          // this.controls.getDirection( destinationPoint )

          // let lookAtatat = this.camera.position.clone();

          // let destinationPoint = item.object.position.clone();
          // destinationPoint.z = destinationPoint.z + 2;

          // let destinationHalfPoint = item.object.position.clone();
          // destinationHalfPoint.z = this.camera.position.z + (item.object.position.z - this.camera.position.z) / 2;

          // let cameraMoves = new THREE.QuadraticBezierCurve3(
          //   this.camera.position,
          //   destinationHalfPoint,
          //   destinationPoint
          // );
          // let cameraMovesPoints = cameraMoves.getSpacedPoints(100);

          // let num = 0;

          // this.camera.lookAt( destinationPoint );

          let cameramermer = this.camera;

          const startOrientation = cameramermer.quaternion.clone();
          const targetOrientation = item.object.quaternion.clone().normalize();

          const destinationsss = this.camera.getWorldDirection(destinationPoint);
          console.log(destinationsss);

          gsap.to(this.camera.position, {
            duration: 1,
            x: destinationPoint.x,
            y: destinationPoint.y,
            z: destinationPoint.z,
            // onUpdate: function () {
            // cameramermer.lookAt(destinationPoint.x, destinationPoint.y, destinationPoint.z)
            // cameramermer.quaternion.copy(startOrientation).slerp(targetOrientation, this.progress());
            // }
          });

          // gsap.to(this.camera, {
          //   duration: 1,
          //   onUpdate: function () {
          //     fdsdsd(elem, num)
          //   }
          // })

          // function fdsdsd(num) {
          //   this.camera.lookAt( cameraMovesPoints[num].x, 4, cameraMovesPoints[num].z );
          // }

          // gsap.to(this.camera.target, {
          //   duration: 1,
          //   x: destinationPoint.x,
          //   y: destinationPoint.y,
          //   z: destinationPoint.z,
          // });

          // this.camera.target.position(destinationPoint.x, destinationPoint.y, destinationPoint.z);

          // const startOrientation = this.camera.quaternion.clone();
          // const targetOrientation = item.quaternion.clone().normalize();

          // gsap.to({}, {
          //   duration: 2,
          //   onUpdate: function () {
          //     this.camera.quaternion.copy(startOrientation).slerp(targetOrientation, this.progress())
          //   }
          // })

          // console.log(lookAtatat);

          // this.camera.lookAt(destinationPoint);

          // gsap.to(this.camera.position, {
          //   duration: 1,
          //   x: destinationPoint.x,
          //   y: destinationPoint.y,
          //   z: destinationPoint.z
          // });

          // console.log(this.camera.position);
        }

        this.pointerMesh.position.x = destinationPoint.x;
        this.pointerMesh.position.z = destinationPoint.z;
      }
    }
  };

  update() {
    this.cube.position.set(this.controls.position);
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
