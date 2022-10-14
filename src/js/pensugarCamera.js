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

        this.setCamera();
        this.setLight();
        this.setModels();
        // this.setControls();
        this.setStats();
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
        const planeGeometry = new THREE.BoxGeometry(50, 50, 0.2);
        const planeMateroal = new THREE.MeshStandardMaterial({
            color: '#444',
            side: THREE.DoubleSide,
        });

        // floor
        const floorMesh = new THREE.Mesh(planeGeometry, planeMateroal);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.name = 'floor';
        this.scene.add(floorMesh);

        // Box
        // const boxMesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(1, 1, 1),
        //     new THREE.MeshStandardMaterial({
        //         color: 'blue'
        //     })
        // );
        // boxMesh.position.set(0, 0.5, 0);
        // boxMesh.name = 'box';
        // this.scene.add(boxMesh);

        // FBX
        this.mixers = [];
        const fbxLoader = new FBXLoader();
        fbxLoader.setPath('models/');
        fbxLoader.load('pengsugar-move.fbx', (object) => {
                console.log(object);
                object.scale.setScalar(0.01);
                object.traverse(c => {
                    c.castShadow = true;
                });
                object.position.y = 0.1;

                // const anim = new FBXLoader();
                // anim.setPath()

                // const anim = new FBXLoader();
                // anim.setPath('models/three-camera-move4.fbx');
                // anim.load(animFile, (anim) => {
                //     const m = new THREE.AnimationMixer(fbx);
                //     this._mixers.push(m);
                //     const idle = m.clipAction(anim.animations[0]);
                //     idle.play();
                // });

                // this.mixers = new THREE.AnimationMixer(fbx);
                    
                // const actions = [];
                // actions[0] = this.mixers.clipAction(fbx.animations[0]);
                // actions[1] = this.mixers.clipAction(fbx.animations[1]);

                // // 애니메이션 속성 지정
                // actions[0].repetitions = 1; // 애니메이션 반복 횟수
                // actions[0].clampWhenFinished = true; // 정지시 애니메이션 시작시 동작으로 정지

                // actions[0].play();


                console.log( object.animations )

                object.mixer = new THREE.AnimationMixer( object );
                this.mixers.push( object.mixer );

                this.cameraMesh = object.children[0];
                this.emptyMesh = object.children[7];

                // var action = object.mixer.clipAction( object.animations[ 4 ] );
                // action = action;
                // action.play();

                object.mixer.clipAction( object.animations[ 0 ] ).repetitions = 1;
                object.mixer.clipAction( object.animations[ 4 ] ).repetitions = 1;
                object.mixer.clipAction( object.animations[ 6 ] ).repetitions = 1;

                object.mixer.clipAction( object.animations[ 0 ] ).clampWhenFinished = true;
                object.mixer.clipAction( object.animations[ 4 ] ).clampWhenFinished = true;
                // object.mixer.clipAction( object.animations[ 6 ] ).clampWhenFinished = true;

                object.mixer.clipAction( object.animations[ 0 ] ).play();
                object.mixer.clipAction( object.animations[ 4 ] ).play();
                object.mixer.clipAction( object.animations[ 6 ] ).play();


                this.scene.add(object);
            }
        )
    }

    setCamera() {
        let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 2, 4);
        camera.lookAt(0, 0.5, 0);
        this.scene.add(camera);

        this.camera = camera;
    }

    setLight() {
        const ambientLight = new THREE.AmbientLight('#fff', 0.5);
        const pointLight = new THREE.PointLight('#fff', 2);
        pointLight.position.set(0, 5, 3);
        pointLight.lookAt(0, 0, 0);
        this.scene.add(ambientLight, pointLight);

        this.light = pointLight;
    }

    update() {
        const delta = this.clock.getDelta();

        if ( this.emptyMesh )
            console.log( this.emptyMesh.position );

        // this.controls.update();
        this.stats.update();
        if ( this.mixers.length > 0 ) {
            for ( var i = 0; i < this.mixers.length; i ++ ) {
                this.mixers[ i ].update( delta );
            }

            const cameraMeshPosition = this.cameraMesh.position.multiplyScalar(0.01);
            this.camera.position.copy( cameraMeshPosition );

            const cameraLookPosition = this.emptyMesh.position.multiplyScalar(0.01);
            this.camera.lookAt( cameraLookPosition );
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