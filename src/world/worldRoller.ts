import { Chunk } from "./chunk/chunk";
import { Vector3, Scene, Color, Mesh, Geometry, Matrix3, Material, Matrix4 } from "three";
import { InstanceRoller } from "./instanceRoller";
import { Assets } from "../util/assets";
import * as THREE from "three";
import { RiverChunk } from "./chunk/riverChunk";

export class WorldRoller {

    // 10 chunks in array
    chunks: Chunk[] = [];
    treeRoller: InstanceRoller;

    // chunk index
    private chunkIndex = 0;

    constructor(
        private readonly scene: Scene,
        // rolling seed
        private seed = 8
    ) {
    }

    // create chunks and add to scene
    init() {
        // const colors = [
        //     new Color(0x46E777),
        //     new Color('cyan'),
        //     new Color('hotpink'),
        //     new Color('red'),
        //     new Color('yellow'),
        //     new Color('darkgreen'),
        //     new Color('purple'),
        //     new Color('lightsalmon'),
        //     new Color('sandybrown'),
        //     new Color('tomato')
        // ];
        try {
            const treeAsset = Assets.getAsset('Tree') as any;
            console.log(treeAsset);
            this.treeRoller = new InstanceRoller(treeAsset.geometry, treeAsset.material, 20);
            this.treeRoller.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            this.scene.add(this.treeRoller);
            // this.scene.add(treeAsset);
        } catch(e) {
            console.log(e);
        }
        for (let i = 0; i < 10; i++) {
            let c = new Chunk();
            c.init();            
            this.seed = c.generate(this.seed);
            c.translateZ(Chunk.chunkSize -(Chunk.chunkSize) * i);
            this.treeRoller.placeNext(c.position);
            // console.log(c.position);
            this.scene.add(c);
            this.chunks.push(c);
        }
    }

    advance() {
        const advanceAmount = 0.3;

        for (let i = this.chunkIndex + 1; i < 10; i++) {
            this.chunks[i].translateZ(advanceAmount);
        }
        for (let i = 0; i < this.chunkIndex; i++) {
            this.chunks[i].translateZ(advanceAmount);
        }
        if (this.chunks[this.chunkIndex].position.z > 2 * Chunk.chunkSize) {
            // Generate
            this.seed = this.chunks[this.chunkIndex].generate(this.seed);
            // Move to furthest chunk
            const furthestZ = this.chunkIndex == 0 ? this.chunks[9].position.z : this.chunks[this.chunkIndex -1].position.z;
            this.chunks[this.chunkIndex].position.setZ(furthestZ -Chunk.chunkSize);
            this.treeRoller.placeNext(this.chunks[this.chunkIndex].position);
            // console.log(this.chunks[this.chunkIndex].position);
            // change index
            this.chunkIndex++;
            if (this.chunkIndex > 9) { this.chunkIndex = 0 }
        } else {
            this.chunks[this.chunkIndex].translateZ(advanceAmount);
        }
    }
}