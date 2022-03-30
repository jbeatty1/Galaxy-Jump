import 'phaser';
import {checkWallManual} from './Objects/Enemy';
/**
 * Class modeling the player character with all movement abilities.
 * This player can be added to any scene by creating a new Player object.
 * 
 * 
 * Major changes:
 * - Made it so the player's time variables are correctly saved if the game pauses
 * - Added an option to jump after the dropkick. The game will temporarily go into
 *      slow motion after dropkicking a wall. If you jump or wait too long, 
 *      the game speed returns to normal.
 * - Made it so you won't register two moves right after each other if you hold jump or attack.
 * - Added laser move
 * - Improved flip physics
 * - Added damage and attacking system
 * @author Tony Imbesi
 * @version 3/21/2022
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
     */
    constructor(config, solids, enemies, input) {
        super(config.scene, config.x, config.y, "dude");
        this.scene = config.scene;
        this.solids = solids;
        this.map = this.solids.tilemap;
        this.enemies = enemies;
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
        this.P_WIDTH = 32; // Width of the sprite
        this.P_HEIGHT = 48; // Height of the sprite
        this.P_WFRAC = 0.75; // Percentage of sprite body filled horizontally by hitbox
        this.P_HFRAC = 0.75; // Percentage of sprite body filled vertically by hitbox
        this.P_HCROUCH = 20; // Height while crouching

        // Player's movement constants:
        this.P_XVEL_SOFTMAX = 340; // Soft limit to max horizontal speed. Can be broken by various methods.
        this.P_XVEL_HARDMAX = 900; // Hard limit to max horizontal speed
        this.P_YVEL_HARDMAX = 900; // Hard limit to max vertical speed
        // We can get the player's velocity at any time using player.body.velocity.x
        this.P_XACCEL = 1800; // Default horizontal acceleration
        this.P_JUMP = -400; // Jump velocity
        this.P_JUMP_ACCEL = -2750; // Jump acceleration. Vertical acceleration is unchanged by gravity but still affects vertical movement.
        this.P_JUMP_BRAKE = 800; // Cancel out jump acceleration at the end of a jump
        this.P_DRAG = 800; // Default drag
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
        this.S_SLIDE_XVEL = 500; // Horizontal velocity from sliding
        this.S_SLIDE_YVEL = -100; // Vertical velocity from sliding
        this.S_SLIDE_W = 30;    // Width and height of hitbox
        this.S_SLIDE_H = 16;
        this.S_slideXOffset = 30; // X and Y offsets for slide
        this.S_slideYOffset = 5;

        // Dropkick constants:
        this.D_MINSPEED = this.P_XVEL_SOFTMAX * 1.1;    // Minimum speed required to perform a dropkick
        this.D_DROPKICK_XVEL = 80; // Horizontal velocity from dropkick
        this.D_DROPKICK_YVEL = -440; // Vertical velocity
        this.D_DROPKICK_W = 40;
        this.D_DROPKICK_H = 36;
        this.D_DROPKICK_Y = -400; // Vertical boost after rebound
        this.D_SLOWDOWN = 2.0;  // Slowdown after hitting something with a dropkick
        this.D_dropXOffset = 30;
        this.D_dropYOffset = 0;

        // Flip constants:
        this.F_FLIP_VEL = 500;
        this.F_FLIP_W = 30;
        this.F_FLIP_H = 30;
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
        this.L_HEIGHT = 2;
        this.L_INCREMENT = 4;
        this.ticksToLaser = 0;

        // Health variables:
        this.maxHP = 100; // Max health
        this.HP = this.maxHP;
        this.iFrames = 90 * this.INTERVAL;
        this.ticksToDamageEnd = 0;
        this.recoilVelocity = 300;
        this.invincible = false;
        

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
        this.maxJumpTicks = 13 * this.INTERVAL; // This variable is best for changing jump height.
        this.isJumping = false;
        this.canJump = false;
        this.inAir = false;

        this.crouching = false;

        this.canAttack = true;
        this.attackDelay = 25 * this.INTERVAL;
        this.atkDelayEnd = 0;
        this.reboundLanded = false;

        this.maxKickTicks = 9 * this.INTERVAL;
        this.ticksToKickEnd = 0;
        this.sideKicking = false;
        this.canKick = true;
        this.staticEdge = 0;
        this.kickEdge = 0;

        this.maxDropTicks = 30 * this.INTERVAL;
        this.ticksToDropKickEnd = 0;
        this.canDropKick = false;
        this.dropKicking = false;
        this.dropKickBounce = false;
        this.dropKickDelay = 0; // Next two variables are used to delay the 'on ground' check for the drop kick
        this.dropKickDelayTicks = 5 * this.INTERVAL;
        this.maxSlowTicks = 15 * this.INTERVAL;
        this.ticksToSlowEnd = 0;
        this.slowTime = false;

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

        this.laser = null
        this.laserPrep = false;
        this.lasering = false;
        this.canLaser = false;
        
        this.xFacing = 0;
        this.kickDirection = 0;

        // Items found:
        this.foundLaser = false;
        this.foundDoubleJump = false;
        this.foundSpeedUp = false;

        

        /** End of player variables */

        // Set controls for player
        this.cursors = input;

        // Player Physics
        this.setBounce(this.P_BOUNCE, 0); // 1st parameter is x-bounce, 2nd is y-bounce
        this.body.setGravityY(this.P_GRAV);
        // this.body.setFrictionX(3); // I couldn't get this to work, but I'm using drag to slow the player down anyway.
        this.body.setDragX(this.P_DRAG);
        this.body.setMaxVelocityY(this.P_YVEL_HARDMAX);

        this.body.setSize(Math.floor(this.P_WIDTH * this.P_WFRAC), Math.floor(this.P_HEIGHT * this.P_HFRAC), true); // false means it won't reposition to player's center
        this.body.setOffset(Math.floor(this.P_WIDTH * ((1 - this.P_HFRAC) * 0.5)), this.P_HEIGHT * (1 - this.P_HFRAC));

        this.setCollideWorldBounds(true); 
        
        
        // Player animations. The keys can be remade using an enumeration.
        // Left animation for premade "dude" asset
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],  // Change frame number if using a different player sprite
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

        // Left animation for premade "dude" asset
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

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
        this.sideKickBox = this.scene.add.rectangle(-10, -10, this.K_SIDEKICK_W, this.K_SIDEKICK_H);
        this.slideBox = this.scene.add.rectangle(-10, -10, this.S_SLIDE_W, this.S_SLIDE_H);
        this.dropKickBox = this.scene.add.rectangle(-10,-10, this.D_DROPKICK_W, this.D_DROPKICK_H);
        this.flipBox = this.scene.add.rectangle(-10, -10 , this.F_FLIP_W, this.F_FLIP_H);
        
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

        this.sideKickBox.setActive(false);
        this.slideBox.setActive(false);
        this.dropKickBox.setActive(false);
        this.flipBox.setActive(false);

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
        
        /** Left and right movement, only when not crouching */
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
            this.anims.play('turn');
        }

        /** Change direction on left/right press if not performing a move */
        if (this.cursors.left.isDown 
            && !(this.sliding || this.sideKicking || this.dropKicking || this.flipping)) {
            this.xFacing = this.xDirection.LEFT;
            this.anims.play('left', true);
        }
        else if (this.cursors.right.isDown 
            && !(this.sliding || this.sideKicking || this.dropKicking || this.flipping)) {
            this.xFacing = this.xDirection.RIGHT;
            this.anims.play('right', true);
        }

        /** Crouch */
        if ((this.cursors.down.isDown && this.body.onFloor()) || this.sliding)
        {
            this.crouching = true;
        }
        else {
            this.crouching = false;
        }

        /** Jump */ 
        if (this.cursors.pressed(this.cursors.jump)
            && this.canJump && !this.isJumping)
        {
            this.isJumping = true;
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
        if (this.cursors.pressed(this.cursors.attack) && this.canAttack
            && ((this.cursors.down.isDown && !this.body.onFloor()) 
                || (!(this.canDropKick && this.cursors.down.isDown) && this.body.onFloor()))
            && this.canSlide && !this.sliding && this.xFacing !== this.xDirection.NONE && !this.dropKicking) 
        {
            this.canAttack = false;
            this.sliding = true;
            this.sideKicking = false;
            this.canKick = false;
            this.canSlide = false;

            if (this.xFacing === this.xDirection.RIGHT)
                this.body.setVelocityX(Math.max(this.body.velocity.x, this.S_SLIDE_XVEL));
            if (this.xFacing === this.xDirection.LEFT)
                this.body.setVelocityX(Math.min(this.body.velocity.x, -this.S_SLIDE_XVEL));

            this.body.setVelocityY(this.S_SLIDE_YVEL);

            this.slideBox.setActive(true);
            this.ticksToSlideEnd = this.ticks + this.maxSlideTicks;
        }
        if (this.sliding && this.ticks < this.ticksToSlideEnd)
        {
            this.crouching = true;
            this.alignWithPlayer(this.slideBox, this.S_slideXOffset, this.S_slideYOffset);
            // this.anims.play('slide');
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
        }
        if (this.sideKicking && this.ticks < this.ticksToKickEnd)
        {
            this.alignWithPlayer(this.sideKickBox, this.kickXOffset, this.kickYOffset);
            // this.anims.play('sidekick');
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
        if (this.cursors.down.isDown
            && !this.laserPrep
            && !this.body.onFloor() && !this.sideKicking && !this.sliding && this.canLaser)
        {
            console.log("Laser init working");
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
                }
            }
            else {
                this.lasering = false;
                this.laserPrep = false;
                this.canLaser = false;
                if (this.laser != null) {
                    this.laser.destroy();
                }
            }
        }

        /** Drop kick: Down + attack on the ground with some speed built up */
        if (this.cursors.down.isDown && this.cursors.pressed(this.cursors.attack) && this.body.onFloor()
            && !this.sliding && this.xFacing !== this.xDirection.NONE
            && this.canDropKick && this.canAttack)
        {
            this.canAttack = false;
            this.dropKicking = true;
            this.canDropKick = false;
            this.canJump = false;
            this.canKick = false;
            this.canSlide = false;
            this.crouching = false;
            this.pvx = Math.abs(this.body.velocity.x) + this.D_DROPKICK_XVEL;
            if (this.xFacing === this.xDirection.RIGHT)
                this.body.setVelocityX(this.pvx);
            if (this.xFacing === this.xDirection.LEFT)
                this.body.setVelocityX(-this.pvx);

            this.body.setVelocityY(this.D_DROPKICK_YVEL);

            this.dropKickBox.setActive(true);
            this.ticksToDropKickEnd = this.ticks + this.maxDropTicks;
            this.dropKickDelay = this.ticks + this.dropKickDelayTicks;
        }
        if (this.dropKicking && this.ticks < this.ticksToDropKickEnd)
        {
            this.canKick = false;
            this.alignWithPlayer(this.dropKickBox, this.D_dropXOffset, this.D_dropYOffset);
            // this.anims.play('dropkick');
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
            this.atkDelayEnd = this.ticks + this.attackDelay;
        }
        if (this.flipping)
        {
            this.alignWithPlayer(this.flipPath, 0, 0);
            this.flipRotation();
            // this.anims.play('flip');
            if (this.body.onFloor()) {
                this.flipping = false;
                this.pathIndex = 0;
                this.flipBox.setActive(false);
            }
        }
        else {
            this.flipping = false;
            this.pathIndex = 0;
            this.flipBox.setActive(false);
            // this.kickDirection = this.xDirection.NONE;
        }
        if (this.cursors.attack.isUp && !this.flipping) {
            this.canFlip = true;
        }

        /** Passive attributes */
        // Regain health up to maximum
        this.recover(0.08);

        if (this.HP <= 0) {
            this.die();
        }

        // Decrease height when crouching
        if (this.crouching) {
            this.body.setSize(Math.floor(this.P_WIDTH * this.P_WFRAC), this.P_HCROUCH, true);
            this.body.setOffset(Math.floor(this.P_WIDTH * ((1 - this.P_HFRAC) * 0.5)), this.P_HEIGHT - this.P_HCROUCH);
            // this.anims.play('crouch');
        }
        // else if (!this.solids.getTileAtWorldXY(this.body.position.x, this.body.position.y + this.P_HEIGHT, true).collideDown) {
        else {  
            this.body.setSize(Math.floor(this.P_WIDTH * this.P_WFRAC), Math.floor(this.P_HEIGHT * this.P_HFRAC), true); // false means it won't reposition to player's center
            this.body.setOffset(Math.floor(this.P_WIDTH * ((1 - this.P_HFRAC) * 0.5)), this.P_HEIGHT * (1 - this.P_HFRAC));
        }

        // Player is slowed down more on the ground
        if (this.body.onFloor()){
            if (this.canDropKick && !this.sliding) {
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
            this.dropKickBounce = false;
        }
        else {
            this.setDragX(this.P_DRAG_AIR);
            if (!this.sliding && !this.dropKickBounce) {
                this.canJump = false;
            }
        }

        // Check to see if player is fast enough to perform dropkick
        if (Math.abs(this.body.velocity.x) >= this.D_MINSPEED) {
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
        if (this.slowTime) {
            if (this.cursors.jump.isDown && this.ticks <= this.ticksToSlowEnd) {
                // Resume time and jump
                this.scene.physics.world.timeScale = 1.0;
                this.slowTime = false;
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
    }

    /** Helper methods */

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
         if ((-this.P_XVEL_SOFTMAX <= this.body.velocity.x && ax < 0) 
             || (this.body.velocity.x <= this.P_XVEL_SOFTMAX && ax > 0)) {
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
            obj.x = this.body.center.x - xDiff;
            obj.y = this.body.center.y + yDiff;
        }
        //else if (this.kickDirection == this.xDirection.RIGHT) {

        else {
            obj.x = this.body.center.x + xDiff;
            obj.y = this.body.center.y + yDiff;
        }
    }

    /**
     * Rotates the flip hitbox around the flip path, and
     * calculates the angle of the flip rebound vector.
     * This updates the hitbox's position and angle as the player is updated.
     */
    flipRotation() {
        this.flipReady = false;
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
        
        // Increment the path index until the hitbox reaches the end of the arc
        this.pathIndex = Math.min(this.pathIndex + this.F_FLIP_SPEED, 1);
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
                // temporarily suppress right movement?
                // reboundRan++;
            }
            // Slight vertical boost
            this.setVelocityY(Math.min(this.body.velocity.y, this.K_SIDEKICK_Y));
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

    dropKickSlowdown() {
        // Slow time
        this.scene.physics.world.timeScale = this.D_SLOWDOWN;
        this.ticksToSlowEnd = this.ticks + this.maxSlowTicks;
        this.slowTime = true;
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
            console.log('vx: ' + vx);

            // Modify vx at earliest part of the flip
            if (this.pathIndex <= 0.2) {
                console.log("pathIndex X check working");
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
                console.log("pathIndex Y check working");
                vy = this.flipReboundVec.y - this.F_FLIP_VEL;
            }
            else {
                vy = this.flipReboundVec.y;
            }
            this.setVelocity(vx, vy);
            this.flipping = false;
            this.reboundLanded = true;
            this.reboundRan++;
            console.log('pathIndex: ' + this.pathIndex);
            console.log('vx: ' + vx);
            console.log('vy: ' + vy);
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
                console.log(frontTile.x + ',' + frontTile.y);
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
                console.log(frontTile.x + ',' + frontTile.y);
            }
            if (this.kickEdge < this.staticEdge 
                && ((frontTile == null || !frontTile.properties.semisolid) || this.body.y + this.body.height > tile.pixelY)) {
                return true;
                // reboundRan++;
            }
        }
        return false;
    }

    laserSetup() {
        if (!this.lasering) {
            var laserX = this.getBottomCenter().x;
            var laserY = this.getBottomCenter().y;
            this.laser = this.scene.add.rectangle(laserX, laserY, this.L_WIDTH, this.L_HEIGHT);
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
        this.alignWithPlayer(this.laser, 0, 0);
        this.laser.height = this.L_HEIGHT;
        this.laser.body.height = this.L_HEIGHT;
        while (i < 200 && !checkWallManual(this.xDirection.DOWN, this.laser.body.position.x, this.laser.body.width, this.laser.body.position.y, this.laser.body.height, this.map)) {
            // console.log(!checkWallManual(this.xDirection.DOWN, this.laser.body.position.x, this.laser.body.width, this.laser.body.position.y, this.laser.body.height, this.map));
            this.laser.setSize(this.laser.width, this.laser.height + this.L_INCREMENT);
            this.laser.body.setSize(this.laser.body.width, this.laser.body.height + this.L_INCREMENT);
            // this.laser.y += 4;
            // this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
            // console.log(this.laser.body.height);
            // this.laserMask.x -= this.L_INCREMENT / 2;
            
            i++;
        }
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
            vy = this.K_SIDEKICK_Y;
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
            vy = this.S_SLIDE_YVEL;
            hit = true;
        }

        // Handle flip
        if (this.flipping && this.scene.physics.overlap(this.flipBox, enemy)) {
            vx = -this.flipReboundVec.x;
            vy = -this.flipReboundVec.y;
            hit = true;
        }

        if (this.lasering && this.scene.physics.overlap(this.laser, enemy)) {
            vx = this.body.velocity.x * 1.5;
            vy = 0;
            hit = true;
        }

        if (hit && enemy.recoilVulnerable) {
            // console.log("PLAYER HIT");
            enemy.hit(vx, vy * 2);
            console.log(vx);
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

    enemyContact(body, enemy) {
        if (enemy.alive && enemy.contactDmg) {
            this.hurt(enemy.damage, enemy.recoilX, enemy.recoilY);
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
            
            this.resetState();
            this.body.setVelocity(vx, vy);
            this.HP = Math.min(this.maxHP, this.HP - amount);
            this.ticksToDamageEnd = this.ticks + this.iFrames;
        }
    }

    /**
     * Kills off the player and returns them to the spawnpoint or last checkpoint.
     */
    die() {
        this.scene.scene.restart(); // Change functionality later
    }

    /**
     * Hits enemies standing on top of a certain tile.
     * 
     * @param {Phaser.Tilemaps.Tile} tile the tile
     */
    hitEnemyOnTile(tile) {
        this.enemies.getChildren().forEach(e => {
            if (e.alive && e.body.enable) { 
                if (this.solids.getTileAtWorldXY(e.x, e.y + e.body.height + 1) === tile
                    || this.solids.getTileAtWorldXY(e.x - 1, e.y) === tile
                    || this.solids.getTileAtWorldXY(e.x + e.body.width + 1, e.y) === tile) {
                    e.recoilVulnerable = true;
                    e.body.setAllowGravity(true);
                    e.hit(Phaser.Math.Between(-150, 150), this.S_SLIDE_YVEL);
                    // console.log("Enemy clause worked");
                }
            }
        });
    }

    /**
     * Resets every significant state variable.
     */
    resetState() {
        this.canAttack = false;
        this.canJump = false;
        this.canSlide = false;
        this.canDropKick = false;
        this.canFlip = false;
        this.sideKicking = false;
        this.dropKicking = false;
        this.flipping = false;
        this.sliding = false;
        this.isJumping = false;
        this.dropKickBounce = false;
    }

    // grounded() {
    //     return (this.body.onFloor() || this.body.touching.down);
    // }
}