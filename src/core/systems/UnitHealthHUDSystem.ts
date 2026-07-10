import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import type { World } from "../World";

export class UnitHealthHUDSystem {
  private healthBars: Map<number, Mesh> = new Map();

  constructor(private world: World) {
    this.initHealthbars();
  }

  initHealthbars() {
    for (const [unitId, { maxHealth, health }] of this.world.units) {
      const unitM = this.world.meshes.get(unitId);

      if (health < maxHealth) {
        const hpMesh = this.createNewHealthBar();
        this.healthBars.set(unitId, hpMesh);
        unitM?.geometry.computeBoundingBox();
        hpMesh.position.y = unitM!.geometry.boundingBox!.max.y;
        hpMesh.scale.x = health / maxHealth;
        unitM?.add(hpMesh);
      }
    }
  }

  update() {
    for (const [unitId, { maxHealth, health }] of this.world.units) {
      const unitT = this.world.transforms.get(unitId);
      const unitM = this.world.meshes.get(unitId);

      if (health < maxHealth) {
        if (this.healthBars.get(unitId)) {
          this.healthBars.get(unitId)!.scale.x = health / maxHealth;
        } else {
          const hpMesh = this.createNewHealthBar();
          hpMesh.position.y = unitT!.y + 5 + 0.1;
          hpMesh.position.x = -(1 - health / maxHealth);
          hpMesh.scale.x = health / maxHealth;
          this.healthBars.set(unitId, hpMesh);

          unitM?.add(hpMesh);
        }
      } else {
        if (this.healthBars.get(unitId)) unitM!.remove(unitM!.children[0]);
      }
    }
  }

  createNewHealthBar() {
    return new Mesh(
      new PlaneGeometry(2, 0.3),
      new MeshBasicMaterial({ color: "green" })
    );
  }
}
