/**
Test of Galaxy Jump prototype in an application setting.
Some notes about this initial draft:
- Every variable needs to be declared either outside of the export statement or inside the preload,
create, or update methods.
- Methods and callbacks declared inside the export statement must be referred to with the this reference.
- Game SUCKS!!!!!!!!

For Galaxy Jump project.

This whole code is a modified version of the part7.html example at http://phaser.io/tutorials/making-your-first-phaser-3-game/part7.
If you want to see what everything else is, I would recommend looking at the other parts in the tutorial.

This is made using the Phaser 3 game engine from https://github.com/photonstorm/phaser
-Tony Imbesi, 1/29/2022

License: https://opensource.org/licenses/MIT|MIT License
Copyright 2020 Photon Storm Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*/

import Player from "../../Player";


// Game timer in milliseconds
var INTERVAL = 16;
// Player's appearance:
var PWIDTH = 32; // Width of the sprite
var PHEIGHT = 48; // Height of the sprite
var P_WFRAC = 0.75; // Percentage of sprite body filled horizontally by hitbox
var P_HFRAC = 0.75; // Percentage of sprite body filled vertically by hitbox

// Player's movement variables:
var PVEL_MAX = 320; // Soft limit to max horizontal speed. Can be broken by various methods.
var P_XVEL_HARDMAX = 900; // Hard limit to max horizontal speed
var P_YVEL_HARDMAX = 900; // Hard limit to max vertical speed
// We can get the player's velocity at any time using player.body.velocity.x
var PXACCEL = 1800; // Default horizontal acceleration
var PJUMP = -400; // Jump velocity
var PJUMP_ACCEL = -2750; // Jump acceleration. Vertical acceleration is unchanged by gravity but still affects vertical movement.
var PJUMP_BRAKE = 800; // Cancel out jump acceleration at the end of a jump
var PDRAG = 800; // Default drag
var PDRAG_AIR = 80; // Air drag
var PGRAV = 1700; // Player gravity. Total gravity = world gravity + player gravity
var KICK_VEL = 400; // Base velocity from kicking an object
var SIDEKICK_Y = -100; // Height gained from side-kicking
var sideKick_W = 40;
var sideKick_H = 48;

var tickCount = 0;
var ticksToJumpEnd = 0;
var maxJumpTicks = 15 * INTERVAL;
var isJumping = false;

var ticksToKickEnd = 0;
var maxKickTicks = 15 * INTERVAL;
var sideKick = false;

// var ticksToMoveEnd = 0;
// var maxMoveTicks = 5;
// var moveLeft = true;
// var moveRight = true;


var platforms;
var player;
var platCollider;
var kickCollider;

var text1;
var text2;
var timer;

var pHitboxes;
var sideKickBox;
var kickXOffset = 5;

var blocks; // rename later
var semisolids;
var tileCollider;
var semiCollider;
// var tileOverlap;
var debugGraphics;
var propertiesText;
var map;
var blockTiles;
var semiTiles;


var maxYVel = 0;
var maxXVel = 0;
var xDirection = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
};
var xFacing = 0;
var kickDirection = 0;
var kickAgain = true;
var lastKick_V = 0;
var collision = false;

var reboundRan = 0;
var kickOK = false;  
var staticEdge = 0;
var kickEdge = 0;

var other;
var collided;
var cursors;
var rebound;

export default class testCourse extends Phaser.Scene {
    constructor () {
        super('testCourse');
    }

    preload ()
    {
        // this.load.setBaseURL('https://labs.phaser.io');
        // this.load.image('sky', 'assets/skies/sky1.png');
        // this.load.image('ground', 'assets/sprites/platform.png');
        //this.load.image('star', 'assets/images/star.png');
        // this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/player/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('sky', 'assets/bg/sky.png');
        // this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        // this.load.spritesheet('dude', 'dude2_hat.png', { frameWidth: 32, frameHeight: 48 });

        // To make a tile map, load the image, then load the .json file created in Tiled
        this.load.image('tiles', 'assets/tilesets/ground_1x1.png');
        this.load.image('semisolid', 'assets/tilesets/platformPack_tilesheet.png');
        this.load.tilemapTiledJSON('map', 'assets/courses/coursetest.json');
    }

    
    
    create ()
    {
        this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(3);
        map = this.make.tilemap({
            key: 'map',
        });
        // First argument of addTilesetImage is the name of the tileset as shown in Tiled.
        // Second argument is the key of the image used in the tileset.

        // Semisolid platforms can only be touched from above. Player can pass through them otherwise.
        semiTiles = map.addTilesetImage('platformPack_tilesheet', 'semisolid');
        semisolids = map.createLayer('semisolid', semiTiles, 0, 0);

        blockTiles = map.addTilesetImage('ground_1x1', 'tiles');
        blocks = map.createLayer('block', blockTiles, 0, 0);
        
        // Different tiles can have different properties and collision rules edited through Tiled.

        
    
        // Check to see if solid tiles have semisolid platforms to their right or left.
        // If so, give them collision on that side.
        blocks.setCollisionByProperty({ solid: true }, true);
        blocks.forEachTile((tile) => {
            other = blocks.getTileAt(tile.x + 1, tile.y);
            if (tile.properties.solid && other != null && other.properties.semisolid) {
                tile.faceRight = true;
                //tile.properties.semiAdjacent = true;
            }
            other = blocks.getTileAt(tile.x - 1, tile.y);
            if (tile.properties.solid && other != null && other.properties.semisolid) {
                tile.faceLeft = true;
                //tile.properties.semiAdjacent = true;
            }
            else {
                //tile.properties.semiAdjacent = false;
            }
        })

        // Semisolid collision
        // Semisolid tiles will be checked under blocks to make debugging easier
        blocks.forEachTile((tile) => {
            if (tile.properties.semisolid) {
                tile.collideUp = true;
                tile.collideLeft = false;
                tile.collideRight = false;
                tile.collideDown = false;
                tile.faceLeft = false;
                tile.faceRight = false;
            }
        })
        

        debugGraphics = this.add.graphics();
        map.renderDebug(debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        });

