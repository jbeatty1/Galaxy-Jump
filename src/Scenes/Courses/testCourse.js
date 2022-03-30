/**
Test of Galaxy Jump prototype in an application setting.
This time, we will try adding a simple course element to the world.
When everything is sorted out, the easiest option might be to just copy the same .js file multiple times
and have it load different tilemaps and tilesets to load different courses.

For Galaxy Jump project.

This whole code is a modified version of the part7.html example at http://phaser.io/tutorials/making-your-first-phaser-3-game/part7.
If you want to see what everything else is, I would recommend looking at the other parts in the tutorial.

This is made using the Phaser 3 game engine from https://github.com/photonstorm/phaser
@author Tony Imbesi
@version 3/30/2022

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
import 'phaser';
import Player from "../../Player";
import loadTiles from "../../loadTiles";
import loadEntities from "../../loadEntities";
import Enemy from "../../Objects/Enemy";
import Walker from "../../Objects/Walker";
import Walker2 from "../../Objects/Walker2";
import LaserCannon from "../../Objects/LaserCannon";
import Bat from "../../Objects/Bat";
import Jumpster from "../../Objects/Jumpster";
import CometSpawner from "../../Objects/CometSpawner";
import Comet from "../../Objects/Comet";



// Scene variables
var text1;
var text2;
var timer;
// var this.solids; 
// var this.semisolids;
var other; // for iterating through tiles
var otherSpike;

// var pHitboxes;
// var sideKickBox;
// var kickXOffset = 5;


// var tileCollider;
// var semiCollider;
// // var tileOverlap;
// var debugGraphics;
var propertiesText;
// var this.map;
// var this.blockTiles;
// var this.semiTiles;

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
        
        this.load.image('sky', 'assets/bg/sky.png');
        // this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        // this.load.spritesheet('dude', 'dude2_hat.png', { frameWidth: 32, frameHeight: 48 });

        // To make a tile this.map, load the image, then load the .json file created in Tiled
        // this.load.image('tiles', 'assets/tilesets/ground_1x1.png');
        
        this.load.tilemapTiledJSON('this.map', 'assets/courses/course1.json');
    }

    
    
    create ()
    {
        this.physics.world.gravity.set(0, 700);
        this.physics.world.setBoundsCollision(true, true, false, false);
        this.WORLD_WIDTH = 400 * 32;
        this.WORLD_HEIGHT = 45 * 32;

        this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(3);
        this.solids;
        // loadTiles(this);
        // loadEntities(this);
        this.map = this.make.tilemap({
            key: 'this.map',
        });
        

        // Semisolid platforms can only be touched from above. Player can pass through them otherwise.
        // this.semiTiles = this.map.addTilesetImage('platformPack_tilesheet', 'semisolid');
        // this.semisolids = this.map.createLayer('semisolid', this.semiTiles, 0, 0);

        // First argument of addTilesetImage is the name of the tileset as shown in Tiled.
        // Second argument is the key of the image used in the tileset.
        /** Add in spikes */
        this.spikeTiles = this.map.addTilesetImage('objects', 'objects');
        this.spikes = this.map.createLayer('spikes', this.spikeTiles, 0, 0);
        this.spikes.setCollisionByProperty({ spikes: true }, true);

        this.terrainTiles = this.map.addTilesetImage('fantasy-tiles_32x32', 'tiles');
        this.solids = this.map.createLayer('terrain', this.terrainTiles, 0, 0);
        
        
        // Different tiles can have different properties and collision rules edited through Tiled.

        
    
        // Check to see if solid tiles have semisolid platforms to their right or left.
        // If so, give them collision on that side.
        this.solids.setCollisionByProperty({ solid: true }, true);
        

        this.solids.forEachTile((tile) => {
            other = this.solids.getTileAt(tile.x + 1, tile.y);
            otherSpike = this.spikes.getTileAt(tile.x + 1, tile.y);
            if (tile.properties.solid && (other != null && other.properties.semisolid) ) {
                tile.faceRight = true;
                //tile.properties.semiAdjacent = true;
            }
            else if (tile.properties.solid && otherSpike != null && otherSpike.properties.spikes) {
                tile.faceRight = false;
            }
            other = this.solids.getTileAt(tile.x - 1, tile.y);
            otherSpike = this.spikes.getTileAt(tile.x - 1, tile.y);
            if (tile.properties.solid && (other != null && other.properties.semisolid) ) {
                tile.faceLeft = true;
                //tile.properties.semiAdjacent = true;
            }
            else if (tile.properties.solid && otherSpike != null && otherSpike.properties.spikes) {
                tile.faceLeft = false;
            }
        });

        // Semisolid collision
        // Semisolid tiles will be checked under this.solids to make debugging easier
        this.solids.forEachTile((tile) => {
            if (tile.properties.semisolid) {
                tile.collideUp = true;
                tile.collideLeft = false;
                tile.collideRight = false;
                tile.collideDown = false;
                tile.faceLeft = false;
                tile.faceRight = false;
            }
            // Check for solid tiles above or below semisolid tiles
            other = this.solids.getTileAt(tile.x, tile.y - 1);
            if (tile.properties.solid && (other != null && other.properties.semisolid)) {
                tile.collideUp = true;
                tile.faceTop = true;
            }
            other = this.solids.getTileAt(tile.x, tile.y + 1);
            if (tile.properties.solid && !tile.properties.semisolid && (other != null && other.properties.semisolid)) {
                tile.collideDown = true;
                tile.faceBottom = true;
            }
        });
        
        /** Debug graphics */
        // this.debugGraphics = this.add.graphics();
        // this.map.renderDebug(this.debugGraphics, {
        //     tileColor: null, // Non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        // });

        // Make the platforms
        // platforms.create(600, 1990, 'ground').setScale(6).refreshBody(); // Floor platform
        // platforms.create(2500, 1775, 'ground').setScale(4).refreshBody();
        // platforms.create(-700, 1700, 'ground').setScale(4).refreshBody();
        // platforms.create(700, 1390, 'ground').setScale(0.5).refreshBody();
        // platforms.create(1000, 1550, 'ground').setScale(1).refreshBody();
        // platforms.create(4900, 1650, 'ground').setScale(6).refreshBody();

        

        
        
        // this.spikeData = '' + this.spikesArray[0].body.position.x + ' ' + this.spikesArray[1].body.position.x;
        // this.spikeData = 'Too bad!';

        // this.spikeLayer = this.map.getObjectLayer('spikes');

        /** Add in the entities */
        this.enemies = this.physics.add.group({
            collideWorldBounds: false
        });
        // Remove default config information
        this.enemies.defaults = {};

        this.enemyArray = this.map.createFromObjects('enemies', [
            { 
                // Find the gid by checking the firstgid value in the tileset as shown in the course's .json file
                // then counting from the top-left to the bottom-right.
                // The firstgid of 'objects' in course1.json is 65
                gid: 67,
                classType: Walker
            },
            {
                gid: 68,
                classType: Walker2
            },
            {
                gid: 71,
                classType: LaserCannon
            },
            {
                gid: 72,
                classType: Bat
            },
            {
                gid: 75,
                classType: Jumpster
            },
            {
                gid: 76,
                classType: CometSpawner
            }
        ]); 
        
        this.enemies.addMultiple(this.enemyArray);
        // this.enemies.children.iterate(function (child) {
        //     child.body.setAllowGravity(true);
        //     child.body.setCollideWorldBounds(false);
        // });
        this.testEnemy = this.enemyArray[0];
        

        /** Make the player character */
        // The object layer can be accessed as an array of objects. objects[0] is the first object in the 'spawnpoint' object layer.
        var spawnX = this.map.getObjectLayer('spawnpoint').objects[0].x;
        var spawnY = this.map.getObjectLayer('spawnpoint').objects[0].y;
        // This thing is similar to an input listener.
        // controls = this.input.keyboard.createCursorKeys();
        
        // Add the player controller
        this.controls = this.sys.game.globals.controls;
        this.controls.addControls(this);

        // This line instantly sets up the player.
        this.player = new Player({scene:this, x:spawnX, y:spawnY}, this.solids, this.enemies, this.controls);
        //this.player.setTexture(this.textures.get('dude'));
        
        // this.player = this.physics.add.sprite(spawnX, spawnY, 'dude');

        // Debug text
        text1 = this.add.text(10, 50, '', { font: '16px Courier', fill: '#00ff00' });
        text2 = this.add.text(10, 60, '', { font: '16px Courier', fill: '#00ff00' });
        text1.setScrollFactor(0);
        text2.setScrollFactor(0);

        // timer = self.setInterval(function(){this.Tick()}, INTERVAL);

        // Camera
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        this.cameras.main.startFollow(this.player, false, 1, 1); // Setting 2nd parameter to 'true' will make the camera round its position value to integers
        this.cameras.main.setDeadzone(70, 50);
        this.cameras.main.setFollowOffset(0, 0);

        propertiesText = this.add.text(16, 600, 'Properties: ', {
            fontSize: '18px',
            fill: '#ffffff'
        });
        propertiesText.setScrollFactor(0);
        
        // Go to next scene!
        this.input.keyboard.on('keydown-Q', () => {
            this.scene.start('testCourse');
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.physics.world.isPaused)
                this.physics.world.pause();
                
            else 
                this.physics.world.resume();
        });
        this.tickCount = 0;

        
        // this.player.setCollideWorldBounds(true);
    }



    // Tick() {
    //     tickCount++;
    // }

    
    
    update (time, delta)
    {
        
        if (!this.physics.world.isPaused) {
            this.player.update(time, delta);
            this.enemies.children.iterate(function(child) {
                child.update(time, delta);
            });
        }

        // DEBUG: Record maximum y velocity after each fall
        // if (!this.player.body.onFloor()) {
        //     maxYVel = 0;
        // }
        // if (this.player.body.velocity.y > maxYVel) {
        //     maxYVel = player.body.velocity.y;
        // }

        // DEBUG: Record maximum x velocity
        // if (Math.abs(this.player.body.velocity.x) > maxXVel) {
        //     maxXVel = Math.abs(this.player.body.velocity.x);
        // }
        // DEBUG FEATURE: Increase x-velocity with space
        // if (controls.space.isDown)
        // {
        //     if (player.body.velocity.x > 0){
        //         player.setVelocityX(900);
        //     }
        //     else if (player.body.velocity.x < 0){
        //         player.setVelocityX(-900);
        //     }
        // }
        // DEBUG: Go back to high platform
        if (this.controls.shift.isDown)
        {
            this.player.setPosition(30, 30);
            //collision = false;
            // player.setVelocityY(-4000);
        }

        
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
        var pointerTileX = this.map.worldToTileX(worldPoint.x);
        var pointerTileY = this.map.worldToTileY(worldPoint.y);
        if (this.input.manager.activePointer.isDown)
        {
            var tile = this.map.getTileAt(pointerTileX, pointerTileY);

            if (tile)
            {
                // Note: JSON.stringify will convert the object tile properties to a string
                propertiesText.setText('!Properties: ' + JSON.stringify(tile.properties) + 
                '\n faceLeft: ' + tile.faceLeft + ' faceRight: ' + tile.faceRight + ' faceBottom: ' + tile.faceBottom +
                '\n collideLeft: ' + tile.collideLeft + ' collideRight: ' + tile.collideRight + ' canCollide: ' + tile.canCollide + ' collideUp: ' + tile.collideUp + ' collideDown: ' + tile.collideDown +
                '\n x: ' + tile.x + ' y: ' + tile.y +
                '\n worldX: ' + tile.pixelX + ' worldY: ' + tile.pixelY);
                tile.properties.viewed = true;
            }
        }
        // End code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        
        // Debug text:
        // text1.setText('XVel: ' + this.player.body.velocity.x + ' PVEL_MAX: ' + this.player.PVEL_MAX + ' Max YVel: ' + maxYVel + ' Max XVel: ' + maxXVel + ' YAcc: ' + player.body.acceleration.y);
        // text2.setText(' XAcc: ' + this.player.body.acceleration.x + " \nkickAgain: " + kickAgain + " sideKick: " + sideKick + " lastKick_V: " + lastKick_V
        //     + "\nstaticEdge: " + staticEdge + " kickEdge: " + kickEdge + " kickOK: " + kickOK + " reboundRan: " + reboundRan 
        //     + " \nenable: " + sideKickBox.body.enable  + ' collided: ' + collision + ' time: ' + time
        //     + "\nArrow keys to move left/right and jump. Press UP to jump. Press SPACE to do a side kick.");
        text1.setText('sliding: ' + this.player.sliding + ' slide time: ' + (time < this.player.ticksToSlideEnd) + ' kickdir: ' + this.player.kickDirection
            + '\ncanDropkick: ' + this.player.canDropKick + ' canSlide: ' + this.player.canSlide + ' canJump: ' + this.player.canJump + ' dropkicking: ' + this.player.dropKicking 
            + ' reboundRan: ' + this.player.reboundRan + ' kickOK: ' + this.player.kickOK + ' sideKicking: ' + this.player.sideKicking
            + '\n last tile: ' + this.player.tile.x
            + '\n kick: ' + this.player.sideKickBox.z + ' ' + this.player.dropKickBox.z
            + '\n list: ' + this.textures.getTextureKeys()
            + '\n tangent: ' + this.player.flipLastTan.x + ', ' + this.player.flipLastTan.y
            + '\n drag: ' + this.player.body.drag.x 
            + '\n angle: ' + this.player.flipAngle
            + '\n ticks: ' + this.player.ticks + ' time: ' + time
            + '\n maxY: ' + this.player.maxY
            + '\n isJumping: ' + this.player.isJumping + this.player.cursors.jump.isDown
            + '\n spikes: ' + this.player.hurtRan
            + '\n YAcceleration: ' + this.player.body.acceleration.y
            + '\n Lasering: ' + this.player.lasering + ' CanLaser: ' + this.player.canLaser
            //+ 'Enemy x: ' + this.testEnemy.body.x
            + '\n HP: ' + this.player.HP
            //+ '\n Tile coords: ' + (this.testEnemy.nextTile != null ? this.testEnemy.nextTile.x : null) 
            //+ ' ' + (this.testEnemy.nextTile != null ? this.testEnemy.nextTile.y : null) + ' ' + this.testEnemy.x
            + '\nArrow keys to move left and right. '
            + 'Press Z to jump. '
            + 'Press X to do an attack. '
            + 'Press ENTER to pause or resume.'
            + 'Press Q to reload map.');

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