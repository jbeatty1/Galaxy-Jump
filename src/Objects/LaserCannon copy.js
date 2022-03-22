import 'phaser';
import Timer from '../Util/Timer';
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
        this.sequenceRunning = false;

        this.timer = -1;

        this.sequenceEnum = {
            WAIT: 0,
            CHARGE: 1,
            FIRE: 2,
            END: 3,
        };

        this.sequenceFunc = 0;

        this.anims.create({
            key: 'idle',
            frames: [{key: 'laser', frame: 0}],
            frameRate: 20
        });

        this.anims.create({
            key: 'notice',
            frames: this.anims.generateFrameNumbers('laser', { start: 1, end: 2 }),
            frameRate: 3,
            repeat: 1
        });

        this.anims.create({
            key: 'charge',
            frames: this.anims.generateFrameNumbers('laser', { start: 3, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('laser', { start: 5, end: 7 }),
            frameRate: 6,
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
            this.sequenceRunning = false;
        }

        /** Timer */
        // Only update if not paused
        this.ticks += delta;

        if (super.isOnScreen() && !this.sequenceRunning) {
            this.beginShotSequence();
        }
        this.continueSequence();
    }

    continueSequence() {
        if (this.sequenceRunning = true) {
            switch (this.sequenceFunc) {
                case this.sequenceEnum.WAIT: 
                    this.beginShotSequence();
                    break;
                case this.sequenceEnum.CHARGE:
                    this.chargeSequence();
                    break;
                case this.sequenceEnum.FIRE:
                    this.fire();
                    break;
                case this.sequenceEnum.END:
                    break;
                default:
                    break;
            }
        }
    }

    beginShotSequence() {
        /** Play notice animation and begin sequence if it hasn't started/finished already */
        if (!this.sequenceRunning) {
            console.log("Begin sequence");
            this.sequenceRunning = true;
            this.timer = this.ticks + this.waitTime;
            this.anims.play('notice', true);
            this.sequenceFunc = this.sequenceEnum.WAIT;
        }
        
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.sequenceFunc = this.sequenceEnum.CHARGE;
        }
    }

    chargeSequence() {
        this.anims.play('charge', true);
        console.log("Charge worked");
    }

    fire() {

    }

    resetState() {
        this.timer = -1;
        this.sequenceRunning = false;
    }

}