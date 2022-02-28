// Code modified from https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/
import 'phaser';
const INTERVAL = 16;
var player;

// Player's appearance:
const P_WIDTH = 32; // Width of the sprite
const P_HEIGHT = 48; // Height of the sprite
const P_WFRAC = 0.75; // Percentage of sprite body filled horizontally by hitbox
const P_HFRAC = 0.75; // Percentage of sprite body filled vertically by hitbox

// Player's movement variables:
const P_XVEL_SOFTMAX = 320; // Soft limit to max horizontal speed. Can be broken by various methods.
const P_XVEL_HARDMAX = 900; // Hard limit to max horizontal speed
const P_YVEL_HARDMAX = 900; // Hard limit to max vertical speed
// We can get the player's velocity at any time using player.body.velocity.x
const P_XACCEL = 1800; // Default horizontal acceleration
const P_JUMP = -400; // Jump velocity
const P_JUMP_ACCEL = -2750; // Jump acceleration. Vertical acceleration is unchanged by gravity but still affects vertical movement.
const P_JUMP_BRAKE = 800; // Cancel out jump acceleration at the end of a jump
const P_DRAG = 800; // Default drag
const P_DRAG_AIR = 80; // Air drag
const P_GRAV = 1700; // Player gravity. Total gravity = world gravity + player gravity
const P_BOUNCE = 0.5;

var pHitboxes;
var sideKickBox;
const K_KICK_VEL = 400; // Base velocity from kicking an object
const K_SIDEKICK_Y = -100; // Height gained from side-kicking
const K_SIDEKICK_W = 40;  // Width of hitbox
const K_SIDEKICK_H = 48;  // Height of hitbox

var tickCount = 0;
var ticksToJumpEnd = 0;
var maxJumpTicks = 15 * INTERVAL;
var isJumping = false;

var maxKickTicks = 15 * INTERVAL;
var sideKick = false;
var kickOK = false;
var staticEdge = 0;
var kickEdge = 0;

var xDirection = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
};
var xFacing = 0;
var kickDirection = 0;
var kickAgain = true;

