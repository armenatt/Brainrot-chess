import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class AssetManager {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private textures = new Map<string, THREE.Texture>();
  private loader = new THREE.LoadingManager();

  async preload(manifest: Record<string, string>) {
    const gltfLoader = new GLTFLoader(this.loader);
    await Promise.all(
      Object.entries(manifest).map(async ([key, url]) => {
        const gltf = await gltfLoader.loadAsync(url);

        const mesh = gltf.scene.children[0].children[0].children[0].children[0]
          .children[0] as THREE.Mesh;
        mesh.geometry.rotateX(THREE.MathUtils.degToRad(-90));
        mesh.geometry.rotateY(THREE.MathUtils.degToRad(180));
        this.geometries.set(key, mesh.geometry);
        this.materials.set(key, mesh.material);
      })
    );
  }

  geometry(key: string) {
    if (!this.geometries.has(key)) throw new Error(`Asset not loaded: ${key}`);

    return this.geometries.get(key)!;
  }

  material(key: string) {
    return this.materials.get(key)!;
  }
}
