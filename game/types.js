/**
 * @namespace types
 */

"use strict"

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
 * Enumeration of all options in the main menu.
 * @enum {string}
 */
export const MainMenuOption = {
  Continue: "Continue",
  NewGame:  "New Game",
  Tutorial: "Tutorial",
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


export {};
