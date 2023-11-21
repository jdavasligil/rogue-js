/**
 * @fileoverview (CC0) 2024 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * GAMMA (GAMe MAth) - Math functions for game development.
 * @package
 */

"use strict";

/**
 * @typedef {{x: number, y: number}} Position
 */

/** A 2D game math library. */
export class GAMMA2 {
  /**
   * Clamp a number x to the closed interval [a,b].
   * @param {number} x - A number.
   * @returns {number}
   */
  static clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
  }

  /**
   * Calculate the L1 (manhattan / taxicab) distance in 2-dimensional space.
   * @param {Position} x1 - First coordinate.
   * @param {Position} x2 - Second coordinate.
   * @returns {number} 
   */
  static L1Norm(x1, x2) {
    return Math.abs(x2.x - x1.x) + Math.abs(x2.y - x1.y);
  }

  /**
   * Calculate the L2 (euclidean) distance in 2-dimensional space.
   * @param {Position} x1 - First coordinate.
   * @param {Position} x2 - Second coordinate.
   * @returns {number} 
   */
  static L2Norm(x1, x2) {
    let dx = x2.x - x1.x;
    let dy = x2.y - x1.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  /**
   * Calculate the square norm distance (||x2 - x1||^2) in 2-dimensional space.
   * @param {Position} x1 - First coordinate.
   * @param {Position} x2 - Second coordinate.
   * @returns {number} 
   */
  L2SquaredNorm(x1, x2) {
    let dx = x2.x - x1.x;
    let dy = x2.y - x1.y;
    return dx*dx + dy*dy;
  }

  /**
   * Calculate the L-Inf (square) distance in 2-dimensional space.
   * @param {Position} x1 - First coordinate.
   * @param {Position} x2 - Second coordinate.
   * @returns {number} 
   */
  static LInfNorm(x1, x2) {
    return Math.max(Math.abs(x2.x - x1.x), Math.abs(x2.y - x1.y));
  }

  /**
   * Efficient pair hashing using Szudzik's function.
   * @param {Position} position - A position coordinate.
   * @returns {number} 
   */
  static pairHash(x) {
    return x.x >= x.y ? x.x * x.x + x.x + x.y : x.x + x.y * x.y;
  }
}
