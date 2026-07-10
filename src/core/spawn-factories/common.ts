import { Rotation } from "../components/Rotation";
import { Transform } from "../components/Transform";
import type { World } from "../World";
import * as THREE from "three";

export function spawnEntityWithMesh(
  world: World,
  geometry: THREE.BufferGeometry,
  material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 }
) {
  const entityId = world.createEntity();

  world.pendingSpawns.push(entityId);

  const t = new Transform(position.x, position.y, position.z);
  const r = new Rotation(rotation.x, rotation.y, rotation.z);

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(t.x, t.y, t.z);
  world.rotations.set(entityId, r);
  world.transforms.set(entityId, t);
  world.meshes.set(entityId, mesh);

  return entityId;
}
