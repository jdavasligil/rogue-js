/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

/**
 * Enumeration of all map tiles including world template, terrain, and entities.
 * Limit of 256.
 * @readonly
 * @enum {number}
 */
export const Tile = {
  Player:         0,

  Floor:          1,
  Wall:           2,

  OpenDoor:       3,
  ClosedDoor:     4,
  PortcullisUp:   5,
  PortcullisDown: 6,
  StairsUp:       7,
  StairsDown:     8,

  Bedrock:        9,
  Granite:        10,
  Rubble:         11,
  Quartz:         12,
  Copper:         13,
  Silver:         14,
  Gold:           15,

  Alchemist:      16,
  Armoury:        17,
  BlackMarket:    18,
  Home:           19,
  MagicShop:      20,
  Store:          21,
  Temple:         22,
  Weaponsmith:    23,

  RoomNode:       24,

  Food:           25,
  Item:           26,
  Potion:         27,
  Scroll:         28,
  Treasure:       29,
  Weapon:         30,

  Beggar:         31,
  Guard:          32,
  Mercenary:      33,
  Thief:          34,
  Townsfolk:      35,

  Dog:            36,
  Skeleton:       37,
  Goblin:         38,
}

/**
 * Whether or not the tile has collision by default.
 * @param {Tile} tile - Tile.
 * @returns {boolean}
 */
export function tileCollision(tile) {
  switch(tile) {
    case Tile.Wall:
    case Tile.Bedrock:
      return true;

    default:
      return false;
  }
}
