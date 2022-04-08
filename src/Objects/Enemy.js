import 'phaser';

/**
 * General class describing basic enemy behavior.
 * 
 * @author Tony Imbesi
 * @version 3/20/2022
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    /**
     * Construct this element with the basic parameters for a sprite.
     * 
     * @param {Phaser.Scene} scene the scene
     * @param {Number} x 
     * @param {Number} y 
     * @param {String | Phaser.Textures.Texture} key the texture to use
     */
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.layer = this.scene.solids;
        this.map = this.scene.map;
        this.group = this.scene.enemies;
        this.cam = this.scene.cameras.main;
        this.camBoundary = 32; // The enemy can load in using loadWhenOnScreen from this many pixels away outside the camera.

        // Basic variables:
        this.alive = true;
        this.loaded = false;
        this.recoilVulnerable = true;
        this.contactDmg = true;
        this.damage = 0;
        this.recoilX = 200;
        this.recoilY = 200;
        this.heavy = false;
        this.spawner = false;   // This is only true for internal "spawner" entities.
        this.toDestroy = false;

        this.hitboxWidth = 32;
        this.hitboxHeight = 32;
        this.GRAVITY = 0;
        // Set height manually
        //this.height = 34;
        //this.displayHeight = 40;

        this.xDirection = {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            NONE: 4
        };

        this.facing = this.xDirection.LEFT;
        
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        this.body.setAllowGravity(true);
        this.setGravityY(this.GRAVITY);
        this.setDepth(2);
        
        this.INTERVAL = 16;
        this.ticks = 0;

        this.tileCollider = this.scene.physics.add.collider(this, this.layer);
        this.breakCollider = this.scene.physics.add.overlap(this, this.layer, this.breakTile, null, this);
        this.selfCollider = this.scene.physics.add.overlap(this, this.group, this.checkSelfCollision, null, this);
        
    }

    update(time, delta) {
        // Override this method
    }

    /**
     * Check to see if there is a solid tile directly to a side of this enemy.
     * 
     * @param {Enemy.xDirection} direction the direction. Cannot be NONE
     */
    checkWall(direction) {
        var nextWall = null;
        if (direction == this.xDirection.LEFT) {
            nextWall = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y);
        }
        else if (direction == this.xDirection.RIGHT) {
            nextWall = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y);
        }
        else if (direction == this.xDirection.UP) {
            nextWall = this.map.getTileAtWorldXY(this.getCenter().x, this.body.y);
        }
        else if (direction == this.xDirection.DOWN) {
            nextWall = this.map.getTileAtWorldXY(this.getCenter().x, this.body.y + this.body.height);
        }

        if (nextWall != null && nextWall.properties.solid && !nextWall.properties.semisolid) {
            //console.log('Tile at: ' + nextWall.x + ', ' + nextWall.y + ' is solid');
            return true;
        }
        else {
            // if (nextWall!= null) {
            //     //console.log('Tile at: ' + nextWall.x + ', ' + nextWall.y + ' is not solid');
            // }
            // else {
            //     //console.log('nextWall is null');
            // }
            return false;
        }
    }

    /**
     * Check to see if there is a solid tile given an x and y position and a width or height.
     * This is a more manual version of the one-argument checkWall method.
     * 
     * @param {Enemy.xDirection} direction the direction, left or right
     * @param {Number} x the x
     * @param {Number} width the width
     * @param {Number} y the y
     * @param {Number} height the height
     * @param {Phaser.Tilemaps.Tilemap} map the tilemap
     */
     checkWallManual(direction, x, width, y, height, map) {
        var nextWall = null;
        if (x == undefined) {
            x = this.body.x;
        }
        if (y == undefined) {
            y = this.body.y;
        }
        if (width == undefined) {
            width = this.body.width;
        }
        if (height == undefined) {
            height = this.body.height;
        }
        if (map == undefined) {
            map = this.map;
        }
        if (direction == this.xDirection.LEFT) {
            nextWall = map.getTileAtWorldXY(x - 1, y);
        }
        else if (direction == this.xDirection.RIGHT) {
            nextWall = map.getTileAtWorldXY((x + width) + 1, y);
        }
        else if (direction == this.xDirection.UP) {
            nextWall = map.getTileAtWorldXY(x, y);
        }
        else if (direction == this.xDirection.DOWN) {
            nextWall = map.getTileAtWorldXY(x, y + height);
        }

        if (nextWall != null && nextWall.properties.solid && !nextWall.properties.semisolid) {
            // console.log('Collided with: ' + nextWall.x + ', ' + nextWall.y + '; x: ' + x);
            // if (direction == this.xDirection.LEFT) {
            //     console.log("left")
            // }
            // else {
            //     console.log("right");
            // }
            return true;
        }
        else {
                // if (nextWall!= null) {
                //     console.log('Tile at: ' + nextWall.x + ', ' + nextWall.y + ' is not solid');
                // }
                // else {
                //     console.log('nextWall is null, x: ' + x);
                // }
            return false;
        }
    }

    /**
     * Check to see if there is either a solid wall or a non-solid floor directly to the left and right of this enemy.
     * 
     * @param {Enemy.xDirection} direction the direction, left or right
     */
     checkWallAndFloor(direction) {
        var nextWall = null;
        var nextFloor = null;
        if (direction == this.xDirection.LEFT) {
            nextWall = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y);
            nextFloor = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y + this.body.height);
        }
        else if (direction == this.xDirection.RIGHT) {
            nextWall = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y);
            nextFloor = this.map.getTileAtWorldXY((this.body.x + this.hitboxWidth) + 1, this.body.y + this.body.height);
        }

        if ((nextWall != null && nextWall.properties.solid && !nextWall.properties.semisolid)
        || (nextFloor == null || !nextFloor.properties.solid)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Break through special tiles if this enemy is launched through them.
     */
    breakTile(enemy1, tile) {
        if (!this.alive && tile.properties.projectile) {
            // Reused code from Player.js. It would be good to have this available to both Enemy.js and Player.js
            // in an external class.
            this.group.getChildren().forEach(e => {
                if (e.alive && e.body.enable) { 
                    if (this.layer.getTileAtWorldXY(e.x, e.y + e.body.height + 1) === tile
                        || this.layer.getTileAtWorldXY(e.x - 1, e.y) === tile
                        || this.layer.getTileAtWorldXY(e.x + e.body.width + 1, e.y) === tile) {
                        e.recoilVulnerable = true;
                        e.body.setAllowGravity(true);
                        e.hit(this.body.velocity.x, -150);
                        // console.log("Enemy clause worked");
                    }
                }
            });

            this.layer.removeTileAt(tile.x, tile.y);
        }
    }

    /**
     * Turns the enemy around by changing its direction and flipping its graphics horizontally.
     */
    turnAround() {
        if (this.facing == this.xDirection.LEFT) {
            this.facing = this.xDirection.RIGHT; 
        }
        else if (this.facing == this.xDirection.RIGHT) {
            this.facing = this.xDirection.LEFT; 
        }
        this.toggleFlipX();
    }

    /**
     * Handles response to attacks.
     * Knock this enemy away.
     * 
     * @param  {Number} vx the x velocity
     * @param {Number} vy the y velocity
     */
    hit(vx, vy) {
        // console.log(vx);
        if (!this.recoilVulnerable)
            return;

        // console.log("ENEMY HIT");
        this.alive = false;
        this.body.setVelocityX(vx);
        this.body.setVelocityY(vy);
        this.body.setBounce(1, 1);
        // this.setAngularVelocity(Math.max(vx, vy));
        // this.anims.play('KO', true);
    }

    /**
     * Unloads the enemy if it moves out of bounds.
     */
    checkOutOfBounds() {
        if ((this.body.position.x + this.body.width < 0) || this.body.position.x > this.scene.WORLD_WIDTH
            || this.body.position.y > this.scene.WORLD_HEIGHT) {
            this.alive = false;
            this.disableBody(true, true);
            // this.toDestroy = true;
        }
    }

    /**
     * Check for collision between this enemy and another enemy to knock out that enemy.
     * 
     * @param {Enemy} enemy1 the enemy calling this method
     * @param {Enemy} enemy2 the enemy that has been collided with
     */
    checkSelfCollision(enemy1, enemy2) {
        //console.log("Collision ran");
        if (this.recoilVulnerable && this.alive && !enemy2.alive && enemy2 instanceof Enemy) {
            // console.log("SELF COLLISION");
            // console.log("enemy2 x: " + enemy2.x);
            this.hit(-enemy2.body.velocity.x * 0.5, -enemy2.body.velocity.y * 0.7);
            this.body.setBounce(1, 1);
            this.scene.physics.collide(this, enemy2);
        }
    }

    /**
     * Checks if the enemy is currently visible on screen.
     * @returns {Boolean} true if the enemy is on screen, false otherwise
     */
    isOnScreen() {
        var cameraBounds = new Phaser.Geom.Rectangle(this.cam.scrollX, this.cam.scrollY, this.cam.displayWidth, this.cam.displayHeight);
        //console.log(cameraBounds.x + ', ' + cameraBounds.width);
        return cameraBounds.contains(this.getCenter().x, this.getCenter().y);
    }

    /**
     * Disables an enemy's body until it first appears near the screen.
     * When this happens, the loaded flag is set to true.
     */
    loadWhenOnScreen() {
        var cameraBounds = new Phaser.Geom.Rectangle(this.cam.scrollX - this.camBoundary, this.cam.scrollY - this.camBoundary, this.cam.displayWidth + this.camBoundary * 2, this.cam.displayHeight + this.camBoundary * 2);
        if (cameraBounds.contains(this.getCenter().x, this.getCenter().y)) {
            this.loaded = true;
            this.enableBody();
        }
        else if (!this.loaded) {
            this.disableBody();
        }
    }

    /**
     * If this is called during the update method, it will load and unload/despawn the enemy
     * based on its appearance on screen.
     * 
     * @param {Boolean} despawn whether this enemy should despawn when it is on screen or not
     */
    checkOffScreen(despawn) {
        if (this.isOnScreen() && this.body.enable) {
            this.enableBody(false, this.x, this.y, true, true);
        }
        else if (despawn) {
            // console.log('ENEMY KILLED');
            this.alive = false;
            this.disableBody(true, true);
            // this.toDestroy = true;
        }
        else {
            this.disableBody(false, false);
        }
    }

    /**
     * Check to see if this enemy is facing the player, defined as being to the left of the player and facing right or vice versa.
     * 
     * @returns true if this enemy is facing the player, false otherwise
     */
    facingPlayer() {
        return (this.facing == this.xDirection.RIGHT && this.x < this.scene.player.getCenter().x)
            || (this.facing == this.xDirection.LEFT && (this.x + this.body.width) > this.scene.player.getCenter().x);
    }
}

