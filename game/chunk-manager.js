/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { GAMMA2 } from "../lib/gamma.js";
import { SERDE } from "../lib/serde.js";
import { BitGrid, IDGrid, TileGrid } from "../lib/grid.js";
import { World } from "./map-generation.js";
import { hasCollision } from "./collision.js";
import { mulberry32 } from "../lib/fast-random.js";
import { Tile } from "./types.js";
import { EntityManager } from "./entity-manager.js";

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
   * @param {TileGrid} tileGrid - Tile grid.
   * @param {BitGrid} visGrid - Visibility bit grid.
   * @param {BitGrid} colGrid - Collision bit grid.
   * @param {IDGrid} idGrid - ID grid.
   * @returns {Chunk}
   */
  constructor() {
    this.tileGrid = new TileGrid(Chunk.size); 
    this.visGrid  = new BitGrid(Chunk.size); 
    this.colGrid  = new BitGrid(Chunk.size); 
    this.idGrid   = new IDGrid(Chunk.size); 
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
   * @param {import("./types.js").Position} position - UV Position of the occupied chunk.
   * @param {number} width - Width of the UV space (u < width).
   * @param {number} height - Height of the UV space (v < height).
   * @param {number} distance - UV distance (L∞) to render chunks (O(d^2) chunks).
   * @returns {ChunkManager}
   */
  constructor(position, width, height, distance) {
    this.position = position;
    this.playerPosition = position;
    this.width = width;
    this.height = height;
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
   * Initialize a chunk by copying data from the underlying world.
   * @param {import("./types.js").Position} position - UV Position.
   * @param {World} world - Reference to the underlying world template.
   * @returns {import("./types.js").Position | undefined}
   */
  loadChunk(position, world) {
    if (
         !this.chunksAvailable()
      ||  this.loaded(position)
      || !this.inBounds(position)
    ) {
      return position;
    }

    // Obtain free chunk index.
    let idx = this.bin.pop();
    idx = idx ? idx : 0;// TEMP

    // Map chunk position to index for fast lookup.
    this.chunkMap[SERDE.posToStr(position)] = idx;

    // Obtain reference to chunk in buffer.
    let chunk = this.chunkBuffer[idx];
    let worldPos = Chunk.UVToWorld(position);
    let rng = mulberry32(Chunk.hashSeed(world.seed, world.depth, position));
    let tile = 0;

    // Reset chunk data.
    chunk.colGrid.clear();
    chunk.visGrid.clear();
    chunk.idGrid.reset();

    // Copy world tiles to chunk.
    for (let y = 0; y < Chunk.size; ++y) {
      for (let x = 0; x < Chunk.size; ++x) {
        tile = world.lookup(worldPos.x + x, worldPos.y + y);
        if (hasCollision(tile)) {
          chunk.colGrid.setBit({x: x, y: y})
        }
        chunk.tileGrid.setTile({x: x, y: y}, tile);
      }
    }

    let i = 0;
    let uv = {x: 0, y: 0};
    let keyVal;

    // Run diffs.
    let chunkStr = Chunk.toChunkString(world.depth, position);

    let chunkDiff = this.chunkDiffCache[chunkStr];
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
      this.chunkDiffCache[chunkStr] = undefined; // MEMORY LEAK
    }

    let entityDiff = this.entityDiffCache[chunkStr];
    if (entityDiff !== undefined) {
      let entityDiffs = entityDiff.split(';');
      for (i = 0; i < entityDiffs.length; ++i) {
        keyVal = entityDiffs[i].split(':'); // E.g., "a,3:ID"
        uv.x = parseInt(keyVal[0], 16); // 10
        uv.y = parseInt(keyVal[0].slice(keyVal.indexOf(',') + 1), 16); // 3

        chunk.idGrid.setID(uv, EntityManager.StrToID(keyVal[1])); // 250
      }
      // Remove diff from cache.
      this.entityDiffCache[chunkStr] = undefined; // MEMORY LEAK
    }
    else {
      // Run random entity generation (treasure, monsters, teleporters, doors, etc.). 
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
      return position;
    }

    let idx = this.chunkMap[SERDE.posToStr(position)];
    let chunk = this.chunkBuffer[idx];
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
        if (tile !== worldTile) {
          if (chunkDiffStr !== "") chunkDiffStr += ';';
          chunkDiffStr += Chunk.toChunkDiff({x: x, y: y}, tile);
        }

        // Save entity diffs.
        entityID = chunk.idGrid.getID({x: x, y: y});
        if (entityID > 0) {
          if (entityDiffStr !== "") chunkDiffStr += ';';
          entityDiffStr += `${x.toString(16)},${y.toString(16)}:${EntityManager.IDToStr(entityID)}`;
        }
      }
    }

    // Cache diffs.
    this.chunkDiffCache[Chunk.toChunkString(world.depth, position)] = chunkDiffStr;
    this.entityDiffCache[Chunk.toChunkString(world.depth, position)] = entityDiffStr;

    // Save diffs to Local Storage.
    window.localStorage.setItem(Chunk.toChunkString(world.depth, position), chunkDiffStr);

    // Unload chunk.
    this.bin.push(idx);
    this.chunkMap[SERDE.posToStr(position)] = undefined; // MEMORY LEAK

    return undefined;
  }

  /**
   * Initialize a chunk by copying data from the underlying world.
   * @param {import("./types.js").Position} position - Player world position.
   * @param {World} world - Reference to the underlying world template.
   * @returns {undefined}
   */
  update(position, world) {
    this.playerPosition = Chunk.worldToUV(position);
    if (this.playerPosition === this.position) {
      return undefined;
    }

    // Unload any chunks that are out of bounds.
    let mapKeys = Object.keys(this.chunkMap);
    for (let i = 0; i < mapKeys.length; ++i) {
      if (!this.withinDistance(this.chunkMap[mapKeys[i]])) {
        this.unloadChunk(SERDE.strToPos(mapKeys[i]), world);
      }
    }

    // Load any chunks that need to be loaded.
    for (let v = (this.playerPosition.y - this.distance); v <= (this.playerPosition.y + this.distance); ++v) {
        for (let u = (this.playerPosition.x - this.distance); u <= (this.playerPosition.x + this.distance); ++u) {
      }
      if (!this.loaded({x: u, y: v})) {
        this.loadChunk({x: u, y: v}, world);
      }
    }
  }

  /**
   * Try to retrieve the tile at a given world coordinate position (slow).
   * @param {import("./types.js").Position} position - World coordinate.
   * @returns {Tile | undefined}
   */
  getTile(position) {
    let chunk = this.getChunk(Chunk.worldToUV(position));
    if (chunk === undefined) return undefined;

    let chunkWorldCoord = Chunk.UVToWorld(Chunk.worldToUV(position));
    return chunk.tileGrid.getTile({
      x: position.x - chunkWorldCoord.x,
      y: position.y - chunkWorldCoord.y
    });
  }

  /**
   * Try to retrieve the collision at a given world coordinate position (slow).
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
   * Try to retrieve the visibility at a given world coordinate position (slow).
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
   * Try to retrieve the EntityID at a given world coordinate position (slow).
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
}
