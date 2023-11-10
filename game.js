/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

// TODO
// [ ] Character Creation
// [ ] Level Generation
// [ ] Combat
// [ ] Serialization

"use strict";

import { parseRoll } from "./lib/dice.js";
import { mulberry32 } from "./lib/fast-random.js";
import { getJSON } from "./lib/serde.js";

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const bgArt = document.getElementById("bg-art");
const ctx = canvas.getContext("2d");

// Set tweakable constants
const sideWidth = Math.floor((canvas.width - canvas.height) / 2);
const gridResolution = 24;
const canvasGrids = Math.floor(canvas.height / gridResolution);

// A fixed seed is useful for recreating random state.
const seed = 12345;

// Enable this to turn on debug mode.
const debug = false;

// Random Number Generator
const rng = mulberry32(seed);

// TYPES

/**
 * A position on an x-y cartesian coordinate grid.
 * @typedef {{x: number, y: number}} Position
 */

/**
 * The in-game camera determines the zoom level and rendering position.
 * @typedef Camera
 * @type {object}
 * @property {Position} position - The world grid position of the camera.
 * @property {number} resolution - The pixel resolution of each tile.
 * @property {number} deadZone - Distance travelled before camera moves.
 */

/**
 * The world holds all game state.
 * @typedef World
 * @type {object}
 * @property {Array.<Tile>} tileGrid - Tile grid.
 * @property {Array.<Boolean>} visGrid - Visibility grid.
 * @property {Array.<Boolean>} colGrid - Collision grid.
 * @property {Array.<number>} entGrid - Entity ID grid.
 * @property {Array.<Entity>} entities - An array for entity data.
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
const Event = {
  playerMoved:   0,
  enterMainMenu: 1,
  exitMainMenu:  2,
  enterTutorial: 3,
  exitTutorial:  4,
}


/**
 * Enumeration of all game states.
 * @enum {number}
 */
const GameState = {
  MainMenu: 0,
  Creation: 1,
  Loading:  2,
  Running:  3,
}

/**
 * Enumeration of all options in the main menu.
 * @enum {string}
 */
const MainMenuOption = {
  Continue: "Continue",
  NewGame:  "New Game",
  Tutorial: "Tutorial",
}

/**
 * Enumeration of all possible game action keybinds.
 * @enum {string}
 */
