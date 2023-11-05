// Copyright (c) 2023 Jaedin Davasligil
//
// Rogue-JS is a pure javascript browser Colors. crawler.

// TODO
// [ ] Character Creation
// [ ] Level Generation
// [ ] Serialization

"use strict";

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const ctx = canvas.getContext("2d");

// Set tweakable constants
const canvasWidth = 896;
const canvasHeight = 504;
const sideWidth = Math.floor((canvasWidth - canvasHeight) / 2); // 196

const gridResolution = 24;
const canvasGrids = Math.floor(canvasHeight / gridResolution);

const seed = 12345;
const debug = false;

// RNG
const rng = mulberry32(seed);

function roll(n,m) {
  var total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.round(1 + rng() * (m - 1));
  }

  return total;
}

// Action Key Binds
const Actions = {
  MoveUp:    "ArrowUp",
  MoveDown:  "ArrowDown",
  MoveLeft:  "ArrowLeft",
  MoveRight: "ArrowRight",
}

// Directions
const Directions = {
  Up:    {x: 0, y:-1},
  Down:  {x: 0, y: 1},
  Left:  {x:-1, y: 0},
  Right: {x: 1, y: 0},
}

// Types of map tiles.
const Tiles = {
  Floor:      ".",
  Wall:       "#",
  OpenDoor:   "'",
  ClosedDoor: "+",
  StairsUp:   "<",
  StairsDown: ">",
  Player:     "@",
}

// Color Palette
const Colors = {
  White:     "#E1D9D1",
  Slate:     "#3C3A2D",
  Brown:     "#684E11",
  DarkBrown: "#151004",
  Orange:    "#EFBC74",
  MagicBlue: "#0784b5",
}

// Event Signals
const Events = {
  entityMoved: 0,
}

// Takes in a tile (string) and returns a color (string)
// Used in the Ascii Renderer to determine default tile colors
// Can be overwritten by colors set by an entity
function matchTileColor(tile) {
  switch(tile) {
    case Tiles.Floor:
      return Colors.Slate;

    case Tiles.OpenDoor:
    case Tiles.ClosedDoor:
      return Colors.Brown;

    case Tiles.Player:
      return Colors.MagicBlue;

    case Tiles.StairsUp:
    case Tiles.StairsDown:
      return Colors.White;

    default:
      return Colors.Orange;
  }
}

const RenderingMode = {
  Ascii: 0,
  Tile: 1,
}

// Player Data
// Player is an entity.
// Every entity has an id, position, tile, and collision flag.
const player = {
  id: 1,
  position: {x: 0, y: 0},
  tile: Tiles.Player,
  collision: false,
  inventory: [],
  equipment: [],
  stats: {
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
    },
  hitpoints: 0,
  armor: 0,
}

// Example of a grid square object
// const square = {
//   tile: Tiles.Wall,
//   collision: true,
//   visible: true,
//   entity_id: 0,
// }

// Camera determines the zoom level and position of the camera.
// Always draws an N x N grid.
const camera = {
  position: {x: 0, y: 0},
  resolution: gridResolution, // 1 tile = 24 Pixels
}

// World is a collection of game data for the entire world
const world = {
  grid: [],     // Array of Square objects
  entities: [], // Array of Entity objects (player, monsters, doors, etc.)
  events: [],   // Array of Event signals
  camera: camera,
  renderer: RenderingMode.Ascii,
  width: 0,
  height: 0,
  debug: debug,
}

