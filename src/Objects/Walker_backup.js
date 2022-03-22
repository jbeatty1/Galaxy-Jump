import 'phaser';

/**
 * Class modeling a basic walking enemy.
 */
export default class Walker extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.layer = this.scene.solids;
        this.map = this.scene.map;
        

        // Basic variables:
        this.hitboxWidth = 32;
        this.hitboxHeight = 28;
        this.GRAVITY = 1000;
        // Set height manually
        this.height = 40;
        this.displayHeight = 40;

        this.xDirection = {
            LEFT: 0,
            RIGHT: 1,
            NONE: 2
        };

        this.moveSpeed = 100; // Movement speed for this enemy
        this.facing = this.xDirection.LEFT;
        this.nextTile = 1;
        
        
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        this.body.setAllowGravity(true);
        this.setGravityY(this.GRAVITY);
        console.log(this.body.gravity.y);
        

        this.tileCollider = this.scene.physics.add.collider(this, this.layer);
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
        if (this.active) {
            this.anims.play('move', true);

            if (this.facing == this.xDirection.LEFT) {
                this.setVelocityX(-this.moveSpeed);
                this.nextTile = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y);
            }
            else if (this.facing == this.xDirection.RIGHT) {
                this.setVelocityX(this.moveSpeed);
                this.nextTile = this.map.getTileAtWorldXY((this.body.x + this.hitboxWidth) + 1, this.body.y);
            }

            
            if (this.nextTile != null && this.nextTile.properties.solid && !this.nextTile.properties.semisolid) {
                this.turnAround();
                
                console.log('Tile at ' + this.nextTile.x + ', ' + this.nextTile.y + ' is solid');
            }
        }
    }

    

    turnAround() {
        if (this.facing == this.xDirection.LEFT) {
            this.facing = this.xDirection.RIGHT; 
        }
        else if (this.facing == this.xDirection.RIGHT) {
            this.facing = this.xDirection.LEFT; 
        }
        this.toggleFlipX();
    }
}