const Action = {
  MoveUp:    "ArrowUp",
  MoveDown:  "ArrowDown",
  MoveLeft:  "ArrowLeft",
  MoveRight: "ArrowRight",
  Enter:     "Enter",
  Escape:    "Escape",
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
const InteractMode = {
  Normal:   0, 
  Combat:   1,
  Social:   2,
  Stealth:  3, 
}

/**
 * Enumeration of all movement directions.
 * @enum {{x: number, y: number}}
 */
const Direction = {
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
const Tile = {
  Floor:      0,
  Wall:       1,
  OpenDoor:   2,
  ClosedDoor: 3,
  StairsUp:   4,
  StairsDown: 5,
  Player:     6,
  Merchant:   7,
}

/**
 * Enumeration of custom color palette colors.
 * @readonly
 * @enum {string}
 */
const Color = {
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
const RenderingMode = {
  Ascii: 0,
  Tile: 1,
}

// Load ancestries and classes from data
const Ancestries = await getJSON("./data/ancestries.json");
const Classes = await getJSON("./data/classes.json");

/**
 * Constructor for Camera.
 * @param {Position} position - The world position of the camera.
 * @param {number} resolution - Pixels per tile.
 * @param {number} deadZone - Distance moved from center before camera moves.
 * @returns {Camera}
 */
function newCamera(position={x: 0, y: 0}, resolution=24, deadZone=4) {
  return {
    position: position,
    resolution: resolution,
    deadZone: deadZone,
  };
}

// World is a collection of game data for the entire world
const world = {
  grid:    [],
  entities: [],
  events: [],
  camera: newCamera(resolution=gridResolution),
  renderer: RenderingMode.Ascii,
  width: 0,
  height: 0,
  turns: 0,
  state: GameState.MainMenu,
  options: [],
  selection: 0,
  saveFileExists: true,
  debug: debug,
}

// Takes in a tile (string) and returns a color (string)
// Used in the Ascii Renderer to determine default tile colors
// Can be overwritten by colors set by an entity
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


// Returns a monsters attack bonus based on their level
function monsterAttackBonus(level) {
  switch(level) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      return level;
    case 8:
    case 9:
      return 8;
    case 10:
    case 11:
      return 9;
    case 12:
    case 13:
      return 10;
    case 14:
    case 15:
      return 11;
    case 16:
    case 17:
      return 12;
    case 18:
    case 19:
      return 13;
    case 20:
    case 21:
      return 14;
    default:
      return 15;
  }
}

// returns a monsters saving throw values based on level
function monsterSavingThrows(level) {
  switch(level) {
    case 0:
    case 1:
      return {
        death:     14,
        wands:     15,
        paralysis: 16,
        breath:    17,
        spells:    18,
      };

    case 2:
    case 3:
      return {
        death:     12,
        wands:     13,
        paralysis: 14,
        breath:    15,
        spells:    16,
      };
    case 4:
    case 5:
    case 6:
      return {
        death:     10,
        wands:     11,
        paralysis: 12,
        breath:    13,
        spells:    14,
      };

    case 7:
    case 8:
    case 9:
      return {
        death:      8,
        wands:      9,
        paralysis: 10,
        breath:    10,
        spells:    12,
      };

    case 10:
    case 11:
    case 12:
      return {
        death:      6,
        wands:      7,
        paralysis:  8,
        breath:     8,
        spells:    10,
      };

    case 13:
    case 14:
    case 15:
      return {
        death:     4,
        wands:     5,
        paralysis: 6,
        breath:    5,
        spells:    8,
      };

    case 16:
    case 17:
    case 18:
      return {
        death:     2,
        wands:     3,
        paralysis: 4,
        breath:    3,
        spells:    6,
      };

    case 19:
    case 20:
    case 21:
      return {
        death:     2,
        wands:     2,
        paralysis: 2,
        breath:    2,
        spells:    4,
      };
    default:
      return {
        death:     2,
        wands:     2,
        paralysis: 2,
        breath:    2,
        spells:    2,
      };
  }
}


// Map Generation
function stringToGrid(s, world) {
  world.grid = [];
  let widthObtained = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '\n') {
      world.grid.push(
        {
          tile: s[i],
          collision: s[i] === Tile.Wall || s[i] === Tile.ClosedDoor,
          visible: true,
          entity_id: 0,
        }
      );
      world.width += (1 - widthObtained);
    } else {
      world.height++;
      widthObtained = 1;
    }
  }
}

// Our currenty entity system maps entities directly by index for fast lookup
// the downside is that it is difficult to remove entities
// one option is to set the deleted entity in the array to null which
// allows for cleanup, but fragments the array and will require null checks
function spawnEntity(pos, world, entity) {
  entity.position = pos;
  entity.id = world.entities.length + 1;
  world.grid[pos.y * world.width + pos.x].entity_id = entity.id;
  world.entities.push(entity);
}

// Text Window
function setText(s) {
  text.innerText = s;
}
function appendText(s) {
  text.innerText += "\n\n" + s;
}
function writeDescription(s) {
  text.innerHTML += "<p style='color: yellow;'>" + s + "</p><br />";
}
function writeAction(s) {
  text.innerHTML += "<p style='color: red;'>" + s + "</p><br />";
}
function clearText() {
  text.innerHTML = "";
}

// Title screen
function drawMainMenu(img, ctx, world) {
  const frameWidth = 4;
  const xShift = 325;
  const yShift = 128;
  const optionXShift = 364; 
  const optionYShift = 160; 
  const optionOffset = 64; 
  const highlightColor = Color.DarkOrange;

  // Draw Background
  ctx.fillStyle = Color.Brown;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, frameWidth, frameWidth, canvas.width - 2 * frameWidth, canvas.height - 2 * frameWidth);

  // Draw Title Text
  ctx.font = "small-caps bold 64px cursive";
  ctx.fillStyle = "#101010";
  ctx.strokeStyle = Color.Orange;
  ctx.fillText("Rogue JS", xShift, yShift);
  ctx.strokeText("Rogue JS", xShift, yShift);

  // Draw Options and selection highlight
  ctx.font = "small-caps bold 36px cursive";

  for (let i = 0; i < world.options.length; i++) {
    if (world.options[world.selection] === world.options[i]) {
      ctx.fillStyle = highlightColor;
    } else {
      ctx.fillStyle = "#101010";
    }
    ctx.fillText(world.options[i], optionXShift, optionYShift + optionOffset * (i + 1));
    ctx.strokeText(world.options[i], optionXShift, optionYShift + optionOffset * (i + 1));
  }
}

