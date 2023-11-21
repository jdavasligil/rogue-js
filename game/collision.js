/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Tile } from "./types";

/**
 * Whether or not the tile has collision by default.
 * @param {Tile} tile - Tile.
 * @returns {boolean}
 */
export function hasCollision(tile) {
  return (
       tile === Tile.Wall
    || tile === Tile.ClosedDoor
  );
}
