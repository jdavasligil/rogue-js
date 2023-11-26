/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

// TODO Handle entity stack diffing

"use strict";

import { GAMMA2 } from "../lib/gamma.js";
import { SERDE } from "../lib/serde.js";
import { BitGrid, IDGrid, TileGrid } from "./grid.js";
import { World } from "./map-generation.js";
import { mulberry32 } from "../lib/fast-random.js";
import { EntityManager } from "./entity-manager.js";
import { Tile, tileCollision, tileEntity } from "./tile.js";
import { EntityType } from "./archetype/archetype.js";
import { Door } from "./archetype/door.js";

// LOCAL STORAGE FORMATS
/**
 * @typedef {string} ChunkString - Key format: `{DEPTH<0x>}_{U<0x>}_{V<0x>}`
 */
/**
 * @typedef {string} ChunkDiff - Val format: `{u<0x>},{v<0x>}:{TILE<0x>};...`
 */
/**
 * Note: Entity diffs are only kept in cache (cleared during world change).
 * @typedef {string} EntityDiff - Val format: `\n{u<0x>},{v<0x>}:{EntityID};...`
 */
/**
 * @typedef {string} PositionString - format: `{x<0x>},{y<0x>}`
 */

/** A Chunk is a 16x16 sub-array of the world map used for data streaming. */
export class Chunk {
  /**
   * Create a Chunk.
   * @param {TileGrid} tileGrid - Terrain tile grid.
   * @param {BitGrid} visGrid - Visibility bit grid.
   * @param {BitGrid} colGrid - Collision bit grid.
   * @param {IDGrid} idGrid - Entity ID grid.
   * @returns {Chunk}
   */
  constructor() {
    this.tileGrid = new TileGrid(Chunk.size); 
    this.visGrid  = new BitGrid(Chunk.size); 
    this.colGrid  = new BitGrid(Chunk.size); 
    this.idGrid   = new IDGrid();
  }

  static get size() { return 16; }

  /**
   * Convert world coordinate position to chunk UV coordinate space.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {import("./types.js").Position}
   */
  static worldToUV(position) {
    return {
      x: Math.floor(position.x / Chunk.size),
      y: Math.floor(position.y / Chunk.size)
    };
  }

  /**
   * Convert UV space to world space.
   * @param {import("./types.js").Position} position - UV coordinate.
   * @returns {import("./types.js").Position}
   */
  static UVToWorld(position) {
    return {
      x: position.x * Chunk.size,
      y: position.y * Chunk.size
    };
  }

  /**
   * Convert UV space to world space.
   * @param {number} seed - World seed.
   * @param {number} depth - Chunk depth.
   * @param {import("./types.js").Position} position - UV coordinate.
   * @returns {import("./types.js").Position}
   */
  static hashSeed(seed, depth, position) {
    return ((depth + 1) * seed) ^ (GAMMA2.pairHash(position));
  }

  /**
   * Convert depth and chunk position to a ChunkString.
   * @param {number} depth - Depth of the chunk.
   * @param {import("./types.js").Position} position - UV Position.
   * @returns {ChunkString}
   */
  static toChunkString(depth, position) {
    return `${depth.toString(16)}_${position.x.toString(16)}_${position.y.toString(16)}`;
  }

  /**
   * Convert UV coord and tile to diff string.
   * @param {import("./types.js").Position} position - UV Position.
   * @param {Tile} tile - Game tile.
   * @returns {ChunkDiff}
   */
  static toChunkDiff(position, tile) {
    return `${position.x.toString(16)},${position.y.toString(16)}:${tile.toString(16)}`;
  }
}

/** The Chunk Manager handles dynamic chunk allocation and deallocation. */
export class ChunkManager {
  /**
   * Create a new ChunkManager.
   * @param {import("./types.js").Position} position - World position of player (stored as UV).
   * @param {number} width - World width (stored as UV).
   * @param {number} height - World height (stored as UV).
   * @param {number} distance - UV distance (L∞) to render chunks (O(d^2) chunks).
   * @returns {ChunkManager}
   */
  constructor(position, width, height, distance) {
    this.playerPosition = Chunk.worldToUV(position);
    this.position = this.playerPosition;
    this.width = Math.floor(width / Chunk.size);
    this.height = Math.floor(height / Chunk.size);
    this.distance = GAMMA2.clamp(distance, 1, 8);
    this.maxChunks = 1 + 4 * (distance * (distance + 1));

    /**
     * Chunk map keeps track of chunks currently being managed.
     * It maps UV-coord of chunk to its index in the buffer.
     * @type {Object.<import("./types.js").Position, number>}
     */
    this.chunkMap = {};

    /**
     * Object pool for chunks.
     * @type {Array.<Chunk>}
     */
    this.chunkBuffer = [];

    /**
     * Stores indices of free chunks in the chunk buffer.
     * @type {Array.<number>}
     */
    this.bin = [];

    /**
     * Stores entity types that need to be generated for a given chunk.
     * @type {Array.<EntityType>}
     */
    this.entityGenStack = [];

    /**
     * Cache of chunk diffs.
     * @type {Object.<ChunkString, ChunkDiff>}
     */
    this.chunkDiffCache = {};

    /**
     * Cache of entity diffs.
     * @type {Object.<ChunkString, EntityDiff>}
     */
    this.entityDiffCache = {};

    // Initialize Chunk Buffer
    for (let i = 0; i < this.maxChunks; ++i) {
      this.chunkBuffer.push(new Chunk());
      this.bin.push(this.maxChunks - 1 - i);
    }
  }

