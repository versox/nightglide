import { Object3D, BufferGeometry, Mesh, Float32BufferAttribute, Color, MeshLambertMaterial, MeshBasicMaterial, Uint8BufferAttribute, Geometry, VertexColors, Vector3, MeshNormalMaterial, MeshPhongMaterial } from "three";
import { random } from "../util/random";
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { getGenerator, FeatureGeneratorT } from "./featureGeneratorService";
import { InstanceRoller } from "./instanceRoller";
import { Assets } from "../util/assets";

/* Chunk:
    - generate
    - advance
    - nextChunk: position
*/
export class Chunk extends Object3D {
    static readonly chunkDepth = 10;
    static readonly chunkWidth = 30;
     
    private vertexSpacing = 1/2;
    private readonly depthCount = Chunk.chunkDepth / this.vertexSpacing + 1;
    private readonly widthCount = Chunk.chunkWidth / this.vertexSpacing + 1;

    // private positionAttr: Float32BufferAttribute;
    // private normalAttr: Float32BufferAttribute;
    // private colorAttr: Uint8BufferAttribute;

    private positionArr: Float32Array;
    private normalArr: Float32Array;
    private colorArr: Float32Array; 

    private geometry: BufferGeometry;

    private featuresGenerator: FeatureGeneratorT;
    private instanceRoller: InstanceRoller;
    private ring: Mesh;


    constructor(private scene) {
        super();
    }

    // Setup buffers / material etc
    init() {

        const ringAsset = Assets.getAsset('Ring');
        const material = new MeshPhongMaterial({
            color: 0x481666,
            transparent: true,
            opacity: 0.5,
            shininess: 100,
            emissive: 0x481666
        });
        this.ring = new Mesh(ringAsset.geometry, material );
        this.ring.layers.set(1);
        this.ring.visible = false;
        this.add(this.ring);

        // Initialize roller
        const treeAsset = Assets.getAsset('Tree');
        this.instanceRoller = new InstanceRoller(treeAsset.geometry, treeAsset.material, 400);
        this.add(this.instanceRoller);

        // Features
        this.featuresGenerator = getGenerator();

        const indices = [];
        for (let zi = 0; zi < this.depthCount - 1; zi++) {
            for (let xi = 0; xi < this.widthCount - 1; xi++) {
                const a = zi * this.widthCount + xi;
                const b = (zi + 1) * this.widthCount + xi;
                indices.push(
                    a, a+1, b,
                    a+1, b+1, b
                );
            }
        }
        // for (let zi = 0; zi < 1; zi++) {
        //     for (let xi = 0; xi < this.widthCount - 1; xi++) {
        //         const a = zi * this.widthCount + xi;
        //         const b = (zi + 1) * this.widthCount + xi;
        //         indices.push(
        //             a, a+1, b,
        //             a+1, b+1, b
        //         );
        //     }
        // }


        this.positionArr = new Float32Array(this.depthCount * this.widthCount * 3);
        // const positionAttr = new Float32BufferAttribute(this.positionArr, 3);

        this.normalArr = new Float32Array(this.depthCount * this.widthCount * 3);
        // const normalAttr = new Float32BufferAttribute(this.normalArr, 3, true);

        this.colorArr = new Float32Array(this.depthCount * this.widthCount * 3);
        // const colorAttr = new Uint8BufferAttribute(this.colorArr, 3);

        this.geometry = new BufferGeometry();
        const geometry = this.geometry;
        geometry.setIndex(indices);
        geometry.setAttribute(
            'position',
            new Float32BufferAttribute(this.positionArr, 3));
        // geometry.setAttribute(
        //     'normal',
        //     new Float32BufferAttribute(this.normalArr, 3, true));
        geometry.setAttribute(
            'color',
            new Float32BufferAttribute(this.colorArr, 3));

        const mesh = new Mesh(geometry, new MeshLambertMaterial({
            vertexColors: true
        }));
        this.add(mesh);
    }

