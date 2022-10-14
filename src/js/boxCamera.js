import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';

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
        // this.setControls();
        this.setStats();
        this.setEvent();
    }

    setControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls = controls;
    }

    setStats() {
        const stats = new Stats();
        document.body.append(stats.domElement);
        
        this.stats = stats;
    }

    setModels() {
        // FBX
        this.mixers = [];
        const fbxLoader = new FBXLoader();
        fbxLoader.setPath('models/');
        fbxLoader.load('box-camera-move.fbx', (object) => {
                object.scale.setScalar(0.01);
                object.traverse(c => {
                    c.castShadow = true;
                });

                /* 카메라 수정 소스 */
                const targetAnimationTrack = object.animations[0].tracks[1];
                const quaternion = new THREE.Quaternion();
                const quaternionToFix = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(1, 0, 0),
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
                this.emptyModel = object.children[2];
                this.boxModel = object.children[3];
                
                object.mixer = new THREE.AnimationMixer( object );
                this.mixers.push( object.mixer );

                const anim = object.mixer.clipAction( object.animations[0] );                // anim.repetitions = 1;
                anim.clampWhenFinished = true;
                anim.play();
                // anim.time = 1;

                this.scene.add(object);
            }
        )
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

    setEvent() {
        let timeLine = 0;
        this.renderer.domElement.addEventListener('wheel', (e) => {
            timeLine += e.wheelDelta * 0.001;

            if ( timeLine < 0 )   timeLine = 99;
            if ( timeLine > 99 ) timeLine = 0;
        })
    }

    update() {
        let delta = this.clock.getDelta();

        if ( this.mixers.length > 0 ) {
            this.mixers[0].update( delta );

            this.camera.position.copy( this.cameraModel.position.multiplyScalar(0.01) );
            this.camera.lookAt( this.emptyModel.position.multiplyScalar(0.01) );
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