/**
Course 2. All course files will be copied from testCourse.js.

For Galaxy Jump project.

This whole code is a modified version of the part7.html example at http://phaser.io/tutorials/making-your-first-phaser-3-game/part7.
If you want to see what everything else is, I would recommend looking at the other parts in the tutorial.

This is made using the Phaser 3 game engine from https://github.com/photonstorm/phaser
@author Tony Imbesi
@version 4/22/2022

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
import Enemy from "../../Objects/Enemy";
import Walker from "../../Objects/Walker";
import Walker2 from "../../Objects/Walker2";
import LaserCannon from "../../Objects/LaserCannon";
import Bat from "../../Objects/Bat";
import Jumpster from "../../Objects/Jumpster";
import CometSpawner from "../../Objects/CometSpawner";
import SpeedItem from '../../Objects/SpeedItem';
import DoubleJumpItem from '../../Objects/DoubleJumpItem';
import LaserItem from '../../Objects/LaserItem';
import Coin from '../../Objects/Coin';
import PauseScreen from '../PauseScreen';
import Goal from '../../Objects/Goal';
import Checkpoint from '../../Objects/Checkpoint';



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

export default class Course3 extends Phaser.Scene {
    constructor () {
        super('Course3');
    }

    preload ()
    {
        // this.load.setBaseURL('https://labs.phaser.io');
        // this.load.image('sky', 'assets/skies/sky1.png');
        // this.load.image('ground', 'assets/sprites/platform.png');
        //this.load.image('star', 'assets/images/star.png');
        // this.load.image('bomb', 'assets/bomb.png');
        
        // this.load.image('sky', 'assets/bg/sky.png');
        // this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        // this.load.spritesheet('dude', 'dude2_hat.png', { frameWidth: 32, frameHeight: 48 });

        // To make a tile this.map, load the image, then load the .json file created in Tiled
        // this.load.image('tiles', 'assets/tilesets/ground_1x1.png');
        
        this.load.tilemapTiledJSON('map3', 'assets/courses/course3.json');
    }

    
    
    create ()
    {
        this.nextLevel = 'Credits';
        this.clearId = 3; // Number used to track saved progress. Each course is numbered from 1 to 3.
        this.sound.pauseOnBlur = false;
        this.bgMusic = this.sound.get('psychoZone');
        this.seek = 0;
        if (this.bgMusic != null) {
            this.seek = this.bgMusic.seek;
        }
        this.sound.stopAll();
        this.sound.removeAll();
        this.model = this.sys.game.globals.model;

        // Handle music: Replace current bgMusic with this level's music
        // this.bgMusic = this.sys.game.globals.bgMusic;
       
        // if (this.model.bgMusicPlaying)
        //     this.bgMusic.stop();
        
        // if (this.bgMusic.key == 'japeFoot') {
        //     console.log("Key matching");
        // }
        // else {
        //     console.log("Key not matching: " + this.bgMusic.key);
        // }
        this.bgMusic = this.sound.add('psychoZone', { volume: 0.3, loop: true });
        if (this.model.musicOn === true) {
            this.bgMusic.play();
            this.bgMusic.setSeek(this.seek);
            this.model.bgMusicPlaying = true;
            // this.levelThemePlaying = true;
        }
        
        this.sys.game.globals.bgMusic = this.bgMusic;
        // console.log("Global: " + this.sys.game.globals.bgMusic.key);
        // console.log("Local: " + this.bgMusic.key);

        // General world settings
        this.physics.world.gravity.set(0, 700);
        this.physics.world.setBoundsCollision(true, true, false, false);
        /** Make sure the width and height matches the dimensions of the tileset! */
        this.WORLD_WIDTH = 400 * 32;
        this.WORLD_HEIGHT = 70 * 32;

        this.bg = this.add.image(0, 0, 'bg3')
        this.bg.setOrigin(0, 0);
        this.bg.setScrollFactor(0);

        this.solids;
        // loadTiles(this);
        // loadEntities(this);
        this.map = this.make.tilemap({
            key: 'map3',
        });
        

        // Semisolid platforms can only be touched from above. Player can pass through them otherwise.
        // this.semiTiles = this.map.addTilesetImage('platformPack_tilesheet', 'semisolid');
        // this.semisolids = this.map.createLayer('semisolid', this.semiTiles, 0, 0);

        // First argument of addTilesetImage is the name of the tileset as shown in Tiled.
        // Second argument is the key of the image used in the tileset.
        /** Add in spikes */
        this.dangerTiles = this.map.addTilesetImage('objects', 'objects3');
        this.spikes = this.map.createLayer('spikes', this.dangerTiles, 0, 0);
        this.spikes.setCollisionByProperty({ spikes: true }, true);
        this.heat = this.map.createLayer('heat', this.dangerTiles, 0, 0);
        this.heat.setDepth(3);

        this.terrainTiles = this.map.addTilesetImage('fantasy-tiles_32x32', 'tiles3');
        this.solids = this.map.createLayer('terrain', this.terrainTiles, 0, 0);
        this.solids.setDepth(1);
        
        
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

        this.heatArray = []
        this.heat.forEachTile((tile) => {
            if (tile.properties.heat || tile.properties.superheat) {
                var imgString = 'heat1';
                if (tile.properties.superheat)
                    imgString = 'heat2';
                var img = this.add.tileSprite(tile.pixelX, tile.pixelY, 32, 32, imgString);
                img.setOrigin(0, 0);
                this.heatArray.push(img);
            }
        });
        this.heatIter = 0;
        
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
        this.enemies.setDepth(2);

        // Make the items
        this.items = this.physics.add.group({
            collideWorldBounds: false,
            allowGravity: false
        });
        // Remove default config information
        this.items.defaults = {};
        // console.log("Made items group");
        this.itemArray = this.map.createFromObjects('items', [
            { 
                // Find the gid by checking the firstgid value in the tileset as shown in the course's .json file
                // then counting from the top-left to the bottom-right.
                // The firstgid of 'objects' in course1.json is 65
                gid: 90,
                classType: Coin
            },
            {
                gid: 91,
                classType: LaserItem
            },
            {
                gid: 92,
                classType: DoubleJumpItem
            },
            {
                gid: 93,
                classType: SpeedItem
            }
        ]); 
        this.testItem = this.itemArray[0];
        this.items.addMultiple(this.itemArray);
        // Do this to start the scene with each item's texture loaded properly.
        this.coinCount = 0;
        this.items.children.iterate(c => {
            c.setTexture(c.textureKey);
            // Also count the number of coins in the course
            if (c instanceof Coin) {
                this.coinCount++;
            }
        });
        this.items.setDepth(0);

        // Make the checkpoints
        this.checkpoints = this.physics.add.group({
            collideWorldBounds: false,
            allowGravity: false
        });
        // Remove default config information
        this.checkpoints.defaults = {};
        this.checkpointArray = this.map.createFromObjects('checkpoints', [
            { 
                // Find the gid by checking the firstgid value in the tileset as shown in the course's .json file
                // then counting from the top-left to the bottom-right.
                // The firstgid of 'objects' in course1.json is 65
                gid: 79,
                classType: Checkpoint
            }
        ]); 
        this.testCheckpoint = this.checkpointArray[0];
        this.checkpoints.addMultiple(this.checkpointArray);
        // Do this to start the scene with each checkpoint's texture loaded properly.
        this.checkpoints.children.iterate(c => {
            // Remove the checkpoint that was set in the player's previous life
            if (this.model.spawnX == c.x && this.model.spawnY + 12 == c.y) {
                c.setActive(false);
                c.setVisible(false);
                c.triggered = true;
                // console.log("Checkpoint removed");
            }
            else {
                // console.log("Checkpoint: " + c.x);
                // console.log("SpawnX: " + this.model.spawnX);
                c.setTexture("checkpoint");
            }
        });
        this.checkpoints.setDepth(1);

        // this.enemies.children.iterate(function (child) {
        //     child.body.setAllowGravity(true);
        //     child.body.setCollideWorldBounds(false);
        // });        

        /** Set the player's spawn point */
        var spawnX = 0;
        var spawnY = 0;
        if (this.model.checkpointSet === true) {
            spawnX = this.model.spawnX;
            spawnY = this.model.spawnY;
        }
        else {
            // The object layer can be accessed as an array of objects. objects[0] is the first object in the 'spawnpoint' object layer.
            spawnX = this.map.getObjectLayer('spawnpoint').objects[0].x;
            spawnY = this.map.getObjectLayer('spawnpoint').objects[0].y;
        }
        
        // This thing is similar to an input listener.
        // controls = this.input.keyboard.createCursorKeys();
        

        // Place the UFO
        this.goalGroup = this.physics.add.group({
            collideWorldBounds: false,
            allowGravity: false
        });

        var goalX = this.map.getObjectLayer('goal').objects[0].x;
        var goalY = this.map.getObjectLayer('goal').objects[0].y;

        this.goal = new Goal(this, goalX, goalY);
        this.goalGroup.add(this.goal);

        // Add the player controller
        this.controls = this.sys.game.globals.controls;
        this.controls.addControls(this);
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;

        // This line instantly sets up the player.
        this.player = new Player({scene:this, x:spawnX, y:spawnY}, this.solids, this.enemies, this.controls, this.coinCount);
        
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

        propertiesText = this.add.text(16, 600, '', {
            fontSize: '18px',
            fill: '#ffffff'
        });
        propertiesText.setScrollFactor(0);
        propertiesText.setDepth(10);
        
        // Go to next scene!
        // this.input.keyboard.on('keydown-Q', () => {
        //     this.scene.start('testCourse');
        // });

        // this.input.keyboard.on('keydown-ENTER', () => {
        //     if (!this.physics.world.isPaused)
        //         this.physics.world.pause();
                
        //     else 
        //         this.physics.world.resume();
        // });

        // this.input.keyboard.on('keydown-F', () => {
        //     if (this.physics.world.isPaused) {
        //         this.physics.world.resume();
        //         this.frame = true;  // Update world one "frame" at a time by pressing F while paused
        //     }
        // });
        this.tickCount = 0;

        
        // this.player.setCollideWorldBounds(true);

        

        this.sfxPause = this.sound.add('pauseEnter', { volume: 0.5, loop: false });
        this.sfxUnpause = this.sound.add('pauseExit', { volume: 0.5, loop: false });

        // Create an event handler to pause the game automatically if you select a different
        // tab or app while the game is running
        // this.input.on('pointerdownoutside', this.pause, this);
    }



    // Tick() {
    //     tickCount++;
    // }

    
    
    update (time, delta)
    {
        // Handle pausing the game
        if (Phaser.Input.Keyboard.JustDown(this.controls.pause) && this.player.controllable) {
            if (!this.physics.world.isPaused) {
                this.pause();
            }
            else {
                this.unpause();
            }
        }
        
        // Update the game if it's unpaused
        if (!this.physics.world.isPaused) {
            this.player.update(time, delta);
            this.enemies.children.iterate(function(child) {
                child.update(time, delta);
            });
            var iter = this.heatIter;
            this.heatArray.forEach(function(img) {
                img.tilePositionY -= 0.4;
                img.tilePositionX += Math.cos(iter) * 0.5;
            });
            this.heatIter += 0.005;

            // Music player
            if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
                if (!this.bgMusic.isPaused) {
                    this.bgMusic.play();
                    console.log("music playing");
                }
                else {
                    this.bgMusic.resume();
                    console.log("music resuming");
                }
            
                this.model.bgMusicPlaying = true;
                // this.sys.game.globals.bgMusic = this.bgMusic;
            }
            else if (this.model.musicOn === false && this.model.bgMusicPlaying === true) {
                this.bgMusic.pause();
                console.log("music pausing");
                this.model.bgMusicPlaying = false;
            }
        }

        // Debug check for frame-by-frame updating
        // if (this.frame) {
        //     this.frame = false;
        //     this.physics.world.pause();
        // }

        // You can toggle the music at any time by pressing the M key
        if (Phaser.Input.Keyboard.JustDown(this.controls.mute)) {
            this.model.musicOn = !this.model.musicOn;
            this.model.soundOn = this.model.musicOn;
            console.log(this.model.musicOn);
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
        // if (this.controls.shift.isDown)
        // {
        //     this.player.setPosition(30, 30);
        //     //collision = false;
        //     // player.setVelocityY(-4000);
        // }

        
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        // var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
        // var pointerTileX = this.map.worldToTileX(worldPoint.x);
        // var pointerTileY = this.map.worldToTileY(worldPoint.y);
        // if (this.input.manager.activePointer.isDown)
        // {
        //     var tile = this.map.getTileAt(pointerTileX, pointerTileY);

        //     if (tile)
        //     {
        //         // Note: JSON.stringify will convert the object tile properties to a string
        //         propertiesText.setText('!Properties: ' + JSON.stringify(tile.properties) + 
        //         '\n faceLeft: ' + tile.faceLeft + ' faceRight: ' + tile.faceRight + ' faceBottom: ' + tile.faceBottom +
        //         '\n collideLeft: ' + tile.collideLeft + ' collideRight: ' + tile.collideRight + ' canCollide: ' + tile.canCollide + ' collideUp: ' + tile.collideUp + ' collideDown: ' + tile.collideDown +
        //         '\n x: ' + tile.x + ' y: ' + tile.y +
        //         '\n worldX: ' + tile.pixelX + ' worldY: ' + tile.pixelY);
        //         tile.properties.viewed = true;
        //     }
        // }
        // End code from https://labs.phaser.io/edit.html?src=src/tilemap/tile%20properties.js
        
        // Debug text:
        // text1.setText('XVel: ' + this.player.body.velocity.x + ' PVEL_MAX: ' + this.player.PVEL_MAX + ' Max YVel: ' + maxYVel + ' Max XVel: ' + maxXVel + ' YAcc: ' + player.body.acceleration.y);
        // text2.setText(' XAcc: ' + this.player.body.acceleration.x + " \nkickAgain: " + kickAgain + " sideKick: " + sideKick + " lastKick_V: " + lastKick_V
        //     + "\nstaticEdge: " + staticEdge + " kickEdge: " + kickEdge + " kickOK: " + kickOK + " reboundRan: " + reboundRan 
        //     + " \nenable: " + sideKickBox.body.enable  + ' collided: ' + collision + ' time: ' + time
        //     + "\nArrow keys to move left/right and jump. Press UP to jump. Press SPACE to do a side kick.");
        // text1.setText(''
        //     // + 'sliding: ' + this.player.sliding + ' slide time: ' + (time < this.player.ticksToSlideEnd) + ' kickdir: ' + this.player.kickDirection
        //     // + '\ncanDropkick: ' + this.player.canDropKick + ' canSlide: ' + this.player.canSlide + ' canJump: ' + this.player.canJump + ' dropkicking: ' + this.player.dropKicking 
        //     // + ' reboundRan: ' + this.player.reboundRan + ' kickOK: ' + this.player.kickOK + ' sideKicking: ' + this.player.sideKicking
        //     // + '\n last tile: ' + this.player.tile.x
        //     // + '\n kick: ' + this.player.sideKickBox.z + ' ' + this.player.dropKickBox.z
        //     // + '\n list: ' + this.textures.getTextureKeys()
        //     // + '\n tangent: ' + this.player.flipLastTan.x + ', ' + this.player.flipLastTan.y
        //     // + '\n drag: ' + this.player.body.drag.x 
        //     // + '\n angle: ' + this.player.flipAngle
        //     // + '\n ticks: ' + this.player.ticks + ' time: ' + time
        //     // + '\n maxY: ' + this.player.maxY
        //     // + '\n crouching: ' + this.player.crouching
        //     // + '\n animsResetFlag: ' + this.player.animsResetFlag
        //     // + '\n animsHoldFlag: ' + this.player.animsHoldFlag
        //     // + '\n YAcceleration: ' + this.player.body.acceleration.y
        //     // + '\n LaserPrep: ' + this.player.laserPrep + ' CanLaser: ' + this.player.canLaser
        //     // //+ 'Enemy x: ' + this.testEnemy.body.x
        //     // + "\n originX: " + this.player.originX
        //     // + "\n hitbox offsetX: " + this.player.body.offset.x
        //     // + "\n hitbox offsetY: " + this.player.body.offset.y
        //     // + "\n item X: " + this.testItem.x
        //     //+ '\n Tile coords: ' + (this.testEnemy.nextTile != null ? this.testEnemy.nextTile.x : null) 
        //     //+ ' ' + (this.testEnemy.nextTile != null ? this.testEnemy.nextTile.y : null) + ' ' + this.testEnemy.x
        //     + '\nArrow keys to move left and right. '
        //     + '\nPress Z to jump. '
        //     + '\nPress X to do an attack. '
        //     + '\nUP + X in the air = do a flip'
        //     + '\n Kick a wall to gain extra speed'
        //     + '\nDOWN + X on ground at high speed = drop kick'
        //     + '\n Hold DOWN in the air = charge and fire laser'
        //     + '\nPress ENTER to pause or resume.'
        //     + '\nPress Q to reload map.'
        //     + '\n Press M to mute/unmute');

        
        console.log("music events: " + this.sound.getAll('japeFoot').length + " sound events: " + this.sound.getAll("pauseEnter").length); 
    } // END update
    
    /**
     * Pauses the game by stopping all updates, animations, and sounds, and opening the pause menu.
     */
    pause() {
        this.model.gamePaused = true;
        // Disable particles
        this.player.emitter.pause();
        // Pause every animation and physics update
        this.physics.world.pause();
        this.player.anims.pause();
        this.enemies.children.iterate(function(child) {
            if (child instanceof Enemy) {
                child.anims.pause();
                if (child.warningSprite instanceof Phaser.GameObjects.Sprite) {
                    child.warningSprite.anims.pause();
                }
            }
                
        });
        this.items.children.iterate(function(child) {
            child.anims.pause();
        });
        this.goalGroup.children.iterate(function(child) {
            child.anims.pause();
        });
        this.sound.pauseAll();
        if (this.model.soundOn === true) {
            this.sfxPause.stop();
            this.sfxPause.play();
        }
        /**
         *  We have to launch the pause screen using the camera's center position 
         *  so that the buttons' clickable areas match the actual positions of the buttons themselves.
         *  Interactive Game Objects internally use a rectangle to detect the mouse, and this rectangle does not
         *  change its position if you set the button's scroll factor to 0.
         */ 
        this.pauseScreen = new PauseScreen(this, this.cameras.main.scrollX + (this.screenWidth / 2), this.cameras.main.scrollY + (this.screenHeight / 2));
        // Launch pause menu here!
    }

    /**
     * Unpauses the game by resuming all sound, animation, and game updates and closing the pause menu.
     */
    unpause() {
        if (this.model.soundOn === true) {
            this.sfxUnpause.stop();
            this.sfxUnpause.play();
        }
        this.player.emitter.resume();
        this.physics.world.resume();
        this.player.anims.resume();
        this.enemies.children.iterate(function(child) {
            if (child instanceof Enemy)
                child.anims.resume();
        });
        this.items.children.iterate(function(child) {
            child.anims.resume();
        });
        this.goalGroup.children.iterate(function(child) {
            child.anims.resume();
        });
        this.sound.resumeAll();
        if (this.model.musicOn === false) {
            this.bgMusic.pause();
        }
        if (this.pauseScreen instanceof PauseScreen) {
            this.pauseScreen.removeEverything();
        }
        // Close pause menu here!
    }

    collided() {
        collision = true;
    }
}