"use strict";

import { Player } from "./game/archetypes/player.js";
import { Chunk, ChunkManager } from "./game/chunk-manager.js";
import { EntityManager } from "./game/entity-manager.js";
import { Cardinal } from "./game/types.js";
import { RingBuffer } from "./lib/ring-buffer.js";

//const T = require("./game/types.js");

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const bgArt = document.getElementById("bg-art");
const ctx = canvas.getContext("2d");

let ev = new RingBuffer;
function testEnttityManager() {
  let em = new EntityManager();
  em.insert(new Player());
  em.insert(new Monster());
  em.insert(new Monster());
  em.insert(new Monster());
  em.insert(new Monster());
  em.insert(new Monster());

  console.log(em.data);
}

function testChunkManager() {
  let cm = new ChunkManager;
    /**
      * @param {ChunkManager} cm
      */
    function logChunkManager(cm) {
      let outstr = "";
      outstr += '(' + cm.NW.position.x + ',' + cm.NW.position.y + ') ';
      outstr += '(' + cm.N.position.x + ',' + cm.N.position.y + ') ';
      outstr += '(' + cm.NE.position.x + ',' + cm.NE.position.y + ') ';
      outstr += '\n';
      outstr += '(' + cm.W.position.x + ',' + cm.W.position.y + ') ';
      outstr += '(' + cm.root.position.x + ',' + cm.root.position.y + ') ';
      outstr += '(' + cm.E.position.x + ',' + cm.E.position.y + ') ';
      outstr += '\n';
      outstr += '(' + cm.SW.position.x + ',' + cm.SW.position.y + ') ';
      outstr += '(' + cm.S.position.x + ',' + cm.S.position.y + ') ';
      outstr += '(' + cm.SE.position.x + ',' + cm.SE.position.y + ') ';
      outstr += '\n';
      console.log(outstr);
    }

  logChunkManager(cm);
  console.log(JSON.stringify(cm.cache));

  cm.reroot(Cardinal.N, new Chunk({x:-16,y:-32}), new Chunk({x:0,y:-32}), new Chunk({x:16,y:-32}));

  logChunkManager(cm);
  console.log(Object.keys(cm.cache));

  cm.reroot(Cardinal.S, cm.cache['{"x":-16,"y":16}'], cm.cache['{"x":0,"y":16}'], cm.cache['{"x":16,"y":16}']);
  logChunkManager(cm);
}
