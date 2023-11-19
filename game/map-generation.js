/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

// 1. Generate large tilemap.
// 2. Player spawn is always (0,0).
// 3. Chunks dynamically load data based on tilemap underneath.
//      a) Chunk loads tile data from world map
//      b) If found, tile diffs are ran through to update chunk.
//      c) Entities are loaded and placed on map.
//      d) Entity diffs are applied.
//      e) Collision and light are calculated like usual, game continues.
//
// LOCALSTORAGE
// CHUNK
// key: "[Xworld]_[Yworld]"
// val: "[Xchunk]_[Ychunk]-[ID]; ... \n[Xchunk]_[Ychunk]-[KEY:VAL]; ..."
//
// MAP
// key: "L[DEPTH]"
// val: "[SEED]"
//
// CHARACTER
// key: "PC"
// val: "[DATA]"
