"use strict";

import { Monster } from "./game/archetypes/monster.js";
import { Player } from "./game/archetypes/player.js";
import { ChunkManager } from "./game/chunk-manager.js";
import { EntityManager } from "./game/entity-manager.js";
import { World } from "./game/map-generation.js";
import { SERDE } from "./lib/serde.js";

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const bgArt = document.getElementById("bg-art");
const ctx = canvas.getContext("2d");

function testEntityManager() {
  const em = new EntityManager();
  const pid = em.insert(new Player());
  const mid1 = em.insert(new Monster());
  const mid2 = em.insert(new Monster());
  const mid3 = em.insert(new Monster());

  const em2 = EntityManager.from(JSON.parse(JSON.stringify(em)));
  console.log(em);
  console.log(em2);
}

function testChunkManager() {
  let world = new World(1, 0);
  let spawn = world.generateTown();

  let em = new EntityManager();
  em.insert(new Player());

  let cm = new ChunkManager(spawn, world.width, world.height, 2);
  console.log(cm.width);
  console.log(cm.height);
  cm.update(spawn, world, true);
  console.log(SERDE.posToStr(spawn));
  console.log(cm.getTile(spawn));
  console.log(cm.chunksAvailable());
  console.log(Object.keys(cm.chunkMap));
}

//testEntityManager();
testChunkManager();
