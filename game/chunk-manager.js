/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { TileGrid } from "../lib/grid.js";

const T = require("./types.js");

export class Chunk {
  
  constructor(position={x:0, y:0}) {
    this.position = position;
    this.tileGrid = new TileGrid(16);
  }

  static get size() { return 16; }
}

/**
 * Constructor for Chunk.
 * @param {T.Position} position - The world position of the chunk.
 * @returns {Chunk}
 */
function newChunk(position) {
  return {
    position: position,
    tileGrid: new TileGrid(16),
    visGrid:  new BitGrid(16),
    colGrid:  new BitGrid(16),
    entGrid:  new IDGrid(16),
  };
}

/**
 * Constructor for ChunkMap.
 * @returns {T.ChunkMap}
 */
function newChunkMap() {
  return {
    cache: new Map(),
    root: newChunk({x:   0, y:   0}),
    N:    newChunk({x:   0, y: -16}),
    NE:   newChunk({x:  16, y: -16}),
    E:    newChunk({x:  16, y:   0}),
    SE:   newChunk({x:  16, y:  16}),
    S:    newChunk({x:   0, y:  16}),
    SW:   newChunk({x: -16, y:  16}),
    W:    newChunk({x: -16, y:   0}),
    NW:   newChunk({x: -16, y: -16}),
  };
}

