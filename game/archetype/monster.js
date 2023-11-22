/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Tile } from "../tile.js";
import { EntityType } from "./archetype.js";

/** Data class representing monster data */
export class Monster {
  /**
   * Create a Monster.
   * @returns {Monster}
   */
  constructor() {
    this.id = (0xFF - EntityType.Monster) << 24;
    this.tile = Tile.Monster;
    this.position = {x:0, y:0};
    this.orientation = Direction.Up;
    this.collision = true;
    this.visible = true;

    this.name = "";
    this.type = "";
    this.description = ""; 
    this.isPerson = true;

    this.morale = 7;
    this.alignment = 0;
    this.level = 0;
    this.experience = 0;
    this.lootTable = 0;

    this.abilities = [];
    this.spells = [];

    this.saves = {
      death:     14,
      wands:     15,
      paralysis: 16,
      breath:    17,
      spells:    18
    };

    // Percent chance resisted in [0.0, 1.0]
    this.immunity = {
      acid:          0.0,
      cold:          0.0,
      electric:      0.0,
      fire:          0.0,
      mundane:       0.0,
      poison:        0.0,
      sleep:         0.0,
      petrification: 0.0,
    }

    this.speed = 24;
    this.hitDice = "";
    this.hitPoints = 1;
    this.maxHitPoints = 1;
    this.armorClass = 9;
    this.maxArmorClass = 9;
    this.attackBonus = 0;
  }

  /**
   * Obtains a monster's level based on their hit dice.
   * @param {string} hitDice - Monster's hit dice.
   * @returns {number} 
   */
  static levelFrom(hitDice) {
    // Number of dice (+ 1 if there is any modifier).
    return parseInt(hitDice) + Number(hitDice.indexOf('+') !== -1);
  }

  /**
   * Obtains a monster's attack bonus based on their level.
   * @param {number} level - Monster's level
   * @returns {number} 
   */
  static attackBonus(level) {
    switch(level) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return level;
      case 8:
      case 9:
        return 8;
      case 10:
      case 11:
        return 9;
      case 12:
      case 13:
        return 10;
      case 14:
      case 15:
        return 11;
      case 16:
      case 17:
        return 12;
      case 18:
      case 19:
        return 13;
      case 20:
      case 21:
        return 14;
      default:
        return 15;
    }
  }

  /**
   * Obtains a monster's saving throw based on their level.
   * @param {number} level - Monster's level
   * @returns {Object.<string,number>} 
   */
  static savingThrow(level) {
    switch(level) {
      case 0:
      case 1:
        return {
          death:     14,
          wands:     15,
          paralysis: 16,
          breath:    17,
          spells:    18,
        };

      case 2:
      case 3:
        return {
          death:     12,
          wands:     13,
          paralysis: 14,
          breath:    15,
          spells:    16,
        };
      case 4:
      case 5:
      case 6:
        return {
          death:     10,
          wands:     11,
          paralysis: 12,
          breath:    13,
          spells:    14,
        };

      case 7:
      case 8:
      case 9:
        return {
          death:      8,
          wands:      9,
          paralysis: 10,
          breath:    10,
          spells:    12,
        };

      case 10:
      case 11:
      case 12:
        return {
          death:      6,
          wands:      7,
          paralysis:  8,
          breath:     8,
          spells:    10,
        };

      case 13:
      case 14:
      case 15:
        return {
          death:     4,
          wands:     5,
          paralysis: 6,
          breath:    5,
          spells:    8,
        };

      case 16:
      case 17:
      case 18:
        return {
          death:     2,
          wands:     3,
          paralysis: 4,
          breath:    3,
          spells:    6,
        };

      case 19:
      case 20:
      case 21:
        return {
          death:     2,
          wands:     2,
          paralysis: 2,
          breath:    2,
          spells:    4,
        };
      default:
        return {
          death:     2,
          wands:     2,
          paralysis: 2,
          breath:    2,
          spells:    2,
        };
    }
  }
}
