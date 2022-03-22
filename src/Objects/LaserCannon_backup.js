import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a laser cannon. This will periodically fire a shot when it is on screen.
 * 
 * @author Tony Imbesi
 * @version 3/19/2022
 */
export default class Laser extends Enemy {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        this.setTexture('laser');
        
        // Basic variables:
        this.alive = true;
        this.recoilVulnerable = false;
        this.contactDmg = false;
        this.damage = 70;
        this.recoilX = 300;
        this.recoilY = 200;

        this.hitboxWidth = 32;
        this.hitboxHeight = 28;
        this.GRAVITY = -700;

        this.camera = this.scene.cameras.main;
        // Set height manually
        //this.height = 34;
        //this.displayHeight = 40;


        this.moveSpeed = 0; // Movement speed for this enemy
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Entity-specific variables
        this.INTERVAL = 16;
        this.ticks = 0;
        this.waitTime = 40 * this.INTERVAL;
        this.chargeTime = 120 * this.INTERVAL;
        this.fireTime = 360 * this.INTERVAL;
        this.sequence = false;

        this.anims.create({
            key: 'idle',
            frames: [{key: 'laser', frame: 0}],
            frameRate: 20
        });

        this.anims.create({
            key: 'notice',
            frames: this.anims.generateFrameNumbers('laser', { start: 1, end: 2 }),
            frameRate: 2,
            repeat: 1
        });

        this.anims.create({
            key: 'charge',
            frames: this.anims.generateFrameNumbers('laser', { start: 3, end: 4 }),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('laser', { start: 5, end: 7 }),
            frameRate: 5,
            repeat: -1
        });

        this.init = false;
    }

    update(time, delta) {
        /** Initialize */
        // Set orientation:
        // If it's next to a wall on the left, face right
        // Or if there's a wall to the right, face left
        // This needs to happen here instead of the constructor because its position isn't updated
        // correctly until after it is constructed.
        if (!this.init) {
            if (super.checkWall(this.xDirection.LEFT)) {
                this.facing = this.xDirection.RIGHT;
            }
            if (super.checkWall(this.xDirection.RIGHT)) {
                this.facing = this.xDirection.LEFT;
            }
            this.anims.play('idle');
            console.log(this.facing + ', ' + this.x);
            this.init = true;
            this.sequence = true;
        }

        /** Timer */
        // Only update if not paused
        this.ticks += delta;

        if (super.isOnScreen()) {
            console.log('ON SCREEN AT ' + this.x);
            this.beginShotSequence(this.sequence);
        }
    }

    beginShotSequence() {
        /** Play notice animation and begin sequence if it hasn't started/finished already */
        var timer = -1;
        if (!this.sequence) {
            this.sequence = true;
            timer = this.ticks + this.waitTime;
            this.anims.play('notice', true);
        }
        if (timer != -1 && this.ticks >= timer) {
            this.chargeSequence();
        }
        
    }

    chargeSequence() {
        this.anims.play('charge', true);
    }

}