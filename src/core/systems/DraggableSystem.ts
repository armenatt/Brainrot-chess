import {
  Object3D,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  type Camera,
} from "three";
import type { World } from "../World";
import type { EventBus } from "../EventBus";

const LIFT_HEIGHT = 2;

export class DraggableSystem {
  private raycaster: Raycaster = new Raycaster();
  private cellRaycaster: Raycaster = new Raycaster();
  private mouseCurrent: Vector2 = new Vector2();
  private dragging: number | null = null;
  private dragPlane = new Plane(new Vector3(0, 1, 0));
  private dragOffset = new Vector3();
  private hitPoint = new Vector3();
  private hoveredCell: number | null = null;

  private boardY: number = 0;

  constructor(
    private world: World,
    private camera: Camera,
    private domElement: HTMLElement,
    private events: EventBus
  ) {
    domElement.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", () => {
      if (this.dragging) {
        events.emit("unit:placed", {
          cellId: this.hoveredCell,
          unitId: this.dragging,
          boardY: this.boardY,
        });
      }

      this.dragging = null;
      this.hoveredCell = null;
    });
  }

  private updatePointer(event: MouseEvent) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouseCurrent.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseCurrent.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.dragging === null) return;
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.mouseCurrent, this.camera);

    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.hitPoint)) {
      const t = this.world.transforms.get(this.dragging)!;
      let nx = this.hitPoint.x + this.dragOffset.x;
      let nz = this.hitPoint.z + this.dragOffset.z;

      const bounds = this.world.draggables.get(this.dragging);

      if (bounds) {
        nx = Math.max(bounds.min.x, Math.min(bounds.max.x, nx));
        nz = Math.max(bounds.min.z, Math.min(bounds.max.z, nz));
      }

      t.x = nx;
      t.z = nz;
    }
    this.hoveredCell = this.pickCell();
  };

  private onMouseDown = (event: MouseEvent) => {
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.mouseCurrent, this.camera);

    const draggableMeshes = [...this.world.draggables.keys()].flatMap((id) => {
      const obj = this.world.meshes.get(id);
      return obj ? [obj] : [];
    });

    const hits = this.raycaster.intersectObjects(draggableMeshes);
    if (!hits[0]) return;

    if (!hits[0]) return;

    const entityId = this.findEntityFromHit(hits[0].object);
    if (entityId === null || !this.world.draggables.has(entityId)) return;

    this.dragging = entityId;

    const t = this.world.transforms.get(entityId)!;
    this.boardY = t.y;
    t.y += LIFT_HEIGHT;
    this.dragPlane.constant = -(this.boardY + LIFT_HEIGHT);

    const hoveredCell = this.pickCell();
    this.hoveredCell = hoveredCell;
    this.events.emit("unit:picked", { unitId: entityId });
  };

  private findEntityFromHit(object: Object3D): number | null {
    let current: Object3D | null = object;
    while (current) {
      for (const [id, mesh] of this.world.meshes) {
        if (mesh === current) return id;
      }
      current = current.parent;
    }
    return null;
  }

  pickCell() {
    const t = this.world.transforms.get(this.dragging!);

    this.cellRaycaster.set(
      new Vector3(t?.x, t?.y, t?.z),
      new Vector3(0, -1, 0)
    );

    const entries = [...this.world.cells].map((id) => ({
      id,
      mesh: this.world.meshes.get(id)!,
    }));

    const hits = this.cellRaycaster.intersectObjects(
      entries.map((entry) => entry.mesh)
    );

    if (!hits[0]) return null;

    const entry = entries.find((entry) => entry.mesh === hits[0].object);

    return entry?.id ?? null;
  }

  saveMaterial() {}

  update() {}
}
