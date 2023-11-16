/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

import { Color, Tile } from "./types";

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
