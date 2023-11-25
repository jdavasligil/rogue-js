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
  Rock:     9,
  Shop:     10,
  Weapon:   11,
}

/**
 * Enumeration of literacy levels.
 * @enum {number}
 */
export const Literacy = {
  Illiterate: 0,
  Basic:      1,
  Literate:   2,
}

/**
 * Enumeration of materials.
 * @enum {number}
 */
export const Material = {
  Wood:       0,
  Stone:      1,
  Iron:       2,
  Steel:      3,
  Silver:     4,
  TrueSilver: 5,
  Adamantine: 6
}

export const LockType = {
  None:      0,
  Rusty:     1,
  Simple:    2,
  Sturdy:    3,
  Intricate: 4,
  Master:    5,
  Magic:     6,
}

export const LockTrapType = {
  None:      0,
  Alarm:     1,
  Rocks:     2,
  Darkness:  3,
  Cold:      4,
  Poison:    5,
  Fire:      6,
}
