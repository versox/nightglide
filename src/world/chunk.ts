import { Object3D, BufferGeometry, Mesh, Float32BufferAttribute, Color, MeshLambertMaterial, MeshBasicMaterial, Uint8BufferAttribute } from "three";
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

    // private positionAttr: Float32BufferAttribute;
    // private normalAttr: Float32BufferAttribute;
    // private colorAttr: Uint8BufferAttribute;

    private positionArr: Float32Array;
    private normalArr: Float32Array;
    private colorArr: Uint8Array; 

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


        this.positionArr = new Float32Array(depthCount * widthCount * 3);
        // const positionAttr = new Float32BufferAttribute(this.positionArr, 3);

        this.normalArr = new Float32Array(depthCount * widthCount * 3);
        // const normalAttr = new Float32BufferAttribute(this.normalArr, 3, true);

        this.colorArr = new Uint8Array(depthCount * widthCount * 3);
        // const colorAttr = new Uint8BufferAttribute(this.colorArr, 3);

        const geometry = new BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute(
            'position',
            new Float32BufferAttribute(this.positionArr, 3));
        geometry.setAttribute(
            'normal',
            new Float32BufferAttribute(this.normalArr, 3, true))
        geometry.setAttribute(
            'color',
            new Uint8BufferAttribute(this.colorArr, 3));
    }

    generate(seed: number) {
        const features = this.featuresGenerator.getFeatures();
        let buffIndex = 0;
        for (let z = Chunk.chunkDepth / 2; z >= -Chunk.chunkDepth / 2; z -= this.vertexSpacing) {
            // Mountain Left
            for (let x = -Chunk.chunkWidth / 2; x <= -Chunk.chunkWidth / 3; x += this.vertexSpacing, buffIndex += 3) {
                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.hillsType.getY(x, Chunk.chunkWidth / 6, 4);
                this.positionArr[buffIndex + 2] = z;
                this.colorArr[buffIndex] = features.hillsType.color.r;
                this.colorArr[buffIndex + 1] = features.hillsType.color.g;
                this.colorArr[buffIndex + 2] = features.hillsType.color.b;
            }

            // Grass / River
            for (let x = -Chunk.chunkWidth / 3; x <= Chunk.chunkWidth / 3; x += this.vertexSpacing, buffIndex += 3) {
                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.groundType.getY(x, Chunk.chunkWidth / 6, 0);
                this.positionArr[buffIndex + 2] = z;
                this.colorArr[buffIndex] = features.groundType.color.r;
                this.colorArr[buffIndex + 1] = features.groundType.color.g;
                this.colorArr[buffIndex + 2] = features.groundType.color.b;
            }
            // rand = random(rand.nextSeed, -0.05, 0.05);
            // let y = x * x / width / width + rand.random;

            // Mountain Right
            for (let x = Chunk.chunkWidth / 3; x <= Chunk.chunkWidth / 2; x+= this.vertexSpacing, buffIndex += 3) {
                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.hillsType.getY(x, Chunk.chunkWidth / 6, 4);
                this.positionArr[buffIndex + 2] = z;
                this.colorArr[buffIndex] = features.hillsType.color.r;
                this.colorArr[buffIndex + 1] = features.hillsType.color.g;
                this.colorArr[buffIndex + 2] = features.hillsType.color.b;
            }
        }
    }

    advance(amount: number) {

    }
}