import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

let loader: GLTFLoader = null;

export const Assets = {
    async loadAssets(source: string)  {
        if(!loader) {
            loader = new GLTFLoader;
        }
        await new Promise((res, rej) => {
            loader.load(
                source,
                (gltf) => {
                    gltf.scene.children.forEach((asset) => {
                        // console.log(asset);
                        this[asset.name] = asset;
                    });
                    res();
            });
        });
    },
    getAsset(assetName) {
        const asset = this[assetName];
        // console.log(assetName);
        // console.log(asset);
        if (!asset) {
            throw `Asset not loaded! ${assetName}`;
        }
        return asset;
    }
}