        // Make the platforms
        // platforms.create(600, 1990, 'ground').setScale(6).refreshBody(); // Floor platform
        // platforms.create(2500, 1775, 'ground').setScale(4).refreshBody();
        // platforms.create(-700, 1700, 'ground').setScale(4).refreshBody();
        // platforms.create(700, 1390, 'ground').setScale(0.5).refreshBody();
        // platforms.create(1000, 1550, 'ground').setScale(1).refreshBody();
        // platforms.create(4900, 1650, 'ground').setScale(6).refreshBody();

        // Make the preset player character
        // The object layer can be accessed as an array of objects. objects[0] is the first object in the 'spawnpoint' object layer.
        var spawnX = map.getObjectLayer('spawnpoint').objects[0].x;
        var spawnY = map.getObjectLayer('spawnpoint').objects[0].y;
        // This thing is similar to an input listener.
        cursors = this.input.keyboard.createCursorKeys();
        player = new Player(this, spawnX, spawnY, 'dude', blocks, semisolids, cursors);
        

        // Debug text
        text1 = this.add.text(10, 50, '', { font: '16px Courier', fill: '#00ff00' });
        text2 = this.add.text(10, 60, '', { font: '16px Courier', fill: '#00ff00' });
        text1.setScrollFactor(0);
        text2.setScrollFactor(0);

        // timer = self.setInterval(function(){this.Tick()}, INTERVAL);

        // Camera
        this.cameras.main.setBounds(0, 0, 1800, 1000);
        this.physics.world.setBounds(0, 0, 1800, 1000);

        this.cameras.main.startFollow(player, false, 1, 1); // Setting 2nd parameter to 'true' will make the camera round its position value to integers
        this.cameras.main.setDeadzone(100, 50);
        this.cameras.main.setFollowOffset(0, 0);

        propertiesText = this.add.text(16, 540, 'Properties: ', {
            fontSize: '18px',
            fill: '#ffffff'
        });
    }



    // Tick() {
    //     tickCount++;
    // }

    
    
    update (time, delta)
    {
        // tickCount++;
        // Timer
        // if (time % INTERVAL == 0) {
        //     tickCount++;
        // }

        // Controls and movement. Could be remade into a switch statement.
        player.update(time);

        // DEBUG: Record maximum y velocity after each fall
        if (!player.body.onFloor()) {
            maxYVel = 0;
        }
        if (player.body.velocity.y > maxYVel) {
            maxYVel = player.body.velocity.y;
        }

        // DEBUG: Record maximum x velocity
        if (Math.abs(player.body.velocity.x) > maxXVel) {
            maxXVel = Math.abs(player.body.velocity.x);
        }
        // DEBUG FEATURE: Increase x-velocity with space
        // if (cursors.space.isDown)
        // {
        //     if (player.body.velocity.x > 0){
        //         player.setVelocityX(900);
        //     }
        //     else if (player.body.velocity.x < 0){
        //         player.setVelocityX(-900);
        //     }
        // }
        // DEBUG: Go back to high platform
        if (cursors.shift.isDown)
        {
            player.setPosition(30, 30);
            collision = false;
            // player.setVelocityY(-4000);
        }

        
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
        var pointerTileX = map.worldToTileX(worldPoint.x);
        var pointerTileY = map.worldToTileY(worldPoint.y);
        if (this.input.manager.activePointer.isDown)
        {
            var tile = map.getTileAt(pointerTileX, pointerTileY);

            if (tile)
            {
                // Note: JSON.stringify will convert the object tile properties to a string
                propertiesText.setText('Properties: ' + JSON.stringify(tile.properties) + 
                '\n faceLeft: ' + tile.faceLeft + ' faceRight: ' + tile.faceRight +
                '\n collideLeft: ' + tile.collideLeft + ' collideRight: ' + tile.collideRight + ' canCollide: ' + tile.canCollide + ' collideUp: ' + tile.collideUp +
                '\n x: ' + tile.x + ' y: ' + tile.y);
                tile.properties.viewed = true;
            }
        }
        // End code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        
        // Debug text:
        text1.setText('XVel: ' + player.body.velocity.x + ' PVEL_MAX: ' + PVEL_MAX + ' Max YVel: ' + maxYVel + ' Max XVel: ' + maxXVel + ' YAcc: ' + player.body.acceleration.y);
        text2.setText(' XAcc: ' + player.body.acceleration.x + " \nkickAgain: " + kickAgain + " sideKick: " + sideKick + " lastKick_V: " + lastKick_V
            + "\nstaticEdge: " + staticEdge + " kickEdge: " + kickEdge + " kickOK: " + kickOK + " reboundRan: " + reboundRan 
            + " \nenable: " + sideKickBox.body.enable  + ' collided: ' + collision + ' time: ' + time
            + "\nArrow keys to move left/right and jump. Press UP to jump. Press SPACE to do a side kick.");

        // Music player
        this.model = this.sys.game.globals.model;
        if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
            this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
            this.bgMusic.play();
            this.model.bgMusicPlaying = true;
            this.sys.game.globals.bgMusic = this.bgMusic;
        }
    } // END update


    collided() {
        collision = true;
    }
}