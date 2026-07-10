import type { Vector3 } from "three";

export type Cell = {
  row: number;
  col: number;
  entityId: number;
};

export class Chessboard {
  constructor(
    public min: Vector3,
    public max: Vector3,
    public rows: number,
    public cols: number,
    public grid: Cell[][],
    public extras: Cell[],
    public placements: Map<number, number>
  ) {}
}
