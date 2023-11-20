/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { mulberry32 } from "../lib/fast-random";
import { stringifyPosition } from "../lib/serde";
import { Tile } from "./types";

// 1. Generate large tilemap.
// 2. Player spawn is always (0,0).
// 3. Chunks dynamically load data based on tilemap underneath.
//      a) Chunk loads tile data from world map
//      b) If found, tile diffs are ran through to update chunk.
//      c) Entities are loaded and placed on map.
//      d) Entity diffs are applied.
//      e) Collision and light are calculated like usual, game continues.
//
// LOCALSTORAGE
// CHUNK
// key: "[Xworld]_[Yworld]"
// val: "[Xchunk]_[Ychunk]-[ID]; ... \n[Xchunk]_[Ychunk]-[KEY:VAL]; ..."
//
// MAP
// key: "L[DEPTH]"
// val: "[SEED]"
//
// CHARACTER
// key: "PC"
// val: "[DATA]"

/** Class holding the underlying world template. */ 
class World {
  /**
   * Create a world template stored using object reference.
   * @returns {World}
   */
  constructor(seed, depth=0) {
    this.seed = seed;
    this.depth = depth; // Zero is surface, positive numbers are lower levels.
    this.defaultTile = Tile.Floor;
    this.tiles = {};
    this.XMAX = 0; // Multiple of 16
    this.YMAX = 0;
    this.origin = {x: 0, y: 0};
  }

  /** A storage variable for holding tiles temporarily. */
  static tileStore = 0;

  /**
   * Insert a tile into the specified location (overwrite existing).
   * @param {Tile} tile - Tile to be inserted into the world.
   * @param {number} x - Local map x-coordinate.
   * @param {number} y - Local map y-coordinate.
   */
  insert(tile, row, col) {
    this.tiles[`${row.toString(16)},${col.toString(16)}`] = tile;
  }
  
  /**
   * Insert a tile into the specified location (overwrite existing).
   * @param {import("./types").Position} position - Position in world coordinates. 
   * @returns {Tile}
   */
  lookup(position) {
    World.tileStore = this.tiles[stringifyPosition(position)];
    if (World.tileStore === undefined) {
      return this.defaultTile;
    }
    return World.tileStore;
  }

  /**
   * Town generation algorithm.
   */
  generateTown() {
    this.zeroTile = Tile.Floor;
    this.YMAX = 64;
    this.XMAX = 96;
    this.origin.x = this.XMAX / 2;
    this.origin.y = this.YMAX / 2;

    let i = 0;

    // Create Walls
    for (i = 0; i < XMAX; ++i) {
    }
  }
}
