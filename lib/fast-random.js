/**
 * @fileoverview (CC0) 2017 Tommy Ettinger (tommy.ettinger@gmail.com)
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * Random Number Generation
 * 
 * https://gist.github.com/tommyettinger/46a874533244883189143505d203312c 
 * @package
 */

"use strict";

/**
 * A seedable pseudorandom number generator with a 32 bit state.
 * Returns a generator which outputs values in [0, 1].
 * @param {number} a - Generator seed.
 */
export function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/** Class for fast random number library functions. */
export class FRNG {
  /**
   * Returns a random integer in the range [a, b).
   * @param {function(): number} rng - Random Number Generator in range(0,1). 
   * @param {number} a - Lower bound inclusive.
   * @param {number} b - Upper bound exclusive.
   * @returns {number}
   */
  static randInt(rng, a, b) {
    return Math.floor(rng() * (b - a) + a);
  }

  /**
   * Samples a random position from a normal distribution using the
   * Marsaglia Polar Method.
   * @param {function(): number} rng - Random Number Generator in range(0,1). 
   * @param {number} m - Mean.
   * @param {number} s - Standard deviation (s > 0).
   * @returns {Object.<number, number>}
   */
  static randGauss(rng, m=0, s=1) {
    let x = 0;
    let y = 0;
    let r2 = 0;

    // Obtain an interior point in the punctured unit circle.
    // 27% chance of point being exterior.
    do {
      x = 2.0 * rng() - 1.0;
      y = 2.0 * rng() - 1.0;
      r2 = x*x + y*y;
    } while (r2 >= 1.0 || r2 === 0.0);

    const f = Math.sqrt(-2.0 * Math.log(r2) / r2);

    return {x: (x*f - m) / s, y: (y*f - m) / s};
  }

  /**
   * Performs a Fisher-Yates shuffle of an array.
   * @param {function(): number} rng - Random Number Generator in range(0,1). 
   * @param {Array.<object>} arr - An array.
   */
  static shuffle(rng, arr) {
    let pivot = 0;
    let swap = arr[0];
    for (let i = 0; i < (arr.length - 1); ++i) {
      pivot = this.randInt(rng, i, arr.length);
      swap = arr[i];
      arr[i] = arr[pivot];
      arr[pivot] = swap;
    }
  }
}
