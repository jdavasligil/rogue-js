/**
 * @fileoverview (CC0) 2024 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * A dice rolling library.
 * @package
 */

"use strict";

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
function parseRoll(rng, s) {
  const reInt = /^\d*$/g;
  const reRoll = /^\d*d\d*$/g;
  const reRollKeepHigh = /^\d*d\d*kh$/g;
  const reRollKeeplow = /^\d*d\d*kl$/g;
  const reRollOpen = /^\d*d\d*!$/g;
  const reRollOpenKeepHigh = /^\d*d\d*!kh$/g;
  const reRollOpenKeepLow = /^\d*d\d*!kl$/g;
  const summedExpr = s.split("+");
  const results = [];

  var total = 0;
  var result = 1;

  for (e in summedExpr) {
    const multExpr = e.split("*");
    result = 1;

    for (f in multExpr) {
      
    }
  }

  // Sum the results of each summed expression.
  for (var i = 0; i < results.length; i++) {
    total += results[i];
  }
  return total;
}

function testParseRoll() {
  rng = () => {return 0};
  testCases = [
    "1d6",
    "2d6",
    "2d6!",
    "2d6kh",
    "2d6kl",
    "3*1d6",
    "1d6+1d6",
    "2+3",
    "3*1d6+4",
  ]
}

/**
 * Rolls dice and returns the sum.
 * @param {function(): number} rng - Random Number Generator in range [0,1].
 * @param {number} n - Number of dice.
 * @param {number} m - Number of faces on each die.
 */
export function roll(rng, n, m) {
  var total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.round(1 + rng() * (m - 1));
  }
  return total;
}
