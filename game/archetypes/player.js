/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Direction, Tile } from "../types";

/** Data class representing player data */
export class Player {
  /**
   * Create a Player.
   * @param {string} name - Character name.
   * @param {import("../types").Position} position - Spawn position.
   * @param {string} ancestry - Character ancestry.
   * @param {string} combatClass - Character combat class.
   * @param {number} gold - Starting gold.
   * @returns {Player}
   */
  constructor(
    name="Jimothy",
    position={x:0, y:0},
    ancestry="Human",
    combatClass="Fighter",
    gold=100,
  ) {
    this.name = name;
    this.position = position;
    this.collision = true;
    this.visible = true;
    this.tile = Tile.Player;
    this.orientation = Direction.Up;
    this.ancestry = ancestry;
    this.combatClass = combatClass;
    this.alignment = 0;
    this.level = 1;
    this.experience = 0;
    this.gold = gold;
    this.weight = 0; // Weight measured in coins
    this.inventory = [];
    this.equipment = [];
    this.speed = 24; // Squares per turn (10 game-minutes)
    this.stats = {
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
    this.damageDice = {n: 1, d: 3};
  }
}
