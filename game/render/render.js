/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { InteractMode, Player } from "../archetype/player.js";
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
  White:       "#E1D9D1",
  Night:       "#1E2229",
  Black:       "#000000",
  Slate:       "#3C3A2D",
  Brown:       "#684E11",
  Mocha:       "#171009",
  DarkBrown:   "#151004",
  Orange:      "#EFBC74",
  Blood:       "#FF1919",
  RedOrange:   "#FF5219",
  Caution:     "#FFe819",
  Green:       "#19ff21",
  YellowGreen: "#81ff19",
  DarkOrange:  "#c4761b",
  MagicBlue:   "#193cff",
  Blue:        "#9ccfd8",
  Copper:      "#B87333",
  Silver:      "#C0C0C0",
  Steel:       "#8d8d94",
  Gold:        "#FFD700",
  Stealth:     "#993399",
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
    this.frameWidth = 4;
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
        return Color.White;

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
   * Clears the UI area of the canvas only.
   */
  clearUI() {
    this.ctx.clearRect(
      this.frameWidth + 2,
      this.frameWidth + 2,
      this.sideWidth - this.frameWidth * 2 - 4,
      this.canvas.height - this.frameWidth * 2 - 4
    );
    this.ctx.clearRect(
      this.canvas.width - this.sideWidth + this.frameWidth + 2,
      this.frameWidth + 2,
      this.sideWidth - this.frameWidth * 2 - 4,
      this.canvas.height - this.frameWidth * 2 - 4
    );
  }

  /**
   * Drawing function for the main menu.
   * @param {number} selection - Index selected (mod length of options).
   * @param {Array.<MainMenuOption>} options - List of main menu options.
   */
  drawMainMenu(selection, options) {
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
      this.frameWidth,
      this.frameWidth,
      this.canvas.width - 2 * this.frameWidth,
      this.canvas.height - 2 * this.frameWidth
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
    this.ctx.fillStyle = this.frameColor;
    this.ctx.strokeStyle = this.frameColor;
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(this.frameWidth, this.frameWidth, this.canvas.width - this.frameWidth * 2, this.canvas.height - this.frameWidth * 2);
  }

  /**
   * Draws the UI.
   * @param {Player} player - Player data.
   * @param {World} world - World data.
   */
  drawUI(player, world) {
    this.clearUI();

    const YOFFSET = 14;
    const XOFFSET = 24;
    const FWIDTH = 11;
    const FSIZE = 18;
    const VSPACE = YOFFSET + FSIZE;
    const RALIGN = this.sideWidth - XOFFSET;

    this.ctx.font = `bold ${FSIZE}px monospace`;
    this.ctx.fillStyle = Color.White;
    this.textAlign = 'start';

    // -- LEFT BAR  --

    // Interaction Mode
    this.ctx.fillText("MODE", XOFFSET, VSPACE);

    this.ctx.textAlign = 'right';
    switch (player.mode) {
      case InteractMode.Normal:
        this.ctx.fillStyle = Color.Orange;
        this.ctx.fillText("NORMAL", RALIGN, VSPACE);
        break;
      case InteractMode.Social:
        this.ctx.fillStyle = Color.Blue;
        this.ctx.fillText("SOCIAL", RALIGN, VSPACE);
        break;
      case InteractMode.Stealth:
        this.ctx.fillStyle = Color.Stealth;
        this.ctx.fillText("STEALTH", RALIGN, VSPACE);
        break;
      case InteractMode.Combat:
        this.ctx.fillStyle = Color.Blood;
        this.ctx.fillText("COMBAT", RALIGN, VSPACE);
        break;
    }

    // Player Info
    this.ctx.font = `${FSIZE}px monospace`;
    this.ctx.fillStyle = Color.Blue;
    this.ctx.textAlign = 'start';

    this.ctx.fillText("Ancestry", XOFFSET, VSPACE * 2);
    this.ctx.fillText("Class",    XOFFSET, 2*VSPACE + FSIZE);
    this.ctx.fillText("Title",    XOFFSET, 2*VSPACE + 2*FSIZE);
    
    // LEFT COL

    this.ctx.font = `bold ${FSIZE}px monospace`;
    this.ctx.fillStyle = Color.White;
    
    // LEVEL, EXP, GOLD
    this.ctx.fillText("LEVEL", XOFFSET, 3*VSPACE + 2*FSIZE);
    this.ctx.fillText("EXP",   XOFFSET, 3*VSPACE + 3*FSIZE);
    this.ctx.fillText("GOLD",  XOFFSET, 3*VSPACE + 4*FSIZE);

    // STATS
    this.ctx.fillText("STR", XOFFSET, 4*VSPACE + 4*FSIZE);
    this.ctx.fillText("DEX", XOFFSET, 4*VSPACE + 5*FSIZE);
    this.ctx.fillText("CON", XOFFSET, 4*VSPACE + 6*FSIZE);
    this.ctx.fillText("INT", XOFFSET, 4*VSPACE + 7*FSIZE);
    this.ctx.fillText("WIS", XOFFSET, 4*VSPACE + 8*FSIZE);
    this.ctx.fillText("CHA", XOFFSET, 4*VSPACE + 9*FSIZE);

    // COMBAT TARGET
    this.ctx.fillText("TR",  XOFFSET, 5*VSPACE + 9*FSIZE);

    // HP AC
    this.ctx.fillText("AC",  XOFFSET, 6*VSPACE + 9*FSIZE);
    this.ctx.fillText("HP",  XOFFSET, 6*VSPACE + 10*FSIZE);

    this.ctx.fillText("MEL", XOFFSET, 7*VSPACE + 10*FSIZE);
    this.ctx.fillText("MIS", XOFFSET, 7*VSPACE + 11*FSIZE);

    // SPELL SLOTS
    this.ctx.fillText("L1",     XOFFSET, 8*VSPACE + 11*FSIZE);
    this.ctx.fillText("L2",     XOFFSET, 8*VSPACE + 12*FSIZE);
    this.ctx.fillText("L3",     XOFFSET, 8*VSPACE + 13*FSIZE);
    this.ctx.fillText("L4",     XOFFSET, 8*VSPACE + 14*FSIZE);
    this.ctx.fillText("L5",     XOFFSET, 8*VSPACE + 15*FSIZE);
    this.ctx.fillText("L6",     XOFFSET, 8*VSPACE + 16*FSIZE);

    // RIGHT COL

    this.ctx.fillStyle = Color.Green;
    this.ctx.textAlign = 'right';
    
    // LEVEL, EXP, GOLD
    this.ctx.fillText(player.level.toString(),             RALIGN, 3*VSPACE + 2*FSIZE);
    this.ctx.fillText(player.experience.toString(),        RALIGN, 3*VSPACE + 3*FSIZE);
    this.ctx.fillText(Player.goldValue(player).toString(), RALIGN, 3*VSPACE + 4*FSIZE);

    // STATS
    // STR
    if (player.scores.str !== player.scores.maxStr) {
      this.statColor(player.scores.str / player.scores.maxStr);
      this.ctx.fillText(
        player.scores.str.toString(),
        RALIGN - FWIDTH * (player.scores.maxStr.toString().length + 1),
        4*VSPACE + 4*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxStr}`,   RALIGN, 4*VSPACE + 4*FSIZE);
    } else {
      this.ctx.fillText(player.scores.str.toString(), RALIGN, 4*VSPACE + 4*FSIZE);
    }
    // DEX
    if (player.scores.dex !== player.scores.maxDex) {
      this.statColor(player.scores.dex / player.scores.maxDex);
      this.ctx.fillText(
        player.scores.dex.toString(),
        RALIGN - FWIDTH * (player.scores.maxDex.toString().length + 1),
        4*VSPACE + 5*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxDex}`,   RALIGN, 4*VSPACE + 5*FSIZE);
    } else {
      this.ctx.fillText(player.scores.dex.toString(), RALIGN, 4*VSPACE + 5*FSIZE);
    }
    // CON
    if (player.scores.con !== player.scores.maxCon) {
      this.statColor(player.scores.con / player.scores.maxCon);
      this.ctx.fillText(
        player.scores.con.toString(),
        RALIGN - FWIDTH * (player.scores.maxCon.toString().length + 1),
        4*VSPACE + 6*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxCon}`,   RALIGN, 4*VSPACE + 6*FSIZE);
    } else {
      this.ctx.fillText(player.scores.con.toString(), RALIGN, 4*VSPACE + 6*FSIZE);
    }
    // INT
    if (player.scores.int !== player.scores.maxInt) {
      this.statColor(player.scores.int / player.scores.maxInt);
      this.ctx.fillText(
        player.scores.int.toString(),
        RALIGN - FWIDTH * (player.scores.maxInt.toString().length + 1),
        4*VSPACE + 7*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxInt}`,   RALIGN, 4*VSPACE + 7*FSIZE);
    } else {
      this.ctx.fillText(player.scores.int.toString(), RALIGN, 4*VSPACE + 7*FSIZE);
    }
    // WIS
    if (player.scores.wis !== player.scores.maxWis) {
      this.statColor(player.scores.wis / player.scores.maxWis);
      this.ctx.fillText(
        player.scores.wis.toString(),
        RALIGN - FWIDTH * (player.scores.maxWis.toString().length + 1),
        4*VSPACE + 8*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxWis}`,   RALIGN, 4*VSPACE + 8*FSIZE);
    } else {
      this.ctx.fillText(player.scores.wis.toString(), RALIGN, 4*VSPACE + 8*FSIZE);
    }
    // CHA
    if (player.scores.cha !== player.scores.maxCha) {
      this.statColor(player.scores.cha / player.scores.maxCha);
      this.ctx.fillText(
        player.scores.cha.toString(),
        RALIGN - FWIDTH * (player.scores.maxCha.toString().length + 1),
        4*VSPACE + 9*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.scores.maxCha}`,   RALIGN, 4*VSPACE + 9*FSIZE);
    } else {
      this.ctx.fillText(player.scores.cha.toString(), RALIGN, 4*VSPACE + 9*FSIZE);
    }
    
    // COMBAT TARGET HP
    if (player.target !== null && Object.hasOwn(player.target, 'hitPoints')) {
      const ratio = player.target.hitPoints / player.target.maxHitPoints;
      const HPnodes = Math.ceil(10 * ratio);
      const nodes = 10 - HPnodes;

      this.ctx.fillStyle = Color.White;
      this.ctx.fillText(
        '[',
        RALIGN - 11*FWIDTH,
        5*VSPACE + 9*FSIZE
      );
      this.statColor(ratio);
      for (let i = 0; i < HPnodes; ++i) {
        this.ctx.fillText(
          '*',
          RALIGN - (nodes + i + 1)*FWIDTH,
          5*VSPACE + 9*FSIZE
        );
      }
      this.ctx.fillStyle = Color.White;
      for (let i = 0; i < nodes; ++i) {
        this.ctx.fillText(
          '*',
          RALIGN - (i + 1)*FWIDTH,
          5*VSPACE + 9*FSIZE
        );
      }
      this.ctx.fillText(
        ']',
        RALIGN,
        5*VSPACE + 9*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
    }

    // AC HP
    if (player.armorClass !== player.maxArmorClass) {
      this.statColor((20 - player.armorClass)/(20 - player.maxArmorClass));
      this.ctx.fillText(
        player.armorClass.toString(),
        RALIGN - FWIDTH * (player.maxArmorClass.toString().length + 1),
        6*VSPACE + 9*FSIZE
      );
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.maxArmorClass}`, RALIGN, 6*VSPACE + 9*FSIZE);
    } else {
      this.ctx.fillText(player.armorClass.toString(), RALIGN, 6*VSPACE + 9*FSIZE);
    }

    if (player.hitPoints !== player.maxHitPoints) {
      this.statColor(player.hitPoints / player.maxHitPoints);
      this.ctx.fillText(
        player.hitPoints.toString(),
        RALIGN - FWIDTH * (player.maxHitPoints.toString().length + 1),
        6*VSPACE + 10*FSIZE
      );
      
      this.ctx.fillStyle = Color.Green;
      this.ctx.fillText(`/${player.maxHitPoints}`, RALIGN, 6*VSPACE + 10*FSIZE);
    } else {
      this.ctx.fillText(player.hitPoints.toString(), RALIGN, 6*VSPACE + 10*FSIZE);
    }

    // MELEE / MISSILE BONUS
    this.ctx.fillText(
      (Player).toString(),
      RALIGN,
      7*VSPACE + 10*FSIZE
    );

    // -- RIGHT BAR --

    // World Info
  }

  /**
   * Determines the text color of the stat depending on ratio.
   * @param {number} ratio - A ratio in [0, 1).
   */
  statColor(ratio) {
      switch(Math.floor(4 * ratio)) {
        case 0:
          this.ctx.fillStyle = Color.Blood;
          break;
        case 1:
          this.ctx.fillStyle = Color.RedOrange;
          break;
        case 2:
          this.ctx.fillStyle = Color.Caution;
          break;
        case 3:
          this.ctx.fillStyle = Color.YellowGreen;
          break;

        default:
          this.ctx.fillStyle = Color.Blue;
      }
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
    this.drawSideBars();

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
    const res = this.camera.resolution;
    const textOffsetX = Math.round(res / 5);
    const textOffsetY = Math.round(res / 5);
    const canvasGrids = Math.floor(this.canvas.height / res);
    const center = Math.floor(canvasGrids / 2);

    this.ctx.font = `${res}px monospace`;
    this.ctx.fillStyle = Color.White;
    this.ctx.textAlign = 'start';

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
