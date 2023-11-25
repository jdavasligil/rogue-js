/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { FRNG } from "../../lib/fast-random.js";
import { Tile } from "../tile.js";
import { EntityType, Material } from "./archetype.js";

export const LockType = {
  None:      0,
  Rusty:     1,
  Simple:    2,
  Sturdy:    3,
  Intricate: 4,
  Master:    5,
  Magic:     6,
}

export const TrapType = {
  None:      0,
  Alarm:     1,
  Rocks:     2,
  Fire:      3,
  Cold:      4,
  Poison:    5,
  Darkness:  6,
}

/** Data class representing door data */
export class Door {
  /**
   * Create a Door.
   * @returns {Door}
   */
  constructor() {
    this.id = (0xFF - EntityType.Door) << 24;
    this.tile = Tile.ClosedDoor;
    this.position = {x:0, y:0};
    this.collision = true;
    this.visible = true;
    this.occlusion = true;

    this.stuck = false;
    this.lock = LockType.None;
    this.trap = TrapType.None;
    this.material = Material.Wood;
    this.hitpoints = 4;
  }

  // Columns are material types.
  static materialChance = [
    [99,  0,  1,  0,  0,  0,  0], // Depth 0
    [94,  5,  1,  0,  0,  0,  0], // Depth 1
    [84, 10,  5,  1,  0,  0,  0], // Depth 2
    [70, 15, 10,  5,  0,  0,  0], // Depth 3
    [60, 20, 15,  5,  0,  0,  0], // Depth 4
    [50, 20, 20, 10,  0,  0,  0], // Depth 5
    [25, 25, 25, 24,  1,  0,  0], // Depth 6
    [15, 20, 38, 25,  1,  1,  0], // Depth 7
    [10, 15, 40, 31,  2,  1,  1], // Depth 8
    [ 5, 10, 30, 43,  5,  2,  5], // Depth 9
    [ 1,  5, 20, 49, 10,  5, 10], // Depth 10
  ];

  // Columns are lock types.
  static lockChance = [
    [ 1, 15, 50, 29,  5,  0,  0], // Depth 0
    [90,  5,  3,  1,  1,  0,  0], // Depth 1
    [85,  5,  5,  4,  1,  0,  0], // Depth 2
    [80,  3,  7,  5,  4,  1,  0], // Depth 3
    [75,  3,  7,  7,  5,  3,  0], // Depth 4
    [70,  1, 20, 10,  0,  0,  0], // Depth 5 //CONTINUE HERE
    [65, 25, 25, 24,  1,  0,  0], // Depth 6
    [60, 20, 38, 25,  1,  1,  0], // Depth 7
    [55, 15, 40, 31,  2,  1,  1], // Depth 8
    [50, 10, 30, 43,  5,  2,  5], // Depth 9
    [45,  5, 20, 49, 10,  5, 10], // Depth 10
  ];

  // Columns are trap types.
  static trapChance = [
    [99,  0,  1,  0,  0,  0,  0], // Depth 0
    [94,  5,  1,  0,  0,  0,  0], // Depth 1
    [84, 10,  5,  1,  0,  0,  0], // Depth 2
    [70, 15, 10,  5,  0,  0,  0], // Depth 3
    [60, 20, 15,  5,  0,  0,  0], // Depth 4
    [50, 20, 20, 10,  0,  0,  0], // Depth 5
    [25, 25, 25, 24,  1,  0,  0], // Depth 6
    [15, 20, 38, 25,  1,  1,  0], // Depth 7
    [10, 15, 40, 31,  2,  1,  1], // Depth 8
    [ 5, 10, 30, 43,  5,  2,  5], // Depth 9
    [ 1,  5, 20, 49, 10,  5, 10], // Depth 10
  ];

  static portcullisChance = [
     0, // Depth 0
     1, // Depth 1
     3, // Depth 2
     5, // Depth 3
     7, // Depth 4
     9, // Depth 5
    10, // Depth 6
    10, // Depth 7
    10, // Depth 8
    10, // Depth 9
    10, // Depth 10
  ];

  static openChance = [
     1, // Depth 0
    15, // Depth 1
    13, // Depth 2
    11, // Depth 3
     9, // Depth 4
     7, // Depth 5
     5, // Depth 6
     3, // Depth 7
     1, // Depth 8
     1, // Depth 9
     1, // Depth 10
  ];

  static secretChance = 5;

  /**
   * Randomize a door's material based on depth.
   * @param {function(): number} rng - Random number generator (0,1). 
   * @param {Door} door - A door.
   * @param {number} depth - Dungeon depth.
   * @returns {undefined}
   */
  static randomMaterial(rng, door, depth) {
    const roll = FRNG.randInt(rng, 0, 100);
    const bounds = Door.materialChance[depth];
    let bound = 0;

    for (let i = 0; i < bounds.length; ++i) {
      bound += bounds[i]
      if (roll < bound) {
        door.material = i;
        return undefined;
      }
    }
  }

  /**
   * Randomly check for special door types.
   * @param {function(): number} rng - Random number generator (0,1). 
   * @param {Door} door - A door.
   * @param {number} depth - Dungeon depth.
   * @returns {undefined}
   */
  static randomSpecial(rng, door, depth) {
    const roll = FRNG.randInt(rng, 0, 100);
    const bounds = Door.materialChance[depth];
    let bound = 0;

    for (let i = 0; i < bounds.length; ++i) {
      bound += bounds[i]
      if (roll < bound) {
        door.material = i;
        return undefined;
      }
    }
  }

  /**
   * Randomize a door based on depth.
   * @param {function(): number} rng - Random number generator (0,1). 
   * @param {Door} door - A door.
   * @param {number} depth - Dungeon depth.
   * @returns {undefined}
   */
  static randomize(rng, door, depth) {

    Door.randomMaterial(rng, door, depth);

    roll = FRNG.randInt(rng, 0, 100);

    // Determine Special Door Type.
    if (roll < 30) {
      door.tile = Tile.OpenDoor;
      door.collision = false;
      door.occlusion = false;

      return undefined;
    } else if (roll < 35) {
      door.tile = Tile.PortcullisUp;
      door.material = Math.max(Material.Iron, door.material);
      door.collision = false;
      door.occlusion = false;

      return undefined;
    } else if (roll < 40) {
      door.tile = Tile.PortcullisDown;
      door.material = Math.max(Material.Iron, door.material);
      door.occlusion = false;

      return undefined;
    } else if (roll < 45) {
      door.tile = Tile.Granite;
      door.material = Material.Stone;
    }

    roll = FRNG.randInt(rng, 0, 100);

    // Determine Lock Difficulty.
    if (roll < 30) {
    } else if (roll < 50) {
      door.stuck = true;
    } else if (roll < 55) {
      door.lock = LockType.Rusty;
    } else if (roll < 60) {
      door.lock = LockType.Simple
    }
  }
}
