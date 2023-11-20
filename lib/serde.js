/**
 * @fileoverview (CC0) 2024 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * SerDe - Serialization and Deserialization with JSON.
 * @package
 */

"use strict";

/**
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Performs a GET request to obtain JSON data.
 * @param {string} url - A valid URL address (local or web).
 * @returns {Promise | null}
 */
export async function getJSON(url) {
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

/**
 * Fast alternative to JSON stringify for serializing positions.
 * @param {Position} pos - A position.
 * @returns {string}
 */
export function stringifyPosition(pos) {
  return `${pos.x.toString(16)},${pos.y.toString(16)}`;
}

/**
 * Fast alternative to JSON parse for deserializing positions.
 * @param {string} posStr - A stringified position.
 * @returns {Position}
 */
export function parsePosition(posStr) {
  return {x: parseInt(posStr, 16),
          y: parseInt(posStr.slice(posStr.indexOf(",") + 1, 16))};
}
