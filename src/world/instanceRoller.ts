import { InstancedMesh, Geometry, Material, Vector3, Matrix4 } from "three";

type UpdateInstance = (position: Vector3) => void;

/*
    Used to position the instances from an InstancedMesh in a queue like fashion
*/
export class InstanceRoller extends InstancedMesh {

    private index = 0;

    constructor(geometry: Geometry, material: Material, count: number) {
        super(geometry, material, count);
    }

    placeNext(position: Vector3, scale: number): UpdateInstance {
        const i = this.index;
        const update = (position) => {
            const matrix = new Matrix4();
            matrix.setPosition(position);
            matrix.scale(new Vector3(scale, scale, scale));
            this.setMatrixAt(i, matrix);
            // console.log('update');
        }
        update(position);
        this.index++;
        if(this.index >= this.count) { this.index = 0 };
        return update;
    }
}