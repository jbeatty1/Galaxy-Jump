import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a jumping enemy.
 * 
 * @author Tony Imbesi
 * @version 3/20/2022
 */
export default class Jumpster extends Enemy {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        this.setTexture('jumpster');
        
        // Basic variables:
        this.recoilVulnerable = true;
        this.alive = true;
        this.damage = 55;
        this.recoilX = 200;
        this.recoilY = 200;

        this.hitboxWidth = 20;
        this.hitboxHeight = 14;
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(6, this.height - this.hitboxHeight);


        this.moveSpeed = 200; // Movement speed for this enemy
        this.jumpPower = -400; // Jump height
        this.gravBoost = 600;
        this.facing = this.xDirection.LEFT;

        this.INTERVAL = 16;
        this.ticks = 0;
        this.timer = -1;
        this.waitTime = 15 * this.INTERVAL;

        this.jumping = false;
        this.seq = {
            WAIT: 0,
            CHARGE: 1,
            JUMP: 2,
            STOPPED: 3,
        };
        this.sequence = this.seq.STOPPED;
        
        // this.spikeCollider = this.scene.physics.add.collider(this, this.scene.spikes);

        this.anims.create({
            key: 'idle',
            frames: [ { key: 'jumpster', frame: 0 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'prep',
            frames: [ { key: 'jumpster', frame: 1 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'up',
            frames: [ { key: 'jumpster', frame: 2 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'down',
            frames: [ { key: 'jumpster', frame: 3 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'KO',
            frames: [ { key: 'jumpster', frame: 4 } ],
            frameRate: 20
        });
    }

    update(time, delta) {
        if (this.alive) {
            /** Timer */
            // Only update if not paused
            this.ticks += delta;

            if (this.body.onFloor()) {
                this.body.setVelocity(0, 0);
                // Reset gravity on landing
                this.setGravityY(0);
                // Turn around to face player
                if (!super.facingPlayer()) {
                    super.turnAround();
                }
            }
            else {
                // 'Fast fall' if jumping past the player
                if (!super.facingPlayer()) {
                    this.setGravityY(this.gravBoost);
                }
                this.sequence = this.seq.STOPPED;
            }

            if (this.body.velocity.y <= 0) {
                this.anims.play('up');
            }
            else if (this.body.velocity.y > 0) {
                this.anims.play('down');
            }
            if (this.body.velocity.y < 0) {
                // Reset sequence here to make sure the jump actually happened beforehand
                this.sequence = this.seq.STOPPED;
            }

            if (super.isOnScreen() && this.alive && this.body.onFloor() && this.sequence === this.seq.STOPPED) {
                this.beginJump();
                //console.log("Starting");
            }

            if (this.sequence === this.seq.WAIT) {
                this.wait();
                //console.log("Waiting");
            }
            else if (this.sequence === this.seq.CHARGE) {
                this.chargeSequence();
                //console.log("Preparing");
            }
            else if (this.sequence === this.seq.JUMP) {
                this.jump();
                //console.log("Jumped");
            }

            if (this.facing == this.xDirection.LEFT && !this.body.onFloor()) {
                this.setVelocityX(-this.moveSpeed);
                // this.nextWall = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y);
                // this.nextFloor = this.map.getTileAtWorldXY(this.body.x - 1, this.body.y + this.body.height);
            }
            else if (this.facing == this.xDirection.RIGHT && !this.body.onFloor()) {
                this.setVelocityX(this.moveSpeed);
                // this.nextWall = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y);
                // this.nextFloor = this.map.getTileAtWorldXY((this.body.x + this.body.width) + 1, this.body.y + this.body.height);
            }

            if (super.checkWall(this.facing)) {
                super.turnAround();
            }
        }

        super.checkOutOfBounds();
    }

    beginJump() {
        if (!this.jumpStarted) {
            this.timer = this.ticks + this.waitTime;
            this.sequence = this.seq.WAIT;
        }
    }

    wait() {
        this.anims.play('idle', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            // console.log('waited');
            this.timer = this.ticks + this.waitTime;
            this.sequence = this.seq.CHARGE;
        }
    }

    chargeSequence() {
        this.anims.play('prep', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.jump();
            this.sequence = this.seq.JUMP;
        }
    }

    jump() {
        this.setVelocityY(this.jumpPower);
    }

    

    hit(vx, vy) {
        super.hit(vx, vy);
        // console.log(vx);
        
        this.setAngularVelocity(Math.max(vx, vy));
        this.anims.play('KO', true);
        this.tileCollider.active = false;
    }
}