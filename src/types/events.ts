export interface IGameEvents {
  "unit:placed": {
    unitId: number;
    cellId: number | null;
    boardY: number;
  };
  "unit:picked": { unitId: number };
  "unit:spawned": { unitId: number; cellId: number };
}
