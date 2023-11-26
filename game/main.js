/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

// TODO
// [ ] Character Creation
// [ ] Level Generation
// [ ] Combat

"use strict";

import { RingBuffer } from "../lib/ring-buffer.js";
import { Monster } from "./archetype/monster.js";
import { InteractMode, Player } from "./archetype/player.js";
import { ChunkManager } from "./chunk-manager.js";
import { EntityManager } from "./entity-manager.js";
import { Action } from "./keybind.js";
import { World } from "./map-generation.js";
import { RenderEngine } from "./render/render.js";
import { Direction, Event, MainMenuOption } from "./types.js";

/**
 * @typedef {Object} Game
 * @property {boolean} debug - Debugging.
 * @property {GameState} state - Active game state.
 * @property {Array.<MainMenuOption>} menu - Main menu option list.
 * @property {number} selection - Menu option selection.
 * @property {Player | null} player - The player character.
 * @property {RingBuffer} events - The event queue.
 * @property {World | null} world - The generated world template.
 * @property {ChunkManager | null} chunks - The chunks of the map loaded in memory.
 * @property {EntityManager} entities - The entities loaded in memory.
 * @property {RenderEngine} renderer - The renderer draws the game.
 */

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

// Load ancestries and classes from data
//const Ancestries = await getJSON("./data/ancestries.json");
//const Classes = await getJSON("./data/classes.json");

/**
 * Initialize the tutorial / test map.
 * @param {Game} game - Game data.
 * @param {number} seed - RNG seed.
 */
function initTutorial(game, seed) {
  game.state = GameState.Loading;

  game.player = new Player();
  const monster = new Monster();
  monster.maxHitPoints = 1 ;
  monster.hitPoints = 1 ;
  game.entities.insert(game.player);
  game.entities.insert(monster);
  game.world = new World(seed);

  let spawn = game.world.generateTestMap();
  game.player.position = spawn;
  monster.position = {x: spawn.x + 2, y: spawn.y};
  game.renderer.camera.setPosition(spawn);

  game.chunks = new ChunkManager(
    spawn,
    game.world.width,
    game.world.height,
    1
  );
  game.chunks.update(game.player.position, game.world, game.entities, true);
  game.chunks.setID(game.player.position, game.player.id);
  game.chunks.setID(monster.position, monster.id);
  game.player.target = monster;

  redraw(game);

  game.state = GameState.Running;
}

/**
 * Redraw the game grid.
 * @param {Game} game - Game data.
 */
function redraw(game) {
  game.renderer.draw(game.entities, game.chunks);
  if (game.debug) {
    game.renderer.drawDebugGrid();
    game.renderer.drawDebugDeadZone();
  }
  if (game.player && game.world) {
    game.renderer.drawUI(game.player, game.world);
  }
}

/**
 * Handle entity movement and collision.
 * @param {import("./entity-manager.js").EntityID} id - An entity ID.
 * @param {Direction} dir - Movement direction.
 * @param {Game} game - Game data.
 * @returns {boolean}
 */
function moveEntity(id, dir, game) {
  const entity = game.entities.lookup(id);

  if (entity === undefined) return false;

  const newPosition = {
    x: entity.position.x + dir.x,
    y: entity.position.y + dir.y,
  }

  // Check bounds
  if (newPosition.x < 0
   || newPosition.x >= game.world.width
   || newPosition.y < 0
   || newPosition.y >= game.world.height) {
    return false;
  }

  // Check collision for terrain
  if (game.chunks.getCollision(newPosition)) {
    return false;
  }

  // Check collision for entities
  const eid = game.chunks.getID(newPosition);
  if (eid && game.entities.lookup(eid).collision) {
    return false;
  }

  game.chunks.setID(newPosition, id);
  game.chunks.popID(entity.position);

  entity.position.x = newPosition.x;
  entity.position.y = newPosition.y;
  entity.orientation = dir;

  if (id === game.player.id) {
    game.events.pushBack(Event.PlayerMoved);
  }

  return true;
}

/**
 * Handles state menu state changes on option selection.
 * @param {Game} game - Game data.
 */
function handleSelectOption(game) {
  switch(game.menu[game.selection]) {
    case MainMenuOption.Continue:
      console.log("Continue");
      break;
    case MainMenuOption.NewGame:
      console.log("NewGame");
      break;
    case MainMenuOption.Tutorial:
      game.events.pushBack(Event.EnterTutorial);
      break;
  }
}

