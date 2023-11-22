/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Tile } from "./tile.js";

/**
 * Enumeration of custom color palette colors.
 * @readonly
 * @enum {string}
 */
export const Color = {
  White:      "#E1D9D1",
  Slate:      "#3C3A2D",
  Brown:      "#684E11",
  DarkBrown:  "#151004",
  Orange:     "#EFBC74",
  DarkOrange: "#c4761b",
  MagicBlue:  "#0784b5",
}

/**
 * Enumeration of rendering modes.
 * @readonly
 * @enum {number}
 */
export const RenderingMode = {
  Ascii: 0,
  Tile:  1,
}

/**
 * Used by renderer in ASCII mode to match default tile colors.
 * Overridden by colors set by an entity.
 * @param {Tile} tile - Tile enum.
 * @returns {Color}
 */
function matchTileColor(tile) {
  switch(tile) {
    case Tile.Floor:
      return Color.Slate;

    case Tile.OpenDoor:
    case Tile.ClosedDoor:
      return Color.Brown;

    case Tile.Player:
      return Color.MagicBlue;

    case Tile.StairsUp:
    case Tile.StairsDown:
    case Tile.Merchant:
      return Color.White;

    default:
      return Color.Orange;
  }
}
