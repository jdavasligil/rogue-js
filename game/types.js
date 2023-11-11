/**
 * @namespace types
 */

/**
 * A Position on an x-y cartesian coordinate grid.
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Properties common to all entities.
 * @typedef Entity 
 * @property {number} id - Entity's unique ID.
 * @property {string} name - Entity name.
 * @property {Position} position - Entity position.
 * @property {boolean} collision - Physical collision.
 * @property {boolean} visible - Visible or invisible.
 */

/**
 * The Camera determines the zoom level and rendering position.
 * @typedef Camera
 * @type {object}
 * @property {Position} position - The world grid position of the camera.
 * @property {number} resolution - The pixel resolution of each tile.
 * @property {number} deadZone - Distance travelled before camera moves.
 */

/**
 * A Chunk is a 16x16 sub-array of the world map used for data streaming.
 * @typedef Chunk
 * @type {object}
 * @property {Position} position - World position of the chunk.
 * @property {TileGrid} tileGrid - Tile grid.
 * @property {BitGrid} visGrid - Visibility grid.
 * @property {BitGrid} colGrid - Collision grid.
 * @property {IDGrid} entGrid - Entity ID grid.
 */

/**
 * The ChunkMap stores references to 9 16x16 chunks in memory at a time.
 * @typedef ChunkMap
 * @type {object}
 * @property {Map.<Position, Chunk>} cache - The chunk cache.
 * @property {Chunk} root - The central chunk.
 * @property {Chunk} N - The northern chunk.
 * @property {Chunk} NE - The northeastern chunk.
 * @property {Chunk} E - The eastern chunk.
 * @property {Chunk} SE - The southeastern chunk.
 * @property {Chunk} S - The southern chunk.
 * @property {Chunk} SW - The southwestern chunk.
 * @property {Chunk} W - The western chunk.
 * @property {Chunk} NW - The northwestern chunk.
 */

/**
 * The World holds all game state.
 * @typedef World
 * @type {object}
 * @property {ChunkMap} chunks - An octree holding per-chunk data buffers.
 * @property {Map.<number, object>} entities - A map to access entity data.
 * @property {Array.<Event>} events - An array for event signals for state change.
 * @property {Camera} camera - The top-down camera which renders the world.
 * @property {RenderingMode} renderer - How to draw the grid.
 * @property {number} width - Width of the world map.
 * @property {number} height - Height of the world map.
 * @property {number} turns - How many turns have passed (1 turn = 10 min).
 * @property {GameState} state - What state the game is currently in.
 * @property {Array.<MainMenuOption>} options - Main menu options available.
 * @property {number} selection - Current option menu selection.
 * @property {boolean} saveFileExists - True when save loaded from local storage.
 * @property {boolean} debug - Activates debugging features.
 */

export {};