// 
/**
 * Event Listener for controlling menu input
 * @param {Game} game - Game data. 
 */
function menuInput(game) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      let keyDetected = false;

      switch (e.key) {
        case Action.MoveUp:
          keyDetected = true;
          game.selection = (game.selection + game.menu.length - 1) % game.menu.length;
          break;
        case Action.MoveDown:
          keyDetected = true;
          game.selection = (game.selection + 1) % game.menu.length;
          break;
        case Action.Enter:
          keyDetected = true;
          game.events.pushBack(Event.ExitMainMenu);
          handleSelectOption(game);
          break;
      }

      if (keyDetected) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve();
      }
    }
  });
}

/**
 * Event Listener for controlling player input.
 * @param {Game} game - Game data.
 */
function playerInput(game) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      let keyDetected = false;

      switch (e.key) {
        case Action.MoveUp:
          keyDetected = true;
          moveEntity(game.player.id, Direction.Up, game);
          break;
        case Action.MoveDown:
          keyDetected = true;
          moveEntity(game.player.id, Direction.Down, game);
          break;
        case Action.MoveLeft:
          keyDetected = true;
          moveEntity(game.player.id, Direction.Left, game);
          break;
        case Action.MoveRight:
          keyDetected = true;
          moveEntity(game.player.id, Direction.Right, game);
          break;
        case Action.ZoomIn:
          keyDetected = true;
          game.renderer.camera.increaseResolution();
          redraw(game);
          break;
        case Action.ZoomOut:
          keyDetected = true;
          game.renderer.camera.decreaseResolution();
          redraw(game);
          break;
        case Action.NormalMode:
          keyDetected = true;
          game.player.mode = InteractMode.Normal;
          redraw(game);
          break;
        case Action.SocialMode:
          keyDetected = true;
          game.player.mode = InteractMode.Social;
          redraw(game);
          break;
        case Action.StealthMode:
          keyDetected = true;
          game.player.mode = InteractMode.Stealth;
          redraw(game);
          break;
        case Action.CombatMode:
          keyDetected = true;
          game.player.mode = InteractMode.Combat;
          redraw(game);
          break;
        case Action.Debug:
          keyDetected = true;
          game.debug = game.debug ? false : true;
          redraw(game);
          break;
      }

      if (keyDetected) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve();
      }
    }
  });
}

/**
 * Handle all event signals and state transitions here
 * @param {Game} game - Game data
 */
function handleEvents(game) {
  while (game.events.length > 0) {
    switch (game.events.popFront()) {
      case Event.PlayerMoved:
        // Time Tracking
        game.player.moves = (game.player.moves + 1) % game.player.speed;
        if (game.player.moves === 0) {
          game.player.turn += 1;
          game.world.time += 10;
        }
        // Chunks
        game.chunks.update(game.player.position, game.world, game.entities);
        game.renderer.updateCamera(game.player);
        redraw(game);
        break;

      case Event.EnterMainMenu:
        game.state = GameState.MainMenu;
        game.selection = 0;
        break;

      case Event.ExitMainMenu:
        game.renderer.clearCanvas();
        break;

      case Event.EnterTutorial:
        initTutorial(game, 3);
        break;
    }
  }
}

/**
 * Core Game Loop using Finite State Machine logic.
 */
async function runGame() {

 // Get DOM elements and context
 // const text = document.getElementById("game-text");

  /** @type {Game} */
  const Game = {
    debug: true,
    state: GameState.MainMenu,
    menu: [],
    selection: 0,
    player: window.localStorage.getItem("save"),
    events: new RingBuffer(),
    world: null,
    chunks: null,
    entities: new EntityManager(),
    renderer: new RenderEngine(document.getElementById("game-canvas")),
  }

  if (Game.player !== null) {
    Game.menu.push(MainMenuOption.Continue);
  }
  Game.menu.push(MainMenuOption.NewGame);
  Game.menu.push(MainMenuOption.Tutorial);

  Game.events.pushBack(Event.EnterMainMenu);

  while (true) {

    handleEvents(Game);

    switch(Game.state) {
      case GameState.MainMenu:
        Game.renderer.drawMainMenu(Game.selection, Game.menu);
        await menuInput(Game);
        Game.renderer.clearCanvas();
        break;

      case GameState.Running:
        await playerInput(Game);
        break;

      default:
        break;
    }
  }
}

runGame();