// Sidebar window
function drawSideBar(ctx, x, y) {
  const frameWidth = 4;
  ctx.fillStyle = Color.Brown;
  ctx.strokeStyle = Color.DarkBrown;
  ctx.fillRect(x, y, sideWidth, canvas.height);
  ctx.strokeRect(x, y, sideWidth, canvas.height);
  ctx.fillStyle = Color.DarkBrown;
  ctx.fillRect(x + frameWidth, y + frameWidth, sideWidth - frameWidth * 2, canvas.height - frameWidth * 2);
}

// Game Window
function drawGrid(ctx, world) {
  switch (world.renderer) {
    case RenderingMode.Ascii:
      renderAscii(ctx, world);
      break;
    case RenderingMode.Tile:
      renderTile(ctx, world);
      break;
    default:
      renderAscii(ctx, world);
  }
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearGrid(ctx) {
  ctx.clearRect(sideWidth, 0, canvas.width - sideWidth * 2, canvas.height);
}

function drawDebugGrid(ctx, world) {
  const res = world.camera.resolution;

  ctx.strokeStyle = "green";

  for (let n = 0; n < 22; n++) {
    // Row Line
    ctx.beginPath();
    ctx.moveTo(sideWidth, n * res);
    ctx.lineTo(sideWidth + canvas.height, n * res);
    ctx.stroke();
    ctx.closePath();
    // Col Line
    ctx.beginPath();
    ctx.moveTo(sideWidth + n * res, 0);
    ctx.lineTo(sideWidth + n * res, canvas.height);
    ctx.stroke();
    ctx.closePath();
  }
}

function drawDebugStaticZone(ctx, world) {
  const res = world.camera.resolution;
  const zoneBuffer = world.camera.deadZone;
  const halfWidth = canvas.width / 2;
  const halfHeight = canvas.height / 2;
  const halfRes = res / 2;
  const leftBound = halfWidth - zoneBuffer * res - halfRes;
  const rightBound = halfWidth + zoneBuffer * res + halfRes;
  const topBound = halfHeight + zoneBuffer * res + halfRes;
  const lowerBound = halfHeight - zoneBuffer * res - halfRes;

  ctx.strokeStyle = "red";

  ctx.beginPath();
  ctx.moveTo(leftBound, topBound);
  ctx.lineTo(rightBound, topBound);
  ctx.lineTo(rightBound, lowerBound);
  ctx.lineTo(leftBound, lowerBound);
  ctx.lineTo(leftBound, topBound);
  ctx.stroke();
  ctx.closePath();
}

// Rendering with ASCII
// canvas grid center = camera position
function renderAscii(ctx, world) {
  const textOffsetX = 2;
  const textOffsetY = 3;
  const center = Math.floor(canvasGrids / 2);
  const res = world.camera.resolution;

  //ctx.font = "24px sans-serif";
  ctx.font = "24px serif";
  ctx.fillStyle = Color.White;

  let rowOffset = 0;
  let colOffset = 0;
  let square = null;

  // Draw Map Tile
  for (let row = 0; row < canvasGrids; row++) {
    for (let col = 0; col < canvasGrids; col++) {
      rowOffset = world.camera.position.y - center + row;
      colOffset = world.camera.position.x - center + col;
      if (0 <= rowOffset
          && rowOffset < world.width
          && 0 <= colOffset
          && colOffset < world.height)
      {
        square = world.grid[rowOffset * world.width + colOffset];
        if (square.entity_id !== 0) {
          square = world.entities[square.entity_id - 1];
        }
        ctx.fillStyle = matchTileColor(square.tile);
        ctx.fillText(square.tile,
          sideWidth + res * col + textOffsetX,
          (1 + row) * res - textOffsetY);
      }
    }
  }
}

function renderTile(ctx, world) {
  renderAscii(ctx, world);
  console.log("Render Tile");
}

// Handle camera movement
function moveCamera(world) {
  const buffer = world.camera.deadZone;
  const dx = Math.abs(world.entities[0].position.x - world.camera.position.x);
  const dy = Math.abs(world.entities[0].position.y - world.camera.position.y);
  const dir = world.entities[0].orientation;

  if (dx > buffer || dy > buffer) {
    world.camera.position.x += dir.x;
    world.camera.position.y += dir.y;
  }
}

// Handle player movement and collision
// Takes in a direction map (up down left right)
// Returns true for success, false for failure to move
function moveEntity(entity_id, dir, world) {
  const oldPosition = world.entities[entity_id - 1].position;
  const currSquare = world.grid[oldPosition.y * world.width + oldPosition.x];
  const newPosition = {
    x: oldPosition.x + dir.x,
    y: oldPosition.y + dir.y,
  }

  // Check bounds
  if (newPosition.x < 0
   || newPosition.x >= world.width
   || newPosition.y < 0
   || newPosition.y >= world.height) {
    return false;
  }

  const nextSquare = world.grid[newPosition.y * world.width + newPosition.x];

  // Check collision for terrain
  if (nextSquare.collision) {
    return false;
  }

  // Check collision for entities
  if (nextSquare.entity_id) {
    if (world.entities[nextSquare.entity_id - 1].collision) {
      return false;
    }
  }

  currSquare.entity_id = 0;
  nextSquare.entity_id = entity_id;
  world.entities[entity_id - 1].position = newPosition;

  // If the entity is the player, handle camera movement
  if (entity_id === player.id) {
    world.entities[0].orientation = dir;
    world.events.push(Event.playerMoved);
  }

  return true;
}

// When an option is entered, this function will handle the state changes
function handleSelectOption(world) {
  switch(world.options[world.selection]) {
    case MainMenuOption.Continue:
      console.log("Continue");
      break;
    case MainMenuOption.NewGame:
      console.log("NewGame");
      break;
    case MainMenuOption.Tutorial:
      world.events.push(Event.enterTutorial);
      break;
  }
}

// Event Listener for controlling menu input
function menuInput(world) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      let keyDetected = false;

      switch (e.key) {
        case Action.MoveUp:
          keyDetected = true;
          world.selection = (world.selection + world.options.length - 1) % world.options.length;
          break;
        case Action.MoveDown:
          keyDetected = true;
          world.selection = (world.selection + 1) % world.options.length;
          break;
        case Action.Enter:
          keyDetected = true;
          world.events.push(Event.exitMainMenu);
          handleSelectOption(world);
          break;
      }

      if (keyDetected) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve();
      }
    }
  });
}

