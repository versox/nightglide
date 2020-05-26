import { Scene, PerspectiveCamera, WebGLRenderer, Vector3, Colors, Color, AmbientLight, AxesHelper, HemisphereLight, DirectionalLight, GridHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Assets } from './util/assets';
import { ChunkRoller } from './world/chunkRoller';
import { GliderPlayer } from './player/gliderPlayer';


export class Game {
    private readonly scene = new Scene();
    private readonly camera = new PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 85);
    private readonly renderer = new WebGLRenderer({
        antialias: true,
        canvas: document.getElementById('c') as HTMLCanvasElement,
        alpha: true
    });
    
    private chunkRoller: ChunkRoller;
    private player: GliderPlayer;
    private pressedKeys = {};

    async init() {
        // Camera
        this.camera.position.set(0, 4, 15);
        this.camera.lookAt(new Vector3(0, 10, 0));
        this.camera.up = new Vector3(0, 1, 1);

        // Light
        const ambientLight = new AmbientLight( 0x404040, 1 );
        // this.scene.add(ambientLight);
        const directionalLight = new DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
        // console.log(directionalLight.position);

        // Renderer
        this.renderer.setSize(innerWidth, innerHeight);
        // this.renderer.setClearColor(new Color('rgb(255,255,255)'));

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const axes = new AxesHelper(15);
        axes.translateY(10);
        this.scene.add(axes);

        const grid = new GridHelper(100, 10);
        grid.translateZ(5);
        grid.translateX(5);
        // this.scene.add(grid);

        await Assets.loadAssets('glider.gltf');
        // GLTF
        // const loader = new GLTFLoader();
        // loader.load(
        //     'glider.gltf',
        //     // Loaded
        //     (gltf) => {
        //         const glider = gltf.scene.getObjectByName('Glider');
        //         // console.log(gltf.scene);
        //         this.scene.add(glider);
        //         // console.log(glider);

        //         this.scene.add(gltf.scene.getObjectByName('Player'));
        //     },
        //     // Loading
        //     (progress) => {

        //     },
        //     // Error
        //     () => {

        //     }
        // )

        // World
        this.chunkRoller = new ChunkRoller(this.scene, 'Seed', 10);
        this.chunkRoller.init();

        // Player
        this.player = new GliderPlayer();
        this.player.init();
        this.player.position.set(0, 2, 7);
        this.scene.add(this.player);
        
        window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }
        window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }

        this.update();
    }

    update() {
        /*
            - move player
            - update objects?
            - advance world (10 chunks)
                - generate ahead
                - no longer need behind
        */
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.update());
        // console.log(this.camera.position);
        this.chunkRoller.advance(0.07);
        // console.log(this.scene);
        this.player.update();
        if(this.pressedKeys[65]) {
            this.player.moveLeft();
        }
        if(this.pressedKeys[68]) {
            this.player.moveRight();
        }
        if(this.pressedKeys[83]) {
            this.player.moveUp();
        }
        if(this.pressedKeys[87]) {
            this.player.moveDown();
        }
        // console.log(this.pressedKeys);
    }
}

new Game().init();
// new App();
