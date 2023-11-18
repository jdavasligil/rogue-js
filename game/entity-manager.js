/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { Monster } from "./archetypes/monster";
import { Player } from "./archetypes/player";
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
    let types = Object.values(EntityType);

    /** @type {Array.<Array.<object>>} */
    this.data = Array(types.length);

    // Initialize data pool by creating objects of each type.
    for (let i = 0; i < types.length; ++i) {
      this.data[0xFF - types[i]] = Array(EntityManager.poolSizeFrom(types[i]));
      for (let j = 0; j < EntityManager.poolSizeFrom(types[i]); ++j) {
        this.data[0xFF - types[i]][j] = new EntityManager.classFrom(types[i])(
          EntityManager.createID(types[i], j) 
        );
      }
    }
  }

  /**
   * Deserialize from JSON.
   * @param {object} json - JSON object.
   */
  static from(json) {
    return Object.assign(new EntityManager(), json);
  }

  /**
   * Match entity type to pool size.
   * @param {EntityType} type - An entity type enum.
   * @returns {number}
   */
  static poolSizeFrom(type) {
    switch(type) {
      case EntityType.Player:
        return 1;
      default:
        return 256;
    }
  }

  /**
   * Match entity type to class.
   * @param {EntityType} type - An entity type enum.
   * @returns {object}
   */
  static classFrom(type) {
    switch(type) {
      case EntityType.Player:
        return Player;
      case EntityType.Monster:
        return Monster;
      default:
        return Monster;
    }
  }

  /**
   * Create an Entity ID from a given type and index.
   * @param {EntityID} ID - An entity ID.
   */
  static createID(type, idx) {
    return (type << 24) | idx;
  }

  /**
   * Retrieve the type value from the given entity ID.
   * @param {EntityID} ID - An entity ID.
   * @returns {number}
   */
  static getIDType(id) {
    return (id & (0xFF << 24)) >>> 24;
  }

  /**
   * Retrieve the type index from the given entity ID.
   * @param {EntityID} ID - An entity ID.
   * @returns {number}
   */
  static getIDIndex(id) {
    return (id & ~(0xFF << 24));
  }

  /**
   * Returns a pointer to the entity associated with the id.
   * @param {EntityID} ID - Entity ID to lookup.
   * @returns {object}
   */
  lookup(id) {
    return this.data[EntityManager.getIDType(id)][EntityManager.getIDIndex(id)];
  }

  /**
   * Returns true if memory is available for the desired ID.
   * @param {EntityID} ID - Entity ID to lookup.
   * @returns {boolean}
   */
  checkFree(id) {
    return this.lookup(id).free;
  }

  /**
   * Inserts an entity into the manager. Returns zero on failure.
   * @param {object} entity - Entity added.
   * @return {EntityID}
   */
  insert(entity) {
    let poolEntity = this.lookup(entity.id);

    if (poolEntity.free) {
      Object.assign(poolEntity, entity);
      poolEntity.free = false;

      return entity.id;
    }

    let type = EntityManager.getIDType(entity.id);
    let id = 0;

    for (let i = 0; i < EntityManager.poolSizeFrom(type); ++i) {
      id = EntityManager.createID(type, i);
      poolEntity = this.lookup(id);

      if (poolEntity.free) {
        Object.assign(poolEntity, entity);
        poolEntity.free = false;
        poolEntity.id = id;

        return id;
      }
    }

    return 0;
  }

  /**
   * Remove and return the entity based on the given ID.
   * @param {number} entity_id - Entity ID to be removed.
   * @returns {T.Entity | null | undefined}
   */
  remove(entity_id) {
  }

  /**
   * Delete the entity based on the given ID.
   * @param {number} entity_id - Entity ID to be deleted.
   * @returns {number | null | undefined}
   */
  delete(entity_id) {
}
