import { Vector3 } from "three";
import type { Chessboard } from "../components/Chessboard";
import type { Transform } from "../components/Transform";
import type { EventBus } from "../EventBus";
import type { World } from "../World";
import type { ICharacter } from "../../types/character";
import type { AssetManager } from "../asset-manager/AssetManager";
import { MAX_UNIT_LEVEL } from "../constants";

export class ChessboardSystem {
  private oldCellId: number | null = null;
  private unitMap: Map<number, Map<ICharacter, Set<number>>> = new Map();

  constructor(
    public world: World,
    public chessboard: Chessboard,
    private events: EventBus,
    private manager: AssetManager
  ) {
    this.populateUnitMap();

    this.events.on("unit:placed", ({ cellId, unitId, boardY }) => {
      this.placeUnit(cellId, unitId, boardY);
    });

    events.on("unit:picked", ({ unitId }) => {
      if (unitId) {
        this.oldCellId = this.findCellForUnit(unitId);
      }
    });

    this.events.on("unit:spawned", ({ unitId }) => {
      this.mergeAndLevelUpUnits(unitId);
      console.log(this.unitMap);
    });
  }

  findCellForUnit(unitId: number) {
    for (const [cellId, unit] of this.chessboard.placements) {
      if (unit === unitId) return cellId;
    }

    return null;
  }

  mergeAndLevelUpUnits(newUnitId: number) {
    this.populateUnitMap();

    let merged = false;

    for (const [level, map] of this.unitMap) {
      if (level === MAX_UNIT_LEVEL) continue;

      for (const [char, units] of map) {
        if (units.size < 3) continue;

        units.forEach((unit) => {
          if (unit !== newUnitId) {
            this.chessboard.placements.delete(this.findCellForUnit(unit)!);
          }

          this.world.destroyEntity(unit);
          units.delete(unit);
        });

        const newUnit = this.world.spawnUnit(
          char,
          this.findCellForUnit(newUnitId)!,
          level + 1,
          this.chessboard.entityId,
          this.manager
        );

        this.unitMap.get(level + 1)?.set(char, new Set([newUnit]));

        merged = true;
      }
    }

    if (merged) this.mergeAndLevelUpUnits(newUnitId);
  }

  populateUnitMap() {
    for (const map of this.unitMap.values()) map.clear();

    for (const [unitId, { character, level }] of this.world.units) {
      if (!this.unitMap.get(level)) this.unitMap.set(level, new Map());

      if (!this.unitMap.get(level)!.has(character)) {
        this.unitMap.get(level)!.set(character, new Set([unitId]));
        continue;
      }

      if (this.unitMap.get(level)!.has(character)) {
        this.unitMap.get(level)!.get(character)?.add(unitId);
      }
    }
  }

  placeUnit(cellId: number | null, unitId: number, boardY: number) {
    const draggingT = this.world.transforms.get(unitId!)!;
    const oldT = this.world.transforms.get(this.oldCellId!);

    if (cellId === null) {
      if (oldT) {
        this.revert(draggingT, new Vector3(oldT.x, boardY, oldT.z));
      }
      return;
    }

    const hoveredCellT = this.world.transforms.get(cellId)!;
    const unit = this.chessboard.placements.get(cellId);

    if (unit && this.oldCellId) {
      this.swapUnits(cellId, this.oldCellId, boardY);
      return;
    }
    if (this.oldCellId) {
      this.chessboard.placements.delete(this.oldCellId);
    }
    this.chessboard.placements.set(cellId, unitId);
    draggingT.x = hoveredCellT.x;
    draggingT.y = boardY;
    draggingT.z = hoveredCellT.z;
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