/**
* Check to see if there is a solid tile given an x and y position and a width or height.
* This is a more manual version of the one-argument checkWall method.
* 
* @param {Enemy.xDirection} direction the direction, left or right
* @param {Number} x the x
* @param {Number} width the width
* @param {Number} y the y
* @param {Number} height the height
* @param {Phaser.Tilemaps.Tilemap} map the tilemap
*/
export function checkWallManual(direction, x, width, y, height, map) {
    var nextWall = null;
    var xDirection = {
     LEFT: 0,
     RIGHT: 1,
     UP: 2,
     DOWN: 3,
     NONE: 4
     };
 
    if (direction == xDirection.LEFT) {
        nextWall = map.getTileAtWorldXY(x - 1, y);
    }
    else if (direction == xDirection.RIGHT) {
        nextWall = map.getTileAtWorldXY((x + width) + 1, y);
    }
    else if (direction == xDirection.UP) {
        nextWall = map.getTileAtWorldXY(x + width / 2, y - 1);
    }
    else if (direction == xDirection.DOWN) {
        nextWall = map.getTileAtWorldXY(x + width / 2, (y + height) + 1);
    }
 
    if (nextWall != null && nextWall.properties.solid && (!nextWall.properties.semisolid || direction == xDirection.DOWN)) {
        console.log(nextWall.x + ', ' + nextWall.y);
        return true;
    }
    else {
        // if (direction == this.xDirection.LEFT)
        //     if (nextWall!= null) {
        //         //console.log('Tile at: ' + nextWall.x + ', ' + nextWall.y + ' is not solid');
        //     }
        //     else {
        //         //console.log('nextWall is null');
        //     }
        return false;
    }
 }
 
 /**
  * Check to see if this object is on screen.
  * @returns true if the object is on screen
  */
 export function isOnScreen() {
     var cameraBounds = new Phaser.Geom.Rectangle(this.cam.scrollX, this.cam.scrollY, this.cam.displayWidth, this.cam.displayHeight);
     //console.log(cameraBounds.x + ', ' + cameraBounds.width);
     return cameraBounds.contains(this.getCenter().x, this.getCenter().y);
 }