import type { Cell } from "../components/Chessboard";
import type { World } from "../World";
import { spawnEntityWithMesh } from "./common";
import * as THREE from "three";

export function createChessboard(
  world: World,
  position = { x: 0, y: 0, z: 0 }
) {
  const chessboardId = world.createEntity();

  const ROWS_COUNT = 10;
  const COLS_COUNT = 10;
  const CELL_SIZE = 2;

  const EXTRAS_COUNT = 6;

  const cells = buildChessboard(
    world,
    ROWS_COUNT,
    COLS_COUNT,
    CELL_SIZE,
    position
  );

  const min = world.meshes.get(cells[0][0].entityId)!.position;
  const chessboardMax = world.meshes.get(
    cells[ROWS_COUNT - 1][COLS_COUNT - 1].entityId
  )!.position;

  const extras = buildChessboard(world, 1, EXTRAS_COUNT, CELL_SIZE, {
    ...position,
    x: min.x + 4,
    z: chessboardMax.z + 4,
  })[0];

  const extrasMax = world.transforms.get(extras[extras.length - 1].entityId)!;

  const max = new THREE.Vector3(chessboardMax.x, chessboardMax.y, extrasMax.z);

  world.chessboards.set(chessboardId, {
    cols: ROWS_COUNT,
    rows: COLS_COUNT,
    grid: cells,
    min,
    max,
    extras,
    placements: new Map(),
  });

  return chessboardId;
}

function buildChessboard(
  world: World,
  rowsCount: number,
  colsCount: number,
  cellSize: number,
  position: { x: number; y: number; z: number }
) {
  const cells: Cell[][] = [];

  for (let row = 0; row < rowsCount; row++) {
    const cols: Cell[] = [];
    for (let col = 0; col < colsCount; col++) {
      const newCellId = spawnEntityWithMesh(
        world,
        new THREE.PlaneGeometry(cellSize, cellSize),
        new THREE.MeshStandardMaterial({
          color: (col + row) % 2 == 0 ? 0x000000 : 0xffffff,
          roughness: 0.4,
        }),
        {
          x: position.x + col * cellSize,
          y: position.y,
          z: position.z + row * cellSize,
        },
        { x: -90, y: 0, z: 0 }
      );
      world.cells.add(newCellId);
      cols.push({ col, row, entityId: newCellId });
    }
    cells.push(cols);
  }
  return cells;
}
