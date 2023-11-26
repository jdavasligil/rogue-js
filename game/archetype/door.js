/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { FRNG } from "../../lib/fast-random.js";
import { HIRO } from "../../lib/hiro.js";
import { Tile } from "../tile.js";
import { EntityType, LockTrapType, LockType, Material } from "./archetype.js";

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

    this.open = false;
    this.stuck = false;
    this.lock = LockType.None;
    this.trap = LockTrapType.None;
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
    [70,  3,  7,  9,  7,  3,  1], // Depth 5
    [65,  1,  7,  9, 10,  5,  3], // Depth 6
    [60,  1,  5,  9, 10,  7,  3], // Depth 7
    [55,  1,  3,  9, 15, 12,  5], // Depth 8
    [50,  1,  3,  7, 15, 17,  7], // Depth 9
    [50,  1,  1,  5, 13, 20, 10], // Depth 10
  ];

  // Columns are trap types.
  static trapChance = [
    [90, 10,  0,  0,  0,  0,  0], // Depth 0
    [90,  7,  2,  1,  0,  0,  0], // Depth 1
    [85, 10,  3,  1,  1,  0,  0], // Depth 2
    [80, 10,  5,  3,  2,  0,  0], // Depth 3
    [75, 10,  7,  5,  3,  0,  0], // Depth 4
    [70, 10,  7,  7,  3,  2,  1], // Depth 5
    [65, 10,  7, 10,  5,  2,  1], // Depth 6
    [60, 10,  5, 10, 10,  3,  2], // Depth 7
    [55, 10,  3, 12, 12,  5,  3], // Depth 8
    [50, 10,  2, 13, 13,  7,  5], // Depth 9
    [50, 10,  1, 14, 13,  7,  5], // Depth 10
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

  static stuckChance = [
     1, // Depth 0
     5, // Depth 1
     7, // Depth 2
     9, // Depth 3
    11, // Depth 4
    13, // Depth 5
    15, // Depth 6
    17, // Depth 7
    19, // Depth 8
    20, // Depth 9
    20, // Depth 10
  ];

  static secretChance = 5;
  static portcullisChance = 5;

  /**
   * Randomize Door HP based on Material.
   * @param {function(): number} rng - Random number generator (0,1). 
   * @param {Door} door - A door.
   */
  static HPFromMaterial(rng, door) {
    switch (door.material) {
      case Material.Wood:
        door.hitpoints = HIRO.rollSum(rng, 2, 6);

      case Material.Stone:
        door.hitpoints = 10 + HIRO.rollSum(rng, 2, 6);

      case Material.Iron:
      case Material.Silver:
        door.hitpoints = 20 + HIRO.rollSum(rng, 2, 6);

      case Material.Steel:
      case Material.TrueSilver:
        door.hitpoints = 30 + HIRO.rollSum(rng, 2, 6);

      case Material.Adamantine:
        door.hitpoints = 40 + HIRO.rollSum(rng, 2, 6);
    }
  }

  /**
   * Open a door.
   * @param {Door} door - A door.
   */
  static open(door) {
    door.open = true;
    door.occlusion = false;
    door.collision = false;
    door.stuck = false;

    switch (door.tile) {
      case Tile.ClosedDoor:
      case Tile.Granite:
        door.tile = Tile.OpenDoor;
        break;

      case Tile.PortcullisDown:
        door.tile = Tile.PortcullisUp;
        break;
    }
  }

  /**
   * Close a door.
   * @param {Door} door - A door.
   */
  static close(door) {
    door.open = false;
    door.collision = true;

    switch (door.tile) {
      case Tile.OpenDoor:
        door.occlusion = true;
        door.tile = Tile.OpenDoor;
        break;

      case Tile.PortcullisUp:
        door.tile = Tile.PortcullisDown;
        break;
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
    // Check for secret door.
    if (depth > 0 && FRNG.randInt(rng, 0, 100) < Door.secretChance) {
      door.tile = Tile.Granite;
      Door.HPFromMaterial(rng, door);

      return undefined;
    }

    // Random material.
    door.material = FRNG.randPdf(rng, Door.materialChance[depth]);

    // Check for portcullis
    if (depth > 0 && FRNG.randInt(rng, 0, 100) < Door.portcullisChance) {
      door.tile = Tile.PortcullisDown;
      door.material = Math.max(Material.Iron, door.material);
      door.occlusion = false;
    }

    Door.HPFromMaterial(rng, door);

    // Check for open door.
    if (FRNG.randInt(rng, 0, 100) < Door.openChance[depth]) {
      Door.open(door);
      return undefined;
    }

    // Check for stuck door.
    door.stuck = FRNG.randInt(rng, 0, 100) < Door.stuckChance[depth];

    // Check for locked door.
    door.lock = FRNG.randPdf(rng, Door.lockChance[depth]);

    // Check for trapped door.
    if (door.lock > 0) {
      door.trap = FRNG.randPdf(rng, Door.trapChance[depth]);
    }

    return undefined;
  }
}
