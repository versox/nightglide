import { Chunk, ChunkBase } from "../chunk";
import { Object3D, BufferGeometry, Mesh, Float32BufferAttribute, Color, MeshLambertMaterial, MeshBasicMaterial } from "three";
import { random } from "../../util/random";
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';

export class RiverChunk extends ChunkBase implements Chunk {
    
    // literal size
    static readonly chunkSize: number = 10;

    private grassGeometry: BufferGeometry;
    private grassVericesAttr: Float32BufferAttribute;

    private mountainGeometry: BufferGeometry;
    private mountainVerticesAttr: Float32BufferAttribute;
    private mountain2Geometry: BufferGeometry;
    private mountain2VerticesAttr: Float32BufferAttribute;

    // private snowGeometry: BufferGeometry;
    // private snowVertices:


    // parts (objects + chunk parts)
    // - tree (Mesh)     possibly instanced for entire game. Move all trees and change them as they go behind camera?
    // - chunk part (Mesh)

    constructor() {
        super();
    }

    // setup chunk
    init() {
        // add geometries
        // grass
        const indices = [];
        for (let zi = 0; zi < 21 - 1; zi++) {
            for (let xi = 0; xi < 21 - 1; xi++) {
                const a = zi * 21 + xi;
                const b = (zi + 1) * 21 + xi;
                indices.push(
                    a, a+1, b,
                    a+1, b+1, b);
            }
        }
        const emptyArr = [];
        for (let i = 0; i < 1323; i++) {
            emptyArr.push(0);
        }
        this.grassVericesAttr = new Float32BufferAttribute(emptyArr, 3);
        this.grassGeometry = new BufferGeometry();
        this.grassGeometry.setAttribute('position', this.grassVericesAttr);
        this.grassGeometry.setIndex(indices);

        this.mountainVerticesAttr = new Float32BufferAttribute(emptyArr, 3);
        this.mountainGeometry = new BufferGeometry();
        this.mountainGeometry.setAttribute('position', this.mountainVerticesAttr);
        this.mountainGeometry.setIndex(indices);

        this.mountain2VerticesAttr = new Float32BufferAttribute(emptyArr, 3);
        this.mountain2Geometry = new BufferGeometry();
        this.mountain2Geometry.setAttribute('position', this.mountain2VerticesAttr);
        this.mountain2Geometry.setIndex(indices);


        (this as any).grassMesh = new Mesh(this.grassGeometry, new MeshLambertMaterial({ color: 0x46E777}));
        this.add((this as any).grassMesh);
        // mountain
        this.add(new Mesh(this.mountainGeometry, new MeshLambertMaterial({color: 'grey'})));
        this.add(new Mesh(this.mountain2Geometry, new MeshLambertMaterial({color: 'grey'})));
        // snow
    }

    // generate
    generate(seed: number): number {
        let rand: any = {nextSeed: seed};
        const grassVerts = [];
        const mountainVerts = [];
        const mountain2Verts = [];
        for (let z = 5; z >= -5; z -= 0.5) {
            const width = 5;
            if (z == -5) {
                seed = rand.nextSeed;
            }
            rand = random(rand.nextSeed, 3.5, 5);
            let mountainAngle = rand.random;
            for (let x = -15; x <= -5; x+= 0.5) {
                let y = 1 / (mountainAngle * mountainAngle) * ((x * x) - (width * width)) + 1;
                mountain2Verts.push(x, y, z);
            }
            for (let x = -5; x <= 5; x+= 0.5) {
                rand = random(rand.nextSeed, -0.05, 0.05);
                let y = x * x / width / width + rand.random;
                grassVerts.push(x, y, z);
            }
            for (let x = 5; x <= 15; x+= 0.5) {
                let y = 1 / (mountainAngle * mountainAngle) * ((x * x) - (width * width)) + 1;
                mountainVerts.push(x, y, z);
            }
        }
        // console.log(grassVerts);
        // console.log(grassVerts.length);
        // console.log(grassVerts.length / 3);
        this.grassVericesAttr.set(grassVerts);
        this.grassGeometry.computeVertexNormals();
        // this.add(new VertexNormalsHelper((this as any).grassMesh, 2, 0x00ff00));
        this.mountainVerticesAttr.set(mountainVerts);
        this.mountainGeometry.computeVertexNormals();

        this.mountain2VerticesAttr.set(mountain2Verts);
        this.mountain2Geometry.computeVertexNormals();
        return seed;
    }

    // Update tree positions
    update() {

    }
}