  /**
   * Returns true if a chunk is already loaded for the given position.
   * @param {import("./types.js").Position} position - UV Position.
   * @returns {boolean}
   */
  loaded(position) {
    return (this.chunkMap[SERDE.posToStr(position)] !== undefined);
  }

  /**
   * Returns true if any chunks are available.
   * @returns {boolean}
   */
  chunksAvailable() {
    return this.bin.length > 0;
  }

  /**
   * Returns true if UV coordinate is in bounds.
   * @param {import("./types.js").Position} position - UV Position.
   * @returns {boolean}
   */
  inBounds(position) {
    return (
         (0 <= position.x)
      && (0 <= position.y)
      && (position.x < this.width)
      && (position.y < this.height) 
    );
  }

  /**
   * Returns true if UV coordinate is within rendering distance.
   * @param {import("./types.js").Position} position - UV Position.
   * @returns {boolean}
   */
  withinDistance(position) {
    return GAMMA2.LInfNorm(this.playerPosition, position) <= this.distance;
  }

  /**
   * Return a reference to a chunk in the buffer.
   * @param {import("./types.js").Position} position - UV Position.
   * @returns {Chunk}
   */
  getChunk(position) {
    return this.chunkBuffer[this.chunkMap[SERDE.posToStr(position)]];
  }

  /**
   * Random entity generation from world map.
   * @param {function(): number} rng - Random number generator (0,1).
   * @param {Tile} tile - Tile from world map.
   * @param {import("./types.js").Position} position - UV Position.
   * @param {number} depth - Dungeon level.
   * @param {Chunk} chunk - Chunk reference.
   * @param {EntityManager} em - Reference to the entity manager.
   */
  generateEntity(rng, tile, position, depth, chunk, em) {
    switch(tile) {
      case Tile.ClosedDoor:
        const door = new Door();
        chunk.idGrid.setID(position, em.insert(door));
        Door.randomize(rng, door, depth);
    }
  }

  /**
   * Initialize a chunk by copying data from the underlying world.
   * @param {import("./types.js").Position} position - UV Position.
   * @param {World} world - Reference to the underlying world template.
   * @param {EntityManager} em - Reference to the entity manager.
   * @returns {import("./types.js").Position | undefined}
   */
  loadChunk(position, world, em) {
    if (
         !this.chunksAvailable()
      ||  this.loaded(position)
      || !this.inBounds(position)
    ) {
      return position;
    }

    // Obtain free chunk index.
    const idx = this.bin.pop();

    // Map chunk position to index for fast lookup.
    this.chunkMap[SERDE.posToStr(position)] = idx;

    const chunk = this.chunkBuffer[idx];
    const worldPos = Chunk.UVToWorld(position);
    const rng = mulberry32(Chunk.hashSeed(world.seed, world.depth, position));
    const chunkStr = Chunk.toChunkString(world.depth, position);
    const entityDiff = this.entityDiffCache[chunkStr];

    let chunkDiff = this.chunkDiffCache[chunkStr];

    let tile = 0;

    // Reset chunk data.
    chunk.colGrid.clear();
    chunk.visGrid.clear();
    chunk.idGrid.reset();

    // Parse world template info into the chunk map.
    for (let y = 0; y < Chunk.size; ++y) {
      for (let x = 0; x < Chunk.size; ++x) {
        tile = world.lookup(worldPos.x + x, worldPos.y + y);

        if (tileEntity(tile)) {
          if (entityDiff === undefined) {
            this.generateEntity(rng, tile, {x: x, y: y}, world.depth, chunk, em);
            world.delete(worldPos.x + x, worldPos.y + y);
            chunk.tileGrid.setTile({x: x, y: y}, world.defaultTile);
          }
        } else {
          chunk.tileGrid.setTile({x: x, y: y}, tile);
        }
        if (tileCollision(tile)) {
          chunk.colGrid.setBit({x: x, y: y});
        }
      }
    }

    let i = 0;
    let uv = {x: 0, y: 0};
    let keyVal;

    // Run diffs.
    if (chunkDiff === undefined) {
      chunkDiff = window.localStorage.getItem(chunkStr);
    }
    if (chunkDiff !== null && chunkDiff !== undefined) {
      let chunkDiffs = chunkDiff.split(';');
      for (i = 0; i < chunkDiffs.length; ++i) {
        keyVal = chunkDiffs[i].split(':'); // E.g., "a,3:fa"
        uv.x = parseInt(keyVal[0], 16); // 10
        uv.y = parseInt(keyVal[0].slice(keyVal.indexOf(',') + 1), 16); // 3

        chunk.tileGrid.setTile(uv, parseInt(keyVal[1], 16)); // 250
      }
      // Remove diff from cache.
      delete this.chunkDiffCache[chunkStr];
    }

    if (entityDiff !== undefined) {
      let entityDiffs = entityDiff.split(';');
      for (i = 0; i < entityDiffs.length; ++i) {
        keyVal = entityDiffs[i].split(':'); // E.g., "a,3:ID"
        uv.x = parseInt(keyVal[0], 16); // 10
        uv.y = parseInt(keyVal[0].slice(keyVal[0].indexOf(',') + 1), 16); // 3

        chunk.idGrid.setID(uv, EntityManager.StrToID(keyVal[1])); // 250
      }
      // Remove diff from cache.
      delete this.entityDiffCache[chunkStr];
    }

    return undefined;
  }