// Map Generation
function stringToGrid(s, world) {
  world.grid = [];
  var widthObtained = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '\n') {
      world.grid.push(
        {
          tile: s[i],
          collision: s[i] === Tiles.Wall || s[i] === Tiles.ClosedDoor,
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

function spawnPlayer(pos, world, player) {
  player.position = pos;
  world.grid[pos.y * world.width + pos.x].entity_id = 1;
  world.entities.push(player);
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

// Sidebar window
function drawSideBar(ctx, x, y) {
  const frameWidth = 4;
  ctx.fillStyle = Colors.Brown;
  ctx.strokeStyle = Colors.DarkBrown;
  ctx.fillRect(x, y, sideWidth, canvasHeight);
  ctx.strokeRect(x, y, sideWidth, canvasHeight);
  ctx.fillStyle = Colors.DarkBrown;
  ctx.fillRect(x + frameWidth, y + frameWidth, sideWidth - frameWidth * 2, canvasHeight - frameWidth * 2);
}

// Game Window
function drawGrid(ctx, world) {
  switch (world.renderer) {
    case RenderingMode.Ascii:
      renderAscii(ctx, world);
      break;
    case RenderingMode.Tile:
      renderTiles(ctx, world);
      break;
    default:
      renderAscii(ctx, world);
  }
}

function clearGrid(ctx) {
  ctx.clearRect(sideWidth, 0, canvasWidth - sideWidth * 2, canvasHeight);
}

function drawDebugGrid(ctx, world) {
  const res = world.camera.resolution;

  ctx.strokeStyle = "green";

  for (var n = 0; n < 22; n++) {
    // Row Line
    ctx.beginPath();
    ctx.moveTo(sideWidth, n * res);
    ctx.lineTo(sideWidth + canvasHeight, n * res);
    ctx.stroke();
    ctx.closePath();
    // Col Line
    ctx.beginPath();
    ctx.moveTo(sideWidth + n * res, 0);
    ctx.lineTo(sideWidth + n * res, canvasHeight);
    ctx.stroke();
    ctx.closePath();
  }
}

function drawDebugStaticZone(ctx, world) {
  const res = world.camera.resolution;
  const zoneBuffer = 6;
  const leftBound = sideWidth + zoneBuffer * res;
  const rightBound = canvasWidth - sideWidth - zoneBuffer * res;
  const topBound = zoneBuffer * res;
  const lowerBound = canvasHeight - zoneBuffer * res;

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

  ctx.font = "24px sans-serif";
  ctx.fillStyle = Colors.White;

  var rowOffset = 0;
  var colOffset = 0;
  var square = null;

  // Draw Map Tiles
  for (var row = 0; row < canvasGrids; row++) {
    for (var col = 0; col < canvasGrids; col++) {
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

function renderTiles(ctx, world) {
  renderAscii(ctx, world);
  console.log("Render Tiles");
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
    console.log(nextSquare.entity_id);
    if (world.entities[nextSquare.entity_id].collision) {
      return false;
    }
  }

  currSquare.entity_id = 0;
  nextSquare.entity_id = entity_id;
  world.entities[0].position = newPosition;
  world.events.push(Events.entityMoved);

  return true;
}

// Event Listener
function waitingKeypress(world) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      var keyDetected = false;

      switch (e.key) {
        case Actions.MoveUp:
          keyDetected = true;
          moveEntity(1, Directions.Up, world);
          break;
        case Actions.MoveDown:
          keyDetected = true;
          moveEntity(1, Directions.Down, world);
          break;
        case Actions.MoveLeft:
          keyDetected = true;
          moveEntity(1, Directions.Left, world);
          break;
        case Actions.MoveRight:
          keyDetected = true;
          moveEntity(1, Directions.Right, world);
          break;
      }

      if (keyDetected) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve();
      }
    }
  });
}

function handleEvents(ctx, world) {
  var e = undefined;
  while ((e = world.events.pop()) !== undefined) {
    switch (e) {
      case Events.entityMoved:
        clearGrid(ctx);
        drawGrid(ctx, world);
        break;
    }
  }
}

// Game Loop
async function runGame(ctx, world) {
  while (true) {
    await waitingKeypress(world);
    handleEvents(ctx, world);
  }
}

// Testing
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

if (world.debug) {
  drawDebugGrid(ctx, world);
  drawDebugStaticZone(ctx, world);
}
stringToGrid(testMap, world);
spawnPlayer({x: 10, y: 10}, world, player);
//world.camera.position = world.entities[player.id - 1].position;
world.camera.position = {x: 10, y: 10};
drawSideBar(ctx, 0, 0);
drawSideBar(ctx, canvasWidth - sideWidth, 0);
drawGrid(ctx, world);

runGame(ctx, world);

//writeDescription("The green slime appears sentient. It smells terribly strong of ammonia.");
//writeAction("The slime attacks you!");
