import { TeapotGeometry } from "three/examples/jsm/Addons.js";
import { Transform } from "./components/Transform";
import * as THREE from "three";
import { Rotation } from "./components/Rotation";
import type { Draggable } from "./components/Draggable";
import type { Chessboard } from "./components/Chessboard";
import { spawnEntityWithModel } from "./spawn-factories/common";
import type { ICharacter } from "../types/character";
import { Unit } from "./components/Unit";
import type { AssetManager } from "./asset-manager/AssetManager";

export class World {
  nextEntityId: number = 0;
  // Archetypes
  players: Set<number> = new Set();
  cameras: Set<number> = new Set();
  cells: Set<number> = new Set();
  extras: Set<number> = new Set();

  // Components
  units: Map<number, Unit> = new Map();
  transforms: Map<number, Transform> = new Map();
  rotations: Map<number, Rotation> = new Map();
  meshes: Map<number, THREE.Object3D> = new Map();
  draggables: Map<number, Draggable> = new Map();
  chessboards: Map<number, Chessboard> = new Map();

  // Queues for spawning and despawning
  pendingSpawns: number[] = [];
  pendingDespawnMeshes: THREE.Object3D[] = [];

  private componentsMap = [
    this.units,
    this.transforms,
    this.rotations,
    this.meshes,
    this.draggables,
  ];

  createEntity() {
    return this.nextEntityId++;
  }

  destroyEntity(entityId: number) {
    const mesh = this.meshes.get(entityId);

    if (mesh) this.pendingDespawnMeshes.push(mesh);

    for (const component of this.componentsMap) component.delete(entityId);
  }

  spawnPlayer(position: { x: number; y: number; z: number }) {
    const entityId = this.createEntity();
    this.players.add(entityId);
    this.pendingSpawns.push(entityId);

    const t = new Transform(position.x, position.y, position.z);
    const r = new Rotation(0, 0, 0);

    const mesh = new THREE.Mesh(
      new TeapotGeometry(1),
      new THREE.MeshStandardMaterial({ color: 0x008000, roughness: 0.1 })
    );

    mesh.position.set(t.x, t.y, t.z);
    mesh.rotation.set(r.x, r.y, r.z);

    this.transforms.set(entityId, t);
    this.rotations.set(entityId, r);
    this.meshes.set(entityId, mesh);

    return entityId;
  }

  spawnUnit(
    character: ICharacter,
    cellId: number,
    level: number,
    chessboardId: number,
    manager: AssetManager
  ) {
    const chessboard = this.chessboards.get(chessboardId)!;
    const cellT = this.transforms.get(cellId)!;

    const entityId = spawnEntityWithModel(
      this,
      manager.cloneModel(character.model),
      cellT
    );
    const max = new Transform(
      chessboard.max.x,
      chessboard?.max.y,
      chessboard?.max.z
    );

    const lastExtraT = this.transforms.get(
      chessboard?.extras[chessboard?.extras.length - 1].entityId
    );

    const unit = new Unit(character, level);
    console.log(unit);

    chessboard.placements.set(cellId, entityId);

    this.units.set(entityId, unit);

    max.z = lastExtraT!.z;
    this.draggables.set(entityId, {
      min: chessboard!.min,
      max: chessboard!.max,
    });

    const SCALE_PER_LEVEL = 1.2;
    const scale = Math.pow(SCALE_PER_LEVEL, level - 1);
    console.log(this.meshes.get(entityId));

    this.meshes.get(entityId)!.scale.setScalar(scale);

    return entityId;
  }
}