// Event Listener for controlling player input
function playerInput(world) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      let keyDetected = false;

      switch (e.key) {
        case Action.MoveUp:
          keyDetected = true;
          moveEntity(1, Direction.Up, world);
          break;
        case Action.MoveDown:
          keyDetected = true;
          moveEntity(1, Direction.Down, world);
          break;
        case Action.MoveLeft:
          keyDetected = true;
          moveEntity(1, Direction.Left, world);
          break;
        case Action.MoveRight:
          keyDetected = true;
          moveEntity(1, Direction.Right, world);
          break;
      }

      if (keyDetected) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve();
      }
    }
  });
}

// Handle all event signals and state transitions here
function handleEvent(ctx, world) {
  for (let i = 0; i < world.events.length; i++) {
    switch (world.events[i]) {
      case Event.playerMoved:
        moveCamera(world);
        clearGrid(ctx);
        drawGrid(ctx, world);
        if (world.debug) {
          drawDebugGrid(ctx, world);
          drawDebugStaticZone(ctx, world);
        }
        break;

      case Event.enterMainMenu:
        world.state = GameState.MainMenu;
        world.selection = 0;
        break;
      case Event.exitMainMenu:
        clearCanvas(ctx);
        break;

      case Event.enterTutorial:
        world.state = GameState.Loading;
        initializeTutorial(ctx, world);
        world.state = GameState.Running;
        break;
    }
  }
  // Drain the event queue
  // Prevents dangling pointer issues
  while (world.events.pop());
}

