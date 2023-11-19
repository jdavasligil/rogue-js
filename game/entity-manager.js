/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { EntityType } from "./types.js";

/**
 * An entity ID is a 32 bit unsigned integer where the leftmost 8 bits
 * store the entity type, and the 24 remaining bits contain the index.
 * The entity type is enumerated descending from 255 - 1, and indexed by
 * the complement: ID - 255.
 * @typedef {number} EntityID 
 */

/** Class for handling entity data and assigning new IDs. */
export class EntityManager {
  /**
   * Create an EntityManager.
   * @returns {EntityManager}
   */
  constructor() {
    let types = Object.values(EntityType);

    /**
     * Data contains all living references to entities of each archetype.
     * @type {Array.<Array.<number>>} 
     */
    this.data = new Array(types.length);

    /**
     * The recycling bin saves deleted indices for each archetype.
     * @type {Array.<Array.<number>>} 
     */
    this.bin = new Array(types.length);

    // Each archetype is stored in its own array indexed by type.
    for (let i = 0; i < types.length; ++i) {
      this.data[types[i]] = [];
      this.bin[types[i]] = [];
    }
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   * @returns {EntityManager}
   */
  static from(json) {
    return Object.assign(new EntityManager(), json);
  }

  /**
   * Create an Entity ID from a given type and index.
   * @param {EntityType} type - An entity ID.
   * @param {number} idx - The index location of the entity in memory.
   */
  static createID(type, idx) {
    return ((0xFF - type) << 24) | idx;
  }

  /**
   * Retrieve the type value from the given entity ID.
   * @param {EntityID} id - An entity ID.
   * @returns {EntityType}
   */
  static getIDType(id) {
    return (0xFF - ((id & (0xFF << 24)) >>> 24));
  }

  /**
   * Retrieve the type index from the given entity ID.
   * @param {EntityID} id - An entity ID.
   * @returns {number}
   */
  static getIDIndex(id) {
    return (id & ~(0xFF << 24));
  }

  /**
   * Returns a pointer to the entity associated with the ID.
   * @param {EntityID} id - Entity ID to lookup.
   * @returns {object}
   */
  lookup(id) {
    return this.data[EntityManager.getIDType(id)][EntityManager.getIDIndex(id)];
  }

  /**
   * Returns a pointer to the array of entities sharing archetype with the ID.
   * @param {EntityID} id - Entity ID to lookup.
   * @returns {Array.<object>}
   */
  allSameAs(id) {
    return this.data[EntityManager.getIDType(id)];
  }

  /**
   * Returns a pointer to the array of entities of a certain type.
   * @param {EntityType} type - Entity type to lookup.
   * @returns {Array.<object>}
   */
  all(type) {
    return this.data[type];
  }

  /**
   * Returns true if memory is available for the desired ID.
   * @param {EntityID} id - Entity ID to lookup.
   * @returns {boolean}
   */
  checkFree(id) {
    return this.lookup(id) === null;
  }

  /**
   * Returns true the recycling bin for the given type is empty.
   * @param {EntityType} type - Entity ID to lookup.
   * @returns {boolean}
   */
  binEmpty(type) {
    return this.bin[type].length === 0;
  }

  /**
   * Inserts an entity into the manager.
   * @param {object} entity - Entity added.
   * @return {EntityID}
   */
  insert(entity) {
    const type = EntityManager.getIDType(entity.id);
    let idx = 0;

    if (this.binEmpty(type)) {
      idx = this.data[type].length;
      this.data[type].push(entity);
    } else {
      idx = this.bin[type].pop();
      this.data[type][idx] = entity;
    }
    entity.id = EntityManager.createID(type, idx);

    return entity.id;
  }

  /**
   * Remove and return the entity based on the given ID.
   * @param {EntityID} id - Entity ID to be removed.
   * @returns {object | undefined}
   */
  remove(id) {
    const type = EntityManager.getIDType(id);
    const idx = EntityManager.getIDIndex(id);
    const entity = this.data[type][idx];

    if (!entity) {
      return undefined;
    }

    this.bin[type].push(idx);
    this.data[type][idx] = null;

    return entity;
  }

  /**
   * Delete the entity based on the given ID.
   * @param {EntityID} id - Entity ID to be deleted.
   * @returns {EntityID | undefined}
   */
  delete(id) {
    const type = EntityManager.getIDType(id);
    const idx = EntityManager.getIDIndex(id);

    if (!this.data[type][idx]) {
      return undefined;
    };

    this.bin[type].push(idx);
    this.data[type][idx] = null;

    return id;
  }
}
