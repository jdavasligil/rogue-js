/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { mulberry32 } from "../lib/fast-random.js";
import { Chunk } from "./chunk-manager.js";
import { Tile } from "./types.js";

// 1. Generate large tilemap.
// 2. Player spawn is always (0,0).
// 3. Chunks dynamically load data based on tilemap underneath.
//      a) Chunk loads tile data from world map
//      b) If found, tile diffs are ran through to update chunk.
//      c) Entities are loaded and placed on map.
//      d) Entity diffs are applied.
//      e) Collision and light are calculated like usual, game continues.
//
//
// CHARACTER
// key: "PC"
// val: "[DATA(SEED+DEPTH)]"

/** Class holding the underlying world template. */ 
export class World {
  /**
   * Create a world template stored using object reference.
   * @returns {World}
   */
  constructor(seed, depth=0) {
    this.seed = seed;
    this.depth = depth; // Zero is surface, positive numbers are lower levels.
    this.defaultTile = Tile.Floor;
    this.tiles = {};
    this.width = 0;
    this.height = 0;
  }

  /** A storage variable for holding tiles temporarily. */
  static tileStore = 0;

  /**
   * Convert a coordinate pair to a unique hash string.
   * @param {number} x - Local map x-coordinate.
   * @param {number} y - Local map y-coordinate.
   * @return {string}
   */
  static coordToString(x, y) {
    return `${x.toString(16)},${y.toString(16)}`;
  }

  /**
   * Insert a tile into the specified location (overwrite existing).
   * @param {Tile} tile - Tile to be inserted into the world.
   * @param {number} x - Local map x-coordinate.
   * @param {number} y - Local map y-coordinate.
   */
  insert(tile, x, y) {
    this.tiles[World.coordToString(x, y)] = tile;
  }
  
  /**
   * Look up a tile at the specified location.
   * @param {number} x_w - x-coordinate in world coordinates. 
   * @param {number} x_w - y-coordinate in world coordinates. 
   * @returns {Tile}
   */
  lookup(x_w, y_w) {
    World.tileStore = this.tiles[World.coordToString(x_w, y_w)];
    if (World.tileStore === undefined) {
      return this.defaultTile;
    }
    return World.tileStore;
  }

  /**
   * Town generation algorithm.
   * @returns {import("./types").Position} spawn - Character spawn location.
   */
  generateTown() {
    this.defaultTile = Tile.Floor;
    this.height = 8 * Chunk.size;
    this.width = 8 * Chunk.size;

    //let rng = mulberry32(this.seed);
    let spawn = {x: this.width / 2, y: this.height / 2};
    let i = 0;

    // Create Walls
    for (i = 0; i < this.width; ++i) {
      this.insert(Tile.Wall, i, 0);
      this.insert(Tile.Wall, i, this.height - 1);
    }
    for (i = 1; i < (this.height - 1); ++i) {
      this.insert(Tile.Wall, 0, i);
      this.insert(Tile.Wall, this.width - 1, i);
    }

    // Create Spawn Point
    this.insert(Tile.Player, spawn.x, spawn.y);

    return spawn;
  }
}
