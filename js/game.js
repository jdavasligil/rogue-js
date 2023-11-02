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
}

const RenderingMode = {
  Ascii: 0,
  Tile: 1,
}

// Player Data
const player = {
  id: 1,
  position: {x: 0, y: 0},
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
  pos: {x: 0, y: 0},
  resolution: 24, // 1 tile = 50 Pixels
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
      renderTile(ctx, world);
      break;
    default:
      renderAscii(ctx, world);
  }
}

// Rendering with ASCII
function renderAscii(ctx, world) {
  ctx.font = "24px sans-serif";
  ctx.fillStyle = dungeonOrange;
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;

  const textOffset = 5;
  const res = world.camera.resolution;

  for (var row = 0; row < world.height; row++) {
    for (var col = 0; col < world.width; col++) {
      ctx.fillText(world.grid[row * world.width + col].tile, sideWidth + res * col, (1 + row) * res - textOffset);
      if (world.debug) {
        ctx.strokeRect(sideWidth + res * col, row * res, res, res);
      }
    }
  }
}

function renderTile(ctx, world) {
  renderAscii(ctx, world);
  console.log("Render Tiles");
}

// Testing
const testMap =
  "##############\n" + 
  "#............#\n" +
  "#............#\n" +
  "#............#\n" +
  "#............#\n" +
  "#............#\n" +
  "##############\n"

stringToGrid(testMap, world);
spawnPlayer({x: 5, y: 3}, world, player);
drawGrid(ctx, world);

//writeDescription("The green slime appears sentient. It smells terribly strong of ammonia.");
//writeAction("The slime attacks you!");
