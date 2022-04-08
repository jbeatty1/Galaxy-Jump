import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a basic walking enemy. This version will only turn around if it hits a wall.
 * 
 * @author Tony Imbesi
 * @version 3/17/2022
 */
export default class Walker extends Enemy {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        this.setTexture('cone');
        
        // Basic variables:
        this.recoilVulnerable = true;
        this.alive = true;
        this.damage = 55;
        this.recoilX = 200;
        this.recoilY = 200;

        this.hitboxWidth = 30;
        this.hitboxHeight = 28;
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        // Set height manually
        //this.height = 34;
        //this.displayHeight = 40;


        this.moveSpeed = 100; // Movement speed for this enemy
        this.facing = this.xDirection.LEFT;
        this.nextWall = 1;
        
        // this.spikeCollider = this.scene.physics.add.collider(this, this.scene.spikes);

        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('cone', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'KO',
            frames: [ { key: 'cone', frame: 2 } ],
            frameRate: 20
        });
    }

    update(time, delta) {
        // Check for on-screen presence to only start moving when the player approaches.
        if (this.alive)
            super.loadWhenOnScreen();
        if (this.alive && this.loaded) {
            this.anims.play('move', true);

            if (this.facing == this.xDirection.LEFT) {
                this.setVelocityX(-this.moveSpeed);
                // this.nextWall = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y);
                // this.nextFloor = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y + this.body.height);
            }
            else if (this.facing == this.xDirection.RIGHT) {
                this.setVelocityX(this.moveSpeed);
                // this.nextWall = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y);
                // this.nextFloor = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y + this.body.height);
            }

            if (this.body.onFloor() && super.checkWall(this.facing)) {
                super.turnAround();
            }
            // if (this.nextFloor != null)
            //     console.log(this.nextFloor.y);
            
            // Turn if the wall one tile ahead is solid or if the floor one tile ahead is not solid
            // if (this.body.onFloor() && (this.nextWall != null && this.nextWall.properties.solid && !this.nextWall.properties.semisolid) ) {
            //     super.turnAround();
                
            //     // console.log('Tile at ' + this.nextWall.x + ', ' + this.nextWall.y + ' is solid,'
            //     //     + 'or tile at ' + this.nextFloor.x + ', ' + this.nextFloor.y + ' is not solid');
            // }
            // else if (this.nextWall != null)
            // console.log('Tile at ' + this.nextWall.x + ', ' + this.nextWall.y + ' is not solid');
        }

        super.checkOutOfBounds();
    }

    

    
    /**
     * Handles response to attacks.
     * Knock this enemy away.
     * 
     * @param  {Number} vx the x velocity
     * @param {Number} vy the y velocity
     */
    hit(vx, vy) {
        super.hit(vx, vy);
        // console.log(vx);
        
        this.setAngularVelocity(Math.max(vx, vy));
        this.anims.play('KO', true);
        this.tileCollider.active = false;
    }
}