// Copyright (c) 2023 Jaedin Davasligil
//
// Rogue-JS is a pure javascript browser dungeon crawler.

"use strict";

// Get DOM elements and context
const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const ctx = canvas.getContext("2d");

// Set tweakable constants
const canvasWidth = 896;
const canvasHeight = 504;
const seed = 12345;

const rng = mulberry32(seed);

function roll(n,m) {
  total = 0
  for (let i = 0; i < n; i++) {
    total += Math.round(1 + rng() * (m - 1));
  }

  return total
}

// Text Window
function setText(s) {
  text.innerText = s;
}
function appendText(s) {
  text.innerText += "\n\n" + s;
}
function writeDescription(s) {
  text.innerHTML += "<p style='color: yellow;'>" + s + "</p><br />";
}
function writeAction(s) {
  text.innerHTML += "<p style='color: red;'>" + s + "</p><br />";
}
function clearText() {
  text.innerHTML = "";
}

// Testing
writeDescription("The green slime appears sentient. It smells terribly strong of ammonia.");
writeAction("The slime attacks you!");

ctx.moveTo(0, 0);
ctx.lineTo(canvasWidth, canvasHeight);
ctx.strokeStyle = "white"
ctx.stroke();
