import { Object3D, BufferGeometry, Mesh, Float32BufferAttribute, Color, MeshLambertMaterial, MeshBasicMaterial, InterleavedBufferAttribute, InterleavedBuffer } from "three";
import { random } from "../util/random";
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { getGenerator, FeatureGeneratorT } from "./featureGeneratorService";

/* Chunk:
    - generate
    - advance
    - nextChunk: position
*/
export class Chunk extends Object3D {
    static readonly chunkDepth = 10;
    static readonly chunkWidth = 30;
     
    private featuresGenerator: FeatureGeneratorT;
    private vertexSpacing = 1/2;

    private float32Access: Float32Array;
    private uint8Access: Uint8Array;

    
    // Setup buffers / material etc
    init() {
        this.featuresGenerator = getGenerator();

        const indices = [];
        const depthCount = Chunk.chunkDepth / this.vertexSpacing + 1;
        const widthCount = Chunk.chunkWidth / this.vertexSpacing + 1;
        for (let zi = 0; zi < depthCount - 1; zi++) {
            for (let xi = 0; xi < widthCount - 1; xi++) {
                const a = zi * widthCount + xi;
                const b = (zi + 1) * widthCount + xi;
                indices.push(
                    a, a+1, b,
                    a+1, b+1, b
                );
            }
        }

        // position: x, y, z (3x4)
        // normal: x, y, z (3x4)
        // color: rgba (4x1)
        const buffer = new ArrayBuffer(28);
        this.float32Access = new Float32Array( buffer );
        const interleavedFloat32 = new InterleavedBuffer(this.float32Access, 7);
        this.uint8Access = new Uint8Array( buffer );
        const interleavedUint8 = new InterleavedBuffer(this.uint8Access, 28);

        const geometry = new BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute(
            'position',
            new InterleavedBufferAttribute(
                interleavedFloat32,
                3, 0, false));
        geometry.setAttribute(
            'normal',
            new InterleavedBufferAttribute(
                interleavedFloat32,
                4, 3, true))
        geometry.setAttribute(
            'color',
            new InterleavedBufferAttribute(
                interleavedUint8,
                3, 24, false));
    }

    generate(seed: number) {
        const features = this.featuresGenerator.getFeatures();
        let buffIndex = 0;
        for (let z = Chunk.chunkDepth / 2; z >= -Chunk.chunkDepth / 2; z -= this.vertexSpacing) {
            // Mountain Left
            for (let x = -Chunk.chunkWidth / 2; x <= -Chunk.chunkWidth / 3; x += this.vertexSpacing, buffIndex += 7) {
                this.float32Access[buffIndex] = x;
                this.float32Access[buffIndex + 1] = features.hillsType.getY(x, Chunk.chunkWidth / 6, 4);
                this.float32Access[buffIndex + 2] = z;
                this.uint8Access[(buffIndex + 6) * 4] = features.hillsType.color.r;
                this.uint8Access[(buffIndex + 6) * 4 + 1] = features.hillsType.color.g;

            }
            // Grass
            // rand = random(rand.nextSeed, -0.05, 0.05);
            // let y = x * x / width / width + rand.random;
            // River

            // Grass
        }
    }

    advance(amount: number) {

    }
}