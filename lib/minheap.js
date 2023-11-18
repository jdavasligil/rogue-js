/**
 * @fileoverview (CC0) 2023 Jaedin Davasligil
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * A min-heap for storing numbers.
 * @package
 */

"use strict";

/** Class for a numeric min-heap. */
export class MinHeap {
  /**
   * Create a min-heap.
   * @returns {MinHeap}
   */
  constructor() {
    this.heap = [];
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new MinHeap(), json);
  }

  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }
  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }
  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }
  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }
  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.heap.length;
  }
  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }
  leftChild(index) {
    return this.heap[this.getLeftChildIndex(index)];
  }
  rightChild(index) {
    return this.heap[this.getRightChildIndex(index)];
  }
  parent(index) {
    return this.heap[this.getParentIndex(index)];
  }

  swap(indexOne, indexTwo) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  /**
   * Peek at the element at the top of the heap.
   * @returns {number}
   */
  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }

  /**
   * Remove and return the item at the top of the heap.
   * @returns {number}
   */
  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }

  /**
   * Add an item onto the heap.
   * @returns {number}
   */
  add(item) {
    this.heap.push(item);
    this.heapifyUp();
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (this.hasParent(index) && this.parent(index) > this.heap[index]) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (this.hasRightChild(index) && this.rightChild(index) < this.leftChild(index)) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (this.heap[index] < this.heap[smallerChildIndex]) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }

  printHeap() {
    var heap =` ${this.heap[0]} `
    for(var i = 1; i<this.heap.length;i++) {
      heap += ` ${this.heap[i]} `;
    }
    console.log(heap);
  }
}

