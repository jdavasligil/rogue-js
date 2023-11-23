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
import { Player } from "./archetype/player.js";
import { ChunkManager } from "./chunk-manager.js";
import { EntityManager } from "./entity-manager.js";
import { World } from "./map-generation.js";
import { RenderEngine } from "./render/render.js";
import { Action, Direction, Event, MainMenuOption } from "./types.js";

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

  game.chunks.replaceID(id);

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
          moveEntity(game.player.id, Direction.Up, game);// TODO Make work with manager
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
 * @param {Game} game - Game data
 */
function handleEvents(game) {
  while (game.events.length > 0) {
    switch (game.events.popFront()) {
      case Event.PlayerMoved:
        game.chunks.update(game.player.position, game.world, true);
        game.renderer.updateCamera(game.entities, game.player.id);
        game.renderer.clearGrid();
        game.renderer.draw(game.entities, game.chunks);
        if (game.debug) {
          game.renderer.drawDebugGrid();
          game.renderer.drawDebugDeadZone();
        }
        break;

      case Event.EnterMainMenu:
        game.state = GameState.MainMenu;
        game.selection = 0;
        break;

      case Event.ExitMainMenu:
        game.renderer.clearCanvas();
        break;

      case Event.EnterTutorial:
        game.state = GameState.Loading;

        game.player = new Player();
        game.entities.insert(game.player);
        game.world = new World(1337);

        let spawn = game.world.generateTown();
        game.player.position = spawn;
        game.renderer.camera.setPosition(spawn);

        game.chunks = new ChunkManager(
          spawn,
          game.world.width,
          game.world.height,
          2
        );
        game.chunks.update(spawn, game.world, true);
        game.renderer.draw(game.entities, game.chunks);

        game.state = GameState.Running;
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
