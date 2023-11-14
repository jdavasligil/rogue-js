/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * A general purpose ring (circular) buffer (queue). Fast and lightweight.
 * @package
 */

"use strict";

/** Class for a generic ring buffer. */
export class RingBuffer {
  /**
   * Create a RingBuffer.
   * @param {number} size - How many bytes the buffer can contain.
   * @returns {RingBuffer}
   */
  constructor(size=32) {
    this.front = 0;
    this.back = 0;
    this.data = new Uint8Array(size);
    this.capacity = size;
    this.length = 0;
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new RingBuffer(), json);
  }

  /**
   * Insert an integer (0 <= n <= 255) into the front of the queue.
   * @param {number} n - Integer added.
   */
  insertAtFront(n) {
  }

  /**
   * Insert an integer (0 <= n <= 255) into the back of the queue.
   * @param {number} n - Integer added.
   */
  insertAtBack(n) {
  }

  /**
   * Peek at the number at the front of the queue.
   */
  peekAtFront() {
  }

  /**
   * Peek at the number at the back of the queue.
   */
  peekAtBack() {
  }

  /**
   * Remove and return the number at the front of the queue.
   * @returns {number}
   */
  popFront() {
  }

  /**
   * Remove and return the number at the back of the queue.
   * @returns {number}
   */
  popBack() {
  }

  /**
   * Return the queue represented as an Array.
   * @returns {Array.<number>}
   */
  asArray() {
  }
}
