/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { ChunkManager } from "../chunk-manager.js";
import { EntityManager } from "../entity-manager.js";
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
  Slate:      "#3C3A2D",
  Brown:      "#684E11",
  DarkBrown:  "#151004",
  Orange:     "#EFBC74",
  DarkOrange: "#c4761b",
  MagicBlue:  "#0784b5",
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
      case Tile.Floor:
        return '.';
      case Tile.OpenDoor:
        return '\'';
      case Tile.ClosedDoor:
        return '+';
      case Tile.Player:
        return '@';
      case Tile.StairsUp:
        return '<'
      case Tile.StairsDown:
        return '>'
      case Tile.Townsfolk:
        return 't'

      default:
        return '*';
    }
  }

  // TODO TEST
  /**
   * Update the camera based on the player's position.
   * @param {EntityManager} em - Entity Manager.
   * @param {import("../entity-manager.js").EntityID} pid - The player ID.
   */
  updateCamera(em, pid) {
    const player = em.lookup(pid);
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
  drawSideBar(x, y) {
    const frameWidth = 4;
    this.ctx.fillStyle = Color.Brown;
    this.ctx.strokeStyle = Color.DarkBrown;
    this.ctx.fillRect(x, y, this.sideWidth, this.canvas.height);
    this.ctx.strokeRect(x, y, this.sideWidth, this.canvas.height);
    this.ctx.fillStyle = Color.DarkBrown;
    this.ctx.fillRect(x + frameWidth, y + frameWidth, this.sideWidth - frameWidth * 2, this.canvas.height - frameWidth * 2);
  }

  /**
   * Draws green grid lines useful for debugging alignment of tiles.
   */
  drawDebugGrid() {
    const res = this.camera.resolution;

    this.ctx.strokeStyle = "green";

    // TODO: Replace Magic number 22 (number of row/col lines to draw)
    for (let n = 0; n < 22; n++) {
      // Row Line
      this.ctx.beginPath();
      this.ctx.moveTo(this.sideWidth, n * res);
      this.ctx.lineTo(this.sideWidth + this.canvas.height, n * res);
      this.ctx.stroke();
      this.ctx.closePath();
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
    const leftBound = halfWidth - zoneBuffer * res - halfRes;
    const rightBound = halfWidth + zoneBuffer * res + halfRes;
    const topBound = halfHeight + zoneBuffer * res + halfRes;
    const lowerBound = halfHeight - zoneBuffer * res - halfRes;

    this.ctx.strokeStyle = "red";

    this.ctx.beginPath();
    this.ctx.moveTo(leftBound, topBound);
    this.ctx.lineTo(rightBound, topBound);
    this.ctx.lineTo(rightBound, lowerBound);
    this.ctx.lineTo(leftBound, lowerBound);
    this.ctx.lineTo(leftBound, topBound);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /**
   * Draw chunks and entities that are loaded in.
   * @param {EntityManager} em - Entity Manager.
   * @param {ChunkManager} cm - Chunk Manager.
   */
  draw(em, cm) {
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
  }

  /**
   * Renders ASCII tiles to the screen grid.
   * @param {EntityManager} em - Entity Manager.
   * @param {ChunkManager} cm - Chunk Manager.
   */
  renderAscii(em, cm) {
    const textOffsetX = 2;
    const textOffsetY = 3;
    const res = this.camera.resolution;
    const canvasGrids = Math.floor(this.canvas.height / res);
    const center = Math.floor(canvasGrids / 2);

    //this.ctx.font = "24px sans-serif";
    this.ctx.font = "24px serif";
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
          tile = em.lookup(entityID).tile; // DANGER Assuming tile exists
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
