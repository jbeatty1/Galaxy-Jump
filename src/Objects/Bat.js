import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a bat. This enemy will fly erratically towards the player's general direction.
 * 
 * @author Tony Imbesi
 * @version 3/30/2022
 */
export default class Bat extends Enemy {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        // this.setFrame('funbat', true, true);
        this.setTexture('funbat');
        
        // Basic variables:
        this.recoilVulnerable = true;
        this.alive = true;
        this.damage = 40;
        this.recoilX = 100;
        this.recoilY = -200;

        this.hitboxWidth = 16;
        this.hitboxHeight = 16;
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setBounce(1, 1);
        // this.body.setOffset(0, this.height - this.hitboxHeight);
        // Set height manually
        //this.height = 34;
        //this.displayHeight = 40;


        this.moveSpeed = 300; // Movement speed for this enemy
        this.INTERVAL = 16;
        this.moveTimer = 15 * this.INTERVAL;
        this.moveAngle = 120; // The enemy's movement will deviate by this many degrees positively or negatively.
        this.ticks = 0;
        
        
        
        // this.spikeCollider = this.scene.physics.add.collider(this, this.scene.spikes);

        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('funbat', { start: 0, end: 1 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'KO',
            frames: [ { key: 'funbat', frame: 2 } ],
            frameRate: 20
        });
    }
    
    update(time, delta) {
        // Check for on-screen presence to only start moving when the player approaches.
        if (this.alive)
            super.loadWhenOnScreen();
        if (this.alive && this.loaded) {
            /** Timer */
            // Only update if not paused
            this.ticks += delta;
            this.anims.play('move', true);
            if (this.ticks >= this.moveTimer) {
                // console.log('changed direction');
                // First, update the velocity vector to face the player.
                this.scene.physics.moveToObject(this, this.scene.player, this.moveSpeed);
                // Then, rotate it somewhere between -angle and +angle
                var angle = Phaser.Math.Between(-this.moveAngle, this.moveAngle);
                angle = angle * Math.PI / 180; // Convert to radians
                this.body.velocity.rotate(angle);
                this.ticks = 0;
            }
        }
        super.checkOutOfBounds();
    }

    hit(vx, vy) {
        super.hit(vx, vy);
        this.setAngularVelocity(Math.max(vx * 2, vy * 2));
        this.anims.play('KO', true);
        this.tileCollider.active = false;
    }
}
