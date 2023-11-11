/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

const T = require("./types.js");

export class Camera {
  /**
    * Constructor for Camera.
    * @param {T.Position} position - The world position of the camera.
    * @param {number} resolution - Pixels per tile.
    * @param {number} deadZone - Distance moved from center before camera moves.
    */
  constructor(position={x: 0, y:0}, resolution=T.Resolution.Medium, deadZone=4) {
    this.position = position;
    this.resolution = resolution;
    this.deadZone = deadZone;
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new Camera(), json);
  }

  /**
   * Shift the camera in the given direction.
   * @param {T.Direction} direction - Which direction to shift.
   * @param {number} distance - Distance.
   */
  shift(direction, distance) {
    this.position.x += direction.x * distance;
    this.position.y += direction.y * distance;
  }

  /**
   * Set camera to the given position.
   * @param {T.Position} position - Position.
   */
  setPosition(position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  /**
   * Set resolution to the given value.
   * @param {T.Resolution} resolution - Grid resolution (pixels per grid).
   */
  setResolution(resolution) {
    this.resolution = resolution;
  }

  /**
   * Increase the resolution one level higher.
   */
  increaseResolution() {
    switch(this.resolution) {
      case T.Resolution.Low:
        this.resolution = T.Resolution.Medium;
        break;

      case T.Resolution.Medium:
        this.resolution = T.Resolution.High;
        break;
    }
  }

  /**
   * Decrease the resolution one level lower.
   */
  decreaseResolution() {
    switch(this.resolution) {
      case T.Resolution.High:
        this.resolution = T.Resolution.Medium;
        break;

      case T.Resolution.Medium:
        this.resolution = T.Resolution.Low;
        break;
    }
  }
}
