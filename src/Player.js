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
     * @config the config object with the scene, x, and y in that order
     * @solids the tile layer for solid terrain
     * @semisolids the tile layer
     * @input the keyboard input
     */
    constructor(config, solids, semisolids, input) {
        super(config.scene, config.x, config.y, 'dude');
        this.scene = config.scene;
        this.scene.physics.add.existing(this);

        /** Start of player variables */
    
        this.INTERVAL = 16; // Number of ticks in milliseconds to multiply other timer variables

        // Player's appearance:
        this.P_WIDTH = 32; // Width of the sprite
        this.P_HEIGHT = 48; // Height of the sprite
        this.P_WFRAC = 0.75; // Percentage of sprite body filled horizontally by hitbox
        this.P_HFRAC = 0.75; // Percentage of sprite body filled vertically by hitbox

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
        this.K_KICK_VEL = 400; // Base velocity from kicking an object

        // Side kick constants:
        this.K_SIDEKICK_Y = -100; // Height gained from side-kicking
        this.K_SIDEKICK_W = 40;  // Width of hitbox
        this.K_SIDEKICK_H = 48;  // Height of hitbox
        this.kickXOffset = 30;  // X offset for side kick
        this.kickYOffset = 0;  // Y offset for side kick

        this.xDirection = {
            NONE: 0,
            LEFT: 1,
            RIGHT: 2,
        };

        this.pHitboxes = null;
        this.sideKickBox = null;

        this.tickCount = 0;
        this.ticksToJumpEnd = 0;
        this.maxJumpTicks = 15 * this.INTERVAL;
        this.isJumping = false;

        this.maxKickTicks = 15 * this.INTERVAL;
        this.sideKick = false;
        this.kickOK = false;
        this.staticEdge = 0;
        this.kickEdge = 0;

        
        this.xFacing = 0;
        this.kickDirection = 0;
        this.kickAgain = true;

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
        this.pHitboxes.add(this.sideKickBox);

        // The hitbox's position changes, but it does not actually have velocity.
        // This means it will not actually "collide" with anything, but it can still overlap with things.
        // To check if the hitbox touches a solid tile, we need the canCollide instance variable.
        // This overlap can pass individual tiles into the rebound method, so we can check if any
        // overlapped tiles have their canCollide value set to true.
        this.solidCollider = this.scene.physics.add.collider(this, solids);
        this.semiCollider = this.scene.physics.add.collider(this, semisolids);
        this.kickCollider = this.scene.physics.add.overlap(this.pHitboxes, solids, null, this.rebound, this);

        
    }

    update(time) {
        if (this.cursors.left.isDown)
        {
            this.moveX(-this.P_XACCEL);
            this.xFacing = this.xDirection.LEFT;
            this.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.moveX(this.P_XACCEL);
            this.xFacing = this.xDirection.RIGHT;
            this.anims.play('right', true);
        }
        // Else: no buttons pressed. Set acceleration to 0 and decrease speed with friction.
        else
        {
            this.setAccelerationX(0);
            this.anims.play('turn');
        }

        // Jump
        if (this.cursors.up.isDown && this.body.onFloor())
        {
            this.isJumping = true;
            this.setVelocityY(this.P_JUMP);
            this.ticksToJumpEnd = time + this.maxJumpTicks;
        }
        // Jump height increases with duration of button press
        if (this.cursors.up.isDown && this.isJumping && time < this.ticksToJumpEnd)
        {
            this.setAccelerationY(this.P_JUMP_ACCEL);
        }

        // End jump after releasing button or holding the button long enough
        if (this.cursors.up.isUp || !this.isJumping || time >= this.ticksToJumpEnd)
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

        // Player is slowed down more on the ground
        if (this.body.onFloor()){
            this.setDragX(this.P_DRAG);
            this.kickAgain = true;
        }
        else {
            this.setDragX(this.P_DRAG_AIR);
        }

        // Do a side kick
        if (this.cursors.space.isDown
            && !(this.body.onFloor()) && !this.sideKick && this.kickAgain)
        {
            this.sideKick = true;
            this.kickAgain = false;
            // sideKickBox.enableBody(false, 0, 0, true, true);
            this.sideKickBox.body.setEnable(true);
            this.ticksToKickEnd = time + this.maxKickTicks;
        }
        if (this.sideKick && time < this.ticksToKickEnd)
        {
            this.alignWithPlayer(this.sideKickBox, this.kickXOffset, this.kickYOffset);
        }
        if (!this.sideKick || time >= this.ticksToKickEnd || this.body.onFloor())
        {
            this.sideKick = false;
            this.sideKickBox.body.setEnable(false);
            this.kickDirection = this.xDirection.NONE;
        }
        if (this.cursors.space.isUp && !this.sideKick) {
            this.kickAgain = true;
        }

        // Hard cap to horizontal speed
        if (this.body.velocity.x > this.P_XVEL_HARDMAX) {
            this.setVelocityX(this.P_XVEL_HARDMAX);
        }
        if (this.body.velocity.x < -this.P_XVEL_HARDMAX) {
            this.setVelocityX(-this.P_XVEL_HARDMAX);
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
        if (this.kickDirection == this.xDirection.NONE) {
            this.kickDirection = this.xFacing;
        }

        if (this.kickDirection == this.xDirection.LEFT) {
            rect.setPosition(this.body.center.x - xDiff, this.body.center.y);
        }
        else if (this.kickDirection == this.xDirection.RIGHT) {
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
        if (this.kickDirection == this.xDirection.LEFT && tile.faceRight && !tile.properties.semisolid && tile.properties.solid) {
            this.staticEdge = tile.pixelX + tile.width;
            this.kickEdge = hitbox.body.position.x + hitbox.body.width;
            if (this.kickEdge > this.staticEdge)
            {
                this.kickOK = true;
                // reboundRan++;
            }
        }
        if (this.kickDirection == this.xDirection.RIGHT && tile.faceLeft && !tile.properties.semisolid && tile.properties.solid) {
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


        
        if (this.sideKick && this.kickOK) {
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
            // reboundRan++;
            this.sideKick = false;
        }
        this.kickOK = false;
        return true;
     }
 
}