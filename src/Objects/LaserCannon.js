import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a laser cannon. This will periodically fire a shot when it is on screen.
 * 
 * @author Tony Imbesi
 * @version 4/6/2022
 */
export default class Laser extends Enemy {
    constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        this.setTexture('laser');
        this.model = this.scene.model;

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
        this.fireTime = 100 * this.INTERVAL;
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
        this.L_HEIGHT = 22;
        this.L_OFFSET = 4;
        this.L_INCREMENT = 4;
        this.sprites = []; // Array used to draw and remove laser sprites
        this.warningSprite = this.scene.add.sprite(this.x, this.y, 'laserwarn');
        this.warningSprite.setVisible(false);
        this.warningSprite.setScrollFactor(0, 1);
        this.warningOffset = 40;
        this.laserWidth = 0;
        this.oldWidth = -1;

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

        this.warningSprite.anims.create({
            key: 'warn',
            frames: this.anims.generateFrameNumbers('laserwarn', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        this.sfxLaserCharge = this.scene.sound.add('enemyLaserCharge', { volume: 0.25, loop: false });
        // this.sfxLaserCharge.addMarker({ name: 'chargeLoop', start: 1 });
        this.sfxLaserFire = this.scene.sound.add('enemyLaserFire', { volume: 0.25, loop: false });
        this.sfxLaserFiring = this.scene.sound.add('enemyLaserFiring', { volume: 0.25, loop: true });

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
            this.warningSprite.setPosition(this.x, this.y - 32);
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

        this.checkAttachment();
        super.checkOutOfBounds();
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
        if (this.model.soundOn === true && !this.sfxLaserCharge.isPlaying) {
            this.sfxLaserCharge.play();
        }
        this.showWarning();
        if (this.timer != -1 && this.ticks >= this.timer) {
            this.timer = this.ticks + this.fireTime;
            this.sequence = this.seq.FIRE;
            this.count = 0;
            this.sfxLaserCharge.stop();
            if (this.model.soundOn === true && !this.sfxLaserFiring.isPlaying) {
                this.sfxLaserFire.play();
                this.sfxLaserFiring.play();
            }
            this.laserSetup();
        }
    }

    /**
     * Final part of the sequence. Fire the laser, and reset the cycle.
     */
    fire() {
        this.warningSprite.setVisible(false);
        this.anims.play('fire', true);
        this.drawLaser();
        this.checkLaserCollision();
        // console.log(this.oldWidth + 'vs. ' + this.laserWidth);
        
        if (this.oldWidth != this.laserWidth || this.oldWidth == -1) {
            this.clearSprites();
            this.drawLaserTexture();
            this.oldWidth = this.laserWidth;
            this.count++;
        }
        if (this.timer != -1 && this.ticks >= this.timer) {
            // console.log("Laser was drawn " + this.count + " times");
            this.resetState();
        }
    }

    /**
     * Helper method to remove every laser beam sprite created by drawLaser().
     */
    clearSprites() {
        this.sprites.forEach(s => {
            s.destroy();
        });
    }

    /**
     * Show the warning sprite
     */
    showWarning() {
        if (this.facing == this.xDirection.LEFT) {
            if (super.isRightOffScreen()) {
                console.log("Laser at " + this.x + " is to the right");
                this.warningSprite.anims.play('warn', true);
                this.warningSprite.setVisible(true);
                this.warningSprite.x = this.cam.displayWidth - this.warningOffset;
            }
            else {
                this.warningSprite.setVisible(false);
            }
        }
        else if (this.facing == this.xDirection.RIGHT) {
            if (super.isLeftOffScreen()) {
                console.log("Laser at " + this.x + " is to the left");
                this.warningSprite.anims.play('warn', true);
                this.warningSprite.setVisible(true);
                this.warningSprite.x = this.warningOffset;
            }
            else {
                this.warningSprite.setVisible(false);
            }
        }
    }

    /**
     * Set up the laser with its own physics body, texture, and collision.
     * TODO: Add the texture.
     */
    laserSetup() {
        if (this.facing == this.xDirection.LEFT) {
            this.laserBaseX = this.body.x + this.L_OFFSET;
        }
        else if (this.facing == this.xDirection.RIGHT) {
            this.laserBaseX = this.body.x + this.body.width - this.L_OFFSET;
        }
        this.laser = this.scene.add.rectangle(this.laserBaseX, this.laserBaseY, this.L_INCREMENT, this.L_HEIGHT);
        this.scene.physics.add.existing(this.laser);
        this.laser.setOrigin(0, 0.5);
        // console.log("Original X: " + this.laser.x);
        // console.log("Base X: " + this.laserBaseX);
        
        this.laser.body.setAllowGravity(false);
        this.laser.setDepth(2);
    }

    /**
     * Draws the laser until it runs into a solid wall.
     * It also updates this.laserWidth to the laser hitbox's new width.
     */
    drawLaser() {
        var i = 0;
        this.laser.x = this.laserBaseX;
        var boundsX = this.scene.physics.world.bounds.x;
        var boundsW = this.scene.physics.world.bounds.width;
        if (this.facing == this.xDirection.LEFT) {
            // Extend left
            var dx = this.getLeftCenter().x + this.L_OFFSET;
            var newWidth = this.L_INCREMENT;
            while (i < 400 && !super.checkWallManual(this.facing, dx, newWidth, this.laser.y, this.L_HEIGHT, this.map)
                && dx > boundsX) {
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
            this.laser.x -= dx;
            this.laser.setSize(newWidth, this.L_HEIGHT);
            // console.log("LEFT");
            // console.log('Width: ' + newWidth);
            // console.log('New X: ' + this.laser.x);
            // console.log('New DX: ' + dx);
            this.laser.body.setSize(newWidth, this.L_HEIGHT);
            this.laser.body.updateFromGameObject();
        }
        else if (this.facing == this.xDirection.RIGHT) {
            // Extend right
            var newWidth = this.L_INCREMENT;
            while (i < 400 && !super.checkWallManual(this.facing, this.laser.x, newWidth, this.laser.y, this.L_HEIGHT, this.map)
                && this.laser.x + newWidth < boundsW) {
                // this.laser.body.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                // this.laser.x += this.L_INCREMENT / 2;

                // this.laserMask.setSize(this.laser.body.width + this.L_INCREMENT, this.laser.body.height);
                // this.laserMask.x += this.L_INCREMENT / 2;

                newWidth += this.L_INCREMENT;
                i++;
            }
            this.laser.setSize(newWidth, this.L_HEIGHT);
            // console.log("RIGHT");
            // console.log('Width: ' + newWidth);
            // console.log('New X: ' + this.laser.x);
            this.laser.body.setSize(newWidth, this.L_HEIGHT);
            this.laser.body.updateFromGameObject();
        }
        this.laserWidth = newWidth;
    }

    checkLaserCollision() {
        if (this.scene.physics.overlap(this.laser, this.scene.player) && this.laser.active)
            this.scene.player.hurt(this.damage, this.recoilX, this.recoilY);
    }

    /**
     * Render the laser texture after finding the width of the laser hitbox.
     */
    drawLaserTexture() {
        if (this.facing == this.xDirection.LEFT) {
            // Render the laser from the left
            // Begin code reused from laserproblem4.txt
            var wTotal = this.laserWidth;
            var x = this.laser.x;
            var y = this.laser.y;
            var w3 = Math.min(32, wTotal);
            w3 = Math.max(8, w3);
            var sdx = x;
            var s3 = this.scene.add.image(sdx - 64, y, 'laserbeam');
            s3.setOrigin(0,0.5);
            s3.setCrop(s3.width - 96, 0, w3, 32);
            s3.setFlipX(true);
            s3.setDepth(3);
            this.sprites.push(s3);
            var w1 = 32;
            var w2 = 32;
            while (sdx + w2 < x + wTotal - w1) {
                sdx += w2;
                var s2 = this.scene.add.image(sdx - 32, y, 'laserbeam');
                s2.setOrigin(0,0.5);
                s2.setCrop(s2.width - 64, 0, w2, 32);
                s2.setFlipX(true);
                s2.setDepth(1);
                this.sprites.push(s2);
            }
            var s1 = this.scene.add.image(x + wTotal - w1, y, 'laserbeam');
            s1.setOrigin(0,0.5);
            s1.setCrop(s1.width - 32, 0, w1, 32);
            s1.setFlipX(true);
            s1.setDepth(2);
            this.sprites.push(s1);
            // End code from laserproblem4.txt
        }
        else if (this.facing == this.xDirection.RIGHT) {
            // Render the laser from the right
            // Begin code reused from laserproblem4.txt
            var wTotal = this.laserWidth;
            var x = this.laser.x;
            var y = this.laser.y;
            var w3 = Math.min(32, wTotal);
            w3 = Math.max(8, w3);
            var sdx = x + wTotal - w3;
            var s3 = this.scene.add.sprite(sdx - 64, y, 'laserbeam');
            s3.setOrigin(0,0.5);
            s3.setCrop(96 - w3, 0, w3, 32);
            s3.setDepth(3);
            this.sprites.push(s3);
            var w1 = 32;
            var w2 = 32;
            while (sdx > x + w1) {
                sdx -= w2;
                var s2 = this.scene.add.sprite(sdx - 32, y, 'laserbeam');
                s2.setOrigin(0,0.5);
                s2.setCrop(32, 0, w2, 32);
                s2.setDepth(1);
                this.sprites.push(s2);
            }
            var s1 = this.scene.add.sprite(x, y, 'laserbeam');
            s1.setOrigin(0,0.5);
            s1.setCrop(0, 0, w1, 32);
            s1.setDepth(2);
            this.sprites.push(s1);
            // End code from laserproblem4.txt
        }
    }
    /**
     * Reset this laser cannon's state.
     * Remove the laser, reset its timer, and reset its animation cycle.
     */
    resetState() {
        this.warningSprite.setVisible(false);
        if (this.laser != null)
            this.laser.destroy();
        // if (this.laserMask != null)
        //     this.laserMask.destroy();
        this.clearSprites();
        this.anims.play('idle', true);
        this.sfxLaserFiring.stop();
        this.sfxLaserCharge.stop();
        this.timer = -1;
        this.oldWidth = -1;
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
        // console.log("Current x: " + this.body.x);
        // console.log(!super.checkWall(this.xDirection.LEFT));
        if (this.alive) {
            if (this.facing == this.xDirection.LEFT && !super.checkWallManual(this.xDirection.RIGHT, this.body.x, this.body.width + 2)) {
                this.recoilVulnerable = true;
                // console.log("Check Attachment ran");
                this.hit(-this.recoilX, 0);
            }
            if (this.facing == this.xDirection.RIGHT && !super.checkWallManual(this.xDirection.LEFT, this.body.x - 2)) {
                this.recoilVulnerable = true;
                // console.log("Check Attachment ran");
                this.hit(this.recoilX, 0);
            }
        }
    }
}