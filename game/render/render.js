/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Player } from "../archetype/player.js";
import { Chunk, ChunkManager } from "../chunk-manager.js";
import { EntityManager } from "../entity-manager.js";
import { World } from "../map-generation.js";
import { Tile } from "../tile.js";
import { MainMenuOption } from "../types.js";
import { Camera } from "./camera.js";

/**
 * Enumeration of custom color palette colors.
 * @readonly
 * @enum {string}
 */
export const Color = {
  White:      "#E1D9D1",
  Night:      "#1E2229",
  Black:      "#000000",
  Slate:      "#3C3A2D",
  Brown:      "#684E11",
  Mocha:      "#171009",
  DarkBrown:  "#151004",
  Orange:     "#EFBC74",
  Blood:      "#FF1919",
  Green:      "#19ff21",
  DarkOrange: "#c4761b",
  MagicBlue:  "#193cff",
  Copper:     "#B87333",
  Silver:     "#C0C0C0",
  Steel:      "#8d8d94",
  Gold:       "#FFD700",
}

/**
 * Enumeration of rendering modes.
 * @readonly
 * @enum {number}
 */
export const RenderingMode = {
  Ascii: 0,
  Tile:  1,
}


/** Class responsible for rendering to the canvas */
export class RenderEngine {
  /**
   * Creates a renderer.
   * @param {HTMLCanvasElement} canvas - The canvas to be rendered to.
   * @param {RenderingMode} mode - Render in either Ascii or Image Tiles.
   */
  constructor(canvas, mode=RenderingMode.Ascii) {
    this.mode = mode;
    this.camera = new Camera();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sideWidth = Math.floor((canvas.width - canvas.height) / 2);
    this.bgColor = Color.Night;
    this.frameColor = Color.Brown;
  }

  /**
   * Used by renderer in ASCII mode to match default tile colors.
   * Overridden by colors set by an entity.
   * @param {Tile} tile - Tile enum.
   * @returns {Color}
   */
  static matchTileColor(tile) {
    switch(tile) {
      case Tile.Floor:
      case Tile.Bedrock:
        return Color.Slate;

      case Tile.OpenDoor:
      case Tile.ClosedDoor:
        return Color.Brown;

      case Tile.Player:
        return Color.MagicBlue;

      case Tile.StairsUp:
      case Tile.StairsDown:
      case Tile.Townsfolk:
        return Color.White;

      case Tile.Alchemist:   
        return Color.Green;
      case Tile.Armoury:     
        return Color.Steel;
      case Tile.BlackMarket: 
        return Color.Black;
      case Tile.Home:        
        return Color.White;
      case Tile.MagicShop:   
        return Color.MagicBlue;
      case Tile.Store:       
        return Color.Copper;
      case Tile.Temple:      
        return Color.Gold;
      case Tile.Weaponsmith: 
        return Color.Blood;

      default:
        return Color.Orange;
    }
  }

  /**
   * Used by renderer in ASCII mode to match tile ASCII symbol.
   * Overridden by colors set by an entity.
   * @param {Tile} tile - Tile enum.
   * @returns {Color}
   */
  static matchTile(tile) {
    switch(tile) {
      case Tile.Player:
        return '@';

      case Tile.Floor:
        return '.';
      case Tile.OpenDoor:
        return '`';
      case Tile.ClosedDoor:
        return '+';

      case Tile.PortcullisUp:
      case Tile.PortcullisDown:
        return ':';

      case Tile.StairsUp:
        return '<';
      case Tile.StairsDown:
        return '>';

      case Tile.Wall:
      case Tile.Bedrock:
      case Tile.Granite:
        return '#';
      case Tile.Rubble:
      case Tile.Quartz:      
      case Tile.Copper:      
      case Tile.Silver:      
      case Tile.Gold:        
        return '%';

      case Tile.Alchemist:   
        return '5';
      case Tile.Armoury:     
        return '3';
      case Tile.BlackMarket: 
        return '4';
      case Tile.Home:        
        return '0';
      case Tile.MagicShop:   
        return '6';
      case Tile.Store:       
        return '1';
      case Tile.Temple:      
        return '7';
      case Tile.Weaponsmith: 
        return '2';

      case Tile.RoomNode:    
        return '*';

      case Tile.Food:        
        return 'f';
      case Tile.Item:        
        return '?';
      case Tile.Potion:      
        return 'p';
      case Tile.Scroll:      
        return 's';
      case Tile.Treasure:    
        return '$';
      case Tile.Weapon:      
        return 'w';

      case Tile.Guard:       
        return 'g';
      case Tile.Mercenary:   
        return 'm';

      case Tile.Thief:       
      case Tile.Beggar:      
        return 'b';
      case Tile.Townsfolk:   
        return 't';

      case Tile.Dog:         
        return 'd';
      case Tile.Skeleton:    
        return 's';
      case Tile.Goblin:      
        return 'g';

      default:
        return '*';
    }
  }

