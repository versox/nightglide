import { Color, Scene, Vector3 } from "three";
import { InstanceRoller } from "./instanceRoller";
import { Assets } from "../util/assets";
import { random } from "../util/random";

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
    ring?: Vector3 | null,
    asset?: any
}

class FeatureGenerator {
    private count = 0;
    private featuresRandom = random((3 * 9301 + 49297) % 233280);

    private readonly STARTER = {
        riverType: RIVER.PIECE,
        groundType: GROUND.GREEN_ROLLING,
        hillsType: HILLS.NORMAL,
        asset: Assets.getAsset('Tree')
    };

    getFeatures(): Features {
        let features: Features;
        
        if (this.count < 2) {
            features = this.STARTER;
        } else {
            features = this.STARTER;
            
            if (this.count % 3 == 0) {
                features = Object.assign({}, features);
                features.ring = new Vector3(
                    this.featuresRandom.random(-5, 5),
                    this.featuresRandom.random(3, 6),
                     0); 
            }
        }
        
        this.count++;
        this.featuresRandom = random(this.featuresRandom.nextSeed);
        return features;
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