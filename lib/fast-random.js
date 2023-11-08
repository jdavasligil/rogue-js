// Written in 2017 by Tommy Ettinger (tommy.ettinger@gmail.com)
//
// To the extent possible under law, the author has dedicated all copyright
// and related and neighboring rights to this software to the public domain
// worldwide. This software is distributed without any warranty.
// See <http://creativecommons.org/publicdomain/zero/1.0/>.
// Random Number Generation
// 
// https://gist.github.com/tommyettinger/46a874533244883189143505d203312c 

"use strict";

export function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
