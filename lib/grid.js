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

/**
 * A position on an x-y cartesian coordinate grid.
 * @typedef {{x: number, y: number}} Position
 */

/**
 * An enum for tiles.
 * @typedef {number} Tile
 */
  
/** Class representing an NxN grid of tiles. */
class TileGrid {
  /**
   * Create a tile array.
   * @param {number} width - The grid width N.
   */
  constructor(width) {
    this.width = width;
    this.data = new Uint8Array(width * width);
  }

  /**
   * Get the tile at a given local coordinate position.
   * @param {Position} - The local coordinate position.
   * @returns {Tile} - The tile found or undefined.
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

  log() {
    let output = "";
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        output += getTile({x: x, y: y}) + " ";
      }
      output += "\n";
    }
    console.log(output);
  }
}

/** Class representing a grid of bits. */
class BitGrid {
  /**
   * Create a byte array.
   * @param {number} width - The grid width.
   */
  constructor(width) {
    this.width = width;
    this.bytesPerRow = width >> 3;
    this.data = new Uint8Array(width * this.bytesPerRow);
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

  log() {
    let output = "\n";
    for (let y = 0; y < this.width; ++y) {
      for (let x = 0; x < this.width; ++x) {
        output += Number(this.getBit({x: x, y: y}));
      }
      output += "\n";
    }
    console.log(output);
  }
}
