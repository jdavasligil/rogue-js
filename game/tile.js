/**
 * @fileoverview Copyright (c) 2023 Jaedin Davasligil
 *
 * Rogue-JS is a pure javascript browser dungeon crawler.
 * @package
 */

"use strict";

import { EntityType } from "./archetype/archetype";

/**
 * Enumeration of all map tiles including world template, terrain, and entities.
 * Limit of 256.
 * @readonly
 * @enum {number}
 */
export const Tile = {
  Empty:          0,

  Player:         1,

  Bedrock:        2,
  Floor:          3,
  Wall:           4,

  OpenDoor:       5,
  ClosedDoor:     6,
  PortcullisUp:   7,
  PortcullisDown: 8,
  StairsUp:       9,
  StairsDown:     10,

  Granite:        11,
  Rubble:         12,
  Quartz:         13,
  Copper:         14,
  Silver:         15,
  Gold:           16,

  Alchemist:      17,
  Armoury:        18,
  BlackMarket:    19,
  Home:           20,
  MagicShop:      21,
  Store:          22,
  Temple:         23,
  Weaponsmith:    24,

  RoomNode:       25,

  Food:           26,
  Item:           27,
  Potion:         28,
  Scroll:         29,
  Treasure:       30,
  Weapon:         31,

  Beggar:         32,
  Guard:          33,
  Mercenary:      34,
  Thief:          35,
  Townsfolk:      36,

  Dog:            37,
  Skeleton:       38,
  Goblin:         39,
}

/**
 * Whether or not the tile has collision by default.
 * @param {Tile} tile - Tile.
 * @returns {boolean}
 */
export function tileCollision(tile) {
  switch(tile) {
    case Tile.Wall:
    case Tile.Bedrock:
      return true;

    default:
      return false;
  }
}

/**
 * Whether or not the tile maps to an entity.
 * @param {Tile} tile - Tile.
 * @returns {boolean}
 */
export function tileEntity(tile) {
  return tile > 4;
}

/**
 * Matches a given tile to an entity type.
 * @param {Tile} tile - A tile.
 * @returns {EntityType}
 */
export function matchTileToType(tile) {
  switch(tile) {
    case OpenDoor:       
    case ClosedDoor:     
    case PortcullisUp:   
    case PortcullisDown: 
      return EntityType.Door;

    case StairsUp:       
    case StairsDown:     
      return EntityType.Stairs;

    case Granite:        
    case Rubble:         
    case Quartz:         
    case Copper:         
    case Silver:         
    case Gold:           
      return EntityType.Rock;

    case Alchemist:      
    case Armoury:        
    case BlackMarket:    
    case Home:           
    case MagicShop:      
    case Store:          
    case Temple:         
    case Weaponsmith:    
      return EntityType.Shop;

    case RoomNode:       
      return EntityType.Room;

    case Food:           
    case Item:           
    case Potion:         
    case Scroll:         
      return EntityType.Item;

    case Treasure:       
      return EntityType.Treasure;

    case Weapon:         
      return EntityType.Weapon;

    case Beggar:         
    case Guard:          
    case Mercenary:      
    case Thief:          
    case Townsfolk:      
    case Dog:            
    case Skeleton:       
    case Goblin:         
      return EntityType.Monster;
  }
}
