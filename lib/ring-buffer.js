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
   * @param {Uint8Array | undefined} data - An existing data buffer.
   * @returns {RingBuffer}
   */
  constructor(size=32, data=undefined) {
    this.data = (data) ? data : new Uint8Array(size);
    this.capacity = size;
    this.length = 0;
    this.front = 0;
    this.back = 0;
    this.lastPop = 0;
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new RingBuffer(), json);
  }

  /**
   * Returns true if queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.length === 0;
  }

  /**
   * Returns true if queue is full.
   * @returns {boolean}
   */
  isFull() {
    return this.length === this.capacity;
  }

  /**
   * Peek at the number at the front of the queue.
   * @returns {number | undefined}
   */
  peekFront() {
    if (this.isEmpty()) return undefined;

    return this.data[(this.front + 1) % this.capacity];
  }

  /**
   * Peek at the number at the back of the queue.
   * @returns {number | undefined}
   */
  peekBack() {
    if (this.isEmpty()) return undefined;

    return this.data[this.back];
  }

  /**
   * Insert an integer (0 <= n <= 255) into the front of the queue.
   * Overwrites newest data (back of queue) by default if queue is full.
   * @param {number} n - Integer added.
   */
  pushFront(n) {
    this.data[this.front] = n;
    this.front = (this.front + this.capacity - 1) % this.capacity;

    if (!this.isFull()) {
      this.length += 1;
    } else {
      this.back = (this.back + this.capacity - 1) % this.capacity;
    }
  }

  /**
   * Insert an integer (0 <= n <= 255) into the back of the queue.
   * Overwrites oldest data (front of queue) by default if queue is full.
   * @param {number} n - Integer added.
   */
  pushBack(n) {
    this.back = (this.back + 1) % this.capacity;
    this.data[this.back] = n;

    if (!this.isFull()) {
      this.length += 1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
  }

  /**
   * Remove and return the number at the front of the queue.
   * @returns {number | undefined}
   */
  popFront() {
    if (this.isEmpty()) return undefined;

    this.front = (this.front + 1) % this.capacity;
    this.lastPop = this.data[this.front];
    this.length -= 1;

    return this.lastPop;
  }

  /**
   * Remove and return the number at the back of the queue.
   * @returns {number | undefined}
   */
  popBack() {
    if (this.isEmpty()) return undefined;

    this.lastPop = this.data[this.back];
    this.back = (this.back + this.capacity - 1) % this.capacity;
    this.length -= 1;

    return this.lastPop;
  }

  /**
   * Return the queue represented as an Array ordered from back to front.
   * @returns {Array.<number>}
   */
  asArray() {
    if (this.isEmpty()) return [];

    let arr = [];
    for (let i = 0; i < this.length; ++i) {
      arr.push(this.data[(this.back + this.capacity - i) % this.capacity]);
    }

    return arr;
  }
}
