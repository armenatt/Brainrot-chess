import * as THREE from "three";
import { RenderSyncSystem } from "./core/systems/RenderSyncSystem";
import { World } from "./core/World";
import { DraggableSystem } from "./core/systems/DraggableSystem";
import { ChessboardSystem } from "./core/systems/ChessboardSystem";
import { createChessboard } from "./core/spawn-factories/chessboard";
import { spawnEntityWithMesh } from "./core/spawn-factories/common";
import { AssetManager } from "./core/asset-manager/AssetManager";
import manifest from "./assets/manifest";
import { EventBus } from "./core/EventBus";
import { UnitHealthHUDSystem } from "./core/systems/UnitHealthHUDSystem";
import TungTungSahur from "./core/characters/TungTungSahur";

// Sandbox
// World initiation to be refactored into a separate entity/class

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

camera.position.set(0, 15, 10);
camera.rotateX(THREE.MathUtils.degToRad(-45));
const FIXED_DT = 1 / 60;
let lastNow = performance.now();
let accumulator = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector("#app")?.appendChild(renderer.domElement);

const world = new World();

const manager = new AssetManager();

await manager.preload(manifest);

const chessboard = createChessboard(world, { x: -9, y: 1, z: -15 });
const draggableUnit = world.spawnUnit(
  TungTungSahur,
  world.chessboards.get(chessboard)!.extras[0].entityId,
  chessboard,
  manager.geometry(TungTungSahur.model),
  manager.material(TungTungSahur.model)
);
const draggableUnit2 = world.spawnUnit(
  TungTungSahur,
  world.chessboards.get(chessboard)!.extras[1].entityId,
  chessboard,
  manager.geometry(TungTungSahur.model),
  new THREE.MeshStandardMaterial({ color: "green" })
);

console.log(chessboard);

spawnEntityWithMesh(
  world,
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: 0x90d6ff,
    roughness: 0.4,
  }),
  { x: 0, y: 0, z: 0 },
  { x: -90, y: 0, z: 0 }
);

const events = new EventBus();

const renderSync = new RenderSyncSystem(scene, world);
const draggable = new DraggableSystem(
  world,
  camera,
  renderer.domElement,
  events
);

const chessboardSystem = new ChessboardSystem(
  world,
  world.chessboards.get(chessboard)!,
  events
);

const unitHealthHUDSystem = new UnitHealthHUDSystem(world);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(0, 15, -15);
scene.add(dirLight);

window.addEventListener("keydown", (event) => {
  if (event.key === "d") {
    world.units.get(draggableUnit)!.health -= 1;
    console.log(world.units.get(draggableUnit));
  }
});

function frame(now: number) {
  const dt = (now - lastNow) / 1000;
  lastNow = now;

  accumulator += dt;
  draggable.update();
  renderSync.update();

  while (accumulator >= FIXED_DT) {
    accumulator -= FIXED_DT;
    unitHealthHUDSystem.update();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(frame);