  // TODO TEST
  /**
   * Update the camera based on the player's position.
   * @param {Player} player - Reference to the player.
   */
  updateCamera(player) {
    const dx = Math.abs(player.position.x - this.camera.position.x);
    const dy = Math.abs(player.position.y - this.camera.position.y);

    if (dx > this.camera.deadZone || dy > this.camera.deadZone) {
      this.camera.shift(player.orientation, 1);
    }
  }

  /**
   * Clear the canvas.
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Clears the grid area of the canvas only.
   */
  clearGrid() {
    this.ctx.clearRect(
      this.sideWidth,
      0,
      this.canvas.width - this.sideWidth * 2,
      this.canvas.height
    );
  }

  /**
   * Drawing function for the main menu.
   * @param {number} selection - Index selected (mod length of options).
   * @param {Array.<MainMenuOption>} options - List of main menu options.
   */
  drawMainMenu(selection, options) {
    const frameWidth = 4;
    const xShift = 325;
    const yShift = 128;
    const optionXShift = 364; 
    const optionYShift = 160; 
    const optionOffset = 64; 
    const highlightColor = Color.DarkOrange;

    // Draw Background
    this.ctx.fillStyle = Color.Brown;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      document.getElementById("bg-art"),
      frameWidth,
      frameWidth,
      this.canvas.width - 2 * frameWidth,
      this.canvas.height - 2 * frameWidth
    );

    // Draw Title Text
    this.ctx.font = "small-caps bold 64px cursive";
    this.ctx.fillStyle = "#101010";
    this.ctx.strokeStyle = Color.Orange;
    this.ctx.fillText("Rogue JS", xShift, yShift);
    this.ctx.strokeText("Rogue JS", xShift, yShift);

    // Draw Options and selection highlight
    this.ctx.font = "small-caps bold 36px cursive";

