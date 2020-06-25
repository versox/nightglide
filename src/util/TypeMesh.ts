import { Mesh, Geometry, Material } from "three";

// Mesh that can have multiple materials depending on it's type
export class TypeMesh extends Mesh {

    tipe: string;

    get material() {
        return this.types[this.tipe];
    }

    set material(mat) {}

    constructor(geometry: Geometry, public types: { [key: string]: Material }) {
        super(geometry, types[Object.keys(types)[0]]);
        this.tipe = Object.keys(types)[0];
    }
}