// Core game: input is blocking
async function runGame(ctx, world) {
  if (world.saveFileExists) {
    world.options.push(MainMenuOption.Continue);
  }
  world.options.push(MainMenuOption.NewGame);
  world.options.push(MainMenuOption.Tutorial);
  world.events.push(Event.enterMainMenu);

  // Main Loop
  while (true) {

    // Handle all events and state transitions
    handleEvent(ctx, world);

    switch(world.state) {
      case GameState.MainMenu:
        drawMainMenu(bgArt, ctx, world);
        await menuInput(world);
        clearCanvas(ctx);
        break;

      case GameState.Running:
        await playerInput(world);
        break;

      default:
        break;
    }
  }
}

function initializeTutorial(ctx, world) {
  const testMap =
    "#####################\n" + 
    "#...................#\n" +
    "#...................#\n" +
    "#..#............##..#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#......>.....'......#\n" +
    "#......<............#\n" +
    "#...........+.......#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#..##...........##..#\n" +
    "#..##............#..#\n" +
    "#...................#\n" +
    "#...................#\n" +
    "#####################\n"

  stringToGrid(testMap, world);

  spawnEntity({x: 10, y: 10}, world, player);
  spawnEntity({x: 11, y: 10}, world, bob);

  world.camera.position = world.entities[player.id - 1].position;

  drawSideBar(ctx, 0, 0);
  drawSideBar(ctx, canvas.width - sideWidth, 0);
  drawGrid(ctx, world);
  if (world.debug) {
    drawDebugGrid(ctx, world);
    drawDebugStaticZone(ctx, world);
  }
}

// Player Data
// Player is an entity
// Every entity has an id, position, tile, and collision flag
const player = {
  id: 1,
  position: {x: 0, y: 0},
  orientation: Direction.Up,
  tile: Tile.Player,
  collision: true,
  visible: true,
  name: "",
  ancestry: Ancestries.Human,
  class: Classes.Fighter,
  alignment: 0, // -5 to 5 (Chaos, Law)
  level: 1,
  experience: 0,
  gold: 0,
  weight: 0, // in gold coins
  inventory: [],
  equipment: [],
  speed: 24, // squares per turn (10 in-game minutes)
  stats: {
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
      maxStr: 0,
      maxDex: 0,
      maxCon: 0,
      maxInt: 0,
      maxWis: 0,
      maxCha: 0,
    },
  saves: {
      death: 0,
      wands: 0,
      paralysis: 0,
      breath: 0,
      spells: 0,
    },
  hitPoints: 0,
  maxHitPoints: 0,
  armorClass: 0,
  maxArmorClass: 0,
  attack: 0, // 20 - THAC0
}

// Bob is a prototypical NPC
const bob = {
  id: 0,
  position: {x: 0, y: 0},
  tile: Tile.Merchant,
  collision: true,
  visible: true,
  name: "Bob",
  type: "Normal Human",
  description: "A bald man with a noticable underbite.",
  isPerson: true,
  morale: 7,
  alignment: 0, // -5 to 5 (Chaos, Law)
  level: 0,
  experience: 0,
  gold: 10,
  inventory: [],
  speed: 24, // squares per turn (10 in-game minutes)
  saves: {
      death: 14,
      wands: 15,
      paralysis: 16,
      breath: 17,
      spells: 18,
    },
  immunity: {
      acid: 0,
      cold: 0,
      electric: 0,
      fire: 0,
      mundane: 0,
      poison: 0,
      sleep: 0,
      petrification: 0,
    },
  hitPoints: 1,
  maxHitPoints: 1,
  armorClass: 9,
  maxArmorClass: 9,
  attack: 0, // 20 - THAC0
}


// GAME
// If character exists in localStorage -> Load character and continue
// else -> run character creation and initialize a new world
runGame(ctx, world);
