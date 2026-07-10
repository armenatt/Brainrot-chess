import type { Vector3 } from "three";

export class Draggable {
  constructor(public min: Vector3, public max: Vector3) {}
}
