/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

// TODO Text System
/**
 *
 */
function setText(text, s) {
  text.innerText = s;
}
/**
 *
 */
function appendText(text, s) {
  text.innerText += "\n\n" + s;
}
/**
 *
 */
function writeDescription(text, s) {
  text.innerHTML += "<p style='color: yellow;'>" + s + "</p><br />";
}
/**
 *
 */
function writeAction(text, s) {
  text.innerHTML += "<p style='color: red;'>" + s + "</p><br />";
}
/**
 *
 */
function clearText() {
  text.innerHTML = "";
}
