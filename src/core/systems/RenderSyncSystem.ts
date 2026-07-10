import type { World } from "../World";
import * as THREE from "three";

export class RenderSyncSystem {
  constructor(private scene: THREE.Scene, private world: World) {}

  update() {
    for (const id of this.world.pendingSpawns) {
      const mesh = this.world.meshes.get(id);

      if (mesh) this.scene.add(mesh);
    }

    this.world.pendingSpawns.length = 0;

    for (const mesh of this.world.pendingDespawnMeshes) {
      this.scene.remove(mesh);
    }

    this.world.pendingDespawnMeshes.length = 0;

    for (const [id, t] of this.world.transforms) {
      const mesh = this.world.meshes.get(id);
      if (mesh) mesh?.position.set(t.x, t.y, t.z);
    }

    for (const [id, r] of this.world.rotations) {
      const mesh = this.world.meshes.get(id);
      if (mesh)
        mesh.rotation.set(
          THREE.MathUtils.degToRad(r.x),
          THREE.MathUtils.degToRad(r.y),
          THREE.MathUtils.degToRad(r.z)
        );
    }
  }
}
