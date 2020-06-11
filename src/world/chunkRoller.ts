import { Chunk } from "./chunk";
import { getGenerator } from "./featureGeneratorService";

/*
    - Hold n chunks and roll them
    - Call generate on roll
    - Pass on seed
*/
export class ChunkRoller {
    private readonly chunks: Chunk[] = [];
    private  chunkIndex = 0;

    constructor(
        private readonly scene,
        private seed,
        private numChunks
    ) {}

    init() {
        // Generate first time
        let prev: Chunk = null;
        for (let i = 0; i < this.numChunks; i++) {
            const c = new Chunk(this.scene);
            c.init();
            this.seed = c.generate(this.seed);
            // TODO: move to position
            if(prev) {
                c.place(prev);
            } else {
                c.position.setZ(Chunk.chunkDepth);
            }
            this.scene.add(c);
            this.chunks.push(c);
            prev = c;
        }
    }

    advance(amount: number) {
        for (let i = this.chunkIndex + 1; i < this.numChunks; i++) {
            this.chunks[i].advance(amount);
        }
        for (let i = 0; i < this.chunkIndex; i++) {
            this.chunks[i].advance(amount);
        }
        if(this.chunks[this.chunkIndex].position.z > 2 * Chunk.chunkDepth) {
            this.seed = this.chunks[this.chunkIndex].generate(this.seed);
            // TODO: move to position
            const prev = this.chunkIndex == 0 ? this.chunks[this.numChunks - 1] : this.chunks[this.chunkIndex - 1];
            this.chunks[this.chunkIndex].place(prev);
            this.chunkIndex++;
            if (this.chunkIndex >= this.numChunks) { this.chunkIndex = 0 }
        } else {
            this.chunks[this.chunkIndex].advance(amount);
        }
    }
}