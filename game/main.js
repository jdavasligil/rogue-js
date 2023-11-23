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

// Constants
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


// Handle camera movement
/**
 * @param {Renderer} renderer - The render engine.
 */
function moveCamera(renderer, em, dir) {
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
    drawDebugDeadZone(ctx, world);
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
