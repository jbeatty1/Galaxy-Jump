import 'phaser';
import {checkWallManual} from './Objects/Enemy';
import HealthBar from './HealthBar';
import Item from './Objects/Item';
import Goal from './Objects/Goal';
import Checkpoint from './Objects/Checkpoint';

/**
 * Class modeling the player character with all movement abilities.
 * This player can be added to any scene by creating a new Player object.
 * 
 *
 * @author Tony Imbesi
 * @version 4/8/2022
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * Sets up the player with all movement abilities.
     * The player will appear at the given x and y positions.
     * 
     * @param {Object} config the config object with the current scene, x, and y in that order
     * @param {Phaser.Tilemaps.TilemapLayer} solids the tile layer for solid terrain
     * @param {Phaser.Tilemaps.TilemapLayer} semisolids the tile layer for semisolid platforms
     * @param {PlayerController} input the keyboard input
     * @param {Number} coins the max number of coins in the level
     */
    constructor(config, solids, enemies, input, coins) {
        super(config.scene, config.x, config.y, "dude");
        this.scene = config.scene;
        this.solids = solids;
        this.map = this.solids.tilemap;
        this.enemies = enemies;
        this.items = this.scene.items;
        this.heat = this.scene.heat;
        this.goals = this.scene.goalGroup;
        this.checkpoints = this.scene.checkpoints;

        this.cam = this.scene.cameras.main;
        this.camBoundary = 32;
        this.model = this.scene.model;
        this.nextLevel = this.scene.nextLevel;

        this.cam.startFollow(this, false, 1, 1); // Setting 2nd parameter to 'true' will make the camera round its position value to integers
        this.cam.setDeadzone(70, 50);
        this.cam.setFollowOffset(0, 0);
        //this.semisolids = config.solids;

        
        // To load the texture properly, you have to add this subclass to both the 'normal' scene and the 'physics' scene.
        // I found this out by looking at this example code: https://labs.phaser.io/edit.html?src=src/physics/arcade/extending%20arcade%20sprite.js
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.textureKey = this.texture.key;

        /** Start of player variables */
    
        this.INTERVAL = 16; // Number of ticks in milliseconds to multiply other timer variables
        this.ticks = 0;
        

        // Player's appearance:
        this.P_WIDTH = 64; // Width of the sprite
        this.P_HEIGHT = 64; // Height of the sprite
        this.P_HITBOX_W = 24;
        this.P_HITBOX_H = 38;
        this.P_WFRAC = this.P_HITBOX_W / this.P_WIDTH; // Percentage of sprite body filled horizontally by hitbox
        this.P_HFRAC = this.P_HITBOX_H / this.P_HEIGHT; // Percentage of sprite body filled vertically by hitbox
        this.P_HCROUCH = 16; // Height while crouching
        this.P_X_OFFSET = 20;

        // Player's movement constants:
        this.P_XVEL_SOFTMAX = 340; // Soft limit to max horizontal speed. Can be broken by various methods.
        this.P_XVEL_HARDMAX = 900; // Hard limit to max horizontal speed
        this.P_YVEL_HARDMAX = 900; // Hard limit to max vertical speed

        this.P_SPEED = this.P_XVEL_SOFTMAX;
        // We can get the player's velocity at any time using player.body.velocity.x
        this.P_XACCEL = 1800; // Default horizontal acceleration
        this.P_JUMP = -400; // Jump velocity
        this.P_JUMP_ACCEL = -2750; // Jump acceleration. Vertical acceleration is unchanged by gravity but still affects vertical movement.
        this.P_JUMP_BRAKE = 800; // Cancel out jump acceleration at the end of a jump
        this.P_DRAG = 800; // Default drag
        this.P_DRAG_SPEEDUP = this.P_DRAG * 1.5; // Ground drag with speedup powerup
        this.P_DRAG_CURRENT = this.P_DRAG; // Current default grounded drag
        this.P_DRAG_FAST = this.P_DRAG / 2; // Drag when moving quickly
        this.P_DRAG_AIR = 80; // Air drag
        this.P_GRAV = 1000; // Player gravity. Total gravity = world gravity + player gravity
        this.P_BOUNCE = 0;
        this.P_DELAY = 150; // Delay in milliseconds before player can input another attack

        

        // Constants determining action attributes:
        
        // Side kick constants:
        this.K_KICK_VEL = 230; // Base velocity from kicking an object
        this.K_KICK_V_STANDING = 300; // Minimum rebound velocity
        this.K_SIDEKICK_Y = -100; // Height gained from side-kicking
        this.K_SIDEKICK_W = 40;  // Width of hitbox
        this.K_SIDEKICK_H = 34;  // Height of hitbox
        this.kickXOffset = 30;  // X offset for side kick
        this.kickYOffset = 0;  // Y offset for side kick

        // Slide constants:
        this.S_SLIDE_DEFAULTX = 475;
        this.S_SLIDE_SPEEDX = 575;
        this.S_SLIDE_XVEL = this.S_SLIDE_DEFAULTX; // Horizontal velocity from sliding
        this.S_SLIDE_YVEL = -100; // Vertical velocity from sliding
        this.S_SLIDE_W = 30;    // Width and height of hitbox
        this.S_SLIDE_H = 16;
        this.S_slideXOffset = 30; // X and Y offsets for slide
        this.S_slideYOffset = 5;

        // Dropkick constants:
        this.D_MINSPEED = this.P_XVEL_SOFTMAX * 1.2;    // Minimum speed required to perform a dropkick
        this.D_DROPKICK_XVEL = 100; // Horizontal velocity from dropkick
        this.D_DROPKICK_YVEL = -400; // Vertical velocity
        this.D_DROPKICK_W = 40;
        this.D_DROPKICK_H = 40;
        this.D_DROPKICK_Y = -400; // Vertical boost after rebound
        this.D_SLOWDOWN = 2.0;  // Slowdown after hitting something with a dropkick
        this.D_dropXOffset = 30;
        this.D_dropYOffset = 0;

        // Flip constants:
        this.F_FLIP_VEL = 500;
        this.F_FLIP_W = 30;
        this.F_FLIP_H = 30;
        this.F_FLIP_ATTACK_W = 50; // Two hitboxes layered on top of each other. One handles terrain collision, the other handles enemies
        this.F_FLIP_ATTACK_H = 45;
        this.F_FLIP_RADIUS = 36; // Radius of arc representing the flip's trajectory
        this.F_FLIP_FRONT = 170; // Start and end angles of arc
        this.F_FLIP_BACK = 340;
        this.F_FLIP_SPEED = 0.04;  // Speed of hitbox traveling along the flip path

        // Laser constants:
        this.L_LASER_WINDUP = 10 * this.INTERVAL; // Ticks before laser move happens
        this.L_LASER_MAX = 50 * this.INTERVAL; // Max number of ticks you can sustain the laser for
        
        this.L_LASERACCEL = -2300;   // Vertical boost from lasering
        this.L_YVEL_MAX = -500;
        this.L_LASERACCEL_UP = -500; // Laser acceleration when going upwards very fast
        this.L_LASERACCEL_DOWN = -4000; // Laser acceleration when moving down
        this.L_WIDTH = 20;
        this.L_HEIGHT = 32;
        this.L_INCREMENT = 4;
        this.ticksToLaser = 0;

        // Health variables:
        this.maxHP = 100; // Max health
        this.HP = this.maxHP;
        this.recoveryRate = 0.07;
        this.heatDmgRate = -0.3;
        this.heatTaken = false;
        this.iFrames = 90 * this.INTERVAL;
        this.ticksToDamageEnd = 0;
        this.recoilVelocity = 300;
        this.invincible = false;
        this.alive = true;
        this.controllable = true;

        // Animation variables:
        this.animsResetFlag = false;
        this.animsHoldFlag = false;
        this.hurtAnimEnd = 0;
        this.hurtAnimTicks = 20 * this.INTERVAL;

        this.xDirection = {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            NONE: 4
        };

        this.pHitboxes = null;
        this.sideKickBox = null;
        this.dropKickBox = null;
        this.kickOK = false;

        this.tickCount = 0;
        this.ticksToJumpEnd = 0;
        this.maxJumpTicks = 12 * this.INTERVAL; // This variable is best for changing jump height.
        this.isJumping = false;
        this.canJump = false;
        this.inAir = false;

        this.crouching = false;
        this.P_SLIDE_OFFSET = this.P_X_OFFSET;
        this.P_DROP_OFFSET = this.P_X_OFFSET;

        this.canAttack = true;
        this.attackDelay = 20 * this.INTERVAL; // Time in milliseconds before player can attack again
        this.atkDelayEnd = 0;
        this.reboundLanded = false;

        this.maxKickTicks = 12 * this.INTERVAL;
        this.ticksToKickEnd = 0;
        this.sideKicking = false;
        this.canKick = true;
        this.staticEdge = 0;
        this.kickEdge = 0;

        this.maxDropTicks = 30 * this.INTERVAL;
        this.ticksToDropKickEnd = 0;
        this.canDropKick = false;
        this.dropKickRan = false; // Used to make sure you can't dropkick twice in one jump under normal circumstances
        this.dropKickOverride = false; // If you dropkick into a wall and jump, this flag will set, allowing you to dropkick again without enough speed
        this.dropKicking = false;
        this.dropKickBounce = false; // Flag that's set if you dropkick into a wall
        this.dropKickDelay = 0; // Next two variables are used to delay the 'on ground' check for the drop kick
        this.dropKickDelayTicks = 5 * this.INTERVAL;
        this.maxSlowTicks = 20 * this.INTERVAL;
        this.ticksToSlowEnd = 0;
        this.slowTime = false; // Flag that's set for the duration of the slowed time effect

        this.maxFlipTicks = 30 * this.INTERVAL;
        this.ticksToFlipEnd = 0;
        this.canFlip = false;
        this.flipping = false;
        this.flipReboundVec = new Phaser.Math.Vector2(0, 0);
        this.flipAngle = 0;
        this.flipLastTan = new Phaser.Math.Vector2(0, 0);

        this.maxSlideTicks = 30 * this.INTERVAL;
        this.ticksToSlideEnd = 0;
        this.canSlide = true;
        this.sliding = true;

        this.laser = null; // Reference to the laser hitbox
        this.laserPrep = false;
        this.lasering = false;
        this.canLaser = false;

        this.canDoubleJump = false;
        this.doubleJumpReady = false; // Used to see if you should be able to double jump after a normal jump or falling off an edge

        this.P_SPEEDUP = this.D_MINSPEED * 1.3;
        
        this.xFacing = 0;
        this.kickDirection = 0;

        // Items found:
        this.coinsFound = 0;
        this.foundLaser = false;
        this.foundDoubleJump = false;
        this.foundSpeedUp = false;

        // Healthbar variables:
        this.healthBar = new HealthBar(this.scene, this.maxHP);

        // Item UI variables:
        // Make a new UI class to display the coin count and powerups taken
        this.maxCoins = coins;
        this.itemsDisplay = this.scene.add.text(50, 50, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.coinUI = this.scene.add.sprite(30, 58, 'coin', 0);
        this.coinUI.setScrollFactor(0);
        this.coinUI.setDepth(10);
        this.itemsDisplay.setScrollFactor(0);
        this.itemsDisplay.setDepth(10);
        this.laserUI = this.scene.add.sprite(160, 30, 'laserItem', 0);
        this.doubleJumpUI = this.scene.add.sprite(200, 32, 'doublejump', 0);
        this.speedUI = this.scene.add.sprite(238, 30, 'speedup', 0);
        this.laserUI.setScrollFactor(0);
        this.laserUI.setDepth(10);
        this.laserUI.setVisible(false);
        this.doubleJumpUI.setScrollFactor(0);
        this.doubleJumpUI.setDepth(10);
        this.doubleJumpUI.setVisible(false);
        this.speedUI.setScrollFactor(0);
        this.speedUI.setDepth(10);
        this.speedUI.setVisible(false);

        

        /** End of player variables */

        // Set controls for player
        this.cursors = input;

        // Player Physics
        this.setBounce(this.P_BOUNCE, 0); // 1st parameter is x-bounce, 2nd is y-bounce
        this.body.setGravityY(this.P_GRAV);
        // this.body.setFrictionX(3); // I couldn't get this to work, but I'm using drag to slow the player down anyway.
        this.body.setDragX(this.P_DRAG);
        this.body.setMaxVelocityY(this.P_YVEL_HARDMAX);

        this.body.setSize(this.P_HITBOX_W, this.P_HITBOX_H, true); // false means it won't reposition to player's center
        this.body.setOffset(this.P_X_OFFSET, this.P_HEIGHT * (1 - this.P_HFRAC));
        this.setDepth(2);

        this.setCollideWorldBounds(true); 
        
        
        // Player animations. The keys can be remade using an enumeration.
        // Move animation for premade "dude" asset
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'fast',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 0 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });
        // this.anims.create({
        //     key: 'left',
        //     frames: [ { key: 'dude', frame: 0 } ],
        //     frameRate: 20
        // });
        // this.anims.create({
        //     key: 'right',
        //     frames: [ { key: 'dude', frame: 2 } ],
        //     frameRate: 20
        // });

        this.anims.create({
            key: 'sidekick',
            frames: [ { key: 'dude', frame: 9 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'hurt',
            frames: [ { key: 'dude', frame: 14 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'slide',
            frames: [ { key: 'dude', frame: 18 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'dropkick',
            frames: [ { key: 'dude', frame: 27 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'post-dropkick',
            frames: [ { key: 'dude', frame: 28 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'crouch',
            frames: [ { key: 'dude', frame: 36 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'crouchprep',
            frames: this.anims.generateFrameNumbers('dude', { start: 37, end: 38 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [ { key: 'dude', frame: 45 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'fall',
            frames: [ { key: 'dude', frame: 46 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'charge',
            frames: [ { key: 'dude', frame: 47 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'lasering',
            frames: this.anims.generateFrameNumbers('dude', { start: 47, end: 48 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'flip1',
            frames: [ { key: 'dude', frame: 54 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'flip2',
            frames: [ { key: 'dude', frame: 55 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'flip3',
            frames: [ { key: 'dude', frame: 56 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'flip4',
            frames: [ { key: 'dude', frame: 57 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        this.anims.create({
            key: 'flip5',
            frames: [ { key: 'dude', frame: 58 } ],  // Change frame number if using a different player sprite
            frameRate: 20
        });

        // Create the sound effects associated with the player
        this.sfxKick = this.scene.sound.add('playerKick', { volume: 0.55, loop: false });
        this.sfxFlip = this.scene.sound.add('playerFlip', { volume: 0.55, loop: false });
        this.sfxJump = this.scene.sound.add('jump', { volume: 0.35, loop: false });
        this.sfxJump2 = this.scene.sound.add('jump2', { volume: 0.35, loop: false });
        this.sfxRebound = this.scene.sound.add('rebound', { volume: 0.55, loop: false });
        this.sfxDropKickCharge = this.scene.sound.add('dropKickCharge', { volume: 0.55, loop: false });
        this.sfxDropKick = this.scene.sound.add('dropKick', { volume: 0.55, loop: false });
        this.sfxDropKickRebound = this.scene.sound.add('dropKickRebound', { volume: 0.55, loop: false });
        this.sfxLaser = this.scene.sound.add('playerLaser', { volume: 0.55, loop: true });
        this.sfxHurt = this.scene.sound.add('hurt', { volume: 0.1, loop: false });
        this.sfxItem = this.scene.sound.add('powerupFound', { volume: 0.65, loop: false });
        this.sfxLaserItem = this.scene.sound.add('laserFound', { volume: 0.65, loop: false });
        this.sfxJumpItem = this.scene.sound.add('doublejumpFound', { volume: 0.65, loop: false });
        this.sfxSpeedItem = this.scene.sound.add('speedupFound', { volume: 0.65, loop: false });

        this.sfxDie = this.scene.sound.add('lose', { volume: 0.55, loop: false });
        this.sfxWin = this.scene.sound.add('win', { volume: 0.55, loop: false });
        this.sfxCheckpoint = this.scene.sound.add('checkpoint', { volume: 0.55, loop: false });

        // For some reason, the sprite renders the pixels at the bottom of the row above it.
        // This crops 1 pixel from the top of the sprite to stop this.
        this.setCrop(0, 1, this.P_WIDTH, this.P_HEIGHT - 1);
        // Make the hitbox group.
        // HOW TO WORK WITH PHYSICS SHAPES IN A GROUP:
        // 1) Make the group with scene.physics.add.group
        // 2) Make the rectangle with scene.add.rectangle()
        // 3) Add the rectangle to the group with group.add(r1)
        // The resulting rectangle should be a physics-based member of a group
        // with a physics body, so you can operate on it like any other physics body.
        this.pHitboxes = this.scene.physics.add.group({
            allowGravity: false
        });

        // Make another group to hold the laser sprites
        this.sprites = this.scene.add.group();
        this.sideKickBox = this.scene.add.rectangle(0, 0, this.K_SIDEKICK_W, this.K_SIDEKICK_H);
        this.slideBox = this.scene.add.rectangle(0, 0, this.S_SLIDE_W, this.S_SLIDE_H);
        this.dropKickBox = this.scene.add.rectangle(0,0, this.D_DROPKICK_W, this.D_DROPKICK_H);
        this.flipBox = this.scene.add.rectangle(0, 0, this.F_FLIP_W, this.F_FLIP_H);
        this.flipAttackBox = this.scene.add.rectangle(0, 0, this.F_FLIP_ATTACK_W, this.F_FLIP_ATTACK_H);
        
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/paths/circle%20path.js
        // this.flipPath = new Phaser.Curves.Path();
        this.flipPath = new Phaser.Curves.Ellipse(-10, -10, this.F_FLIP_RADIUS, this.F_FLIP_RADIUS, this.F_FLIP_FRONT, this.F_FLIP_BACK);
        // this.flipPath.setRotation(180);
        this.scene.add.existing(this.flipPath);
        // End modified code from https://labs.phaser.io/edit.html?src=src/paths/circle%20path.js
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/physics/arcade/body%20on%20a%20path.js
        this.pathVector = new Phaser.Math.Vector2();
        // 1st argument is a percentage representing distance from start of the path; 0 is the start, 1 is the end
        // 2nd argument is the Vector2 to store the x and y position at that point in the path
        this.flipPath.getPoint(0, this.pathVector);
        this.pathIndex = 0;
        // End modified code from https://labs.phaser.io/edit.html?src=src/physics/arcade/body%20on%20a%20path.js

        

        this.pHitboxes.add(this.sideKickBox);
        this.pHitboxes.add(this.slideBox);
        this.pHitboxes.add(this.dropKickBox);
        this.pHitboxes.add(this.flipBox);
        this.pHitboxes.add(this.flipAttackBox);

        this.sideKickBox.setActive(false);
        this.slideBox.setActive(false);
        this.dropKickBox.setActive(false);
        this.flipBox.setActive(false);
        this.flipAttackBox.setActive(false);

        // The hitbox's position changes, but it does not actually have velocity.
        // This means it will not actually "collide" with anything, but it can still overlap with things.
        // To check if the hitbox touches a solid tile, we need the canCollide instance variable.
        // This overlap can pass individual tiles into the rebound method, so we can check if any
        // overlapped tiles have their canCollide value set to true.
        this.solidCollider = this.scene.physics.add.collider(this, solids);
        //this.semiCollider = this.scene.physics.add.collider(this, semisolids);

        // These will similarly check the player against every tile in the 'spikes' layer and every enemy's physics body.
        this.spikeCollider = this.scene.physics.add.collider(this, this.scene.spikes, this.spikeContact, null, this);
        this.enemyCollider = this.scene.physics.add.overlap(this, this.enemies, this.enemyContact, null, this);

        // Heat collider
        this.heatCollider = this.scene.physics.add.overlap(this, this.heat, this.heatDmg, null, this);

        // Items collider
        this.itemsCollider = this.scene.physics.add.overlap(this, this.items, this.collectItem, null, this);

        // Colliders for each move. These are actually overlaps set to only detect overlap with solid terrain.
        // Extra note: Order matters. Each collision will be checked in order of addition, 
        // and the results of earlier colliders may affect the results of later colliders.
        // attackCollider comes first because later colliders disable attack hitboxes
        this.attackCollider = this.scene.physics.add.overlap(this.pHitboxes, this.enemies, this.attack, null, this);

        this.kickCollider = this.scene.physics.add.overlap(this.sideKickBox, solids, null, this.kickRebound, this);
        this.dropKickCollider = this.scene.physics.add.overlap(this.dropKickBox, solids, null, this.dropKickRebound, this);
        this.flipCollider = this.scene.physics.add.overlap(this.flipBox, solids, null, this.flipRebound, this);

        this.softCollider = this.scene.physics.add.overlap(this.pHitboxes, this.solids, this.breakSoft, null, this);
        this.hardCollider = this.scene.physics.add.overlap(this.dropKickBox, this.solids, this.breakHard, null, this);

        // Goal collider
        this.goalCollider = this.scene.physics.add.overlap(this, this.goals, this.hitGoal, null, this);

        // Checkpoint collider
        this.checkpointCollider = this.scene.physics.add.overlap(this, this.checkpoints, this.hitCheckpoint, null, this);

        // Begin modified code from https://labs.phaser.io/edit.html?src=src/game%20objects/particle%20emitter/create%20emitter.js
        // Particle emitter
        //  First create a particle manager
        //  A single manager can be responsible for multiple emitters
        //  The manager also controls which particle texture is used by _all_ emitter
        this.particles = this.scene.add.particles('dKickParticle');

        this.emitter = this.particles.createEmitter();
        // setSpeed changes how fast the particles travel
        this.emitter.setSpeed(30);
        // setFrequency has the emitter generate 3 particles every 300 milliseconds
        this.emitter.setFrequency(800, 2);
        // Stop the emitter
        this.emitter.stop();
        // End modified code from https://labs.phaser.io/edit.html?src=src/game%20objects/particle%20emitter/create%20emitter.js


        this.alignRan = 0;
        this.reboundRan = 0;
        this.hurtRan = 0;
        this.tile = solids.getTileAt(0,0, true);
        this.maxY = 0;
    }

    update(time, delta) {

        /** Timer */
        // Only update if not paused
        this.ticks += delta;

        /** Actions */
        if (this.controllable) {
            /** Left and right movement, only when not crouching */
            /** @Move */
            if (this.cursors.left.isDown && ((!this.crouching && !this.sliding) || !this.body.onFloor()))
            {
                this.moveX(-this.P_XACCEL);
                
            }
            else if (this.cursors.right.isDown && ((!this.crouching && !this.sliding) || !this.body.onFloor()))
            {
                this.moveX(this.P_XACCEL);
                
            }
            // Else: no movement. Set acceleration to 0 and decrease speed with friction/drag.
            else
            {
                this.setAccelerationX(0);
                if (!this.animsHoldFlag && !this.laserPrep) {
                    this.anims.play('turn');
                }
            }

            /** Change direction on left/right press if not performing a move */
            if (!(this.isAttacking() || this.slowTime)) {
                if (this.cursors.left.isDown) {
                    this.xFacing = this.xDirection.LEFT;
                    this.setFlipX(true);
                    if (!this.animsHoldFlag && this.body.onFloor()) {
                        if (this.canDropKick) {
                            this.anims.play('fast', true);
                        }
                        else {
                            this.anims.play('move', true);
                        }
                    }
                }
                else if (this.cursors.right.isDown) {
                    this.xFacing = this.xDirection.RIGHT;
                    this.setFlipX(false);
                    if (!this.animsHoldFlag && this.body.onFloor()) {
                        if (this.canDropKick) {
                            this.anims.play('fast', true);
                        }
                        else {
                            this.anims.play('move', true);
                        }
                    }
                }
            }

            /** @Crouch */
            if ((this.cursors.down.isDown && this.body.onFloor()) || this.sliding)
            {
                this.crouching = true;
            }
            else {
                this.crouching = false;
            }

            /** @Jump */ 
            if (this.cursors.pressed(this.cursors.jump)
                && (this.canJump || this.doubleJumpReady) && !this.isJumping
                && !(this.crouching && this.checkCeiling())) // Ensure you can't jump while crouching in a 1-high space
            {
                // console.log("Jump ran");
                this.isJumping = true;
                // Handle the double jump
                if (this.doubleJumpReady) {
                    // Play the sound effect
                    if (this.model.soundOn === true && !this.body.onFloor()) {
                        this.sfxJump2.play();
                    }
                    this.doubleJumpReady = false;
                    this.canDoubleJump = false;
                }
                else if (this.canJump) {
                    // Jump was not performed as a double jump, so play the normal jump sound
                    if (this.model.soundOn === true) {
                        this.sfxJump.play();
                    }
                }
                this.canJump = false;
                this.canKick = true;
                this.canLaser = true;
                this.sliding = false;
                this.dropKickBounce = false;
                // this.canSlide = false;
                this.setVelocityY(this.P_JUMP);
                this.ticksToJumpEnd = this.ticks + this.maxJumpTicks;

            }
            // Jump height increases with duration of button press
            if (this.cursors.jump.isDown && this.isJumping && this.ticks < this.ticksToJumpEnd)
            {
                this.setAccelerationY(this.P_JUMP_ACCEL);
            }

            /** End jump after releasing button or holding the button long enough */
            if (!this.cursors.jump.isDown || !this.isJumping || this.ticks >= this.ticksToJumpEnd)
            {
                this.isJumping = false;
                if (this.canDoubleJump && !this.body.onFloor()) {
                    this.doubleJumpReady = true;
                    this.canDoubleJump = false;
                }
                if (this.body.velocity.y < 0) {
                    this.setAccelerationY(this.P_JUMP_BRAKE);
                    this.maxY = this.body.position.y;
                }
                else if (!this.lasering) {
                    // Player is still affected by gravity
                    this.setAccelerationY(0);
                }
            }

            /** Do a slide with attack on ground. You can still jump even if airborne after doing this move! */
            /** @Slide */
            if (this.cursors.pressed(this.cursors.attack) && this.canAttack
                && ((this.cursors.down.isDown && !this.body.onFloor() && !this.canDropKick) 
                    || (!(this.canDropKick && this.cursors.down.isDown) && this.body.onFloor()))
                && this.canSlide && !this.sliding && this.xFacing !== this.xDirection.NONE && !this.dropKicking
                && (this.cursors.left.isDown || this.cursors.right.isDown)) 
            {
                this.canAttack = false;
                this.sliding = true;
                this.sideKicking = false;
                this.canKick = false;
                this.canSlide = false;
                this.canDoubleJump = false;

                if (this.xFacing === this.xDirection.RIGHT)
                    this.body.setVelocityX(Math.max(this.body.velocity.x, this.S_SLIDE_XVEL));
                if (this.xFacing === this.xDirection.LEFT)
                    this.body.setVelocityX(Math.min(this.body.velocity.x, -this.S_SLIDE_XVEL));

                if (!this.body.onFloor())
                    this.body.setVelocityY(this.S_SLIDE_YVEL); // Slight vertical boost when performed in the air

                this.slideBox.setActive(true);
                this.ticksToSlideEnd = this.ticks + this.maxSlideTicks;
            }
            if (this.sliding && this.ticks < this.ticksToSlideEnd)
            {
                // console.log("Slide alignment");
                this.alignPlayerSlide();
                this.crouching = true;
                this.anims.play('slide');
                this.alignWithPlayer(this.slideBox, this.S_slideXOffset, this.S_slideYOffset);
                
                // if (this.body.onFloor())
                // {
                //     this.sliding = false;
                //     //this.canSlide = true;
                //     this.slideBox.setActive(false);
                //     // this.kickDirection = this.xDirection.NONE;
                // }
            }
            else {
                this.sliding = false;  
                this.slideBox.setActive(false);
            }
            

            /** Do a side kick with attack button in air */ 
            /** @Kick @SideKick */
            if (this.cursors.pressed(this.cursors.attack) && this.canAttack
                && this.cursors.down.isUp && this.cursors.up.isUp
                && !(this.body.onFloor()) && !this.sideKicking && this.canKick && !this.sliding)
            {
                this.canAttack = false;
                this.sideKicking = true;
                this.canKick = false;
                this.sliding = false;
                this.canSlide = false;

                // sideKickBox.enableBody(false, 0, 0, true, true);
                this.sideKickBox.setActive(true);
                this.ticksToKickEnd = this.ticks + this.maxKickTicks;
                this.atkDelayEnd = this.ticks + this.attackDelay;

                if (this.model.soundOn === true) {
                    this.sfxKick.play();
                }
            }
            if (this.sideKicking && this.ticks < this.ticksToKickEnd)
            {
                this.alignPlayerKick();
                this.anims.play('sidekick', true);
                this.alignWithPlayer(this.sideKickBox, this.kickXOffset, this.kickYOffset);
                if (this.body.onFloor()) {
                    this.sideKicking = false;
                    this.sideKickBox.setActive(false);
                }
            }
            else {
                this.sideKicking = false;
                this.sideKickBox.setActive(false);
                // this.kickDirection = this.xDirection.NONE;
            }
            // if (this.cursors.attack.isUp && !this.sideKicking) {
            //     this.canKick = true;
            // }

            /** Laser move: Down + hold attack in the air */
            /** @Laser */
            if (this.foundLaser && this.cursors.down.isDown
                && !this.laserPrep
                && !this.body.onFloor() && !this.sideKicking && !this.sliding && this.canLaser)
            {
                this.anims.play('charge', true);
                // console.log("Laser init working");
                this.laserPrep = true;
                this.ticksToLaser = this.ticks + this.L_LASER_WINDUP;
                // Attack duration timer starts at the same time as the windup, so add windup time
                this.ticksToLaserEnd = this.ticksToLaser + this.L_LASER_MAX;
            }

            if (this.laserPrep) {
                // If player is holding down, in air, and not doing anything else...
                if (this.cursors.down.isDown
                    && !this.body.onFloor() 
                    && (!this.sideKicking && !this.sliding && !this.dropKicking && !this.flipping)
                    && this.ticks < this.ticksToLaserEnd)
                {
                    // console.log("Laser prep working");
                    // And if down is held for long enough...
                    if (this.ticks >= this.ticksToLaser) {
                        this.anims.play('lasering', true);
                        // Fire the laser downwards
                        if (this.body.velocity.y > 0) {
                            this.setAccelerationY(this.L_LASERACCEL_DOWN);
                        }
                        else if (this.body.velocity.y > this.L_YVEL_MAX) {
                            this.setAccelerationY(this.L_LASERACCEL);
                        }
                        else {
                            this.setAccelerationY(this.L_LASERACCEL_UP);
                        }
                        
                        // console.log(this.body.acceleration.y);
                        this.laserSetup();
                        this.canJump = false;
                        this.lasering = true;
                        this.drawLaser();
                        // Play laser sound effect
                        if (this.model.soundOn === true && !this.sfxLaser.isPlaying) {
                            this.sfxLaser.play();
                        }
                    }
                }
                else {
                    this.sfxLaser.stop();
                    this.lasering = false;
                    this.clearSprites();
                    this.laserPrep = false;
                    // console.log("Laser ended");
                    this.canLaser = false;
                    if (this.laser != null) {
                        this.laser.destroy();
                    }
                }
            }

            /** Drop kick: Down + attack on the ground or air with some speed built up
             * If you hit a wall, you can jump out of the recoil and dropkick again!
             */
            /** @DropKick */
            if (this.cursors.down.isDown && this.cursors.pressed(this.cursors.attack)
                && (this.dropKickOverride || 
                (!this.sliding && this.xFacing !== this.xDirection.NONE
                && this.canDropKick && this.canAttack && !this.dropKicking && !this.dropKickRan)))
            {
                // Sound effect
                if (this.model.soundOn) {
                    this.sfxDropKick.play();
                }
                // Set state variables, velocity, and hitbox
                this.canAttack = false;
                this.dropKicking = true;
                this.canDropKick = false;
                this.dropKickRan = true;
                this.dropKickOverride = false;
                this.canJump = false;
                this.canKick = false;
                this.canSlide = false;
                this.crouching = false;
                this.pvx = Math.max(this.D_MINSPEED, Math.abs(this.body.velocity.x) + this.D_DROPKICK_XVEL);
                if (this.xFacing === this.xDirection.RIGHT)
                    this.body.setVelocityX(this.pvx);
                if (this.xFacing === this.xDirection.LEFT)
                    this.body.setVelocityX(-this.pvx);

                this.body.setVelocityY(this.D_DROPKICK_YVEL);

                this.dropKickBox.setActive(true);
                this.ticksToDropKickEnd = this.ticks + this.maxDropTicks;
                this.dropKickDelay = this.ticks + this.dropKickDelayTicks;
                // this.alignPlayerDropKick();
            }
            
            if (this.dropKicking && this.ticks < this.ticksToDropKickEnd)
            {
                this.alignPlayerDropKick();
                // this.crouching = false;
                this.canKick = false;
                this.anims.play('dropkick', true);
                
                this.alignWithPlayer(this.dropKickBox, this.D_dropXOffset, this.D_dropYOffset);
                
                if (this.body.onFloor() && this.ticks > this.dropKickDelay)
                {
                    this.dropKicking = false;
                    this.dropKickBox.setActive(false);

                }
            }
            if (this.ticks >= this.ticksToDropKickEnd) {
                this.dropKicking = false;
            }
            
            /** Do a flip by holding up while attempting a side kick */
            /** @Flip */
            if (this.cursors.up.isDown && this.cursors.pressed(this.cursors.attack) && this.cursors.down.isUp
                && !(this.body.onFloor()) && !this.sideKicking && this.canKick && !this.sliding
                && this.canAttack)
            {
                this.canAttack = false;
                this.flipping = true;
                this.canKick = false;
                this.sliding = false;
                this.canSlide = false;

                this.flipBox.setActive(true);
                this.flipAttackBox.setActive(true);
                this.atkDelayEnd = this.ticks + this.attackDelay;
                if (this.model.soundOn === true) {
                    this.sfxFlip.play();
                }
            }
            if (this.flipping)
            {
                this.alignWithPlayer(this.flipPath, 0, 0);
                this.flipRotation();
                if (this.body.onFloor()) {
                    this.flipping = false;
                    this.pathIndex = 0;
                    this.flipBox.setActive(false);
                    this.flipAttackBox.setActive(false);
                }
            }
            else {
                this.flipping = false;
                this.pathIndex = 0;
                this.flipBox.setActive(false);
                this.flipAttackBox.setActive(false);
                // this.kickDirection = this.xDirection.NONE;
            }
            if (this.cursors.attack.isUp && !this.flipping) {
                this.canFlip = true;
            }

            /** Passive attributes */
            // Regain health up to maximum
            this.recover(this.recoveryRate);

            if (this.HP <= 0) {
                this.die();
            }

            // CROUCH: Decrease height when crouching
            /** @crouch */
            if (this.crouching) {
                // console.log("Crouch size");
                this.body.setSize(Math.floor(this.P_WIDTH * this.P_WFRAC), this.P_HCROUCH, true);
                if (this.sliding) {
                    this.body.setOffset(this.P_SLIDE_OFFSET, this.P_HEIGHT - this.P_HCROUCH);
                }
                else {
                    // console.log("Crouch offset");
                    this.body.setOffset(this.P_X_OFFSET, this.P_HEIGHT - this.P_HCROUCH);
                    if (this.canDropKick) {
                        this.anims.play('crouchprep', true);
                        // console.log("Play crouch-prep");
                        // Play sound effect
                        if (this.model.soundOn === true && !this.sfxDropKickCharge.isPlaying) {
                            this.sfxDropKickCharge.play();
                        }
                    }
                    else {
                        this.anims.play('crouch', true);
                        this.sfxDropKickCharge.stop();
                        // console.log("Play crouch");
                    }
                }
            }
            // else if (!this.solids.getTileAtWorldXY(this.body.position.x, this.body.position.y + this.P_HEIGHT, true).collideDown) {
            else if (!this.isAttacking() || this.dropKicking) {  
                // Reset height when not crouching and not doing any attack other than dropkick
                this.body.setSize(Math.floor(this.P_WIDTH * this.P_WFRAC), Math.floor(this.P_HEIGHT * this.P_HFRAC), true); // false means it won't reposition to player's center
                if (this.dropKicking || this.slowTime) {
                    this.body.setOffset(this.P_DROP_OFFSET, this.P_HEIGHT * (1 - this.P_HFRAC));
                }
                else {
                    // console.log("Standing offset");
                    this.body.setOffset(this.P_X_OFFSET, this.P_HEIGHT * (1 - this.P_HFRAC));
                }
            }
            if (!this.crouching) {
                this.sfxDropKickCharge.stop();
            }

            // IDLE: Player is slowed down more on the ground
            /** @onFloor */
            if (this.body.onFloor()){
                if (this.canDropKick && !this.sliding && !this.foundSpeedUp) {
                    this.setDragX(this.P_DRAG_FAST);
                }
                else {
                    this.setDragX(this.P_DRAG);
                }
                this.canKick = true;
                this.canJump = true;
                this.canSlide = true;
                this.canLaser = true;
                this.isJumping = false;
                this.dropKickRan = false;
                this.dropKickBounce = false;
                this.dropKickOverride = false;
                if (this.foundDoubleJump) {
                    this.canDoubleJump = true;
                }
            }
            else {
                this.setDragX(this.P_DRAG_AIR);
                if (!this.sliding && !this.dropKickBounce) {
                    this.canJump = false;
                }
            }

            // Check to see if player is fast enough to perform dropkick
            if (Math.abs(this.body.velocity.x) >= this.D_MINSPEED && !this.dropKicking) {
                this.canDropKick = true;
            }
            else if (!this.dropKicking) {
                this.canDropKick = false;
            }

            /** Hitboxes with z = 1 will not register a rebound */
            if (this.sideKicking) {
                this.sideKickBox.setZ(0);
            }
            else {
                this.sideKickBox.setZ(1);
            }
            if (this.dropKicking) {
                this.dropKickBox.setZ(0);
            }
            else {
                this.dropKickBox.setZ(1);
            }
            // if (this.sliding) {
            //     this.slideBox.setZ(0);
            // }
            // else {
            //     this.slideBox.setZ(1);
            // }

            // Hard cap to horizontal speed
            if (this.body.velocity.x > this.P_XVEL_HARDMAX) {
                this.setVelocityX(this.P_XVEL_HARDMAX);
            }
            if (this.body.velocity.x < -this.P_XVEL_HARDMAX) {
                this.setVelocityX(-this.P_XVEL_HARDMAX);
            }

            /** Handle jump during slowdown */
            /** @slowTime */
            if (this.slowTime) {
                this.alignPlayerDropKick();
                this.anims.play('post-dropkick', true);
                if (this.cursors.jump.isDown && this.ticks <= this.ticksToSlowEnd) {
                    // Resume time and jump
                    this.scene.physics.world.timeScale = 1.0;
                    this.slowTime = false;
                    this.dropKickRan = false;
                    this.dropKickOverride = true;
                }
                else if (this.ticks > this.ticksToSlowEnd || this.body.onFloor()) {
                    // Resume time
                    this.scene.physics.world.timeScale = 1.0;
                    this.slowTime = false;
                    this.canJump = false;
                }
            }

            /** Handle attack delay */
            if (this.cursors.attack.isUp && (this.body.onFloor() || this.reboundLanded || this.ticks >= this.atkDelayEnd)) {
                this.canAttack = true;
                this.reboundLanded = false;
                this.animsHoldFlag = false;
            }

            /** Handle invincibility timer after taking damage */
            if (this.ticks >= this.ticksToDamageEnd) {
                this.invincible = false;
                this.setAlpha(1);
            }
            else {
                this.invincible = true;
                this.setAlpha(0.5);
            }

            /** Handle falling out of bounds */
            if (this.body.position.y > this.scene.WORLD_HEIGHT) {
                this.die();
            }

            /** Handle speed power-up */
            if (this.foundSpeedUp) {
                this.P_SPEED = this.P_SPEEDUP;
                this.S_SLIDE_XVEL = this.S_SLIDE_SPEEDX;
            }
            else {
                this.P_SPEED = this.P_XVEL_SOFTMAX;
                this.S_SLIDE_XVEL = this.S_SLIDE_DEFAULTX;
            }

            /** Reset sprite origin and animation */
            if (!(this.isAttacking() || this.slowTime)) {
                this.setOrigin(0.5, 0.5);
                if (!this.crouching) {
                    this.body.setOffset(this.P_X_OFFSET, this.P_HEIGHT * (1 - this.P_HFRAC));
                }
                if (this.animsResetFlag) {
                    this.animsResetFlag = false;
                    if (this.cursors.down.isUp && (!this.animsHoldFlag || (this.animsHoldFlag && this.ticks >= this.atkDelayEnd))) {
                        this.anims.play('turn', true);
                        // console.log("Animation reset");
                        this.animsHoldFlag = false;
                    }
                    else if (this.laserPrep) {
                        this.anims.play('charge', true);
                        // console.log("Laser charge");
                        this.animsHoldFlag = false;
                    }
                }
            }
            
            if (!this.body.onFloor() && !(this.animsHoldFlag || this.animsResetFlag) && !this.laserPrep) {
                if (this.body.velocity.y <= 0) {
                    // console.log("Jump animation + " + (this.laserPrep));
                    this.anims.play("jump", true);
                }
                else {
                    this.anims.play("fall", true);
                }
            }
            // this.body.setOffset(this.P_X_OFFSET, this.P_HEIGHT * (1 - this.P_HFRAC));

            if (this.ticks <= this.hurtAnimEnd) {
                this.anims.play('hurt', true);
            }

            /** Handle particle emitter to indicate when a dropkick is possible */
            if (this.dropKickOverride || this.canDropKick || this.dropKicking) {
                // console.log("Can drop kick");
                this.emitter.start();
                // this.emitter.resume();
                this.emitter.startFollow(this);
            }
            else {
                // this.emitter.killAll();
                this.emitter.stop();
            }

            // Update player-based GUI elements
            this.healthBar.setHP(this.HP);
            this.updateItemDisplay();
            // Ensure that the heatDmg method only runs once per update
            this.heatTaken = false;
        } // END if alive
        else {
            this.anims.play('hurt', true);
            this.setAlpha(1);
        }

        this.checkOffScreen(); // Handle going off screen
    } // END update

    /** Helper methods */

    /**
     * Check to see if the player is directly underneath a ceiling tile.
     * @returns true if the block immediately above the player is a solid ceiling tile, false otherwise
     */
    checkCeiling() {
        var found = false;
        // Check the tiles directly above the player for solid, impassable tiles
        this.map.getTilesWithinWorldXY(this.body.x, this.body.y - 20, this.body.width, 2, {}, this.cam, this.solids).forEach((tile) => {
            if (tile.properties.solid && !tile.properties.semisolid) {
                found = true;
                // console.log("Tile at " + tile.pixelX + ", " + tile.pixelY + "is solid");
            }
            else {
                // console.log("Tile at " + tile.pixelX + ", " + tile.pixelY + "is not solid");
            }
        });
        return found;
    }
    /**
     * Check to see if the player is doing an attack.
     * @return true if the player is side kicking, drop-kicking, sliding, flipping, or lasering.
     */
    isAttacking() {
        // console.log("isAttacking: " + this.sideKicking || this.sliding || this.dropKicking || this.flipping || this.lasering);
        return (this.sideKicking || this.sliding || this.dropKicking || this.flipping || this.lasering);
    }

    /**
     * Realigns the player sprite when performing a side kick.
     * 
     */
    alignPlayerKick() {
        this.animsResetFlag = true;
        // console.log("running alignPlayerKick");
        this.kickDirection = this.xDirection.NONE;
        if (this.xFacing == this.xDirection.RIGHT || this.kickDirection == this.xDirection.RIGHT) {
            this.setOrigin(0.25, 0.5);
            // console.log("Facing right");
            this.body.setOffset(0, this.P_HEIGHT * (1 - this.P_HFRAC));
        }
        else if (this.xFacing == this.xDirection.LEFT || this.kickDirection == this.xDirection.LEFT) {
            this.setOrigin(0.75, 0.5);
            // console.log("Facing left");
            this.body.setOffset(this.P_WIDTH - this.P_HITBOX_W, this.P_HEIGHT * (1 - this.P_HFRAC));
        }
    }

    /**
     * Realigns the player sprite when performing a slide.
     */
    alignPlayerSlide() {
        this.animsResetFlag = true;
        // console.log("running alignPlayerSlide");
        this.kickDirection = this.xDirection.NONE;
        if (this.xFacing == this.xDirection.RIGHT || this.kickDirection == this.xDirection.RIGHT) {
            this.setOrigin(0.25, 0.5);
            // console.log("Facing right");
            // See the if (this.crouching) clause to see how the hitbox's offset changes
            this.P_SLIDE_OFFSET = 0;
        }
        else if (this.xFacing == this.xDirection.LEFT || this.kickDirection == this.xDirection.LEFT) {
            this.setOrigin(0.75, 0.5);
            // console.log("Facing left");
            // See the if (this.crouching) clause to see how the hitbox's offset changes
            this.P_SLIDE_OFFSET = this.P_WIDTH - this.P_HITBOX_W;
        }
    }

    /**
     * Realigns the player sprite when performing a drop kick.
     */
     alignPlayerDropKick() {
        this.animsResetFlag = true;
        // console.log("running alignPlayerDropKick");
        if (this.slowTime) {
            // console.log("In slow time");
        }
        this.kickDirection = this.xDirection.NONE;
        if (this.xFacing == this.xDirection.RIGHT || this.kickDirection == this.xDirection.RIGHT) {
            this.setOrigin(0.25, 0.5);
            // console.log("Facing right");
            // See the if (this.crouching) clause to see how the hitbox's offset changes
            this.P_DROP_OFFSET = 0;
        }
        else if (this.xFacing == this.xDirection.LEFT || this.kickDirection == this.xDirection.LEFT) {
            this.setOrigin(0.75, 0.5);
            // console.log("Facing left");
            // See the if (this.crouching) clause to see how the hitbox's offset changes
            this.P_DROP_OFFSET = this.P_WIDTH - this.P_HITBOX_W;
        }
    }

    /**
    * Moves left or right by changing the player's acceleration.
    * 
    * @param ax the left or right acceleration. Negative = left, positive = right.
    *
    */
     moveX(ax)
     {
         // pvx = player.body.velocity.x;
         // When the player is moving beyond top speed AND trying to move in the same direction as pvx, do not accelerate any more.
         if ((-this.P_SPEED <= this.body.velocity.x && ax < 0) 
             || (this.body.velocity.x <= this.P_SPEED && ax > 0)) {
             this.setAccelerationX(ax);
             this.setDragX(this.P_DRAG);
         }
         else {
             this.setAccelerationX(0);
             this.setDragX(this.P_DRAG_FAST);
         }
     } // END move
 
     /**
     * Aligns a hitbox with the player.
     * 
     * @param obj the rectangle
     * @param xDiff the x offset: positive positions it in front of player
     * @param yDiff the y offset: negative is up
     */
     alignWithPlayer(obj, xDiff, yDiff) {
        // Lock in kick direction
        this.alignRan++;
        // if (this.kickDirection == this.xDirection.NONE) {
        //     this.kickDirection = this.xFacing;
        // }
        this.kickDirection = this.xFacing;

        if (this.kickDirection == this.xDirection.LEFT) {
            this.setFlipX(true);
            obj.x = this.body.center.x - xDiff;
            obj.y = this.body.center.y + yDiff;
        }
        //else if (this.kickDirection == this.xDirection.RIGHT) {

        else {
            this.setFlipX(false);
            obj.x = this.body.center.x + xDiff;
            obj.y = this.body.center.y + yDiff;
        }
    }

    /**
     * Aligns a laser sprite specifically with the player.
     * This is a stripped-down version of alignWithPlayer().
     * 
     * @param obj the sprite
     * @param yDiff the y offset: negative is up
     */
     alignSpriteWithPlayer(obj, yDiff) {
        this.alignRan++;
        
        obj.x = this.body.center.x;
        obj.y = this.body.center.y + yDiff;
    }

    /**
     * Rotates the flip hitbox around the flip path, and
     * calculates the angle of the flip rebound vector.
     * This updates the hitbox's position and angle as the player is updated.
     */
    flipRotation() {
        this.flipReady = false;
        this.animsResetFlag = true;
        this.animsHoldFlag = true;
        if (this.kickDirection == this.xDirection.RIGHT) {
            // Counter-clockwise motion
            this.flipPath.setStartAngle(-(this.F_FLIP_BACK - 180));
            this.flipPath.setEndAngle(-(this.F_FLIP_FRONT - 180));
            
            // Get the next point and tangent
            this.flipPath.getPoint(1 - this.pathIndex, this.pathVector);
            this.flipLastTan = this.flipPath.getTangent(1 - this.pathIndex, this.flipLastTan);
        }
        else if (this.kickDirection == this.xDirection.LEFT) {
            // Clockwise motion
            this.flipPath.setStartAngle(this.F_FLIP_FRONT);
            this.flipPath.setEndAngle(this.F_FLIP_BACK);

             // Get the next point and tangent
            this.flipPath.getPoint(this.pathIndex, this.pathVector);
            this.flipLastTan = this.flipPath.getTangent(this.pathIndex, this.flipLastTan);
        }

        // Calculate the angle in radians from the unit tangent vector acquired from .getTangent method
        this.flipAngle = Math.atan(this.flipLastTan.y / this.flipLastTan.x);
        
        this.flipBox.setPosition(this.pathVector.x, this.pathVector.y);
        this.flipAttackBox.setPosition(this.pathVector.x, this.pathVector.y);
        
        // Increment the path index until the hitbox reaches the end of the arc
        this.pathIndex = Math.min(this.pathIndex + this.F_FLIP_SPEED, 1);
        if (this.pathIndex <= 0.2) {
            this.anims.play('flip1', true);
        }
        else if (this.pathIndex <= 0.4) {
            this.anims.play('flip2', true);
        }
        else if (this.pathIndex <= 0.6) {
            this.anims.play('flip3', true);
        }
        else if (this.pathIndex <= 0.8) {
            this.anims.play('flip4', true);
        }
        else if (this.pathIndex <= 1) {
            this.anims.play('flip5', true);
        }
        if (this.pathIndex >= 1) {
            this.flipping = false;
            this.pathIndex = 0;
        }

        // Rotate flip vector

        // Set to default kick vector at angle of 0
        this.flipReboundVec.set(0, -this.F_FLIP_VEL);
        // Rotate by the angle modified by an offset
        
        //var angleOffset = 0;
        this.flipReboundVec.set(this.F_FLIP_VEL, 0);
        // Rotate by the angle
        this.flipReboundVec = this.flipReboundVec.rotate(this.flipAngle);
        // If kicking to the left, ensure you will always go to the left
        if (this.kickDirection === this.xDirection.RIGHT) {
            if (this.flipReboundVec.x < 0) {
                this.flipReboundVec.x *= -1;
            }
        }
        else if (this.kickDirection === this.xDirection.LEFT) {
            if (this.flipReboundVec.x > 0) {
                this.flipReboundVec.x *= -1;
            }
        }
        if (this.flipReboundVec.y < 0) {
            this.flipReboundVec.y *= -1;
        }
        //this.flipAngle += angleOffset;
        this.flipReady = true;
    }
 
    /**
     * Makes the player rebound off of an object.
     * 
     * @param hitbox the hitbox from a player action
     * @param tile the tile overlapped by the hitbox
     */
    // If a function is called in an overlap, you can pass a reference to the individual objects involved in the overlap.
    kickRebound(hitbox, tile)
    {
        
        // The top and bottom of the hitbox can be higher or lower than the player hitbox.
        // The rebound should only happen if it hits the corner or edge of a surface AND if that surface isn't semisolid.
        
        // if ((xFacing == xDirection.LEFT && pHitboxes.body.blocked.left)
        //     || (xFacing == xDirection.RIGHT && pHitboxes.body.blocked.right)) {
        //     kickOK = true;
        // }


        // Only certain moves will rebound the player
        if (this.sideKicking && !this.dropKicking && this.verifyRebound(hitbox, tile)) {
            this.tile = tile;
            let pvx = this.body.velocity.x;
            // Left side kick: Right rebound
            if (this.kickDirection == this.xDirection.LEFT) {
                // player.setPosition(player.body.position.x + kickXOffset, player.body.position.y);
                // Invert pvx if player is also moving left
                if (this.body.velocity.x < 0) {
                    pvx = -pvx;
                }
                this.setVelocityX(Math.max(this.K_KICK_V_STANDING, pvx + this.K_KICK_VEL));
                this.lastKick_V = pvx + this.K_KICK_VEL;
                this.xFacing = this.xDirection.RIGHT;
                this.setFlipX(false);
                // temporarily suppress left movement?
                // reboundRan++;
            }
            // Right side kick: Left rebound
            else if (this.kickDirection == this.xDirection.RIGHT) {
                // player.setPosition(player.body.position.x - kickXOffset, player.body.position.y);
                // Invert pvx if player is also moving right
                if (this.body.velocity.x > 0) {
                    pvx = -pvx;
                }
                this.setVelocityX(Math.min(-this.K_KICK_V_STANDING, pvx - this.K_KICK_VEL));
                this.lastKick_V = pvx - this.K_KICK_VEL;
                this.xFacing = this.xDirection.LEFT;
                this.setFlipX(true);
                // temporarily suppress right movement?
                // reboundRan++;
            }
            // Slight vertical boost
            this.setVelocityY(Math.min(this.body.velocity.y, this.K_SIDEKICK_Y));
            if (this.model.soundOn === true) {
                this.sfxRebound.play();
            }
            //this.reboundRan++;
            this.sideKicking = false;
            this.reboundLanded = true;
        }
        this.canKick = true;
        this.kickOK = false;
        return true;
    }

    /**
     * Special rebound function for dropkicking into an object.
     * 
     * @param hitbox the hitbox from a player action
     * @param tile the tile overlapped by the hitbox
     */
    dropKickRebound(hitbox, tile) {
        
        if (this.dropKicking && !this.sideKicking && this.verifyRebound(hitbox, tile)) {
            this.dropKickSlowdown();
            this.setVelocity(-this.body.velocity.x * 0.5, this.D_DROPKICK_Y);
            this.canKick = true;
            this.canSlide = false;
            this.dropKickBounce = true;
            this.canJump = true;
            this.dropKicking = false;
            this.reboundLanded = true;
            this.reboundRan++;
        }
        return true;
    }

    /**
     * Initiates the "slow motion" effect after hitting a wall with the dropkick.
     */
    dropKickSlowdown() {
        // Slow time
        this.scene.physics.world.timeScale = this.D_SLOWDOWN;
        this.ticksToSlowEnd = this.ticks + this.maxSlowTicks;
        this.slowTime = true;

        // Sound effect
        if (this.model.soundOn === true) {
            this.sfxDropKickRebound.play();
        }
    }

    /**
     * Special rebound function for flipping into an object.
     * 
     * @param hitbox the hitbox from a player action
     * @param tile the tile overlapped by the hitbox
     */
     flipRebound(hitbox, tile) {
        var vx = 0;
        var vy = 0;
        if (this.flipReady && this.flipping && tile.properties.solid && !tile.properties.semisolid && !tile.properties.soft) {
            // Flip vector calculated in flipRotation method
            // console.log('vx: ' + vx);

            // Modify vx at earliest part of the flip
            if (this.pathIndex <= 0.2) {
                // console.log("pathIndex X check working");
                if (this.kickDirection == this.xDirection.RIGHT)
                    vx = -this.flipReboundVec.x - this.F_FLIP_VEL;
                else if (this.kickDirection == this.xDirection.LEFT)
                    vx = this.flipReboundVec.x + this.F_FLIP_VEL;
            }
            else {
                vx = this.flipReboundVec.x;
            }

            // Modify vy at latest part of the flip
            if (this.pathIndex >= 0.7) {
                // console.log("pathIndex Y check working");
                vy = this.flipReboundVec.y - this.F_FLIP_VEL;
            }
            else {
                vy = this.flipReboundVec.y;
            }
            if (this.model.soundOn === true) {
                this.sfxRebound.play();
            }
            this.setVelocity(vx, vy);
            this.flipping = false;
            this.reboundLanded = true;
            this.reboundRan++;
            // console.log('pathIndex: ' + this.pathIndex);
            // console.log('vx: ' + vx);
            // console.log('vy: ' + vy);
        }

        return true;
    }
 
    /** 
     * This method verifies the tile overlapped by a kick hitbox
     * to make sure you should actually be able to boost off of it.
     * 
     * @param {Phaser.GameObjects.Rectangle} hitbox the hitbox
     * @param {Phaser.Tilemaps.Tile} tile the tile
     * @returns true if the hitbox is against a solid wall or corner, false otherwise
     */
    verifyRebound(hitbox, tile) {
        var frontTile = null;
        var tileHeight = Math.min(tile.pixelY, this.body.y + (this.body.height * 1.5));

        if (this.kickDirection == this.xDirection.LEFT && tile.faceRight && !tile.properties.semisolid && tile.properties.solid && !tile.properties.soft) {
            this.staticEdge = tile.pixelX + tile.width;
            this.kickEdge = hitbox.body.position.x + hitbox.body.width;
            frontTile = this.map.getTileAtWorldXY(tile.pixelX + 32, tileHeight);
            if (frontTile != null) {
                // console.log(frontTile.x + ',' + frontTile.y);
            }
            if (this.kickEdge > this.staticEdge 
                && ((frontTile == null || !frontTile.properties.semisolid) || this.body.y + this.body.height > tile.pixelY)) {
                return true;
                // reboundRan++;
            }
        }
        if (this.kickDirection == this.xDirection.RIGHT && tile.faceLeft && !tile.properties.semisolid && tile.properties.solid && !tile.properties.soft) {
            this.staticEdge = tile.pixelX;
            this.kickEdge = hitbox.body.position.x;
            frontTile = this.map.getTileAtWorldXY(tile.pixelX - 32, tileHeight);
            if (frontTile != null) {
                // console.log(frontTile.x + ',' + frontTile.y);
            }
            if (this.kickEdge < this.staticEdge 
                && ((frontTile == null || !frontTile.properties.semisolid) || this.body.y + this.body.height > tile.pixelY)) {
                return true;
                // reboundRan++;
            }
        }
        return false;
    }

    /**
     * Set up the laser. This method only runs once at the beginning of the laser move.
     */
    laserSetup() {
        if (!this.lasering) {
            var laserX = this.getBottomCenter().x;
            var laserY = this.getBottomCenter().y;
            this.laser = this.scene.add.rectangle(laserX, laserY, this.L_WIDTH, this.L_HEIGHT);
            this.laser.setOrigin(0.5, 0);
            // Create and hide the three laser sprites

            this.lSprite1 = this.scene.add.sprite(laserX, laserY, "laserdown", 0);
            this.lSprite2 = this.scene.add.sprite(laserX, laserY, "laserdown", 1);
            this.lSprite3 = this.scene.add.sprite(laserX, laserY, "laserdown", 2);

            this.sprites.add(this.lSprite1);
            this.sprites.add(this.lSprite2);
            this.sprites.add(this.lSprite3);
            this.lSprite1.setDepth(1);
            this.lSprite2.setDepth(0);
            this.lSprite3.setDepth(2);

            this.sprites.children.iterate(s => {
                // s.setVisible(false);
                s.setOrigin(0.5, 0);
            });

            //var laser = new Phaser.GameObjects.Rectangle(this.scene, 1, 2, 3, 4);
            this.pHitboxes.add(this.laser);
            
            this.laser.body.setAllowGravity(false);
        }
    }

    drawLaser() {
        var i = 0;
        // var laserX = this.getBottomCenter().x;
        // var laserY = this.getBottomCenter().y;
        // Extend down
        this.alignSpriteWithPlayer(this.laser, -2);
        var newHeight = this.L_HEIGHT;
        
        while (i < 200 && !checkWallManual(this.xDirection.DOWN, this.laser.body.x, this.laser.body.width, this.laser.body.position.y, newHeight, this.map)) {
            // console.log(!checkWallManual(this.xDirection.DOWN, this.laser.body.position.x, this.laser.body.width, this.laser.body.position.y, this.laser.body.height, this.map));
            newHeight += this.L_INCREMENT;
            // this.laser.y += 4;
            // this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
            // console.log(this.laser.body.height);
            // this.laserMask.x -= this.L_INCREMENT / 2;
            
            i++;
        }
        
        var tileY = this.map.getTileAtWorldXY(this.body.position.x, this.body.position.y + newHeight + 32);
        var floorY = newHeight; 
        // console.log("Look for tile at: " + (this.body.position.y + newHeight + 32));
        // if (tileY != null && tileY.properties.solid) {
        //     floorY = Math.round(tileY.pixelY - this.body.position.y) - 12;
        //     // console.log("Floor tile found: " + tileY.pixelY);
        //     // console.log("FloorY is now " + floorY);
        //     // console.log("Compare to newHeight: " + newHeight);

        // }
        // else if (tileY == null) {
        //     // console.log("Tile is null");
        // }

        this.laser.setSize(this.L_WIDTH, floorY);
        this.laser.body.setSize(this.L_WIDTH, floorY);
        this.laser.body.updateFromGameObject();

        // Now render the laser underneath the player
        this.alignSpriteWithPlayer(this.lSprite1, -2);
        this.lSprite1.setVisible(true);
        this.alignSpriteWithPlayer(this.lSprite3, floorY - 32);
        this.lSprite3.setVisible(true);
        this.lSprite2.displayHeight = floorY - 32; // Space between the two laser sprites
        this.alignSpriteWithPlayer(this.lSprite2, -2 + 32);
        this.lSprite2.setVisible(true);
    }

    /**
     * Helper method to remove every laser beam sprite created by drawLaser().
     */
    clearSprites() {
        this.sprites.clear(true, true);
    }

    /**
     * 
     * @param {Phaser.GameObjects.Rectangle} pHitbox the hitbox
     * @param {Walker} enemy the enemy
     */
    attack(pHitbox, enemy) {
        var vx = 0;
        var vy = 0;
        var hit = false;

        // Handle side kick
        if (this.sideKicking && this.scene.physics.overlap(this.sideKickBox, enemy)) {
            if (this.kickDirection === this.xDirection.RIGHT) {
                vx = this.K_KICK_VEL;
                this.reboundRan++;
            }
            else if (this.kickDirection === this.xDirection.LEFT)
                vx = -this.K_KICK_VEL;
            vy = this.K_SIDEKICK_Y * 2;
            vx *= 1.2;
            hit = true;
        }

        // Handle drop kick
        if (this.dropKicking && this.scene.physics.overlap(this.dropKickBox, enemy)) {
            if (this.kickDirection == this.xDirection.RIGHT)
                vx = this.S_SLIDE_XVEL;
            else if (this.kickDirection == this.xDirection.LEFT)
                vx = -this.S_SLIDE_XVEL;
            vy = this.D_DROPKICK_Y;
            hit = true;
        }

        // Handle slide
        if (this.sliding && this.scene.physics.overlap(this.slideBox, enemy)) {
            if (this.kickDirection == this.xDirection.RIGHT)
                vx = this.S_SLIDE_XVEL;
            else if (this.kickDirection == this.xDirection.LEFT)
                vx = -this.S_SLIDE_XVEL;
            vy = this.S_SLIDE_YVEL * 2;
            hit = true;
        }

        // Handle flip
        if (this.flipping && this.scene.physics.overlap(this.flipAttackBox, enemy)) {
            vx = -this.flipReboundVec.x;
            vy = -this.flipReboundVec.y * 2;
            hit = true;
        }

        if (this.lasering && this.scene.physics.overlap(this.laser, enemy)) {
            vx = this.body.velocity.x * 1.5;
            vy = 0;
            hit = true;
        }

        if (hit && enemy.recoilVulnerable) {
            // console.log("PLAYER HIT");
            enemy.hit(vx, vy);
            // console.log(vx);
        }
    }

    /**
     * Breaks soft tiles when they are hit by normal attacks.
     * Soft tiles have the "soft" property checked in Tiled.
     * 
     * @param {*} pHitboxes hitbox unused
     * @param {Phaser.Tilemaps.Tile} tile the tile
     */
    breakSoft(pHitboxes, tile) {
        if (tile.properties.soft) {
            // Hit enemies standing on this tile
            this.hitEnemyOnTile(tile);

            // Now remove the tile
            this.solids.removeTileAt(tile.x, tile.y);
            // TODO: Additional particle effects
        }
    }

    breakHard(pHitboxes, tile) {
        if (tile.properties.hard) {
            // Hit enemies standing on this tile
            this.hitEnemyOnTile(tile);

            // Now remove the tile
            this.solids.removeTileAt(tile.x, tile.y);
            
            // TODO: Additional particle effects
        }
    }

    /**
     * Handles contact with spikes.
     * 
     * @param {Player} body the player
     * @param {Phaser.Tilemaps.Tile} spike the spike tile collided with
     */
    spikeContact(body, spike) {
        this.hurt(70, 300, 450);
    }

    /**
     * Handles contact with enemies.
     * 
     * @param {Player} body the player
     * @param {Enemy} enemy the enemy touched by the player
     */
    enemyContact(body, enemy) {
        if (enemy.alive && enemy.contactDmg) {
            this.hurt(enemy.damage, enemy.recoilX, enemy.recoilY);
        }
    }

    /**
     * Handles contact with heat tiles.
     * 
     * @param {Player} body the player
     * @param {Phaser.Tilemaps.Tile} spike the spike tile collided with
     */
    heatDmg(body, tile) {
        if ((tile.properties.heat || tile.properties.superheat) && !this.heatTaken) {
            // console.log("HeatDmg taken");
            if (tile.properties.superheat) {
                this.recover(this.heatDmgRate * 2);
            }
            else {
                this.recover(this.heatDmgRate);
            }
            this.heatTaken = true;
        }
    }

    /**
     * Recovers an amount of health, but will not exceed the max health.
     * Alternatively, this can be used to deal damage to the player without adding knockback
     * or invulnerability.
     * @param {number} amount the amount of health to heal for.
     */
    recover(amount) {
        this.HP = Math.min(this.maxHP, this.HP + amount);
    }

    /**
     * Deals an amount of damage, sets invulnerability timer, and knocks the player back.
     * The horizontal recoil is in the opposite direction of the player's 'facing' direction.
     * The player will get shot downward if you hit a ceiling or upward if you hit a floor.
     * 
     * @param {number} amount the amount of health to subtract. Must be positive.
     * @param {number} recoilX the amount of horizontal recoil
     * @param {number} recoilY the amount of vertical recoil.
     */
    hurt(amount, recoilX, recoilY) {
        if (!this.invincible) {
            var vx = 0;
            var vy = 0;

            if (this.xFacing == this.xDirection.RIGHT) {
                // Left
                vx = Math.min(-Math.abs(this.body.velocity.x), -recoilX);
            }
            else if (this.xFacing == this.xDirection.LEFT) {
                // Right
                vx = Math.max(Math.abs(this.body.velocity.x), recoilX);
            }

            if (this.body.onFloor() || this.body.velocity.y >= 0) {
                // Up
                vy = Math.min(-Math.abs(this.body.velocity.y), -recoilY);
            }
            if (this.body.onCeiling() || this.body.velocity.y < 0) {
                // Down
                this.hurtRan++;
                vy = Math.max(Math.abs(this.body.velocity.y), recoilY * 0.5);
            }
            if (this.alive) {
                this.resetState();
                if (this.model.soundOn === true) {
                    this.sfxHurt.play();
                }
                this.HP = Math.min(this.maxHP, this.HP - amount);
                this.ticksToDamageEnd = this.ticks + this.iFrames;
                this.hurtAnimEnd = this.ticks + this.hurtAnimTicks;
            }
            
            this.body.setVelocity(vx, vy);
            
            
        }
    }

    /**
     * Kills off the player and returns them to the spawnpoint or last checkpoint.
     * @author Josiah Cornelius
     * 
     */
    die() {
    
        if (this.model.soundOn === true) {
            this.sfxDie.play();
        }
        this.HP = 0;
        this.anims.play('hurt', true);
        //the slide animation looks like the player died
        // I beg to differ!!!!!!!!!!
        // this.anims.play('slide', true);
        // this.cursors.left = false
        // this.cursors.right = false;
        // this.cursors.up = false;
        // this.cursors.down = false;
        // this.canJump = false;
        // this.jump = false;
        // this.maxJumpTicks = false;
        // this.P_JUMP = false;
        setTimeout(() => {
            if (this.scene instanceof Phaser.Scene)
                this.scene.scene.restart(); 
        }, 4000);
    
        // Additions by Tony Imbesi: Stop camera and reset state
        this.resetState();
        this.cam.stopFollow();
        this.removePowerUps();
        this.setAngularVelocity(300 * this.body.velocity.x);
        this.body.setVelocityY(-(this.body.velocity.y * this.body.velocity.y));
        this.body.setAcceleration(0, 0);
        // Setting this flag disables all user input without having to edit the controller object. 
        // All actions that check for keys pressed are inside an if (this.controllable) statement.
        this.alive = false; 
        this.controllable = false;
        this.setAllColliders(false);
        // End code by Tony Imbesi
    }

    /**
     * When the player is defeated, restart the level once the player goes off screen.
     * 
     */
    checkOffScreen() {
        var cameraBounds = new Phaser.Geom.Rectangle(this.cam.scrollX - this.camBoundary, this.cam.scrollY - this.camBoundary, this.cam.displayWidth + this.camBoundary * 2, this.cam.displayHeight + this.camBoundary * 2);
        if (!this.alive && !cameraBounds.contains(this.getCenter().x, this.getCenter().y) && !this.sfxDie.isPlaying) {
            this.scene.scene.restart(); // Could be changed later to moving the player back to spawnpoint or checkpoint
        }
    }

    /**
     * Hits enemies standing on top of a certain tile.
     * 
     * @param {Phaser.Tilemaps.Tile} tile the tile
     */
    hitEnemyOnTile(tile) {
        this.enemies.getChildren().forEach(e => {
            if (e.alive && e.body.enable) { 
                if (this.solids.getTileAtWorldXY(e.x, e.y + e.body.height + 1) === tile) {
                    // || this.solids.getTileAtWorldXY(e.x - 1, e.y) === tile
                    // || this.solids.getTileAtWorldXY(e.x + e.body.width + 1, e.y) === tile) {
                    e.recoilVulnerable = true;
                    e.body.setAllowGravity(true);
                    e.hit(Phaser.Math.Between(-150, 150), this.S_SLIDE_YVEL);
                    // console.log("Enemy clause worked");
                }
            }
        });
    }

    /**
     * Handles the collection of items or power ups.
     * If a coin is picked up, increment the coin counter.
     * If a powerup is picked up, set the corresponding powerup flag and update the item UI.
     * 
     * @param {Player} body the player
     * @param {Item} item the item collected
     * 
     * Based on code in Collectibles.js by Josiah Cornelius
     */
    collectItem(body, item) {
        if (item.itemType == item.itemEnum.COIN) {
            this.coinsFound++;
            if (this.model.soundOn === true) {
                if (this.coinsFound < this.maxCoins) {
                    this.sfxItem.play(); // replace with coin sound effect
                }
                else {
                    this.sfxCheckpoint.play();
                    // this.coinUI.setTexture('nicePlay');
                }
            }
        }
        if (item.itemType == item.itemEnum.LASER) {
            if (this.model.soundOn === true) {
                this.sfxItem.play();
                if (!this.foundLaser) {
                    this.sfxLaserItem.play();
                }
            }
            this.foundLaser = true;
        }
        if (item.itemType == item.itemEnum.DOUBLEJUMP) {
            if (this.model.soundOn === true) {
                this.sfxItem.play();
                if (!this.foundDoubleJump) {
                    this.sfxJumpItem.play();
                }
            }
            this.foundDoubleJump = true;
            this.canDoubleJump = true;
        }
        if (item.itemType == item.itemEnum.SPEEDUP) {
            if (this.model.soundOn === true) {
                this.sfxItem.play();
                if (!this.foundSpeedUp) {
                    this.sfxSpeedItem.play();
                }
            }
            this.foundSpeedUp = true;
            this.P_SPEED = this.P_SPEEDUP; // Increase speed
        }

        // Remove the item
        item.destroy();
    }

    /**
     * Update the item display based on the coin count and the three powerup flags.
     */
    updateItemDisplay() {
        // Begin modified code from Josiah Cornelius's 'Collectibles.js'
        var displayString = "Coins collected: " + this.coinsFound + " / " + this.maxCoins;
        if (this.foundLaser) {
            displayString += "\n-Found the LASER upgrade!";
            this.laserUI.setVisible(true);
        }
        if (this.foundDoubleJump) {
            displayString += "\n-Found the DOUBLE JUMP upgrade!";
            this.doubleJumpUI.setVisible(true);
        }
        if (this.foundSpeedUp) {
            displayString += "\n-Found the SPEED UP!";
            this.speedUI.setVisible(true);
        }
        
        this.itemsDisplay.setText(displayString);
        // End modified code from Josiah Cornelius's 'Collectibles.js'
    }

    /**
     * Handles touching the goal UFO.
     * The player model disappears and is no longer controllable, and the UFO flies away.
     * Shortly after, the next course loads.
     * I found out from testing that you can still trigger this event and clear the course if you die
     * and your body collides with it before the scene restarts. This is hilarious and will stay in the game.
     * 
     * @author Tony Imbesi
     * @version 4/20/2022
     * 
     * @param {Player} body the player
     * @param {Goal} goal the goal UFO
     */
    hitGoal(body, goal) {
        this.setVisible(false);
        goal.flyAway(this.body.velocity.x, this.body.velocity.y);
        if (this.model.soundOn === true) {
            this.sfxWin.play();
        }
        this.controllable = false;
        this.model.checkpointSet = false;
        this.model.spawnX = undefined;
        this.model.spawnY = undefined;
        // Save progress: increase the levelCleared number if you cleared a later course
        if (Number(localStorage.levelCleared) < this.scene.clearId) {
            localStorage.levelCleared = this.scene.clearId;
            // Also record if the level was cleared with all coins collected
            if (this.coinsFound >= this.maxCoins) {
                localStorage.setItem("fullClear" + this.scene.clearId, true);
            }
        }

        // Begin modified code from Josiah Cornelius
        setTimeout(() => {
            this.scene.scene.start(this.nextLevel);;
        }, 3000);
        // End modified code from Josiah Cornelius
        this.disableBody();
        
    }

    /**
     * Handles touching a checkpoint flag.
     * The checkpoint disappears and its coordinates are passed to the global model
     * for reference later. When the player respawns, those coordinates will be used instead
     * of the spawnpoint coordinates.
     * 
     * @author Tony Imbesi
     * @version 4/20/2022
     * 
     * @param {Player} body the player
     * @param {Checkpoint} checkpoint the checkpoint flag
     */
    hitCheckpoint(body, checkpoint) {
        // console.log('hitCheckpoint ran');
        if (!checkpoint.triggered) {
            this.HP = this.maxHP;
            checkpoint.trigger(this.body.velocity.x);
            if (this.model.soundOn === true) {
                this.sfxCheckpoint.play();
            }
            this.model.spawnX = checkpoint.x;
            this.model.spawnY = checkpoint.y - 12;
            this.model.checkpointSet = true;
        }
    }


    /**
     * Resets every significant state variable.
     */
    resetState() {
        this.cam.startFollow(this, false, 1, 1); // Setting 2nd parameter to 'true' will make the camera round its position value to integers
        this.cam.setDeadzone(70, 50);
        this.cam.setFollowOffset(0, 0);
        this.emitter.stop();
        this.alive = true;
        this.controllable = true;
        this.canAttack = false;
        this.canJump = false;
        this.canSlide = false;
        this.canDropKick = false;
        this.dropKickRan = false;
        this.dropKickOverride = false;
        this.canFlip = false;
        this.sideKicking = false;
        this.dropKicking = false;
        this.flipping = false;
        this.sliding = false;
        this.isJumping = false;
        this.dropKickBounce = false;
        this.setAllColliders(true);
        this.body.setAllowGravity(true);
    }

    /**
     * Sets every relevant collider's 'active' value.
     * 
     * @param {Boolean} active set all relevant colliders to true or false
     */
    setAllColliders(active) {
        this.solidCollider.active = active;
        this.spikeCollider.active = active;
        this.heatCollider.active = active;
        this.itemsCollider.active = active;
        this.enemyCollider.active = active;
        this.setCollideWorldBounds(active);
    }

    /**
     * Removes every power-up state.
     */
    removePowerUps() {
        this.foundDoubleJump = false;
        this.foundLaser = false;
        this.foundSpeedUp = false;
    }

    // grounded() {
    //     return (this.body.onFloor() || this.body.touching.down);
    // }
}
