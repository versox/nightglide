import { Mesh, Vector3, AmbientLight, DirectionalLight, PointLight, SphereGeometry, MeshBasicMaterial, LineBasicMaterial } from "three";
import { Assets } from "../util/assets";

export class GliderPlayer extends Mesh {
    private roll = 0;
    private pitch = 0;
    private moveHyp = 0.2;
    

    bound: Mesh;

    constructor() {
        super();
    }

    init() {
        // console.log('player');
        // console.log(this);

        const asset = Assets.getAsset('Player');
        this.geometry = asset.geometry;
        this.material = asset.material;

        this.layers.set(1);

        var light = new PointLight( 0xff0000, 5, 3 );
        light.layers.set(1);
        this.add(light);

        const playerLight = new DirectionalLight(0xffffff, 0.9);
        playerLight.position.set(0, 5, 1);
        playerLight.layers.set(1);
        this.add(playerLight);
        this.bound = new Mesh(new SphereGeometry(
            this.geometry.boundingSphere.radius
        ), new MeshBasicMaterial({transparent: true, opacity: 0.3, color: 'red'}));
        // this.bound.position.setY(this.bound.position.Y + 2);
        // this.bound.translateY(0.2);
        this.bound.layers.set(1);
        // this.bound.geometry
        // this.add(this.bound);
    }

    moveLeft() {
        this.roll -= 0.01;
        this.updateRoll();
    }

    moveRight() {
        this.roll += 0.01;
        this.updateRoll();
    }

    updateRoll() {
        this.rotation.setFromVector3(this.rotation.toVector3().setZ(-this.roll));
    }

    moveUp() {
        if(this.position.y < 8) {
            this.pitch += 0.01;
            this.updatePitch();
        }
    }

    moveDown() {
        this.pitch -= 0.01;
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
}