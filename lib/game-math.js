/**
 * @fileoverview (CC0) 2024 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * GameMath - Math functions for game development.
 * @package
 */

"use strict";

/**
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Calculate the L1 (manhattan / taxicab) distance in 2-dimensional space.
 * @param {Position} x1 - First coordinate.
 * @param {Position} x2 - Second coordinate.
 */
export function distance2DL1(x1, x2) {
  return Math.abs(x2.x - x1.x) + Math.abs(x2.y - x1.y);
}

/**
 * Calculate the L2 (euclidean) distance in 2-dimensional space.
 * @param {Position} x1 - First coordinate.
 * @param {Position} x2 - Second coordinate.
 */
export function distance2DL2(x1, x2) {
  let dx = x2.x - x1.x;
  let dy = x2.y - x1.y;
  return Math.sqrt(dx*dx + dy*dy);
}

/**
 * Calculate the L-Inf (square) distance in 2-dimensional space.
 * @param {Position} x1 - First coordinate.
 * @param {Position} x2 - Second coordinate.
 */
export function distance2DLInf(x1, x2) {
  return Math.max(Math.abs(x2.x - x1.x), Math.abs(x2.y - x1.y));
}

/**
 * Calculate the square norm distance (||x2 - x1||^2) in 2-dimensional space.
 * @param {Position} x1 - First coordinate.
 * @param {Position} x2 - Second coordinate.
 */
export function squareNorm2D(x1, x2) {
  let dx = x2.x - x1.x;
  let dy = x2.y - x1.y;
  return dx*dx + dy*dy;
}
