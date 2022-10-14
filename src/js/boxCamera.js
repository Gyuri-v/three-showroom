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
                
                // object.mixer = new THREE.AnimationMixer( object );
                // this.mixers.push( object.mixer );

                console.log( object.children );
                // console.log( object.animations[0].tracks[1].times );
                // console.log( object.animations[0].tracks[1].values );

                this.empty = object.children[2];
                // const emptyLine = this.empty.getSpacedPoints(100);
                // console.log(this.empty);

                this.animPosition = object.animations[0].tracks[0].values;
                
                this.scene.add(object);

                let firstCameraPosition = new THREE.Vector3( 
                    this.animPosition[0],
                    this.animPosition[1],
                    this.animPosition[2]
                );
                firstCameraPosition.multiplyScalar(0.01);
                this.camera.position.copy( firstCameraPosition );
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

            let currentLine = new THREE.Vector3(
                this.animPosition[Math.round(timeLine) * 3],
                this.animPosition[Math.round(timeLine) * 3 + 1],
                this.animPosition[Math.round(timeLine) * 3 + 2],
            )
            currentLine = currentLine.multiplyScalar(0.01);
            this.currentLine = currentLine;
        })
    }

    update() {
        if ( !this.currentLine /* || !this.currentQuaternion */ ) return;

        this.camera.position.lerp( this.currentLine, 0.1 );
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