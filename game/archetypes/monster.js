/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Direction, EntityType, Tile } from "../types.js";

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
    this.speed = 24;
    this.saves = {
      death:     14,
      wands:     15,
      paralysis: 16,
      breath:    17,
      spells:    18
    };
    this.immunity = {
      acid:          0,
      cold:          0,
      electric:      0,
      fire:          0,
      mundane:       0,
      poison:        0,
      sleep:         0,
      petrification: 0,
    }
    this.hitPoints = 1;
    this.maxHitPoints = 1;
    this.armorClass = 9;
    this.maxArmorClass = 9;
    this.attackBonus = 0;
  }
}
