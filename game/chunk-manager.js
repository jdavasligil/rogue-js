/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { BitGrid, IDGrid, TileGrid } from "../lib/grid.js";
import { distance2DLInf } from "../lib/game-math.js";
import { parsePosition } from "../lib/serde.js";
import { Cardinal } from "./types.js";

//const T = require("./types.js");

/** A Chunk is a 16x16 sub-array of the world map used for data streaming. */
export class Chunk {
  /**
   * Create a Chunk.
   * @param {T.Position} position - The world position of the chunk.
   * @param {TileGrid | undefined} tileGrid - Optional tile grid.
   * @param {BitGrid | undefined} visGrid - Optional visibility bit grid.
   * @param {BitGrid | undefined} colGrid - Optional collision bit grid.
   * @param {IDGrid | undefined} idGrid - Optional ID grid.
   * @returns {Chunk}
   */
  constructor(position={x:0, y:0},
              tileGrid=undefined,
              visGrid=undefined,
              colGrid=undefined,
              idGrid=undefined) {
    this.position = position;
    this.tileGrid = (tileGrid) ? tileGrid : new TileGrid(Chunk.size); 
    this.visGrid  = (visGrid)  ? visGrid  : new BitGrid(Chunk.size); 
    this.colGrid  = (colGrid)  ? colGrid  : new BitGrid(Chunk.size); 
    this.idGrid   = (idGrid)   ? idGrid   : new IDGrid(Chunk.size); 
  }

  static get size() { return 16; }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return new Chunk(json.position,
                     TileGrid.from(json.tileGrid),
                     BitGrid.from(json.visGrid),
                     BitGrid.from(json.colGrid),
                     IDGrid.from(json.idGrid));
  }
}

/** The Chunk Manager handles dynamic chunk allocation and deallocation. */
export class ChunkManager {
  /**
   * Create a new ChunkManager.
   * @returns {ChunkManager}
   * @params {Object.<string, Chunk>} cache - A map from position -> chunk.
   * @params {Chunk | undefined} root - The chunk containing the player.
   * @params {Chunk | undefined} N    - The chunk north of the player.
   * @params {Chunk | undefined} NE   - The chunk northeast of the player.
   * @params {Chunk | undefined} E    - The chunk east of the player.
   * @params {Chunk | undefined} SE   - The chunk southeast of the player.
   * @params {Chunk | undefined} S    - The chunk south of  the player.
   * @params {Chunk | undefined} SW   - The chunk southwest of the player.
   * @params {Chunk | undefined} W    - The chunk west of the player.
   * @params {Chunk | undefined} NW   - The chunk northwest of the player.
   */
  constructor(cache={},
              root=undefined,
              N=undefined,
              NE=undefined,
              E=undefined,
              SE=undefined,
              S=undefined,
              SW=undefined,
              W=undefined,
              NW=undefined) {
    this.cache = cache;
    this.root  = (root) ? root : new Chunk({x: 0,           y: 0});
    this.N     = (N)    ? N    : new Chunk({x: 0,           y: -Chunk.size});
    this.NE    = (NE)   ? NE   : new Chunk({x: Chunk.size,  y: -Chunk.size});
    this.E     = (E)    ? E    : new Chunk({x: Chunk.size,  y: 0});
    this.SE    = (SE)   ? SE   : new Chunk({x: Chunk.size,  y: Chunk.size});
    this.S     = (S)    ? SE   : new Chunk({x: 0,           y: Chunk.size});
    this.SW    = (SW)   ? SW   : new Chunk({x: -Chunk.size, y: Chunk.size});
    this.W     = (W)    ? W    : new Chunk({x: -Chunk.size, y: 0});
    this.NW    = (NW)   ? NW   : new Chunk({x: -Chunk.size, y: -Chunk.size});
  }

  // A temporary position store used during pruning that reduces overhead.
  static positionStore = {x: 0, y: 0};

