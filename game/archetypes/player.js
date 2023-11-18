/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Direction, Literacy, Tile } from "../types";

/** Data class representing player data */
export class Player {
  /**
   * Create a Player.
   * @param {number} id - Entity id.
   * @returns {Player}
   */
  constructor(id) {
    this.id = id;
    this.tile = Tile.Player;
    this.position = {x:0, y:0};
    this.orientation = Direction.Up;
    this.collision = true;
    this.visible = true;

    this.name = "";
    this.ancestry = "";
    this.combatClass = "";
    this.title = "";
    this.backstory = "";
    this.primeRequisite = "";
    this.alignment = 0;
    this.level = 1;
    this.experience = 0;
    this.coins = {
      platinum: 0,
      gold: 0,
      electrum: 0,
      silver: 0,
      copper: 0,
    };
    this.weight = 0; // Weight measured in coins [cn], max = 1600cn
    this.inventory = [];
    this.equipment = {
      mainHand: null,
      offHand: null,
      armour: null,
      ammunition: null,
    };
    this.languages = [];
    this.abilities = [];
    this.spells = [];
    this.skills = [];
    this.speed = 24; // Squares per turn (10 game-minutes)
    this.scores = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      maxStr: 10,
      maxDex: 10,
      maxCon: 10,
      maxInt: 10,
      maxWis: 10,
      maxCha: 10
    };
    this.saves = {
      death: 13,
      wands: 14,
      paralysis: 15,
      breath: 16,
      spells: 17
    };
    this.hitDice = {n: 1, d: 10};
    this.hitPoints = 10;
    this.maxHitPoints = 10;
    this.armorClass = 9; // Lower is better!
    this.maxArmorClass = 9;
    this.attackBonus = 0;
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new Player(), json);
  }

  /**
   * Returns the typical modifier for ability score. Valid for all but CHA.
   * @param {number} score - Ability score.
   * @returns {number}
   */
  static getMod(score) {
    switch(score) {
      case 3:
        return -3;
      case 4:
      case 5:
        return -2;
      case 6:
      case 7:
      case 8:
        return -1;
      case 9:
      case 10:
      case 11:
      case 12:
        return 0;
      case 13:
      case 14:
      case 15:
        return +1;
      case 16:
      case 17:
        return +2;
      case 18:
        return +3;
      default:
        return 0;
    }
  }

  /**
   * Returns the alternative modifier for ability score. For CHA and Initiative.
   * @param {number} score - Ability score (CHA or DEX for Initiative).
   * @returns {number}
   */
  static getAltMod(score) {
    switch(score) {
      case 3:
        return -2;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return -1;
      case 9:
      case 10:
      case 11:
      case 12:
        return 0;
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
        return +1;
      case 18:
        return +2;
      default:
        return 0;
    }
  }

  /**
   * Returns the X-in-6 chance to open a stuck door given strength.
   * @param {number} str - Strength.
   * @returns {number}
   */
  static doorChance(str) {
    switch(str) {
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return 1;
      case 9:
      case 10:
      case 11:
      case 12:
        return 2;
      case 13:
      case 14:
      case 15:
        return 3;
      case 16:
      case 17:
        return 4;
      case 18:
        return 5;
      default:
        return 0;
    }
  }

  /**
   * Returns the Literacy level of the player.
   * @param {number} int - Intelligence.
   * @returns {number}
   */
  static literacy(int) {
    switch(int) {
      case 3:
      case 4:
      case 5:
        return Literacy.Illiterate;
      case 6:
      case 7:
      case 8:
        return Literacy.Basic;
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
        return Literacy.Basic;
      default:
        return 0;
    }
  }

  /**
   * Returns the Prime Requisite XP Modifier for the player.
   * @param {number} score - Prime Requisite ability score.
   * @returns {number}
   */
  static primeRequisiteMod(score) {
    switch(score) {
      case 3:
      case 4:
      case 5:
        return 0.80;
      case 6:
      case 7:
      case 8:
        return 0.90;
      case 9:
      case 10:
      case 11:
      case 12:
        return 1.00;
      case 13:
      case 14:
      case 15:
        return 1.05;
      case 16:
      case 17:
      case 18:
        return 1.10;
      default:
        return 0;
    }
  }
}
