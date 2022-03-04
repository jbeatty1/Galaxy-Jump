import 'phaser';

/**
 * Class modeling the player character with all movement abilities.
 * This player can be added to any scene by creating a new Player object.
 * 
 * @author Tony Imbesi
 * @version 3/1/2022
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
    constructor(config, solids, semisolids, input) {
        super(config.scene, config.x, config.y, 'dude');
        this.scene = config.scene;
        this.solids = config.solids;
        this.semisolids = config.solids;

        this.scene.physics.add.existing(this);

        /** Start of player variables */
    
        this.INTERVAL = 16; // Number of ticks in milliseconds to multiply other timer variables

        // Player's appearance:
        this.P_WIDTH = 32; // Width of the sprite
        this.P_HEIGHT = 48; // Height of the sprite
        this.P_WFRAC = 0.75; // Percentage of sprite body filled horizontally by hitbox
        this.P_HFRAC = 0.75; // Percentage of sprite body filled vertically by hitbox
        this.P_HCROUCH = 20; // Height while crouching

        // Player's movement constants:
        this.P_XVEL_SOFTMAX = 320; // Soft limit to max horizontal speed. Can be broken by various methods.
        this.P_XVEL_HARDMAX = 900; // Hard limit to max horizontal speed
        this.P_YVEL_HARDMAX = 900; // Hard limit to max vertical speed
        // We can get the player's velocity at any time using player.body.velocity.x
        this.P_XACCEL = 1800; // Default horizontal acceleration
        this.P_JUMP = -400; // Jump velocity
        this.P_JUMP_ACCEL = -2750; // Jump acceleration. Vertical acceleration is unchanged by gravity but still affects vertical movement.
        this.P_JUMP_BRAKE = 800; // Cancel out jump acceleration at the end of a jump
        this.P_DRAG = 800; // Default drag
        this.P_DRAG_AIR = 80; // Air drag
        this.P_GRAV = 1700; // Player gravity. Total gravity = world gravity + player gravity
        this.P_BOUNCE = 0.5;

        // Constants determining action attributes:
        
        // Side kick constants:
        this.K_KICK_VEL = 400; // Base velocity from kicking an object
        this.K_SIDEKICK_Y = -100; // Height gained from side-kicking
        this.K_SIDEKICK_W = 40;  // Width of hitbox
        this.K_SIDEKICK_H = 48;  // Height of hitbox
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
        this.D_DROPKICK_XVEL = 200; // Horizontal velocity from sliding
        this.D_DROPKICK_YVEL = -400; // Vertical velocity from sliding
        this.D_DROPKICK_W = 40;
        this.D_DROPKICK_H = 30;
        this.D_dropXOffset = 30;
        this.D_dropYOffset = 0;

        // Laser constants:
        this.L_LASER_WINDUP = 125;  // Ticks before laser move happens
        this.L_LASERACCEL = -800;   // Vertical boost from lasering
        

        this.xDirection = {
            NONE: 0,
            LEFT: 1,
            RIGHT: 2,
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

        this.maxKickTicks = 15 * this.INTERVAL;
        this.ticksToKickEnd = 0;
        this.sideKicking = false;
        this.canKick = true;
        this.staticEdge = 0;
        this.kickEdge = 0;

        this.maxDropTicks = 30 * this.INTERVAL;
        this.ticksToDropKickEnd = 0;
        this.canDropKick = false;
        this.dropKicking = false;
        this.dropKickRebound = false;

        this.maxSlideTicks = 30 * this.INTERVAL;
        this.ticksToSlideEnd = 0;
        this.canSlide = true;
        this.sliding = true;

        this.laserPrep = false;
        this.lasering = false;
        this.canLaser = false;
        
        this.xFacing = 0;
        this.kickDirection = 0;

        

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
        this.pHitboxes = this.scene.physics.add.group();
        this.sideKickBox = this.scene.add.rectangle(-10, -10, this.K_SIDEKICK_W, this.K_SIDEKICK_H);
        this.slideBox = this.scene.add.rectangle(-10, -10, this.S_SLIDE_W, this.S_SLIDE_H);
        this.dropKickBox = this.scene.add.rectangle(-10,-10, this.D_DROPKICK_W, this.D_DROPKICK_H);

        this.pHitboxes.add(this.sideKickBox);
        this.pHitboxes.add(this.slideBox);
        this.pHitboxes.add(this.dropKickBox);

        // The hitbox's position changes, but it does not actually have velocity.
        // This means it will not actually "collide" with anything, but it can still overlap with things.
        // To check if the hitbox touches a solid tile, we need the canCollide instance variable.
        // This overlap can pass individual tiles into the rebound method, so we can check if any
        // overlapped tiles have their canCollide value set to true.
        this.solidCollider = this.scene.physics.add.collider(this, solids);
        this.semiCollider = this.scene.physics.add.collider(this, semisolids);
        this.kickCollider = this.scene.physics.add.overlap(this.pHitboxes, solids, null, this.rebound, this);

        this.alignRan = 0;
        this.reboundRan = 0;
        this.tile = solids.getTileAt(0,0, true);
    }

    update(time) {

        /** Actions */
        
        /** Left and right movement, only when not crouching */
        if (this.cursors.left.isDown && ((!this.crouching && !this.sliding) || !this.body.onFloor()))
        {
            this.moveX(-this.P_XACCEL);
            //this.anims.play('left', true);
        }
        else if (this.cursors.right.isDown && ((!this.crouching && !this.sliding) || !this.body.onFloor()))
        {
            this.moveX(this.P_XACCEL);
            //this.anims.play('right', true);
        }
        // Else: no movement. Set acceleration to 0 and decrease speed with friction/drag.
        else
        {
            this.setAccelerationX(0);
            this.anims.play('turn');
        }

        if (this.cursors.left.isDown && (!this.sliding)) {
            this.xFacing = this.xDirection.LEFT;
        }
        else if (this.cursors.right.isDown && (!this.sliding)) {
            this.xFacing = this.xDirection.RIGHT;
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
        if (this.cursors.jump.isDown && this.canJump && !this.isJumping)
        {
            this.isJumping = true;
            this.canJump = false;
            this.canKick = true;
            this.canLaser = true;
            this.sliding = false;
            this.dropKickRebound = false;
            // this.canSlide = false;
            this.setVelocityY(this.P_JUMP);
            this.ticksToJumpEnd = time + this.maxJumpTicks;
        }
        // Jump height increases with duration of button press
        if (this.cursors.jump.isDown && this.isJumping && time < this.ticksToJumpEnd)
        {
            this.setAccelerationY(this.P_JUMP_ACCEL);
        }

        /** End jump after releasing button or holding the button long enough */
        if (this.cursors.jump.isUp || !this.isJumping || time >= this.ticksToJumpEnd)
        {
            this.isJumping = false;
            if (this.body.velocity.y < 0) {
                this.setAccelerationY(this.P_JUMP_BRAKE);
            }
            else {
                // Player is still affected by gravity
                this.setAccelerationY(0);
            }
        }

        /** Do a slide with attack on ground. You can still jump even if airborne after doing this move! */
        if (this.cursors.attack.isDown && ((this.cursors.down.isDown && !this.body.onFloor()) || this.body.onFloor() && !this.canDropKick)
            && this.canSlide && !this.sliding && this.xFacing !== this.xDirection.NONE && !this.dropKicking) 
        {
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
            this.ticksToSlideEnd = time + this.maxSlideTicks;
        }
        if (this.sliding && time < this.ticksToSlideEnd)
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
        if (this.cursors.attack.isDown && !this.cursors.down.isDown
            && !(this.body.onFloor()) && !this.sideKicking && this.canKick && !this.sliding)
        {
            this.sideKicking = true;
            this.canKick = false;
            this.sliding = false;
            this.canSlide = false;

            // sideKickBox.enableBody(false, 0, 0, true, true);
            this.sideKickBox.setActive(true);
            this.ticksToKickEnd = time + this.maxKickTicks;
        }
        if (this.sideKicking && time < this.ticksToKickEnd)
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
        if (this.cursors.attack.isUp && !this.sideKicking) {
            this.canKick = true;
        }

        /** Laser move: Down + hold attack in the air */
        // if (this.cursors.down.isDown && this.cursors.attack.isDown
        //     && !this.body.onFloor() && !this.sideKicking && !this.sliding && this.canLaser)
        // {
        //     this.laserPrep = true;
        // }

        // if (this.laserPrep) {
        //     if ((this.cursors.attack.getDuration() >= this.L_LASER_WINDUP)
        //         && !this.body.onFloor() && !this.sideKicking && !this.sliding)
        //     {
        //         this.setAccelerationY(this.L_LASERACCEL);
        //         this.canJump = false;
        //     }
        //     else {
        //         this.laserPrep = false;
        //         this.canLaser = false;
        //     }
        // }

        /** Drop kick: Down + attack on the ground with some speed built up */
        if (this.cursors.down.isDown && this.cursors.attack.isDown && this.body.onFloor()
            && !this.sliding && this.xFacing !== this.xDirection.NONE
            && this.canDropKick)
        {
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
            this.ticksToDropKickEnd = time + this.maxDropTicks;
            this.dropKickDelay = time + 5 * this.INTERVAL;
        }
        if (this.dropKicking && time < this.ticksToDropKickEnd)
        {
            this.alignWithPlayer(this.dropKickBox, this.D_dropXOffset, this.D_dropYOffset);
            // this.anims.play('dropkick');
            if (this.body.onFloor() && time > this.dropKickDelay)
            {
                this.dropKicking = false;
                this.dropKickBox.setActive(false);

            }
        }
        

        /** Passive attributes */
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
            this.setDragX(this.P_DRAG);
            this.canKick = true;
            this.canJump = true;
            this.canSlide = true;
            this.isJumping = false;
            this.dropKickRebound = false;
        }
        else {
            this.setDragX(this.P_DRAG_AIR);
            if (!this.sliding && !this.dropKickRebound) {
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
         }
         else {
             this.setAccelerationX(0);
         }
     } // END move
 
     /**
     * Aligns a rectangle with the player.
     * 
     * @param rect the rectangle
     * @param xDiff the x offset: positive positions it in front of player
     * @param yDiff the y offset: negative is up
     */
     alignWithPlayer(rect, xDiff, yDiff) {
        // Lock in kick direction
        this.alignRan++;
        // if (this.kickDirection == this.xDirection.NONE) {
        //     this.kickDirection = this.xFacing;
        // }
        this.kickDirection = this.xFacing;

        if (this.kickDirection == this.xDirection.LEFT) {
            rect.setPosition(this.body.center.x - xDiff, this.body.center.y);
        }
        //else if (this.kickDirection == this.xDirection.RIGHT) {

        else {
            rect.setPosition(this.body.center.x + xDiff, this.body.center.y + yDiff);
        }
    }
 
    /**
     * Makes the player rebound off of an object.
     * 
     * @param pHitboxes the hitbox from a player action
     * @param tile the tile overlapped by the hitbox
     */
    // If a function is called in an overlap, you can pass a reference to the individual objects involved in the overlap.
    rebound(hitbox, tile)
    {
        
        // The top and bottom of the hitbox can be higher or lower than the player hitbox.
        // The rebound should only happen if it hits the corner or edge of a surface AND if that surface isn't semisolid.
        if (hitbox.z == 0 && this.kickDirection == this.xDirection.LEFT && tile.faceRight && !tile.properties.semisolid && tile.properties.solid) {
            this.staticEdge = tile.pixelX + tile.width;
            this.kickEdge = hitbox.body.position.x + hitbox.body.width;
            if (this.kickEdge > this.staticEdge)
            {
                this.kickOK = true;
                // reboundRan++;
            }
        }
        if (hitbox.z == 0 && this.kickDirection == this.xDirection.RIGHT && tile.faceLeft && !tile.properties.semisolid && tile.properties.solid) {
            this.staticEdge = tile.pixelX;
            this.kickEdge = hitbox.body.position.x;
            if (this.kickEdge < this.staticEdge)
            {
                this.kickOK = true;
                // reboundRan++;
            }
        }
        
        // if ((xFacing == xDirection.LEFT && pHitboxes.body.blocked.left)
        //     || (xFacing == xDirection.RIGHT && pHitboxes.body.blocked.right)) {
        //     kickOK = true;
        // }


        // Only certain moves will rebound the player
        if (this.sideKicking && !this.dropKicking && this.kickOK) {
            this.tile = tile;
            let pvx = this.body.velocity.x;
            // Left side kick: Right rebound
            if (this.kickDirection == this.xDirection.LEFT) {
                // player.setPosition(player.body.position.x + kickXOffset, player.body.position.y);
                // Invert pvx if player is also moving left
                if (this.body.velocity.x < 0) {
                    pvx = -pvx;
                }
                this.setVelocityX(pvx + this.K_KICK_VEL);
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
                this.setVelocityX(pvx - this.K_KICK_VEL);
                this.lastKick_V = pvx - this.K_KICK_VEL;
                this.xFacing = this.xDirection.LEFT;
                // temporarily suppress right movement?
                // reboundRan++;
            }
            // Slight vertical boost
            this.setVelocityY(Math.min(this.body.velocity.y, this.K_SIDEKICK_Y));
            this.reboundRan++;
            this.sideKicking = false;
        }

        if (this.dropKicking && !this.sideKicking && this.kickOK) {
            this.setVelocityY(this.P_JUMP_ACCEL);
            this.canKick = true;
            this.dropKickRebound = true;
            this.canJump = true;
            this.dropKicking = false;
        }
        this.kickOK = false;
        return true;
    }
 
}