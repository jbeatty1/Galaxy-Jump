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
        this.waitTime = 60 * this.INTERVAL;
        this.chargeTime = 120 * this.INTERVAL;
        this.fireTime = 90 * this.INTERVAL;
        this.seq = {
            WAIT: 0,
            CHARGE: 1,
            FIRE: 2,
            END: 3,
            STOPPED: 4,
        };
        this.sequence = this.seq.STOPPED;

        this.timer = -1;

        this.laser = null;
        this.L_WIDTH = 32;
        this.L_HEIGHT = 32;
        this.L_OFFSET = 4;
        this.L_INCREMENT = 8;

        this.anims.create({
            key: 'idle',
            frames: [{key: 'laser', frame: 0}],
            frameRate: 20
        });

        this.anims.create({
            key: 'notice',
            frames: this.anims.generateFrameNumbers('laser', { start: 0, end: 2 }),
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
            frameRate: 10,
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
            this.sequence = this.seq.STOPPED;
        }

        /** Timer */
        // Only update if not paused
        this.ticks += delta;

        if (super.isOnScreen() && this.alive) {
            this.beginShotSequence();
        }
        if (this.sequence === this.seq.WAIT) {
            this.wait();
        }
        else if (this.sequence === this.seq.CHARGE) {
            this.chargeSequence();
        }
        else if (this.sequence === this.seq.FIRE) {
            this.fire();
        }

        super.checkOutOfBounds();
    }

    beginShotSequence() {
        /** Play notice animation and begin sequence if it hasn't started/finished already */
        if (this.sequence === this.seq.STOPPED) {
            this.timer = this.ticks + this.waitTime;
            this.sequence = this.seq.WAIT;
        }
    }

    wait() {
        this.anims.play('notice', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.timer = this.ticks + this.chargeTime;
            this.sequence = this.seq.CHARGE;
        }
    }

    chargeSequence() {
        this.anims.play('charge', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.timer = this.ticks + this.fireTime;
            this.sequence = this.seq.FIRE;
            this.laserSetup();
        }
    }

    fire() {
        this.anims.play('fire', true);
        this.drawLaser();
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.resetState();
        }
    }

    laserSetup() {
        // Begin modified code from https://www.emanueleferonato.com/2019/04/24/add-a-nice-time-bar-energy-bar-mana-bar-whatever-bar-to-your-html5-games-using-phaser-3-masks/
        var laserX = 0;
        var laserY = this.getCenter().y;
        var originX = 0;
        if (this.facing == this.xDirection.LEFT) {
            laserX = this.getLeftCenter().x + this.L_OFFSET;
            originX = 1;
        }
        else if (this.facing == this.xDirection.RIGHT) {
            laserX = this.getRightCenter().x - this.L_OFFSET;
        }
        this.laser = this.scene.add.rectangle(laserX, laserY, this.L_WIDTH, this.L_HEIGHT);
        this.scene.physics.add.existing(this.laser);
        this.laser.setOrigin(originX, 0.5);
        
        this.laser.body.setAllowGravity(false);
        
        //  // a copy of the energy bar to be used as a mask. Another simple sprite but...
        this.laserMask = this.scene.add.sprite(laserX, laserY, 'laserbeam');
        this.laserMask.setOrigin(originX, 0.5);
        if (this.facing == this.xDirection.RIGHT)
            this.laserMask.toggleFlipX();

        // // ...it's not visible...
        this.laserMask.visible = false;
 
        // // and we assign it as energyBar's mask.
        this.laser.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.laserMask));
        // End modified code from https://www.emanueleferonato.com/2019/04/24/add-a-nice-time-bar-energy-bar-mana-bar-whatever-bar-to-your-html5-games-using-phaser-3-masks/
    }

    drawLaser() {
        var checkRange = this.L_WIDTH + this.L_OFFSET;
        var i = 0;
        if (this.facing == this.xDirection.LEFT) {
            // Extend left
            if (i < 1000 && !super.checkWallManual(this.facing, this.laser.body.position.x, this.laser.body.width, this.laser.y)) {
                this.laser.body.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                this.laser.x -= this.L_INCREMENT / 2;
                this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);

                this.laserMask.x -= this.L_INCREMENT / 2;
                //console.log(this.laser.body.position.x);
                i++;
            }
        }
        else if (this.facing == this.xDirection.RIGHT) {
            // Extend right
            if (i < 1000 && !super.checkWallManual(this.facing, this.laser.body.position.x, this.laser.body.width, this.laser.y)) {
                this.laser.body.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                this.laser.x += this.L_INCREMENT / 2;

                this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                this.laserMask.x += this.L_INCREMENT / 2;
                i++;
            }
        }

        if (this.scene.physics.overlap(this.laser, this.scene.player))
            this.scene.player.hurt(this.damage, this.recoilX, this.recoilY);
    }

    resetState() {
        if (this.laser != null)
            this.laser.destroy();
        if (this.laserMask != null)
            this.laserMask.destroy();
        this.anims.play('idle', true);
        this.timer = -1;
        this.sequence = this.seq.STOPPED;
    }

    hit(vx, vy) {
        super.hit(vx, vy);
        this.setAngularVelocity(Math.max(vx, vy));
        this.tileCollider.active = false;
        this.resetState();
    }

    
}