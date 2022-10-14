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

                console.log( object.children )

                this.cameraModel = object.children[0];
                this.emptyModel = object.children[2];
                this.boxModel = object.children[3];
                
                object.mixer = new THREE.AnimationMixer( object );
                this.mixers.push( object.mixer );

                const anim = object.mixer.clipAction( object.animations[0] );
                // anim.repetitions = 1;
                // anim.clampWhenFinished = true;
                // anim.play();
                // anim.time = 1;

                console.log( object.animations[0].tracks[0] );
                console.log( object.animations[0].tracks[0].times );
                console.log( object.animations[0].tracks[0].values );

                this.animValue = object.animations[0].tracks[0].values;

                // this.anim = anim;

                // console.log( object.children );
                // console.log( object.animations[0].duration );
                // console.log( this.anim.time );
                
                this.scene.add(object);

                let firstCameraPosition = new THREE.Vector3( 
                    this.animValue[0],
                    this.animValue[1],
                    this.animValue[2]
                )
                firstCameraPosition.multiplyScalar(0.01);
                this.camera.position.copy( firstCameraPosition );
                this.camera.lookAt(0, 0, 0);
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

            if ( timeLine < 0 )   timeLine = 100;
            if ( timeLine > 100 ) timeLine = 0;

            let currentLine = new THREE.Vector3(
                this.animValue[Math.round(timeLine) * 3],
                this.animValue[Math.round(timeLine) * 3 + 1],
                this.animValue[Math.round(timeLine) * 3 + 2],
            )
            currentLine = currentLine.multiplyScalar(0.01);
            this.currentLine = currentLine;

            // console.log( Math.round(timeLine),  currentLine);


            // console.log( currentLine );

            // this.camera.position.copy( currentLine );
        })
    }

    update() {
        if ( !this.currentLine ) return;

        this.camera.position.lerp( this.currentLine, 0.1 );

        // this.camera.position.copy( cp, 0.1 );
        this.camera.lookAt(0, 0, 0);

        // const delta = this.clock.getDelta();

        // console.log( this.anim );

        // if ( this.mixers.length > 0 ) {
        //     this.mixers[0].update( delta );

        //     this.camera.position.copy( this.cameraModel.position.multiplyScalar(0.01) );
        //     this.camera.lookAt( this.emptyModel.position.multiplyScalar(0.01) );
        // }
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