  /**
   * Unload a chunk by storing diffs and cleaning up entities.
   * @param {import("./types.js").Position} position - UV Position.
   * @param {World} world - Reference to the underlying world template.
   * @returns {import("./types.js").Position | undefined}
   */
  unloadChunk(position, world) {
    if (!this.loaded(position)) {
      alert(`NOT LOADED: ${SERDE.posToStr(position)}`)
      return position;
    }

    const worldPos = Chunk.UVToWorld(position);
    const idx = this.chunkMap[SERDE.posToStr(position)];
    const chunk = this.chunkBuffer[idx];

    let chunkDiffStr = "";
    let entityDiffStr = "";

    let worldTile = 0;
    let tile = 0;
    let entityID = 0;

    for (let y = 0; y < Chunk.size; ++y) {
      for (let x = 0; x < Chunk.size; ++x) {

        // Save chunk diffs.
        worldTile = world.lookup(worldPos.x + x, worldPos.y + y);
        tile = chunk.tileGrid.getTile({x: x, y: y});
        if (!tileEntity(worldTile) && tile !== worldTile) {
          if (chunkDiffStr !== "") chunkDiffStr += ';';
          chunkDiffStr += Chunk.toChunkDiff({x: x, y: y}, tile);
        }

        // Save entity diffs.
        entityID = chunk.idGrid.getID({x: x, y: y});
        if (entityID !== undefined) {
          if (entityDiffStr !== "") entityDiffStr += ';';
          entityDiffStr += `${x.toString(16)},${y.toString(16)}:${EntityManager.IDToStr(entityID)}`;
        }
      }
    }

    // Cache diffs.
    if (chunkDiffStr !== "") {
      this.chunkDiffCache[Chunk.toChunkString(world.depth, position)] = chunkDiffStr;

      // Save chunk diffs to Local Storage.
      window.localStorage.setItem(Chunk.toChunkString(world.depth, position), chunkDiffStr);
    }

    if (entityDiffStr !== "") {
      this.entityDiffCache[Chunk.toChunkString(world.depth, position)] = entityDiffStr;
    }


    // Unload chunk.
    this.bin.push(idx);
    delete this.chunkMap[SERDE.posToStr(position)]; 

    return undefined;
  }

  // TODO Fix entity dropping on move during chunk update.
  /**
   * Given the position of the player, update all chunks if necessary.
   * @param {import("./types.js").Position} position - Player world position.
   * @param {World} world - Reference to the underlying world template.
   * @param {EntityManager} em - Reference to the entity manager.
   * @param {boolean} force - Whether or not to force an update to occur.
   * @returns {undefined}
   */
  update(position, world, em, force=false) {
    this.playerPosition = Chunk.worldToUV(position);
    if (
         (this.playerPosition.x === this.position.x) 
      && (this.playerPosition.y === this.position.y)
      && !force
    ) {
      return undefined;
    }

    // Update current chunk manager position.
    Object.assign(this.position, this.playerPosition);

    // Unload any chunks that are out of bounds.
    const mapKeys = Object.keys(this.chunkMap);
    for (let i = 0; i < mapKeys.length; ++i) {
      if (!this.withinDistance(SERDE.strToPos(mapKeys[i]))) {
        this.unloadChunk(SERDE.strToPos(mapKeys[i]), world);
      }
    }

    // Load any chunks that need to be loaded.
    for (let v = (this.playerPosition.y - this.distance); v <= (this.playerPosition.y + this.distance); ++v) {
        for (let u = (this.playerPosition.x - this.distance); u <= (this.playerPosition.x + this.distance); ++u) {
          this.loadChunk({x: u, y: v}, world, em);
      }
    }
  }

