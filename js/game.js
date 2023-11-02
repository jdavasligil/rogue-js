// Copyright (c) 2023 Jaedin Davasligil
//
// Rogue-JS is a pure javascript browser dungeon crawler.

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
const debug = true;

// Color Palette
const dungeonBrown = "#241b06";
const dungeonDarkBrown = "#151004";
const dungeonOrange = "#EFBC74";

// RNG
const rng = mulberry32(seed);

function roll(n,m) {
  var total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.round(1 + rng() * (m - 1));
  }

  return total;
}

// Types of map tiles.
const Tiles = {
  Floor: ".",
  Wall: "#",
  OpenDoor: "'",
  ClosedDoor: "+",
  StairsUp: "<",
  StairsDown: ">",
  Player: "@",
}

const RenderingMode = {
  Ascii: 0,
  Tile: 1,
}

// Player Data
const player = {
  id: 1,
  position: {x: 0, y: 0},
  tile: Tiles.Player,
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
  grid: [],
  camera: camera,
  renderer: RenderingMode.Tile,
  entities: [],
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
  ctx.fillStyle = dungeonBrown;
  ctx.strokeStyle = dungeonDarkBrown;
  ctx.fillRect(x, y, sideWidth, canvasHeight);
  ctx.strokeRect(x, y, sideWidth, canvasHeight);
  ctx.fillStyle = dungeonDarkBrown;
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
  ctx.fillStyle = dungeonOrange;

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
        if (square.entity_id === 0) {
          ctx.fillText(square.tile,
            sideWidth + res * col + textOffsetX,
            (1 + row) * res - textOffsetY);
        } else {
          ctx.fillText(world.entities[square.entity_id - 1].tile,
            sideWidth + res * col + textOffsetX,
            (1 + row) * res - textOffsetY);
        }
      }
    }
  }
}

function renderTiles(ctx, world) {
  renderAscii(ctx, world);
  console.log("Render Tiles");
}

// Testing
const testMap =
  "#####################\n" + 
  "#...................#\n" +
  "#...................#\n" +
  "#..#............##..#\n" +
  "#...................#\n" +
  "#...................#\n" +
  "#...................#\n" +
  "#...................#\n" +
  "#...................#\n" +
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
drawGrid(ctx, world);

//writeDescription("The green slime appears sentient. It smells terribly strong of ammonia.");
//writeAction("The slime attacks you!");
