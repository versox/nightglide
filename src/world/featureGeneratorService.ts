import { Color } from "three";

enum RIVER {
    START,
    PIECE,
    END
}

interface GROUND {
    getY: (x:number, width: number, rand: number) => number,
    color: Color}
const GROUND = {
    GREEN_ROLLING: {
        getY(x, width, rand): number {
            return x * x / width / width + rand;
        },
        color: new Color(0x46E777)
    }
}

interface HILLS {
    getY: (x: number, width: number, angle: number) => number,
    color: Color}
const HILLS = {
    NORMAL: {
        getY(x, width, angle): number {
            return 1 / (angle * angle) * ((x * x) - (width * width)) + 1
        },
        color: new Color('grey')
    }
}


interface Features {
    riverType: RIVER,
    groundType: GROUND,
    hillsType: HILLS,
    entities?: {}
}

class FeatureGenerator {
    constructor() {

    }

    getFeatures(): Features {
        return {
            riverType: RIVER.PIECE,
            groundType: GROUND.GREEN_ROLLING,
            hillsType: HILLS.NORMAL
        }
    }
}

export type FeatureGeneratorT = {
    getFeatures: () => Features
}

let generator = null;

export function getGenerator(): FeatureGeneratorT {
    if(!generator) {
        generator = new FeatureGenerator();
    }
    return generator;
}