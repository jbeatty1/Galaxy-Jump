import 'phaser';

/**
 * Call this function to load the tilemap corresponding to the course.
 *
 * @param {Phaser.Scene} scene the current scene
 */


export default function loadTiles(scene) {
    scene.map = scene.make.tilemap({
        key: 'scene.map',
    });
    // First argument of addTilesetImage is the name of the tileset as shown in Tiled.
    // Second argument is the key of the image used in the tileset.
    // Semisolid platforms can only be touched from above. Player can pass through them otherwise.
    // scene.semiTiles = scene.map.addTilesetImage('platformPack_tilesheet', 'semisolid');
    // scene.semisolids = scene.map.createLayer('semisolid', scene.semiTiles, 0, 0);
    scene.terrainTiles = scene.map.addTilesetImage('fantasy-tiles_32x32', 'tiles');
    scene.solids = scene.map.createLayer('terrain', scene.terrainTiles, 0, 0);

    // Different tiles can have different properties and collision rules edited through Tiled.
    // Check to see if solid tiles have semisolid platforms to their right or left.
    // If so, give them collision on that side.
    
    /** The next line crashed because it couldn't read the properties of the tiles in solids. */
    scene.solids.setCollisionByProperty({ solid: true }, true);
    scene.solids.forEachTile((tile) => {
        other = scene.solids.getTileAt(tile.x + 1, tile.y);
        if (tile.properties.solid && other != null && other.properties.semisolid) {
            tile.faceRight = true;
            //tile.properties.semiAdjacent = true;
        }
        other = scene.solids.getTileAt(tile.x - 1, tile.y);
        if (tile.properties.solid && other != null && other.properties.semisolid) {
            tile.faceLeft = true;
            //tile.properties.semiAdjacent = true;
        }
        else {
            //tile.properties.semiAdjacent = false;
        }
    });

    // Semisolid collision
    // Semisolid tiles will be checked under scene.solids to make debugging easier
    scene.solids.forEachTile((tile) => {
        if (tile.properties.semisolid) {
            tile.collideUp = true;
            tile.collideLeft = false;
            tile.collideRight = false;
            tile.collideDown = false;
            tile.faceLeft = false;
            tile.faceRight = false;
        }
    });
}
