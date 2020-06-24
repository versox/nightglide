import './style.scss';

import { Scene, PerspectiveCamera, WebGLRenderer, Vector3, AxesHelper, DirectionalLight, GridHelper, Fog, TextureLoader, Sprite, SpriteMaterial, AmbientLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Assets } from './util/assets';
import { ChunkRoller } from './world/chunkRoller';
import { GliderPlayer } from './player/gliderPlayer';
import { getGenerator } from './world/featureGeneratorService';


export class Game {
    private readonly CAMERA_GAME_FAR = 110;

    private pressedKeys = {};

    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera; 
    
    private scene: Scene; 
    private titleSprite: Sprite;
    private chunkRoller: ChunkRoller;
    private player: GliderPlayer;


    async init() {
        // Menu buttons
        global['buttons'] = {
            play: () => {
                this.startGame();
            },
            playAgain: () => {
                this.startAgain();
            }
        }

        // Keyboard
        window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }
        window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }        

        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Renderer
        this.renderer = new WebGLRenderer({
            antialias: true,
            canvas: document.getElementById('c') as HTMLCanvasElement,
            alpha: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(innerWidth, innerHeight);

        // Camera
        this.camera = new PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 11);
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(new Vector3(0, 3, 0));
        // this.camera.up = new Vector3(0, 1, 1.5);

        // Scene
        this.scene = new Scene();
        const assetPromise =  Assets.loadAssets('assets/meshes.gltf');

        // Light
        const directionalLight = new DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
        this.scene.fog = new Fog(0x000000, 30, 120);

        // Menu
        const textureLoader = new TextureLoader();
        this.titleSprite = new Sprite(
            new SpriteMaterial({
                map: await new Promise((res, rej) => {
                    textureLoader.load('assets/logo.png', res)
                })
            }
        ));
        this.titleSprite.scale.set(10, 5, 1);
        this.titleSprite.position.set(0, 7, 5);
        this.scene.add(this.titleSprite);

        // World
        await assetPromise;
        this.chunkRoller = new ChunkRoller(this.scene, (9301 + 49297) % 233280, 12);
        this.chunkRoller.init();

        // Player
        this.player = new GliderPlayer();
        this.player.init();
        this.player.position.set(0, 4, 12);
        this.scene.add(this.player);

        document.getElementById('play').style.visibility = "visible";

        // const oc = new OrbitControls(this.camera, document.getElementById('c'));

        this.static();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
        this.render();
    }

    startGame() {
        document.getElementById('play').style.visibility = "hidden";
        this.scene.remove(this.titleSprite);
        this.player.position.set(0, 3, 8);
        // this.camera.lookAt(this.player.position);
        this.progressAnim();
    }

    startAgain() {
        document.getElementById('gameOver').style.visibility = 'hidden';
        getGenerator().reset();
        this.chunkRoller.reset();
        this.player.position.set(0, 3, 8);
        this.player.reset();
        this.progressAnim();
    }

    progressAnim() {
        if (this.camera.far <= this.CAMERA_GAME_FAR) {
            this.camera.far += 2;
            this.camera.updateProjectionMatrix();
        } else {
            window.requestAnimationFrame(() => this.update());
            return;
        }
        this.render();
        window.requestAnimationFrame(() => this.progressAnim());
    }

    static() {
        this.render();
    }

    gameOver() {
        document.getElementById('gameOver').style.visibility = 'visible';
        this.render();
    }
    

    update() {
        // Check pressed keys
        if(this.pressedKeys[65]) { // a
            this.player.moveLeft();
        }
        if(this.pressedKeys[68]) { // d
            this.player.moveRight();
        }
        if(this.pressedKeys[83]) { // s
            this.player.moveUp();
        }
        if(this.pressedKeys[87]) { // w
            this.player.moveDown();
        }
        if(this.pressedKeys[16]) {
            // console.log(this.advanceAmount);
        } else {
            // if (this.advanceAmount > 0.09) { this.advanceAmount -= 0.005; }
        }

        // Update player, camera, and world
        this.player.update();
        this.camera.lookAt(
            this.player.position.x,
            this.player.position.y - 1,
            this.player.position.z);
        this.camera.position.set(this.player.position.x, this.player.position.y + 2, this.camera.position.z);
        this.chunkRoller.advance(this.player.advanceSpeed);

        // Check bounds
        if (this.player.checkCollision(this.chunkRoller.boundChunk, this.chunkRoller.boundOffset)) {
            requestAnimationFrame(() => this.gameOver());
        } else {
            this.render();        
            requestAnimationFrame(() => this.update());
        };
    }

    render() {
        this.camera.layers.set(0);
        this.renderer.render(this.scene, this.camera);
        this.renderer.autoClear = false;
        this.camera.layers.set(1);
        this.renderer.render(this.scene, this.camera);
        this.renderer.autoClear = true;
    }
}

new Game().init();
// new App();
