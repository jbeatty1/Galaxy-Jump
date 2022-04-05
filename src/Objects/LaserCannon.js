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
        this.laserBaseX = 0;
        this.laserBaseY = 0;
        this.L_WIDTH = 32;
        this.L_HEIGHT = 32;
        this.L_OFFSET = 4;
        this.L_INCREMENT = 4;

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
            this.laserBaseY = this.getCenter().y;
            this.anims.play('idle');
            // console.log(this.facing + ', ' + this.laserBaseX);
            this.init = true;
            this.sequence = this.seq.STOPPED;
        }

        /** Timer */
        // Only update if not paused
        this.ticks += delta;

        // Manage the state of the laser. Each of the following methods will change
        // the sequence variable to update the laser's state.
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
        this.checkAttachment();
    }

    /**
     * Begins the firing sequence. The laser should be shown on screen before it starts
     * winding up a shot.
     */
    beginShotSequence() {
        /** Play notice animation and begin sequence if it hasn't started/finished already */
        if (this.sequence === this.seq.STOPPED) {
            this.timer = this.ticks + this.waitTime;
            this.sequence = this.seq.WAIT;
        }
    }

    /**
     * Next part of the sequence. Show the notice animation until it's time to charge.
     */
    wait() {
        this.anims.play('notice', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.timer = this.ticks + this.chargeTime;
            this.sequence = this.seq.CHARGE;
        }
    }

    /**
     * Next part of the sequence. Show the charging animation until it's time to fire.
     * It calls laserSetup() here so that it only runs once. Otherwise, it's similar
     * to the previous two methods.
     */
    chargeSequence() {
        this.anims.play('charge', true);
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.timer = this.ticks + this.fireTime;
            this.sequence = this.seq.FIRE;
            this.laserSetup();
        }
    }

    /**
     * Final part of the sequence. Fire the laser, and reset the cycle.
     */
    fire() {
        this.anims.play('fire', true);
        this.drawLaser();
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.resetState();
        }
    }

    /**
     * Set up the laser with its own physics body, texture, and collision.
     * TODO: Add the texture.
     */
    laserSetup() {
        // Begin modified code from https://www.emanueleferonato.com/2019/04/24/add-a-nice-time-bar-energy-bar-mana-bar-whatever-bar-to-your-html5-games-using-phaser-3-masks/
        if (this.facing == this.xDirection.LEFT) {
            this.laserBaseX = this.body.x + this.L_OFFSET;
        }
        else if (this.facing == this.xDirection.RIGHT) {
            this.laserBaseX = this.body.x + this.body.width - this.L_OFFSET;
        }
        this.laser = this.scene.add.rectangle(this.laserBaseX, this.laserBaseY, this.L_INCREMENT, this.L_HEIGHT);
        this.scene.physics.add.existing(this.laser);
        this.laser.setOrigin(0, 0.5);
        console.log("Original X: " + this.laser.x);
        console.log("Base X: " + this.laserBaseX);
        
        this.laser.body.setAllowGravity(false);
        
        // The following lines use a mask approach. I'm not sure if this is really the right way to do it.
        //  // a copy of the energy bar to be used as a mask. Another simple sprite but...
        this.laserMask = this.scene.add.sprite(this.laserBaseX, this.laserBaseY, 'laserbeam');
        this.laserMask.setOrigin(0, 0.5);
        if (this.facing == this.xDirection.RIGHT)
            this.laserMask.toggleFlipX();

        // // ...it's not visible...
        this.laserMask.visible = false;
 
        // // and we assign it as energyBar's mask.
        this.laser.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.laserMask));
        // End modified code from https://www.emanueleferonato.com/2019/04/24/add-a-nice-time-bar-energy-bar-mana-bar-whatever-bar-to-your-html5-games-using-phaser-3-masks/
    }

    /**
     * Draws the laser until it runs into a solid wall.
     * Currently it uses if statements to handle the extension.
     */
    drawLaser() {
        var i = 0;
        this.laser.x = this.laserBaseX;
        if (this.facing == this.xDirection.LEFT) {
            // Extend left
            var dx = this.getLeftCenter().x + this.L_OFFSET;
            var newWidth = this.L_INCREMENT;
            while (i < 1000 && !super.checkWallManual(this.facing, dx, newWidth, this.laser.y, this.L_HEIGHT, this.map)) {
                // this.laser.body.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                // this.laser.x -= this.L_INCREMENT / 2;
                // this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);

                // this.laserMask.x -= this.L_INCREMENT / 2;
                //console.log(this.laser.body.position.x);

                newWidth += this.L_INCREMENT;
                dx -= this.L_INCREMENT;
                // console.log("dx: " + dx);
                i++;
            }
            dx = newWidth;
            this.laser.setSize(newWidth, this.L_HEIGHT);
            this.laser.x -= dx;
            console.log("LEFT");
            console.log('Width: ' + newWidth);
            console.log('New X: ' + this.laser.x);
            console.log('New DX: ' + dx);
            this.laser.body.setSize(newWidth, this.L_HEIGHT);
        }
        else if (this.facing == this.xDirection.RIGHT) {
            // Extend right
            var newWidth = this.L_INCREMENT;
            while (i < 1000 && !super.checkWallManual(this.facing, this.laser.x, newWidth, this.laser.y, this.L_HEIGHT, this.map)) {
                // this.laser.body.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                // this.laser.x += this.L_INCREMENT / 2;

                // this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                // this.laserMask.x += this.L_INCREMENT / 2;

                newWidth += this.L_INCREMENT;
                i++;
            }
            this.laser.setSize(newWidth, this.L_HEIGHT);
            console.log("RIGHT");
            console.log('Width: ' + newWidth);
            console.log('New X: ' + this.laser.x);
            this.laser.body.setSize(newWidth, this.L_HEIGHT);
        }

        if (this.scene.physics.overlap(this.laser, this.scene.player))
            this.scene.player.hurt(this.damage, this.recoilX, this.recoilY);
    }

    /**
     * Reset this laser cannon's state.
     * Remove the laser, reset its timer, and reset its animation cycle.
     */
    resetState() {
        if (this.laser != null)
            this.laser.destroy();
        if (this.laserMask != null)
            this.laserMask.destroy();
        this.anims.play('idle', true);
        this.timer = -1;
        this.sequence = this.seq.STOPPED;
    }

    /**
     * In special cases, it can still be destroyed. 
     * @param {Number} vx the horizontal velocity
     * @param {Number} vy the vertical velocity
     */
    hit(vx, vy) {
        super.hit(vx, vy);
        this.body.setAllowGravity(true);
        this.setAngularVelocity(Math.max(vx, vy));
        this.tileCollider.active = false;
        this.resetState();
    }

    /**
     * If the laser is no longer attached to a solid tile, destroy it.
     */
    checkAttachment() {
        if (this.alive) {
            if (this.facing == this.xDirection.LEFT && !super.checkWall(this.xDirection.RIGHT)) {
                this.recoilVulnerable = true;
                this.hit(-this.recoilX, 0);
            }
            if (this.facing == this.xDirection.RIGHT && !super.checkWall(this.xDirection.LEFT)) {
                this.recoilVulnerable = true;
                this.hit(this.recoilX, 0);
            }
        }
    }
}