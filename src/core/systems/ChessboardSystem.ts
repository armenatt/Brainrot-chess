import { Vector3 } from "three";
import type { Chessboard } from "../components/Chessboard";
import type { Transform } from "../components/Transform";
import type { EventBus } from "../EventBus";
import type { World } from "../World";

export class ChessboardSystem {
  private oldCellId: number = 0;

  constructor(
    public world: World,
    public chessboard: Chessboard,
    private events: EventBus
  ) {
    this.events.on("unit:placed", ({ cellId, unitId, boardY }) => {
      const draggingT = this.world.transforms.get(unitId!)!;
      const oldT = world.transforms.get(this.oldCellId)!;

      if (cellId === null) {
        this.revert(draggingT, new Vector3(oldT.x, boardY, oldT.z));
        return;
      }

      const hoveredCellT = this.world.transforms.get(cellId)!;
      const unit = this.chessboard.placements.get(cellId);

      if (unit && this.oldCellId) {
        this.swapUnits(cellId, this.oldCellId, boardY);
        return;
      }

      this.chessboard.placements.delete(this.oldCellId);
      this.chessboard.placements.set(cellId, unitId);
      draggingT.x = hoveredCellT.x;
      draggingT.y = boardY;
      draggingT.z = hoveredCellT.z;
    });

    events.on("unit:picked", ({ unitId }) => {
      if (unitId) {
        this.oldCellId = this.findCellForUnit(unitId);
      }
    });
  }

  findCellForUnit(unitId: number) {
    for (const [cellId, unit] of this.chessboard.placements) {
      if (unit === unitId) return cellId;
    }

    return null;
  }

  swapUnits(cellId: number, oldCellId: number, boardY: number) {
    const unit = this.chessboard.placements.get(oldCellId);
    const newUnit = this.chessboard.placements.get(cellId);

    const unitT = this.world.transforms.get(unit!)!;
    const newUnitT = this.world.transforms.get(newUnit!)!;

    const cellT = this.world.transforms.get(oldCellId!)!;
    const newCellT = this.world.transforms.get(cellId!)!;

    unitT.x = newCellT.x;
    unitT.y = boardY;
    unitT.z = newCellT.z;

    this.chessboard.placements.set(oldCellId, newUnit!);

    newUnitT.x = cellT.x;
    newUnitT.y = boardY;
    newUnitT.z = cellT.z;

    this.chessboard.placements.set(cellId, unit!);
  }

  revert(t: Transform, oldPosition: Vector3) {
    t.x = oldPosition.x;
    t.y = oldPosition.y;
    t.z = oldPosition.z;
  }

  update() {}
}
