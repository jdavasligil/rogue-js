/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { FRNG, mulberry32 } from "../lib/fast-random.js";
import { Chunk } from "./chunk-manager.js";
import { Tile } from "./tile.js";

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
   * @param {number} seed - Seed used to generate the world.
   * @param {number} depth - Depth of the world.
   * @param {number} time - Time elapsed since character creation in minutes.
   * @returns {World}
   */
  constructor(seed, depth=0, time=0) {
    this.seed = seed;
    this.depth = depth; // Zero is surface, positive numbers are lower levels.
    this.time = 0; // 
    this.defaultTile = Tile.Floor;
    this.tiles = {};
    this.width = 0;
    this.height = 0;
  }

  /** A storage variable for holding tiles temporarily. */
  static tileStore = 0;

  /**
   * Format time string for world time in `dd:HH:MM`.
   * @return {string}
   */
  timeString() {
    return `${Math.floor(this.time / 1440)}:${Math.floor(this.time / 60) % 24}:${this.time % 60}`;
  }

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
   * Draw a rectangle of tiles.
   * @param {Tile} tile - Tile to draw.
   * @param {import("./types").Position} pos - Coordinate of top-left corner.
   * @param {number} width - Width.
   * @param {number} height - Height.
   * @param {boolean} fill - Fill the interior with tiles.
   */
  drawRectangle(tile, pos, width, height, fill=false) {
    if (fill) {
      for (let j = pos.y; j < (pos.y + height); ++j) {
        for (let i = pos.x; i < (pos.x + width); ++i) {
          this.insert(tile, i, j);
        }
      }
    } else {
      let i = 0;
      for (i = pos.x; i < (pos.x + width); ++i) {
        this.insert(tile, i, pos.y);
        this.insert(tile, i, (pos.y + height - 1));
      }
      for (i = (pos.y + 1); i < (pos.y + height - 1); ++i) {
        this.insert(tile, pos.x, i);
        this.insert(tile, (pos.x + width - 1), i);
      }
    }
  }

  /**
   * Draw a random shop.
   * @param {function(): number} rng - Random number generator (0,1).
   * @param {Tile} tile - Tile to draw.
   * @param {import("./types").Position} pos - Coordinate of top-left corner.
   * @param {number} maxSize - The maximum possible size of a shop.
   */
  drawShop(rng, tile, pos, maxSize=6) {
    const width = FRNG.randInt(rng, 2, maxSize + 1);
    const height = FRNG.randInt(rng, 2, maxSize + 1);
    const perimeter = 2 * (height + width - 2);
    const shopIdx = FRNG.randInt(rng, 0, perimeter);
    const x = pos.x + FRNG.randInt(rng, 0, maxSize - width + 1);
    const y = pos.y + FRNG.randInt(rng, 0, maxSize - height + 1);

    let i = 0;
    let count = 0;
    for (i = x; i < (x + width); ++i) {
      if (count === shopIdx) {
        this.insert(tile, i, y); 
      } else {
        this.insert(Tile.Wall, i, y);
      }
      count += 1;

      if (count === shopIdx) {
        this.insert(tile, i, (y + height - 1));
      } else {
        this.insert(Tile.Wall, i, (y + height - 1));
      }
      count += 1;
    }
    for (i = (y + 1); i < (y + height - 1); ++i) {
      if (count === shopIdx) {
        this.insert(tile, x, i);
      } else {
        this.insert(Tile.Wall, x, i);
      }
      count += 1;

      if (count === shopIdx) {
        this.insert(tile, (x + width - 1), i);
      } else {
        this.insert(Tile.Wall, (x + width - 1), i);
      }
      count += 1;
    }

    this.drawRectangle(Tile.Wall, {x: x+1, y: y+1}, width-2, height-2, true);
  }

  /**
   * Town generation algorithm.
   * @returns {import("./types").Position} spawn - Character spawn location.
   */
  generateTown() {
    this.defaultTile = Tile.Floor;
    this.height = 2 * Chunk.size;
    this.width = 3 * Chunk.size;

    let i = 0;

    const spawn = {x: this.width / 2, y: this.height / 2};
    const rng = mulberry32(this.seed);

    const shops = [
      Tile.Alchemist,      
      Tile.Armoury,        
      Tile.BlackMarket,    
      Tile.Home,           
      Tile.MagicShop,      
      Tile.Store,          
      Tile.Temple,         
      Tile.Weaponsmith
    ];
    const shopPositions = [
      {x: 10, y: 9},
      {x: 17, y: 9},
      {x: 25, y: 9},
      {x: 32, y: 9},
      {x: 10, y: 17},
      {x: 17, y: 17},
      {x: 25, y: 17},
      {x: 32, y: 17}
    ];

    FRNG.shuffle(rng, shops);

    // Create Walls
    this.drawRectangle(Tile.Wall, {x: 0, y: 0}, this.width, this.height);

    // Create Shops
    for (i = 0; i < shops.length; ++i) {
      this.drawShop(rng, shops[i], shopPositions[i]);
    }

    return spawn;
  }

  /**
   * Test Map generation algorithm.
   * @returns {import("./types").Position} spawn - Character spawn location.
   */
  generateTestMap() {
    this.defaultTile = Tile.Floor;
    this.height = 16 * Chunk.size;
    this.width = 16 * Chunk.size;

    let i = 0;

    const spawn = {x: this.width / 2, y: this.height / 2};
    const rng = mulberry32(this.seed);

    const shops = [
      Tile.Alchemist,      
      Tile.Armoury,        
      Tile.BlackMarket,    
      Tile.Home,           
      Tile.MagicShop,      
      Tile.Store,          
      Tile.Temple,         
      Tile.Weaponsmith
    ];
    const shopPositions = [
      {x: 10, y: 9},
      {x: 17, y: 9},
      {x: 25, y: 9},
      {x: 32, y: 9},
      {x: 10, y: 17},
      {x: 17, y: 17},
      {x: 25, y: 17},
      {x: 32, y: 17}
    ];

    FRNG.shuffle(rng, shops);

    // Create Walls
    this.drawRectangle(Tile.Wall, {x: 0, y: 0}, this.width, this.height);

    // Create Shops
    for (i = 0; i < shops.length; ++i) {
      this.drawShop(rng, shops[i], shopPositions[i]);
    }

    this.drawRectangle(Tile.ClosedDoor, {x: this.width / 4, y: this.height / 4}, this.width / 4, this.height / 4);

    return spawn;
  }
}