  // Chunks further than this (square / L-Inf) grid distance will be pruned
  // distance > 2 otherwise cache will delete adjacent values
  // larger values tradeoff space O(n^2) for performance
  static get pruneDistance() { return 5; }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    let deCache = {};
    for (const [key, value] of Object.entries(json.cache)) {
      deCache[key] = Chunk.from(value);
    }
    return new ChunkManager(deCache,
                            Chunk.from(json.root),
                            Chunk.from(json.N),
                            Chunk.from(json.NE),
                            Chunk.from(json.E),
                            Chunk.from(json.SE),
                            Chunk.from(json.S),
                            Chunk.from(json.SW),
                            Chunk.from(json.W),
                            Chunk.from(json.NW));
  }

  /**
   * Reroot the tree based on the given cardinal direction.
   * Triggered by an event when the player moves past the root boundary.
   * Called when new chunk data is loaded.
   * @param {T.Cardinal} cardinal - A cardinal direction.
   * @param {Chunk} topChunk - Top / left most chunk.
   * @param {Chunk} midChunk - Middle chunk.
   * @param {Chunk} bottomChunk - Bottom / right most chunk.
   */
  reroot(cardinal, topChunk, midChunk, bottomChunk) {
    switch(cardinal) {
      case Cardinal.N:
        // 1. Cache the chunks going out of range
        this.cache[JSON.stringify(this.SW.position)] = this.SW;
        this.cache[JSON.stringify(this.S.position)] = this.S;
        this.cache[JSON.stringify(this.SE.position)] = this.SE;

        // 2. Shift chunks that were cached
        this.SW = this.W;
        this.S = this.root;
        this.SE = this.E;

        // 3. Shift root chunk
        this.W = this.NW;
        this.root = this.N;
        this.E = this.NE;

        // 4. Assign new chunks
        this.NW = topChunk;
        this.N = midChunk;
        this.NE = bottomChunk;

        break;

      case Cardinal.E:
        // 1. Cache the chunks going out of range
        this.cache[JSON.stringify(this.NW.position)] = this.NW;
        this.cache[JSON.stringify(this.W.position)] = this.W;
        this.cache[JSON.stringify(this.SW.position)] = this.SW;

        // 2. Shift chunks that were cached
        this.NW = this.N;
        this.W = this.root;
        this.SW = this.S;

        // 3. Shift root chunk
        this.N = this.NE;
        this.root = this.E;
        this.S = this.SE;

        // 4. Assign new chunks
        this.NE = topChunk;
        this.E = midChunk;
        this.SE = bottomChunk;

        break;

      case Cardinal.S:
        // 1. Cache the chunks going out of range
        this.cache[JSON.stringify(this.NW.position)] = this.NW;
        this.cache[JSON.stringify(this.N.position)] = this.N;
        this.cache[JSON.stringify(this.NE.position)] = this.NE;

        // 2. Shift chunks that were cached
        this.NW = this.W;
        this.N = this.root;
        this.NE = this.E;

        // 3. Shift root chunk
        this.W = this.SW;
        this.root = this.S;
        this.E = this.SE;
 
        // 4. Assign new chunks
        this.SW = topChunk;
        this.S = midChunk;
        this.SE = bottomChunk;

        break;

      case Cardinal.W:
        // 1. Cache the chunks going out of range
        this.cache[JSON.stringify(this.NE.position)] = this.NE;
        this.cache[JSON.stringify(this.E.position)] = this.E;
        this.cache[JSON.stringify(this.SE.position)] = this.SE;

        // 2. Shift chunks that were cached
        this.NE = this.N;
        this.E = this.root;
        this.SE = this.S;

        // 3. Shift root chunk
        this.N = this.NW;
        this.root = this.W;
        this.S = this.SW;
 
        // 4. Assign new chunks
        this.NW = topChunk;
        this.W = midChunk;
        this.SW = bottomChunk;

        break;
    }
  }

  /**
   * Prevent the cache from becoming too large by pruning values far from root.
   */
  pruneCache() {
    for (const key of Object.keys(this.cache)) {
      Object.assign(ChunkManager.positionStore, parsePosition(key));
      if (distance2DLInf(ChunkManager.positionStore, this.root.position) > ChunkManager.pruneDistance) {
        delete this.cache[key];
      }
    }
  }
}
