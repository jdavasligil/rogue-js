/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { SERDE } from "../lib/serde";

/**
 * @typedef {{x: number, y: number}} Position
 */

/**
 * An enum for tiles.
 * @typedef {number} Tile
 */
  
/** Class representing an NxN grid of tiles. */
export class TileGrid {
  /**
   * Create a tile array.
   * @param {number} width - The grid width N.
   * @param {Uint8Array | undefined} data - An array buffer.
   * @returns {TileGrid}
   */
  constructor(width, data=undefined) {
    this.width = width;
    this.data = (data) ? data : new Uint8Array(width * width);
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   * @returns {TileGrid}
   */
  static from(json) {
    return new TileGrid(json.width, new Uint8Array(Object.values(json.data)));
  }

  /**
   * Get the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {Tile | undefined} - The tile found or undefined.
   */
  getTile(position) {
    return this.data[position.y * this.width + position.x];
  }

  /**
   * Set the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {Tile} - The tile to set.
   */
  setTile(position, tile) {
    this.data[position.y * this.width + position.x] = tile;
  }

  /**
   * Replace the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {Tile} - The replacement tile.
   * @returns {Tile} - The tile being replaced.
   */
  replaceTile(position, tile) {
    let tileReplaced = this.data[position.y * this.width + position.x];
    this.data[position.y * this.width + position.x] = tile;
    return tileReplaced;
  }

  /**
   * Reset the entire grid.
   */
  reset() {
    this.data.fill(0);
  }

  /**
   * Get a string representation of the grid.
   * @returns {string} - Grid string.
   */
  toString() {
    let output = "";
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        output += this.getTile({x: x, y: y}) + " ";
      }
      output += "\n";
    }
    return output;
  }
}

/** Class mapping grid coordinates to stack of IDs. */
export class IDGrid {
  /**
   * Create an ID array.
   * @returns {IDGrid}
   */
  constructor() {
    /** @type {Object.<string,Array.<number>>} */
    this.data = {};
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   * @returns {IDGrid}
   */
  static from(json) {
    return Object.assign(new IDGrid(json.width), json);
  }

  /**
   * Return the entity stack at the given position.
   * @param {Position} - The local coordinate position.
   * @returns {number | undefined} - The id found or undefined.
   */
  entitiesAt(position) {
    return this.data[SERDE.posToStr(position)];
  }

  /**
   * Pop the top entity at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {number | undefined} - The id found or undefined.
   */
  popID(position) {
    if (this.data[SERDE.posToStr(position)] === undefined) {
      return undefined;
    }
    return this.data[SERDE.posToStr(position)].pop();
  }

  /**
   * Get the top entity at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {number | undefined} - The id found or undefined.
   */
  getID(position) {
    if (this.data[SERDE.posToStr(position)] === undefined) {
      return undefined;
    }
    return this.data[SERDE.posToStr(position)].at(-1);
  }

  /**
   * Set the id at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {number} - The id to set.
   */
  setID(position, id) {
    if (this.data[SERDE.posToStr(position)] === undefined) {
      this.data[SERDE.posToStr(position)] = new Array();
    }
    this.data[SERDE.posToStr(position)].push(id);
  }

  /**
   * Replace the ID at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {number} - The replacement id.
   * @returns {number | undefined} - The id being replaced.
   */
  replaceID(position, id) {
    if (this.data[SERDE.posToStr(position)] === undefined) {
      this.data[SERDE.posToStr(position)] = new Array();
    }
    let arr = this.data[SERDE.posToStr(position)];

    let idReplaced = arr.pop();
    arr.push(id);
    return idReplaced;
  }

  /**
   * Set the id at the given local coordinate position under the top one.
   * @param {Position} - The local coordinate position.
   * @param {number} - The replacement id.
   */
  setUnderID(position, id) {
    if (this.data[SERDE.posToStr(position)] === undefined) {
      this.data[SERDE.posToStr(position)] = new Array();
    }
    let arr = this.data[SERDE.posToStr(position)];

    let top = arr.pop();
    arr.push(id);
    if (top !== undefined) arr.push(top);
  }

  /**
   * Reset the entire grid to empty.
   */
  reset() {
    let keys = Object.keys(this.data);
    for (let i = 0; i < keys.length; ++i) {
      delete this.data[keys[i]];
    }
  }

  /**
   * Get a string representation of the grid.
   * @returns {string} - Grid string.
   */
  toString() {
    let output = "";
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        output += this.getID({x: x, y: y}) + " ";
      }
      output += "\n";
    }
    return output;
  }
}

/** Class representing a grid of bits. */
export class BitGrid {
  /**
   * Create a byte array.
   * @param {number} width - The grid width.
   * @param {Uint8Array | undefined} data - Optional array buffer.
   * @param {boolean} fill - Whether or not the bits should be set or unset.
   * @returns {BitGrid}
   */
  constructor(width, data=undefined, fill=false) {
    this.width = width;
    this.bytesPerRow = width >> 3;
    if (data === undefined) {
      this.data = new Uint8Array(width * this.bytesPerRow);
    } else {
      this.data = data;
    }
    if (fill) this.data.fill(255);
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   * @returns {BitGrid}
   */
  static from(json) {
    return new BitGrid(json.width, new Uint8Array(Object.values(json.data)));
  }

  /**
   * Get the bit at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {boolean} - True if bit is set, otherwise false.
   */
  getBit(position) {
    return 0 < (this.data[position.y * this.bytesPerRow + ((position.x / 8) >> 0)] & (1 << (7 - position.x % 8)));
  }

  /**
   * Set the bit at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   */
  setBit(position) {
    this.data[position.y * this.bytesPerRow + ((position.x / 8) >> 0)] |= (1 << (7 - position.x % 8));
  }

  /**
   * Clear the bit at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   */
  clearBit(position) {
    this.data[position.y * this.bytesPerRow + ((position.x / 8) >> 0)] &= ~(1 << (7 - position.x % 8));
  }

  /**
   * Clear the bit at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   */
  toggleBit(position) {
    this.data[position.y * this.bytesPerRow + ((position.x / 8) >> 0)] ^= (1 << (7 - position.x % 8));
  }

  /**
   * Clears all bits.
   */
  clear() {
    this.data.fill(0);
  }

  /**
   * Get a string representation of the grid.
   * @returns {string} - Grid string.
   */
  toString() {
    let output = "\n";
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        output += Number(this.getBit({x: x, y: y}));
      }
      output += "\n";
    }
    return output;
  }
}
