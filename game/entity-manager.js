/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

const types = require("./types.js");

/** Class for handling entity data and assigning new IDs. */
export class EntityManager {
  /**
   * Create an entity manager.
   * @param {number} nextID - The next ID to be assigned.
   */
  constructor(nextID=1) {
    this.nextID = nextID;
    /** @type {Map.<number, types.Entity>} */
    this.data = new Map();
    this.idRecycleBin = [];
  }

  /**
   * Get the tile at a given local coordinate position.
   */
  getTile() {
    return this.data;
  }
}