    generate(seed: number) {
        const features = this.featuresGenerator.getFeatures();
        this.instanceRoller.geometry = features.asset.geometry;
        this.instanceRoller.material = features.asset.material;
        let rand = random(seed);

        // Ring
        if(features.ring) {
            this.ring.visible = true;
            this.ring.position.set(features.ring.x, features.ring.y, features.ring.z);
        } else {
            this.ring.visible = false;
        }

        let buffIndex = 0;
        for (let z = Chunk.chunkDepth / 2; z >= -Chunk.chunkDepth / 2; z -= this.vertexSpacing) {
            // Mountain angle: 3.5 and 5
            let mountainAngle = rand.random(3.5, 5);
            // mountain grass noise: an offset of sorts
            let mgn = Math.round(rand.random(-1, 1));

            // console.log(mountainAngle);
            // Mountain Left
            for (let x = -Chunk.chunkWidth / 2; x <= -Chunk.chunkWidth / 6 + (mgn - 1) * this.vertexSpacing; x += this.vertexSpacing) {
                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.hillsType.getY(x, Chunk.chunkWidth / 6, mountainAngle );
                this.positionArr[buffIndex + 2] = z;
                this.colorArr[buffIndex] = features.hillsType.color.r;
                this.colorArr[buffIndex + 1] = features.hillsType.color.g;
                this.colorArr[buffIndex + 2] = features.hillsType.color.b;
                buffIndex += 3;
            }

            // ground noise
            let groundRandom = random(rand.seed);

            // Grass / River
            for (let x = -Chunk.chunkWidth / 6 + mgn * this.vertexSpacing; x <= Chunk.chunkWidth / 6 + (mgn - 1) * this.vertexSpacing; x += this.vertexSpacing) {
                let groundNoise = groundRandom.random(-0.05, 0.05);

                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.groundType.getY(x, 5, groundNoise);
                this.positionArr[buffIndex + 2] = z;
                this.colorArr[buffIndex] = features.groundType.color.r;
                this.colorArr[buffIndex + 1] = features.groundType.color.g;
                this.colorArr[buffIndex + 2] = features.groundType.color.b;

                if(-0.05 <= groundNoise && groundNoise <= 0.05) { 
                    this.instanceRoller.placeNext(
                        new Vector3(x, features.groundType.getY(x, 5, groundNoise), z),
                        groundRandom.random(0.25, 1.25));
                }
                // console.log(features.groundType.color);
                buffIndex += 3;
                groundRandom = random(groundRandom.nextSeed);
            }
            // rand = random(rand.nextSeed, -0.05, 0.05);
            // let y = x * x / width / width + rand.random;

            // Mountain Right
            for (let x = Chunk.chunkWidth / 6 + mgn * this.vertexSpacing; x <= Chunk.chunkWidth / 2; x+= this.vertexSpacing) {
                this.positionArr[buffIndex] = x;
                this.positionArr[buffIndex + 1] = features.hillsType.getY(x, Chunk.chunkWidth / 6, mountainAngle);
                this.positionArr[buffIndex + 2] = z;
                // console.log(features.hillsType.color.r);
                // this.colorArr[buffIndex] = features.hillsType.color.r;
                // this.colorArr[buffIndex + 1] = features.hillsType.color.g;
                // this.colorArr[buffIndex + 2] = features.hillsType.color.b;
                this.colorArr[buffIndex] = 1;
                this.colorArr[buffIndex + 1] = 1;
                this.colorArr[buffIndex + 2] = 1;
                // console.log(this.colorArr[buffIndex]);
                // console.log(this.positionArr[buffIndex]);
                // console.log(buffIndex);
                buffIndex += 3;
            }
            if(z != -Chunk.chunkDepth / 2) { rand = random(rand.nextSeed); }
        }

        // Calculate normals
        // for (let zi = 0; zi < 1; zi++) {
        //     for (let xi = 0; xi < this.widthCount + 1; xi++) {
        //         const a = zi * this.widthCount + xi;
        //         const b = (zi + 1) * this.widthCount + xi;
        //         const c = b + 1;
        //         const d = a + 1;

        //         const posA = new Vector3(
        //             this.positionArr[a * 3],
        //             this.positionArr[a * 3 + 1],
        //             this.positionArr[a * 3 + 2]);
        //         const posB = new Vector3(
        //             this.positionArr[b * 3],
        //             this.positionArr[b * 3 + 1],
        //             this.positionArr[b * 3 + 2]);
        //         const posC = new Vector3(
        //             this.positionArr[c * 3],
        //             this.positionArr[c * 3 + 1],
        //             this.positionArr[c * 3 + 2]);
        //         const posD = new Vector3(
        //             this.positionArr[d * 3],
        //             this.positionArr[d * 3 + 1],
        //             this.positionArr[d * 3 + 2]);
                
        //         let normA = new Vector3(
        //             this.normalArr[a * 3],
        //             this.normalArr[a * 3 + 1],
        //             this.normalArr[a * 3 + 2]);
        //         let normB = new Vector3(
        //             this.normalArr[b * 3],
        //             this.normalArr[b * 3 + 1],
        //             this.normalArr[b * 3 + 2]);
        //         let normC = new Vector3(
        //             this.normalArr[c * 3],
        //             this.normalArr[c * 3 + 1],
        //             this.normalArr[c * 3 + 2]);
        //         let normD = new Vector3(
        //             this.normalArr[d * 3],
        //             this.normalArr[d * 3 + 1],
        //             this.normalArr[d * 3 + 2]);
                

        //         const e0 = posB.sub(posA);
        //         const e1 = posC.sub(posB);
        //         const e2 = posD.sub(posC);
        //         const e3 = posA.sub(posD);

        //         normA = normA.add(e0.cross(e3.negate()));
        //         normB = normB.add(e1.cross(e0.negate()));
        //         normC = normC.add(e2.cross(e1.negate()));
        //         normD = normD.add(e3.cross(e2.negate()));
                
        //         this.normalArr[a * 3] = normA.x;
        //         this.normalArr[a * 3 + 1] = normA.y;
        //         this.normalArr[a * 3 + 2] = normA.z;

        //         this.normalArr[b * 3] = normB.x;
        //         this.normalArr[b * 3 + 1] = normB.y;
        //         this.normalArr[b * 3 + 2] = normB.z;

        //         this.normalArr[c * 3] = normC.x;
        //         this.normalArr[c * 3 + 1] = normC.y;
        //         this.normalArr[c * 3 + 2] = normC.z;

        //         this.normalArr[d * 3] = normD.x;
        //         this.normalArr[d * 3 + 1] = normD.y;
        //         this.normalArr[d * 3 + 2] = normD.z;
        //     }
        // }

        // console.log(this.colorArr);

        this.geometry.attributes.position = new Float32BufferAttribute(this.positionArr, 3);
        // this.geometry.attributes.normal = new Float32BufferAttribute(this.normalArr, 3);
        this.geometry.attributes.color = new Float32BufferAttribute(this.colorArr, 3);
        this.geometry.computeVertexNormals();
        // console.log(this.geometry);
        return rand.seed;
    }

    advance(amount: number) {
        this.translateZ(amount);
    }

    place(prevChunk: Chunk) {
        this.position.setZ(prevChunk.position.z - Chunk.chunkDepth);
    }
}