/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

/**
 * Enumeration of all grid resolutions supported by the camera. 
 * @enum {number}
 */
export const Resolution = {
  Low:    18,
  Medium: 24,
  High:   32,
}

export class Camera {
  /**
    * Constructor for Camera.
    * @param {import("./types").Position} position - The world position of the camera.
    * @param {number} resolution - Pixels per tile.
    * @param {number} deadZone - Distance moved from center before camera moves.
    */
  constructor(position={x: 0, y:0},
              resolution=Resolution.Medium,
              deadZone=4) {
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
   * @param {Direction} direction - Which direction to shift.
   * @param {number} distance - Distance.
   */
  shift(direction, distance) {
    this.position.x += direction.x * distance;
    this.position.y += direction.y * distance;
  }

  /**
   * Set camera to the given position.
   * @param {import("./types").Position} position - Position.
   */
  setPosition(position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  /**
   * Set resolution to the given value.
   * @param {Resolution} resolution - Grid resolution (pixels per grid).
   */
  setResolution(resolution) {
    this.resolution = resolution;
  }

  /**
   * Increase the resolution one level higher.
   */
  increaseResolution() {
    switch(this.resolution) {
      case Resolution.Low:
        this.resolution = Resolution.Medium;
        break;

      case Resolution.Medium:
        this.resolution = Resolution.High;
        break;
    }
  }

  /**
   * Decrease the resolution one level lower.
   */
  decreaseResolution() {
    switch(this.resolution) {
      case Resolution.High:
        this.resolution = Resolution.Medium;
        break;

      case Resolution.Medium:
        this.resolution = Resolution.Low;
        break;
    }
  }
}
