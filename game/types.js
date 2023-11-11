/**
 * @namespace types
 */

"use strict"

/**
 * A Position on an x-y cartesian coordinate grid.
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Properties common to all entities.
 * @typedef Entity 
 * @property {number} id - Entity's unique ID.
 * @property {EntityType} type - Entity archetype.
 * @property {string} name - Entity name.
 * @property {Position} position - Entity position.
 * @property {boolean} collision - Physical collision.
 * @property {boolean} visible - Visible or invisible.
 * @property {object} data - Additional data depending on the type.
 */

/**
 * The Camera determines the zoom level and rendering position.
 * @typedef Camera
 * @type {object}
 * @property {Position} position - The world grid position of the camera.
 * @property {number} resolution - The pixel resolution of each tile.
 * @property {number} deadZone - Distance travelled before camera moves.
 */

/**
 * A Chunk is a 16x16 sub-array of the world map used for data streaming.
 * @typedef Chunk
 * @type {object}
 * @property {Position} position - World position of the chunk.
 * @property {TileGrid} tileGrid - Tile grid.
 * @property {BitGrid} visGrid - Visibility grid.
 * @property {BitGrid} colGrid - Collision grid.
 * @property {IDGrid} entGrid - Entity ID grid.
 */

/**
 * The ChunkMap stores references to 9 16x16 chunks in memory at a time.
 * @typedef ChunkMap
 * @type {object}
 * @property {Map.<Position, Chunk>} cache - The chunk cache.
 * @property {Chunk} root - The central chunk.
 * @property {Chunk} N - The northern chunk.
 * @property {Chunk} NE - The northeastern chunk.
 * @property {Chunk} E - The eastern chunk.
 * @property {Chunk} SE - The southeastern chunk.
 * @property {Chunk} S - The southern chunk.
 * @property {Chunk} SW - The southwestern chunk.
 * @property {Chunk} W - The western chunk.
 * @property {Chunk} NW - The northwestern chunk.
 */

/**
 * The World holds all game state.
 * @typedef World
 * @type {object}
 * @property {ChunkMap} chunks - An octree holding per-chunk data buffers.
 * @property {Map.<number, object>} entities - A map to access entity data.
 * @property {Array.<Event>} events - An array for event signals for state change.
 * @property {Camera} camera - The top-down camera which renders the world.
 * @property {RenderingMode} renderer - How to draw the grid.
 * @property {number} width - Width of the world map.
 * @property {number} height - Height of the world map.
 * @property {number} turns - How many turns have passed (1 turn = 10 min).
 * @property {GameState} state - What state the game is currently in.
 * @property {Array.<MainMenuOption>} options - Main menu options available.
 * @property {number} selection - Current option menu selection.
 * @property {boolean} saveFileExists - True when save loaded from local storage.
 * @property {boolean} debug - Activates debugging features.
 */

/**
 * Enumeration of all event signals. This includes FSM transitions.
 * @enum {number}
 */
export const Event = {
  PlayerMoved:   1,
  EnterMainMenu: 2,
  ExitMainMenu:  3,
  EnterTutorial: 4,
  ExitTutorial:  5,
}

/**
 * Enumeration of all entity archetypes.
 * @enum {number}
 */
export const EntityType = {
  Door:     1,
  Monster:  2,
  Player:   3,
  Portal:   4,
  Stairs:   5,
  Teleport: 6,
  Trap:     7,
  Treasure: 8,
}

/**
 * Enumeration of all game states.
 * @enum {number}
 */
export const GameState = {
  MainMenu: 1,
  Creation: 2,
  Loading:  3,
  Running:  4,
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
  Low:   18,
  Medium: 24,
  High:  32,
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
  Normal:   1, 
  Combat:   2,
  Social:   3,
  Stealth:  4, 
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
 * Enumeration of all map tiles including terrain and entities.
 * @readonly
 * @enum {number}
 */
export const Tile = {
  Floor:      1,
  Wall:       2,
  OpenDoor:   3,
  ClosedDoor: 4,
  StairsUp:   5,
  StairsDown: 6,
  Player:     7,
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
 * Enumeration of possible rendering modes.
 * @readonly
 * @enum {number}
 */
export const RenderingMode = {
  Ascii: 1,
  Tile:  2,
}

export {};
