/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

/**
 * Enumeration of all game action keybinds.
 * @enum {string}
 */
export const Action = {
  MoveUp:      "ArrowUp",
  MoveDown:    "ArrowDown",
  MoveLeft:    "ArrowLeft",
  MoveRight:   "ArrowRight",
  Enter:       "Enter",
  Escape:      "Escape",
  ZoomIn:      "=",
  ZoomOut:     "-",
  NormalMode:  "1",
  SocialMode:  "2",
  StealthMode: "3",
  CombatMode:  "4",
  Debug:       "`",
}
