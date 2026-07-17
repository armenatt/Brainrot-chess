import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class AssetManager {
  private models = new Map<string, THREE.Object3D>();
  private loader = new THREE.LoadingManager();

  async preload(manifest: Record<string, string>) {
    const gltfLoader = new GLTFLoader(this.loader);
    await Promise.all(
      Object.entries(manifest).map(async ([key, url]) => {
        const gltf = await gltfLoader.loadAsync(`src/assets/${url}`);

        const group = gltf.scene;

        group.name = key;
        this.models.set(key, group);
      })
    );
  }

  cloneModel(key: string): THREE.Group {
    const source = this.models.get(key);
    if (!source) throw new Error(`Model not loaded: ${key}`);

    return source.clone(true) as THREE.Group;
  }
}
