/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * A collection of utility functions for working with characters.
 * @package
 */

"use strict";

/**
 * Tests if character is a digit.
 * @param {string} c - A single character string.
 */
export function isDigit(c) {
  return "0" <= c && c <= "9";
}

/**
 * Tests if character is a digit.
 * @param {string} c - A single character string.
 */
export function isWhiteSpace(c) {
  return ((c === ' ') || (c === '\t') || (c === '\n') || (c === '\r'));
}
