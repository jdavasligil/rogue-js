/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { BitGrid, IDGrid, TileGrid } from "../lib/grid.js";

const T = require("./types.js");

/** A Chunk is a 16x16 sub-array of the world map used for data streaming. */
export class Chunk {
  /**
   * Create a Chunk.
   * @param {T.Position} position - The world position of the chunk.
   * @returns {Chunk}
   */
  constructor(position={x:0, y:0}) {
    this.position = position;
    this.tileGrid = new TileGrid(16);
    this.visGrid  = new BitGrid(16);
    this.colGrid  = new BitGrid(16);
    this.entGrid  = new IDGrid(16);
  }

  static get size() { return 16; }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new EntityManager(), json);
  }

}

/** The Chunk Manager handles dynamic chunk allocation and deallocation. */
export class ChunkManager {
  /**
   * Create a new ChunkManager.
   * @returns {ChunkManager}
   */
  constructor() {
    this.cache = new Map();
    this.root  = new Chunk({x:   0, y:   0});
    this.N     = new Chunk({x:   0, y: -16});
    this.NE    = new Chunk({x:  16, y: -16});
    this.E     = new Chunk({x:  16, y:   0});
    this.SE    = new Chunk({x:  16, y:  16});
    this.S     = new Chunk({x:   0, y:  16});
    this.SW    = new Chunk({x: -16, y:  16});
    this.W     = new Chunk({x: -16, y:   0});
    this.NW    = new Chunk({x: -16, y: -16});
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new EntityManager(), json);
  }
}
