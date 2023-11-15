/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

import { Tile } from "./types";

// Takes in a tile (string) and returns a color (string)
// Used in the Ascii Renderer to determine default tile colors
// Can be overwritten by colors set by an entity

/**
 * Used by renderer in ASCII mode to match default tile colors.
 * Overridden by colors set by an entity.
 * @param {Tile} tile - 
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
