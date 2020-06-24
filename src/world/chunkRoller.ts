import { Chunk } from "./chunk";
import { getGenerator } from "./featureGeneratorService";

/*
    - Hold n chunks and roll them
    - Call generate on roll
    - Pass on seed
*/
export class ChunkRoller {
    private readonly chunks: Chunk[] = [];
    private chunkIndex = 0;

    public boundChunk: Chunk;
    public boundOffset: number;

    constructor(
        private readonly scene,
        private seed,
        private numChunks
    ) {}

    reset() {
        this.chunkIndex = 0;

        let prev: Chunk = null;
        for (let i = 0; i < this.numChunks; i++) {
            const c = this.chunks[i];
            this.seed = c.generate(this.seed);
            if(prev) {
                c.place(prev);
            } else {
                c.position.setZ(Chunk.chunkDepth);
            }
            prev = c;
        }
    }

    init() {
        // Generate first time
        let prev: Chunk = null;
        for (let i = 0; i < this.numChunks; i++) {
            const c = new Chunk(this.scene);
            c.init();
            this.seed = c.generate(this.seed);
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
        // Active chunk for bound checking
        let activeBound = (this.chunkIndex);
        if (this.chunks[activeBound].position.z > Chunk.chunkDepth + 3) {
            activeBound = (activeBound + 1) % 12;
        }
        this.boundChunk = this.chunks[activeBound];
        this.boundOffset = 8 - this.boundChunk.position.z;


        for (let i = this.chunkIndex + 1; i < this.numChunks; i++) {
            this.chunks[i].advance(amount);
        }
        for (let i = 0; i < this.chunkIndex; i++) {
            this.chunks[i].advance(amount);
        }
        if(this.chunks[this.chunkIndex].position.z > 2 * Chunk.chunkDepth) {
            this.seed = this.chunks[this.chunkIndex].generate(this.seed);
            const prev = this.chunkIndex == 0 ? this.chunks[this.numChunks - 1] : this.chunks[this.chunkIndex - 1];
            this.chunks[this.chunkIndex].place(prev);
            this.chunkIndex++;
            if (this.chunkIndex >= this.numChunks) { this.chunkIndex = 0 }
        } else {
            this.chunks[this.chunkIndex].advance(amount);
        }
    }
}