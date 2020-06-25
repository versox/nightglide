import { Mesh, Vector3, AmbientLight, DirectionalLight, PointLight, SphereGeometry, MeshBasicMaterial, LineBasicMaterial, Vector2, Triangle } from "three";
import { Assets } from "../util/assets";
import { Chunk } from "../world/chunk";

const baseAdvance = 0.10;
const advanceIncrease = 0.03;
const baseMove = 0.01;
const moveIncrease = 0.0005;

export class GliderPlayer extends Mesh {
    private advanceFactor = 0;
    public advanceSpeed = baseAdvance + this.advanceFactor * advanceIncrease;
    public moveSpeed = baseMove + this.advanceFactor * moveIncrease;

    private roll = 0;
    private pitch = 0;
    private moveHyp = 0.2;
    
    private score = 0;
    private scoreElement: HTMLDivElement;
    private lives = 3;
    private livesElement: HTMLDivElement;

    private lastCollision = 0;
    private potentialMiss = false;

    constructor() {
        super();
    }
    
    reset() {
        this.advanceFactor = 0;
        this.calculateAdvance();
        this.score = 0;
        this.scoreElement.innerText = '0';
        this.lives = 3;
        this.updateLives();
        this.roll = 0;
        this.pitch = 0;
        this.updateRoll();
        this.updatePitch();
    }

    init() {
        // console.log('player');
        // console.log(this);
        this.scoreElement = document.getElementById('score') as HTMLDivElement;
        this.scoreElement.innerText = '0';
        this.livesElement = document.getElementById('lives') as HTMLDivElement;
        this.updateLives();

        const asset = Assets.getAsset('Player');
        this.geometry = asset.geometry;
        this.material = asset.material;

        this.layers.set(1);

        // var light = new PointLight( 0xff0000, 5, 3 );
        // light.layers.set(1);
        // this.add(light);

        const playerLight = new DirectionalLight(0xffffff, 0.9);
        playerLight.position.set(0, 5, 1);
        playerLight.layers.set(1);
        this.add(playerLight);
    }

    moveLeft() {
        this.roll -= this.moveSpeed;
        this.updateRoll();
    }

    moveRight() {
        this.roll += this.moveSpeed;
        this.updateRoll();
    }

    updateRoll() {
        this.rotation.setFromVector3(this.rotation.toVector3().setZ(-this.roll));
    }

    moveUp() {
        if(this.position.y < 8) {
            this.pitch += this.moveSpeed;
            this.updatePitch();
        }
    }

    moveDown() {
        this.pitch -= this.moveSpeed;
        this.updatePitch();
    }

    updatePitch() {
        this.rotation.setFromVector3(this.rotation.toVector3().setX(this.pitch));
    }

    update() {
        const movementX = Math.sin(this.roll) * this.moveHyp;
        const movementY = Math.sin(this.pitch) * this.moveHyp;
        if(this.pitch > Math.PI / 9) { this.pitch -= 0.01; }
        else if(this.pitch > 0) { this.pitch -= 0.002; }
        this.position.add(new Vector3(movementX, movementY, 0));
    }

    increaseScore() {
        this.score++;
        this.scoreElement.innerText = this.score.toString();
    }

    updateLives() {
        this.livesElement.querySelectorAll('img').forEach((e) => (e as any).style.visibility = 'hidden');
        this.livesElement.querySelectorAll(`img:nth-child(-n+${this.lives})`).forEach((e) => (e as any).style.visibility = 'visible');
    }

    calculateAdvance() {
        this.advanceSpeed = baseAdvance + this.advanceFactor * advanceIncrease;
        this.moveSpeed = baseMove + this.advanceFactor * moveIncrease;
    }

    checkCollision(activeChunk: Chunk, offset: number): boolean {
        if (performance.now() - this.lastCollision > 500) {
            const ring = activeChunk.atRing(offset);
            if (ring) {
                const deltaX = ring.position.x - this.position.x;
                const deltaY = ring.position.y - this.position.y;
                const delta = Math.sqrt(
                    (deltaX * deltaX) + (deltaY * deltaY) 
                );
                if (delta < 0.7) {
                    ring.visible = false;
                    this.increaseScore();
                    if (ring.tipe == 'speedup') {
                        this.advanceFactor++;
                        this.calculateAdvance();
                    }
                    this.potentialMiss = false;
                    this.lastCollision = performance.now();
                } else {
                    this.potentialMiss = true;
                }
            } else {
                if (this.potentialMiss) {
                    // console.log("MISS");
                    this.potentialMiss = false;
                    this.lives--;
                    // console.log(this.lives);
                    this.updateLives();
                    if (this.lives <= 0) {
                        return true;
                    }
                }
            }
        }
        
        // Return ground
        return (this.position.y < activeChunk.groundBounds[Math.floor(offset)](this.position.x));
    }
}