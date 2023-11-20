/**
 * @namespace types
 */

"use strict"

import { ChunkManager } from "./chunk-manager.js"
import { EntityManager } from "./entity-manager.js"

/**
 * A Position on an x-y cartesian coordinate grid.
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Enumeration of all event signals. This includes FSM transitions.
 * @enum {number}
 */
export const Event = {
  PlayerMoved:   0,
  EnterMainMenu: 1,
  ExitMainMenu:  2,
  EnterTutorial: 3,
  ExitTutorial:  4,
}

/**
 * Enumeration of all entity archetypes.
 * @enum {number}
 */
export const EntityType = {
  Player:   0,
  Monster:  1,
  Trap:     2,
  Door:     3,
  Stairs:   4,
  Treasure: 5,
  Teleport: 6,
  Portal:   7,
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
 * Enumeration of all game states.
 * @enum {number}
 */
export const GameState = {
  MainMenu: 0,
  Creation: 1,
  Loading:  2,
  Running:  3,
}

/**
 * Enumeration of all options in the main menu.
 * @enum {string}
 */
export const MainMenuOption = {
  Continue: "Continue",
  NewGame:  "New Game",
  Tutorial: "Tutorial",
}

/**
 * Enumeration of all game action keybinds.
 * @enum {string}
 */
export const Action = {
  MoveUp:    "ArrowUp",
  MoveDown:  "ArrowDown",
  MoveLeft:  "ArrowLeft",
  MoveRight: "ArrowRight",
  Enter:     "Enter",
  Escape:    "Escape",
}

/**
 * Enumeration of all grid resolutions supported by the camera. 
 * @enum {number}
 */
export const Resolution = {
  Low:    18,
  Medium: 24,
  High:   32,
}

/**
 * Enumeration of all possible interaction modes.
 *
 * Normal - Open door, initiate trade.
 * Combat - Attack target, break object.
 * Social - Attempt to initiate dialogue.
 * Stealth - Pick lock, pick pocket, steal, sneak.
 * @readonly 
 * @enum {number}
 */
export const InteractMode = {
  Normal:   0, 
  Combat:   1,
  Social:   2,
  Stealth:  3, 
}

/**
 * Enumeration of all movement directions.
 * @enum {{x: number, y: number}}
 */
export const Direction = {
  Up:    {x: 0, y:-1},
  Down:  {x: 0, y: 1},
  Left:  {x:-1, y: 0},
  Right: {x: 1, y: 0},
}

/**
 * Enumeration of all cardinal directions.
 * @enum {number}
 */
export const Cardinal = {
  N: 0,
  E: 1,
  S: 2,
  W: 3,
}

/**
 * Enumeration of all map tiles including terrain and entities.
 * @readonly
 * @enum {number}
 */
export const Tile = {
  Floor:      0,
  Wall:       1,
  OpenDoor:   2,
  ClosedDoor: 3,
  StairsUp:   4,
  StairsDown: 5,
  Player:     6,
  Monster:    7,
  Merchant:   8,
}

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

export {};
