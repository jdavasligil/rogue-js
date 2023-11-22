/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

/**
 * Enumeration of all entity archetypes.
 * @enum {number}
 */
export const EntityType = {
  Player:   0,
  Room:     1,
  Monster:  2,
  Trap:     3,
  Door:     4,
  Stairs:   5,
  Treasure: 6,
  Teleport: 7,
  Portal:   8,
}
