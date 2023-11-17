/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { EntityType } from "./types";

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
    this.nextID = 1;
    /** @type {Array.<Array.<object>>} */
    this.data = Array(Object.values(EntityType).length);
    this.idRecycleBin = [];
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new EntityManager(), json);
  }

  /**
   * Create an Entity ID from a given type and index.
   * @param {EntityID} id - An entity ID.
   */
  static createID(type, idx) {
    return (type << 24) | idx;
  }

  /**
   * Retrieve the type value from the given entity ID.
   * @param {EntityID} id - An entity ID.
   * @returns {number}
   */
  static getIDType(id) {
    return (id & (0xFF << 24)) >>> 24;
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
   * Inserts an entity into the manager with ID recycling.
   * @param {T.Entity} entity - Entity added.
   */
  insert(entity) {
    switch(this.idRecycleBin.length === 0) {
      case True:
        entity.id = this.nextID;
        this.data.push(entity);
        this.nextID += 1;
        break;

      case False:
        entity.id = this.idRecycleBin.pop();
        this.data[entity.id] = entity;
        break;
    }
  }

  /**
   * Remove and return the entity based on the given ID.
   * @param {number} entity_id - Entity id to be removed.
   * @returns {T.Entity | null | undefined}
   */
  remove(entity_id) {
    if (entity_id > this.data.length) {
      return undefined;
    }

    let entity = this.data[entity_id - 1];

    if (entity === null) {
      return null;
    }

    this.idRecycleBin.push(entity_id);
    this.data[entity_id - 1] = null;

    return entity;
  }

  /**
   * Delete the entity based on the given ID.
   * @param {number} entity_id - Entity id to be deleted.
   * @returns {number | null | undefined}
   */
  delete(entity_id) {
    if (entity_id > this.data.length) {
      return undefined;
    }

    if (this.data[entity_id - 1] === null) {
      return null;
    }

    this.idRecycleBin.push(entity_id);
    this.data[entity_id - 1] = null;

    return entity_id;
  }
}
