/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * HiRo (High Roller) A dice rolling library independent of number generator.
 * @package
 */

"use strict";

export class HIRO {

  static isDigit(c) {
    return "0" <= c && c <= "9";
  }
  
  /**
   * Rolls dice and returns the sum.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollSum(rng, n, m) {
    let total = 0;
    for (let i = 0; i < n; ++i) {
      total += Math.round(1 + rng() * (m - 1));
    }
    return total;
  }

  /**
   * Rolls open (exploding) dice and returns the sum.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollOpen(rng, n, m) {
    let total = 0;
    let roll = 0;
    let iter = 0;
    for (let i = 0; i < n; ++i) {
      do {
        roll = Math.round(1 + rng() * (m - 1));
        total += roll;
        iter += 1;
      } while (roll === m && iter < 100);
    }
    return total;
  }

  /**
   * Rolls dice and returns the highest roll.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollKeepHigh(rng, n, m) {
    let roll = 0;
    let rollStar = 0;
    for (let i = 0; i < n; ++i) {
      roll = Math.round(1 + rng() * (m - 1));
      rollStar = Math.max(roll, rollStar);
    }
    return rollStar;
  }

  /**
   * Rolls open (exploding) dice and returns the highest roll.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollKeepHighOpen(rng, n, m) {
    let roll = 0;
    let rollStar = 0;
    let total = 0;
    let iter = 0;
    for (let i = 0; i < n; ++i) {
      total = 0;
      iter = 0;
      do {
        roll = Math.round(1 + rng() * (m - 1));
        total += roll;
        iter += 1
      } while (roll === m && iter < 100);
      rollStar = Math.max(total, rollStar);
    }
    return rollStar;
  }

  /**
   * Rolls dice and returns the lowest roll.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollKeepLow(rng, n, m) {
    let roll = 0;
    let rollStar = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < n; ++i) {
      roll = Math.round(1 + rng() * (m - 1));
      rollStar = Math.min(roll, rollStar);
    }
    return rollStar;
  }

  /**
   * Rolls open (exploding) dice and returns the lowest roll.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {number} n - Number of dice.
   * @param {number} m - Number of faces on each die.
   */
  static rollKeepLowOpen(rng, n, m) {
    let roll = 0;
    let rollStar = Number.MAX_SAFE_INTEGER;
    let total = 0;
    let iter = 0;
    for (let i = 0; i < n; ++i) {
      total = 0;
      iter = 0;
      do {
        roll = Math.round(1 + rng() * (m - 1));
        total += roll;
        iter += 1
      } while (roll === m && iter < 100);
      rollStar = Math.min(total, rollStar);
    }
    return rollStar;
  }

  /**
   * Accepts a single dice rolling notation simple expression.
   *
   * Notation: 
   * - XdY:   Roll X Y-sided dice and return the sum. 
   * - XdY!:  Roll X Y-sided open ended (exploding) dice and return the sum. 
   * - XdYkh: Roll X Y-sided dice and return the highest result. 
   * - XdYkl: Roll X Y-sided dice and return the lowest result. 
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {string} e - Dice rolling notation string (simple expression).
   */
  static parseRollExpr(rng, e) {
    // Edge cases (empty expr, single char, or integer)
    if (!e.includes('d')) {
      return parseInt(e);
    }

    // Handle special case where X is omitted (i.e., e="d4")
    let x = (e.indexOf('d') === 0) ? 1 : parseInt(e);
    let y = parseInt(e.slice(e.indexOf('d') + 1));

    // Check if either are invalid
    if (x * y === NaN) {
      return NaN;
    }

    // Case of 'XdY'
    if (HIRO.isDigit(e.at(e.length))) {
      return HIRO.rollSum(rng, x, y);
    }

    switch(e.at(e.length)) {
      case '!':
        switch(e.at(e.length - 1)) {
          case 'h':
            return HIRO.rollKeepHighOpen(rng, x, y);
          case 'l':
            return HIRO.rollKeepLowOpen(rng, x, y);
          default:
            return HIRO.rollOpen(rng, x, y);
        }
      case 'h':
        return HIRO.rollKeepHigh(rng, x, y);
      case 'l':
        return HIRO.rollKeepLow(rng, x, y);
    }

    return NaN;
  }

  /**
   * Accepts a dice rolling notation string and performs requested operations.
   *
   * Notation: 
   * - XdY:   Roll X Y-sided dice and return the sum. 
   * - XdY!:  Roll X Y-sided open ended (exploding) dice and return the sum. 
   * - XdYkh: Roll X Y-sided dice and return the highest result. 
   * - XdYkl: Roll X Y-sided dice and return the lowest result. 
   * - N*(E): Multiply the result of a given expression by N.
   * - (E)+(F): Sum the result of expressions E and F.
   * @param {function(): number} rng - Random Number Generator in range [0,1].
   * @param {string} s - Dice rolling notation string.
   */
  static parseRoll(rng, s) {
    const summedExpr = s.split("+");
    const results = [];
    let result = 1;

    for (let i = 0; i < summedExpr.length; ++i) {
      const multExpr = summedExpr[i].split("*");
      result = 1;

      for (let j = 0; j < multExpr.length; ++j) {
        result *= HIRO.parseRollExpr(rng, multExpr[j]);
      }
      results.push(result);
    }

    // Sum the results of each summed expression.
    let total = 0;
    for (let i = 0; i < results.length; ++i) {
      total += results[i];
    }
    return total;
  }
}
