/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * Classes for reusable grid structures.
 * @package
 */

"use strict";

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
   */
  constructor(width) {
    this.width = width;
    this.data = new Uint8Array(width * width);
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new TileGrid(), json);
  }

  /**
   * Get the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {Tile | undefined} - The tile found or undefined.
   */
  getTile(position) {
    return this.data[position.y * width + position.x];
  }

  /**
   * Set the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {Tile} - The tile to set.
   */
  setTile(position, tile) {
    this.data[position.y * width + position.x] = tile;
  }

  /**
   * Replace the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {Tile} - The replacement tile.
   * @returns {Tile} - The tile being replaced.
   */
  replaceTile(position, tile) {
    let tileReplaced = this.data[position.y * width + position.x];
    this.data[position.y * width + position.x] = tile;
    return tileReplaced;
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

/** Class representing an NxN grid of IDs. */
export class IDGrid {
  /**
   * Create a tile array.
   * @param {number} width - The grid width N.
   */
  constructor(width) {
    this.width = width;
    this.data = new Uint16Array(width * width);
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new IDGrid(), json);
  }

  /**
   * Get the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {number | undefined} - The id found or undefined.
   */
  getID(position) {
    return this.data[position.y * width + position.x];
  }

  /**
   * Set the id at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {number} - The id to set.
   */
  setID(position, id) {
    this.data[position.y * width + position.x] = id;
  }

  /**
   * Replace the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @param {number} - The replacement id.
   * @returns {number} - The id being replaced.
   */
  replaceID(position, id) {
    let idReplaced = this.data[position.y * width + position.x];
    this.data[position.y * width + position.x] = id;
    return idReplaced;
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
   */
  constructor(width, fill=false) {
    this.width = width;
    this.bytesPerRow = width >> 3;
    this.data = new Uint8Array(width * this.bytesPerRow);
    if (fill) this.data.fill(255);
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new BitGrid(), json);
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