    for (let i = 0; i < options.length; i++) {
      if (options[selection] === options[i]) {
        this.ctx.fillStyle = highlightColor;
      } else {
        this.ctx.fillStyle = "#101010";
      }
      this.ctx.fillText(options[i], optionXShift, optionYShift + optionOffset * (i + 1));
      this.ctx.strokeText(options[i], optionXShift, optionYShift + optionOffset * (i + 1));
    }
  }

  /**
   * Draws the background for the side bars used for the UI.
   */
  drawSideBars() {
    this.ctx.strokeStyle = this.frameColor;
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.moveTo(this.sideWidth, 2);
    this.ctx.lineTo(this.sideWidth, this.canvas.height - 2);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - this.sideWidth, 2);
    this.ctx.lineTo(this.canvas.width - this.sideWidth, this.canvas.height - 2);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /**
   * Draws the background for the game grid.
   */
  drawBackground() {
    const frameWidth = 4;
    this.ctx.fillStyle = this.frameColor;
    this.ctx.strokeStyle = this.frameColor;
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(frameWidth, frameWidth, this.canvas.width - frameWidth * 2, this.canvas.height - frameWidth * 2);
  }

  /**
   * Draws the UI.
   */
  drawUI() {
    this.drawSideBars();
  }

  /**
   * Draws green grid lines useful for debugging alignment of tiles.
   */
  drawDebugGrid() {
    const res = this.camera.resolution;
    const gridCount = Math.floor(this.canvas.height / res);

    this.ctx.strokeStyle = "green";
    this.ctx.lineWidth = 1;

    // TODO: Replace Magic number 22 (number of row/col lines to draw)
    for (let n = 0; n < (gridCount + 1); n++) {
      if (((this.camera.position.y - Math.floor(gridCount / 2) + n) % Chunk.size) === 0) {
        this.ctx.strokeStyle = "blue";
      } else {
        this.ctx.strokeStyle = "green";
      }
      // Row Line
      this.ctx.beginPath();
      this.ctx.moveTo(this.sideWidth, n * res);
      this.ctx.lineTo(this.sideWidth + this.canvas.height, n * res);
      this.ctx.stroke();
      this.ctx.closePath();

      if (((this.camera.position.x - Math.floor(gridCount / 2) + n) % Chunk.size) === 0) {
        this.ctx.strokeStyle = "blue";
      } else {
        this.ctx.strokeStyle = "green";
      }
      // Col Line
      this.ctx.beginPath();
      this.ctx.moveTo(this.sideWidth + n * res, 0);
      this.ctx.lineTo(this.sideWidth + n * res, this.canvas.height);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  /**
   * Draws the camera deadzone area around the player.
   */
  drawDebugDeadZone() {
    const res = this.camera.resolution;
    const zoneBuffer = this.camera.deadZone;
    const halfWidth = this.canvas.width / 2;
    const halfHeight = this.canvas.height / 2;
    const halfRes = res / 2;

    const canvasGrids = Math.floor(this.canvas.height / res);

    let leftShift  = -halfRes;
    let rightShift =  halfRes;
    let topShift   =  halfRes;
    let lowShift   = -halfRes;

    if (canvasGrids % 2 === 0) {
      leftShift  = 0;
      rightShift = res;
      topShift   = 0;
      lowShift   = res;
    }

    const leftBound  = halfWidth  - zoneBuffer * res + leftShift;
    const rightBound = halfWidth  + zoneBuffer * res + rightShift;
    const topBound   = halfHeight - zoneBuffer * res + topShift;
    const lowerBound = halfHeight + zoneBuffer * res + lowShift;

    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(leftBound,  topBound);
    this.ctx.lineTo(rightBound, topBound);
    this.ctx.lineTo(rightBound, lowerBound);
    this.ctx.lineTo(leftBound,  lowerBound);
    this.ctx.lineTo(leftBound,  topBound);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /**
   * Draw chunks and entities that are loaded in.
   * @param {EntityManager} em - Entity Manager.
   * @param {ChunkManager} cm - Chunk Manager.
   */
  draw(em, cm) {
    this.clearGrid();
    this.drawBackground();

    switch (this.mode) {
      case RenderingMode.Ascii:
        this.renderAscii(em, cm);
        break;
      case RenderingMode.Tile:
        this.renderTile(em, cm);
        break;
      default:
        this.renderAscii(em, cm);
    }
    this.drawUI();
  }

  /**
   * Renders ASCII tiles to the screen grid.
   * @param {EntityManager} em - Entity Manager.
   * @param {ChunkManager} cm - Chunk Manager.
   */
  renderAscii(em, cm) {
    const res = this.camera.resolution;
    const textOffsetX = Math.round(res / 16);
    const textOffsetY = Math.round(res / 6);
    const canvasGrids = Math.floor(this.canvas.height / res);
    const center = Math.floor(canvasGrids / 2);

    //this.ctx.font = "24px sans-serif";
    this.ctx.font = `${res}px serif`;
    this.ctx.fillStyle = Color.White;

    let rowOffset = 0;
    let colOffset = 0;
    let tile;
    let entityID;

    // Iterate over all canvas grids, querying tiles in each.
    for (let row = 0; row < canvasGrids; row++) {
      for (let col = 0; col < canvasGrids; col++) {
        rowOffset = this.camera.position.y - center + row;
        colOffset = this.camera.position.x - center + col;

        tile = cm.getTile({x: colOffset, y: rowOffset});
        entityID = cm.getID({x: colOffset, y: rowOffset});

        if (entityID !== undefined) {
          tile = em.lookup(entityID).tile;
        }

        this.ctx.fillStyle = RenderEngine.matchTileColor(tile);
        if (tile !== undefined) {
          this.ctx.fillText(
            RenderEngine.matchTile(tile),
            this.sideWidth + res * col + textOffsetX,
            (1 + row) * res - textOffsetY
          );
        }
      }
    }
  }

  /**
   * TODO Tile rendering
   */
  renderTile(em, cm) {
    this.renderAscii(em, cm);
    console.log("Render Tile");
  }
}
