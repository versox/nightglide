import { Chunk } from "./chunk";

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
        private numChunks = 10
    ) {}

    init() {
        // Generate first time
        for (let i = 0; i < this.numChunks; i++) {
            const c = new Chunk();
            c.init();
            this.seed = c.generate(this.seed);
            // TODO: move to position

            this.scene.add(c);
            this.chunks.push(c);
        }
    }

    advance(amount: number) {
        for (let i = this.chunkIndex + 1; i < 10; i++) {
            this.chunks[i].advance(amount);
        }
        for (let i = 0; i < this.chunkIndex; i++) {
            this.chunks[i].advance(amount);
        }
        if(this.chunks[this.chunkIndex].position.z > 2 * Chunk.chunkSize) {
            this.seed = this.chunks[this.chunkIndex].generate(this.seed);
            // TODO: move to position

            this.chunkIndex++;
            if (this.chunkIndex > 9) { this.chunkIndex = 0 }
        } else {
            this.chunks[this.chunkIndex].advance(amount);
        }
    }
}