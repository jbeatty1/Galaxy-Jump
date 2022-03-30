import 'phaser';
import Enemy from './Enemy';

/**
 * Class modeling a comet hazard. This will travel in a straight line in direction
 * specified by its spawner.
 * 
 * @author Tony Imbesi
 * @version 3/29/2022
 */
export default class Comet extends Enemy {
    /**
     * Construct this element with the basic parameters for a sprite.
     * 
     * @param {Phaser.Scene} scene the scene
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} angle the angle at which the comet will travel
     */
    constructor (scene, x, y, angle) {
        super(scene, x, y, 'comet');
        this.setTexture('comet');
        // Basic variables:
        this.recoilVulnerable = true;
        this.alive = true;
        this.damage = 65;
        this.recoilX = 200;
        this.recoilY = 200;
        this.GRAVITY = 600;
        this.hitboxWidth = 32;
        this.hitboxHeight = 32;
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);

        this.body.setAllowGravity(false);

        this.moveSpeed = 200; // Movement speed for this enemy
        this.theAngle = angle * Math.PI / 180;
        

        this.moveVector = new Phaser.Math.Vector2(0, this.moveSpeed);
        this.moveVector.rotate(this.theAngle);
        this.tileCollider.active = false;
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('comet', { start: 0, end: 2 }),
            frameRate: 4,
            repeat: -1
        });
    }

    update(time, delta) {
        // console.log(this.alive);
        // console.log("x: " + this.x);
        // console.log("y: " + this.y);
        if (this.alive) {
            this.body.setAllowGravity(false);
            this.anims.play('move', true);
            this.setVelocity(this.moveVector.x, this.moveVector.y);
        }
        else {
            this.anims.play('move', true);
            super.checkOffScreen(true);
        }
        this.setRotation(this.body.velocity.angle() - Math.PI / 2 );
        // super.checkOffScreen(true);
    }

    hit(vx, vy) {
        super.hit(vx, vy);
        this.body.setAllowGravity(true);
        this.body.setBounce(0, 0);
    }
}