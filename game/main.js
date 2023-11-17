/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

// TODO
// [ ] Refactor into modules.
// [ ] Character Creation
// [ ] Level Generation
// [ ] Combat
// [ ] Serialization

"use strict";

import { mulberry32 } from "../lib/fast-random.js";
import { RingBuffer } from "../lib/ring-buffer.js";
import { Camera } from "./camera.js";
import { ChunkManager } from "./chunk-manager.js";
import { EntityManager } from "./entity-manager.js";

const T = require("./types.js");

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const bgArt = document.getElementById("bg-art");
const ctx = canvas.getContext("2d");

// Constants
const sideWidth = Math.floor((canvas.width - canvas.height) / 2);
const gridResolution = 18; // 18, 24, 32

// A fixed seed is useful for recreating random state.
const seed = 12345;

// Enable this to turn on debug mode.
const debug = false;

// Random Number Generator
const rng = mulberry32(seed);

// Load ancestries and classes from data
//const Ancestries = await getJSON("./data/ancestries.json");
//const Classes = await getJSON("./data/classes.json");

/**
 * Constructor for the world.
 * @returns {T.World}
 */
function newWorld() {
  return {
    chunks: new ChunkManager(),
    entities: new EntityManager(),
    events: new RingBuffer(),
    camera: new Camera(),
    renderer: RenderingMode.Ascii,
    turn: 0,
    state: GameState.Loading,
    options: [],
    selection: 0,
    saveFileExists: false,
    debug: false,
  };
}

// Returns a monsters attack bonus based on their level
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
function spawnEntity(pos, world, entity) {
  entity.position = pos;
  entity.id = world.entities.length + 1;
  world.grid[pos.y * world.width + pos.x].entity_id = entity.id;
  world.entities.push(entity);
}

// Text Window
/**
 *
 */
function setText(text, s) {
  text.innerText = s;
}
/**
 *
 */
function appendText(text, s) {
  text.innerText += "\n\n" + s;
}
/**
 *
 */
function writeDescription(text, s) {
  text.innerHTML += "<p style='color: yellow;'>" + s + "</p><br />";
}
/**
 *
 */
function writeAction(text, s) {
  text.innerHTML += "<p style='color: red;'>" + s + "</p><br />";
}
/**
 *
 */
function clearText() {
  text.innerHTML = "";
}

// Title screen
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
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

/**
 *
 */
function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 *
 */
function clearGrid(ctx) {
  ctx.clearRect(sideWidth, 0, canvas.width - sideWidth * 2, canvas.height);
}

/**
 *
 */
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

/**
 *
 */
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
/**
 *
 */
function renderAscii(ctx, world) {
  const textOffsetX = 2;
  const textOffsetY = 3;
  const canvasGrids = Math.floor(canvas.height / gridResolution);
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

/**
 *
 */
function renderTile(ctx, world) {
  renderAscii(ctx, world);
  console.log("Render Tile");
}

// Handle camera movement
/**
 *
 */
function moveCamera(world, dir) {
  const buffer = world.camera.deadZone;
  const dx = Math.abs(world.entities[0].position.x - world.camera.position.x);
  const dy = Math.abs(world.entities[0].position.y - world.camera.position.y);

  if (dx > buffer || dy > buffer) {
    world.camera.position.x += dir.x;
    world.camera.position.y += dir.y;
  }
}

// Handle player movement and collision
// Takes in a direction map (up down left right)
// Returns true for success, false for failure to move
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
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
/**
 *
 */
function handleEvents(ctx, world) {
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
/**
 *
 */
async function runGame(ctx, world) {

  const world = newWorld();

  if (world.saveFileExists) {
    world.options.push(MainMenuOption.Continue);
  }
  world.options.push(MainMenuOption.NewGame);
  world.options.push(MainMenuOption.Tutorial);
  world.events.push(Event.enterMainMenu);

  // Main Loop
  while (true) {

    // Handle all events and state transitions
    handleEvents(ctx, world);

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

//runGame(ctx);