  /**
   * Try to retrieve the tile at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {Tile | undefined}
   */
  getTile(position) {
    const chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    const chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    return chunk.tileGrid.getTile({
      x: position.x - chunkWorldCoord.x,
      y: position.y - chunkWorldCoord.y
    });
  }

  /**
   * Try to retrieve the collision at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {boolean | undefined}
   */
  getCollision(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    return chunk.colGrid.getBit({
      x: position.x - chunkWorldCoord.x,
      y: position.y - chunkWorldCoord.y
    });
  }

  /**
   * Try to retrieve the visibility at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {boolean | undefined}
   */
  getVisibility(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    return chunk.visGrid.getBit({
      x: position.x - chunkWorldCoord.x,
      y: position.y - chunkWorldCoord.y
    });
  }

  /**
   * Try to retrieve the EntityID at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {import("./entity-manager.js").EntityID | undefined}
   */
  getID(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    return chunk.idGrid.getID({
      x: position.x - chunkWorldCoord.x,
      y: position.y - chunkWorldCoord.y
    });
  }

  /**
   * Try to set the tile at the given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @param {Tile} tile - Game tile.
   * @returns {Tile | undefined}
   */
  setTile(position, tile) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return tile;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));

    chunk.tileGrid.setTile(
      {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y},
      tile
    );

    return undefined;
  }

  /**
   * Try to set the collision at the given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @param {boolean} state - Collision for chunk position set on or off.
   * @returns {boolean | undefined}
   */
  setCollision(position, state) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return state;

    // TODO FINISH SETTERS
    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));

    if (state === true) {
      chunk.colGrid.setBit(
        {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y}
      );
    } else {
      chunk.colGrid.clearBit(
        {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y}
      );
    }

    return undefined;
  }

  /**
   * Try to set the visibility at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @param {boolean} state - Visibility for chunk position set on or off.
   * @returns {boolean | undefined}
   */
  setVisibility(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return state;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    if (state === true) {
      chunk.visGrid.setBit(
        {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y}
      );
    } else {
      chunk.visGrid.clearBit(
        {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y}
      );
    }

    return undefined;
  }

  /**
   * Try to set the EntityID at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @param {import("./entity-manager.js").EntityID} id - Entity ID.
   * @returns {import("./entity-manager.js").EntityID | undefined}
   */
  setID(position, id) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return id;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    chunk.idGrid.setID(
      {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y},
      id
    );

    return undefined;
  }

  /**
   * Try to replace the top ID at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @param {import("./entity-manager.js").EntityID} id - Entity ID.
   * @returns {import("./entity-manager.js").EntityID | undefined}
   */
  replaceID(position, id) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return id;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    
    return chunk.idGrid.replaceID(
      {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y},
      id
    );
  }

  /**
   * Try to pop the top EntityID at a given world coordinate position.
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {import("./entity-manager.js").EntityID | undefined}
   */
  popID(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));

    return chunk.idGrid.popID(
      {x: position.x - chunkWorldCoord.x, y: position.y - chunkWorldCoord.y}
    );
  }

  /**
   * Reset the chunk manager. Called on world change.
   * @param {import("./types.js").Position} position - World position of player (stored as UV).
   * @param {number} width - World width (stored as UV).
   * @param {number} height - World height (stored as UV).
   * @returns {undefined}
   */
  reset(position, width, height) {
    this.position = Chunk.worldToUV(position);
    this.width = Math.floor(width / Chunk.size);
    this.height = Math.floor(height / Chunk.size);

    // Clear Caches
    let i = 0;
    let cacheKeys = Object.keys(this.entityDiffCache);

    for (i = 0; i < cacheKeys.length; ++i) {
      delete this.entityDiffCache[cacheKeys[i]];
    }

    cacheKeys = Object.keys(this.chunkDiffCache);

    for (i = 0; i < cacheKeys.length; ++i) {
      delete this.chunkDiffCache[cacheKeys[i]];
    }

    // Empty chunk map
    cacheKeys = Object.keys(this.chunkMap);
    for (i = 0; i < cacheKeys.length; ++i) {
      this.bin.push(this.chunkMap[cacheKeys[i]]);
      delete this.chunkMap[cacheKeys[i]];
    }

    return undefined;
  }
}
