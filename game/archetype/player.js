/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Tile } from "../tile.js";
import { Direction } from "../types.js";
import { EntityType, Literacy } from "./archetype.js";

/**
 * Enumeration of all possible interaction modes.
 *
 * Normal - Open door, initiate trade.
 * Combat - Attack target, break object.
 * Social - Attempt to initiate dialogue.
 * Stealth - Pick lock, pick pocket, steal, sneak.
 * @readonly 
 * @enum {number}
 */
export const InteractMode = {
  Normal:  0, 
  Social:  1,
  Stealth: 2, 
  Combat:  3,
}

/** Data class representing player data */
export class Player {
  /**
   * Create a Player.
   * @returns {Player}
   */
  constructor() {
    this.id = (0xFF - EntityType.Player) << 24;
    this.tile = Tile.Player;
    this.position = {x:0, y:0};
    this.orientation = Direction.Up;
    this.collision = true;
    this.visible = true;
    this.occlusion = false;

    /** @type {object | null} */
    this.target = null;

    this.mode = InteractMode.Normal;

    this.seed = 0;
    this.turn = 0; // Each turn is 10 minutes.
    this.moves = 0; // Move counter: Turn increases in this.speed moves.

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
    this.spellSlots = [0,0,0,0,0,0];
    this.maxSpellSlots = [0,0,0,0,0,0];
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
    this.armorClass = 10; 
    this.maxArmorClass = 10;
    this.attackBonus = 0;
  }

  /**
   * Calculate the gold value of a player.
   * @param {Player} player - Player data.
   */
  static goldValue(player) {
    return Math.floor(
      (10.00)*player.coins.platinum +
              player.coins.gold +
       (0.50)*player.coins.electrum + 
       (0.10)*player.coins.silver +
       (0.01)*player.coins.copper
    );
  }

  /**
   * Calculate the total weight of a player.
   * @param {Player} player - Player data.
   */
  static weight(player) {
    let total = 0;

    total += player.coins.copper;
    total += player.coins.silver;
    total += player.coins.electrum;
    total += player.coins.gold;
    total += player.coins.platinum;

    const equipment = Object.values(player.equipment);
    for (let i = 0; i < equipment.length; ++i) {
      total += (equipment[i] !== null) ? equipment[i].weight : 0;
    }

    const inventory = Object.values(player.inventory);
    for (let i = 0; i < inventory.length; ++i) {
      total += (inventory[i] !== null) ? inventory[i].weight : 0;
    }

    return total;
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
   * Returns the Melee Attack Bonus of the player character given.
   * @param {Player} player - Player data.
   * @returns {number}
   */
  static meleeBonus(player) {
    return Player.getMod(player.scores.str) + player.attackBonus;
  }

  /**
   * Returns the Missile Attack Bonus of the player character given.
   * @param {Player} player - Player data.
   * @returns {number}
   */
  static missileBonus(player) {
    return Player.getMod(player.scores.dex) + player.attackBonus;
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
        return 1;
      case 18:
        return 2;
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
        return Literacy.Literate;
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
