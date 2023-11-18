/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * A general purpose ring (circular) buffer (queue). Fast and lightweight.
 * Supports pushing and popping to both front and back with optional overwrite.
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
  constructor(
    data=undefined,
    capacity=32,
    length=0,
    front=0,
    back=0,
    lastPop=0
  ) {
    this.data = (data) ? data : new Uint8Array(capacity);
    this.capacity = capacity;
    this.length = length;
    this.front = front;
    this.back = back;
    this.lastPop = lastPop;
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return new RingBuffer(
      new Uint8Array(Object.values(json.data)),
      json.capacity, 
      json.length, 
      json.front, 
      json.back, 
      json.lastPop, 
    );
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
   * Insert an integer into the front of the queue.
   * Overwrites newest data (back of queue) by default if queue is full.
   * @param {number} n - Integer added.
   * @returns {number | undefined}
   */
  pushOverFront(n) {
    if (this.isFull()) {
      this.lastPop = this.data[this.front];
      this.data[this.front] = n;
      this.front = (this.front + this.capacity - 1) % this.capacity;
      this.back = (this.back + this.capacity - 1) % this.capacity;

      return this.lastPop;

    } else {
      this.data[this.front] = n;
      this.front = (this.front + this.capacity - 1) % this.capacity;
      this.length += 1;

      return undefined;
    }
  }

  /**
   * Insert an integer into the back of the queue.
   * Overwrites oldest data (front of queue) by default if queue is full.
   * Returns the value being overwritten.
   * @param {number} n - Integer added.
   * @returns {number | undefined}
   */
  pushOverBack(n) {
    this.back = (this.back + 1) % this.capacity;

    if (this.isFull()) {
      this.lastPop = this.data[this.back];
      this.data[this.back] = n;
      this.front = (this.front + 1) % this.capacity;
      
      return this.lastPop;

    } else {
      this.data[this.back] = n;
      this.length += 1;

      return undefined;
    }
  }

  /**
   * Insert an integer into the front of the queue.
   * Returns the value being pushed if it fails to insert.
   * @param {number} n - Integer added.
   * @returns {number | undefined}
   */
  pushFront(n) {
    if (this.isFull()) {
      return n;
    }
    this.data[this.front] = n;
    this.front = (this.front + this.capacity - 1) % this.capacity;
    this.length += 1;

    return undefined;
  }

  /**
   * Insert an integer into the back of the queue.
   * Returns the value being pushed if it fails to insert.
   * @param {number} n - Integer added.
   * @returns {number | undefined}
   */
  pushBack(n) {
    if (this.isFull()) {
      return n;
    }
    this.back = (this.back + 1) % this.capacity;
    this.data[this.back] = n;
    this.length += 1;

    return undefined;
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
