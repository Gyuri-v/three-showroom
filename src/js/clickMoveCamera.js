import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { PreventDragClick } from '../js/PreventDragClick';

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
    this.collisionMeshes = [];
    this.area = 50;
    this.positionY = 4;
    this.startTime = 0;
    this.isMouseClick = false;
    this.isWheeelStop = false;
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
      new THREE.BoxGeometry(2, 1, 1), 
      new THREE.MeshStandardMaterial({ color: 'red' })
    );
    boxMesh.position.set(-5, 3, -this.area / 2);
    boxMesh.name = 'box';
    this.meshes.push(boxMesh);
    this.scene.add(boxMesh);

    const boxMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1), 
      new THREE.MeshStandardMaterial({ color: 'blue' })
    );
    boxMesh2.position.set(-this.area / 2, 4, 5);
    boxMesh2.rotation.y = Math.PI / 2;
    boxMesh2.name = 'box';
    this.meshes.push(boxMesh2);
    this.scene.add(boxMesh2);

    const boxMesh3 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 1), 
      new THREE.MeshStandardMaterial({ color: 'green' })
    );
    boxMesh3.position.set(this.area / 2, 5, 10);
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
    pointerMesh.name = 'pointer';
    this.scene.add(pointerMesh);
    
    this.pointerMesh = pointerMesh;

    // pillar
    const pillarMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 30, 2),
      new THREE.MeshStandardMaterial({ color: 'gray' })
    )
    pillarMesh.position.set(0, 15, 0);
    pillarMesh.name = 'pillar';
    this.pillarMesh = pillarMesh;
    this.meshes.push(pillarMesh);
    this.scene.add(pillarMesh);
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
      let frontCheck = true;
      let backCheck = true;

      // Front
      let cameraDirectionFront = new THREE.Vector3(0, 0, -1); 
      cameraDirectionFront.applyQuaternion( this.camera.quaternion ).normalize(); // camera 가 바라보는 방향 구하기 -> 정규화

      this.raycaster.set( this.camera.position, cameraDirectionFront); // raycaster를 카메라를 기준으로, 카메라가 보고있는 방향으로 광선 쏘도록 설정
      this.collisionIntersects = this.raycaster.intersectObjects(this.meshes, false); // this.meshes 배열 요소 중애 raycaster 광선과 부딪히는 요소 찾기

      if ( 
        this.collisionIntersects.length > 0 && // 부딪히는 요소가 있고
        this.collisionIntersects[0].distance < 3 // 부딪히는 요소와의 거리가 3 이하면 휠 불가능
      ) {
        frontCheck = false;
      }

      // Back
      let cameraDirectionBack = cameraDirectionFront.clone();
      cameraDirectionBack.z = cameraDirectionBack.z * -1;
      
      this.raycaster.set( this.camera.position, cameraDirectionBack);
      this.collisionIntersects = this.raycaster.intersectObjects(this.meshes, false);

      if ( 
        this.collisionIntersects.length > 0 && // 부딪히는 요소가 있고
        this.collisionIntersects[0].distance < 3 // 부딪히는 요소와의 거리가 3 이하면 휠 불가능
      ) {
        backCheck = false;
      }

      if (e.wheelDelta > 0) {
        if ( !frontCheck ) return;
        this.controls.moveForward(e.wheelDelta * 0.0005);
        this.setFovOrigin();
      } else {
        if ( !backCheck ) return;
        this.controls.moveForward(e.wheelDelta * 0.0005);
        this.setFovOrigin();
      }
    });
  }

  setCamera() {
    let camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, this.positionY, this.area / 2 + 5);
    this.scene.add(camera);

    this.camera = camera;
    this.setControls();
  }

  setControls() {
    const controls = new PointerLockControls(this.camera, this.renderer.domElement);
    
    controls.addEventListener( 'change', this.setFovOrigin.bind(this));

    this.controls = controls;
  }

  setFovOrigin() {
    if ( this.camera.fov == 47 ) return;

    this.cameraFov = 47;
    this.cameraFovCount = 10;
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
    const intersects = this.raycaster.intersectObjects(this.meshes);
    this.pointerMesh.material.opacity = 0;

    for (const item of intersects) {

      if (item.object.name === "box") {
        if (this.isMouseClick) {
          this.isCameraMove = true;
          this.startTime = Date.now();

          this.cameraLookTarget = item.object;

          const size = new THREE.Box3().setFromObject(item.object);
          const sizeY = size.max.y - size.min.y;
          const sizeZ = size.max.z - size.min.z;

          const cameraBoxDistance = 2;

          const targetHeight = sizeY * window.innerHeight / (window.innerHeight / 2);
          // let cameraDistanceFromMesh = this.camera.position.distanceTo(item.object.position);
          // cameraDistanceFromMesh -= sizeZ / 2;

          this.cameraFov = 2 * (180 / Math.PI) * Math.atan(targetHeight / cameraBoxDistance);
          this.cameraFovCount = 60;
          // this.camera.updateProjectionMatrix();

          let targetQuaternion = new THREE.Quaternion().copy(this.cameraLookTarget.quaternion);
          let destinationPoint = item.object.position.clone();
          if ( targetQuaternion.x === 0 && targetQuaternion.y === 0 && targetQuaternion.z === 0 ) {
            destinationPoint.z = destinationPoint.z + cameraBoxDistance;
          } else if ( targetQuaternion.y > 0 ) {
            destinationPoint.x = destinationPoint.x + cameraBoxDistance;
          } else if ( targetQuaternion.y < 0 ) {
            destinationPoint.x = destinationPoint.x - cameraBoxDistance;
          }

          let cameraMoves = new THREE.LineCurve3( this.camera.position, destinationPoint );
          this.cameraMovesPoints = cameraMoves.getSpacedPoints(100);
        }
      }

      if (item.object.name === 'floor') {
        this.pointerMesh.material.opacity = 1;

        let destinationPoint = item.point.clone();
        destinationPoint.y = this.positionY;

        if (this.isMouseClick) {
          this.isCameraMove = true;
          this.startTime = Date.now();

          this.cameraLookPoint = item.point.clone();

          let cameraMoves = new THREE.LineCurve3(this.camera.position, destinationPoint);
          this.cameraMovesPoints = cameraMoves.getSpacedPoints(100);
        }

        this.pointerMesh.position.x = destinationPoint.x;
        this.pointerMesh.position.z = destinationPoint.z;
      }

      this.isMouseClick = false;

      break;
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

        if ( this.cameraLookPoint ) {
          const startCamera = this.camera.quaternion.clone();

          this.camera.lookAt(this.cameraLookPoint.x, this.positionY, this.cameraLookPoint.z);
          const endCamera = this.camera.quaternion.clone();

          this.camera.quaternion.slerpQuaternions(startCamera, endCamera, 0.05)
        }

        if ( this.cameraLookTarget ) {
          const cameraQuaternion = new THREE.Quaternion().copy(this.camera.quaternion);
          const targetQuaternion = new THREE.Quaternion().copy(this.cameraLookTarget.quaternion);

          this.camera.quaternion.slerpQuaternions(cameraQuaternion, targetQuaternion, 0.05);
        }
      }

      if (elapsed > this.cameraMovesPoints.length) {
        elapsed = 0;
        this.isCameraMove = false;
        this.cameraLookTarget = null;
        this.cameraLookPoint = null;
      }
    }

    if ( this.cameraFov && this.cameraFovCount > 1 ) {
      this.cameraFovCount--;

      this.camera.fov -= (this.camera.fov - this.cameraFov) / this.cameraFovCount;
      this.camera.updateProjectionMatrix();
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