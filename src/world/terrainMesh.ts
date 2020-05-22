import { Material, Mesh } from "three";

export class TerrainMesh extends Mesh {

    constructor(material: Material) {
        super();
        this.material = material;
    }
}