var cursors;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * Sets up the player with all movement abilities.
     * @param x the starting x position
     * @param y the starting y position
     * @spritesheet the key of the spritesheet to use
     * @scene the current scene
     * @solids the tile layer for solid terrain
     * @semisolids the tile layer
     * @input the keyboard input
     */
    constructor(scene, x, y, spritesheet, solids, semisolids, input) {
        super(scene, x, y, spritesheet);
        
        // Player Physics
        this.body.setBounceX(P_BOUNCE); // 1st parameter is x-bounce, 2nd is y-bounce
        this.body.setGravityY(P_GRAV);
        // this.body.setFrictionX(3); // I couldn't get this to work, but I'm using drag to slow the player down anyway.
        this.body.setDragX(P_DRAG);
        this.body.setMaxVelocityY(P_YVEL_HARDMAX);

        this.body.setSize(Math.floor(P_WIDTH * P_WFRAC), Math.floor(P_HEIGHT * P_HFRAC), true); // false means it won't reposition to player's center
        this.body.setOffset(Math.floor(P_WIDTH * ((1 - P_HFRAC) * 0.5)), P_HEIGHT * (1 - P_HFRAC));

        this.setCollideWorldBounds(true);
        //platCollider = this.physics.add.collider(player, platforms);   
        
        // Tile collider
        scene.physics.add.collider(this, solids);
        scene.physics.add.collider(this, semisolids);
        
        // Player animations. The keys can be remade using an enumeration.
        // Left animation for premade "dude" asset
        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers(spritesheet, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'turn',
            frames: [ { key: spritesheet, frame: 4 } ],  // Change frame number if using a different player sprite
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
        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers(spritesheet, { start: 5, end: 8 }),
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
        pHitboxes = scene.physics.add.group();
        sideKickBox = scene.add.rectangle(-10, -10, K_SIDEKICK_W, K_SIDEKICK_H);
        pHitboxes.add(sideKickBox);

        // The hitbox's position changes, but it does not actually have velocity.
        // This means it will not actually "collide" with anything, but it can still overlap with things.
        // To check if the hitbox touches a solid tile, we need the canCollide instance variable.
        // This overlap can pass individual tiles into the rebound method, so we can check if any
        // overlapped tiles have their canCollide value set to true.
        scene.physics.add.overlap(pHitboxes, solids, null, scene.rebound, this);

        // Set controls for player
        cursors = input;
    }

    update(time) {
        if (cursors.left.isDown)
        {
            this.moveX(-P_XACCEL);
            xFacing = xDirection.LEFT;
            this.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            this.moveX(P_XACCEL);
            xFacing = xDirection.RIGHT;
            this.anims.play('right', true);
        }
        // Else: no buttons pressed. Set acceleration to 0 and decrease speed with friction.
        else
        {
            this.setAccelerationX(0);
            this.anims.play('turn');
        }

        // Jump
        if (cursors.up.isDown && this.body.onFloor())
        {
            isJumping = true;
            this.setVelocityY(P_JUMP);
            ticksToJumpEnd = time + maxJumpTicks;
        }
        // Jump height increases with duration of button press
        if (cursors.up.isDown && isJumping && time < ticksToJumpEnd)
        {
            this.setAccelerationY(P_JUMP_ACCEL);
        }

        // End jump after releasing button or holding the button long enough
        if (cursors.up.isUp || !isJumping || time >= ticksToJumpEnd)
        {
            isJumping = false;
            if (this.body.velocity.y < 0) {
                this.setAccelerationY(P_JUMP_BRAKE);
            }
            else {
                // Player is still affected by gravity
                this.setAccelerationY(0);
            }
        }

        // Player is slowed down more on the ground
        if (this.body.onFloor()){
            this.setDragX(P_DRAG);
            kickAgain = true;
        }
        else {
            this.setDragX(P_DRAG_AIR);
        }

        // Do a side kick
        if (cursors.space.isDown
            && !(this.body.onFloor()) && !sideKick && kickAgain)
        {
            sideKick = true;
            kickAgain = false;
            // sideKickBox.enableBody(false, 0, 0, true, true);
            sideKickBox.body.setEnable(true);
            ticksToKickEnd = time + maxKickTicks;
        }
        if (sideKick && time < ticksToKickEnd)
        {
            this.alignWithPlayer(sideKickBox, 30, 0);
        }
        if (!sideKick || time >= ticksToKickEnd || this.body.onFloor())
        {
            sideKick = false;
            sideKickBox.body.setEnable(false);
            kickDirection = xDirection.NONE;
        }
        if (cursors.space.isUp && !sideKick) {
            kickAgain = true;
        }

        // Hard cap to horizontal speed
        if (this.body.velocity.x > P_XVEL_HARDMAX) {
            this.setVelocityX(P_XVEL_HARDMAX);
        }
        if (this.body.velocity.x < -P_XVEL_HARDMAX) {
            this.setVelocityX(-P_XVEL_HARDMAX);
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
         if ((-P_XVEL_SOFTMAX <= this.body.velocity.x && ax < 0) 
             || (this.body.velocity.x <= P_XVEL_SOFTMAX && ax > 0)) {
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
         if (kickDirection == xDirection.NONE) {
             kickDirection = xFacing;
         }
 
         if (kickDirection == xDirection.LEFT) {
             rect.setPosition(this.body.center.x - xDiff, this.body.center.y);
         }
         else if (kickDirection == xDirection.RIGHT) {
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
     rebound(pHitboxes, tile)
     {
         // The top and bottom of the hitbox can be higher or lower than the player hitbox.
         // The rebound should only happen if it hits the corner or edge of a surface AND if that surface isn't semisolid.
         if (kickDirection == xDirection.LEFT && tile.faceRight && !tile.properties.semisolid && tile.properties.solid) {
             staticEdge = tile.pixelX + tile.width;
             kickEdge = pHitboxes.body.position.x + pHitboxes.body.width;
             if (kickEdge > staticEdge)
             {
                 kickOK = true;
                 // reboundRan++;
             }
         }
         if (kickDirection == xDirection.RIGHT && tile.faceLeft && !tile.properties.semisolid && tile.properties.solid) {
             staticEdge = tile.pixelX;
             kickEdge = pHitboxes.body.position.x;
             if (kickEdge < staticEdge)
             {
                 kickOK = true;
                 // reboundRan++;
             }
         }
         
         // if ((xFacing == xDirection.LEFT && pHitboxes.body.blocked.left)
         //     || (xFacing == xDirection.RIGHT && pHitboxes.body.blocked.right)) {
         //     kickOK = true;
         // }
 
 
         
         if (sideKick && kickOK) {
             var pvx = this.body.velocity.x;
             // Left side kick: Right rebound
             if (kickDirection == xDirection.LEFT) {
                 // player.setPosition(player.body.position.x + kickXOffset, player.body.position.y);
                 // Invert pvx if player is also moving left
                 if (this.body.velocity.x < 0) {
                     pvx = -pvx;
                 }
                 this.setVelocityX(pvx + K_KICK_VEL);
                 lastKick_V = pvx + K_KICK_VEL;
                 xFacing = xDirection.RIGHT;
                 // temporarily suppress left movement?
                 // reboundRan++;
             }
             // Right side kick: Left rebound
             else if (kickDirection == xDirection.RIGHT) {
                 // player.setPosition(player.body.position.x - kickXOffset, player.body.position.y);
                 // Invert pvx if player is also moving right
                 if (this.body.velocity.x > 0) {
                     pvx = -pvx;
                 }
                 this.setVelocityX(pvx - K_KICK_VEL);
                 lastKick_V = pvx - K_KICK_VEL;
                 xFacing = xDirection.LEFT;
                 // temporarily suppress right movement?
                 // reboundRan++;
             }
             // Slight vertical boost
             this.setVelocityY(Math.min(this.body.velocity.y, K_SIDEKICK_Y));
             reboundRan++;
             sideKick = false;
         }
         kickOK = false;
         return true;
     }
 
}