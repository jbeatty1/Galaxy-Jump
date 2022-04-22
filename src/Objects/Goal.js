import 'phaser';

/**
 * Class representing the goal UFO.
 * Touching this will trigger the end-of-level sequence and take you to the next course as determined by the
 * course's scene.
 * @author Tony Imbesi
 * @version 4/19/2022
 * Based on code from Josiah Cornelius
 */
export default class Goal extends Phaser.Physics.Arcade.Sprite {
    /**
     * Construct this element with the basic parameters
     *
     * @param {Phaser.Scene} scene
     * @param {Number} width the width
     * @param {Number} height the height
     * @param {String | Phaser.Textures.Texture} key the texture to use
    */
    constructor (scene, x, y) {
        // Basic construction function calls
        super(scene, x, y, 'goal1');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.map = this.scene.map;
        // this.cam = this.scene.cameras.main;
        console.log("Goal created");
        this.GRAVITY = 0;
        this.body.setAllowGravity(false);

        this.hitboxWidth = 56;
        this.hitboxHeight = 40;

        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('goal1', { start: 0, end: 2 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'active',
            frames: [{key: 'goal1', frame: 3}],
            frameRate: 20
        });
        this.anims.play('idle', true);
        this.setDepth(2);
        console.log(this.texture);
    }


    /**
     * Calling this method will cause the UFO to fly away as part of the level ending animation.
     * @author Tony Imbesi
     * 
     * @param vx the horizontal initial velocity
     * @param vy the vertical initial velocity
     */
    flyAway(vx, vy) {
        // The UFO will only bounce downwards, not upwards.
        this.anims.play('active', true);
        if (vy < 0) {
            vy = 0;
        }

        this.setVelocity(vx, vy);
        // The UFO should always fly upwards.
        vy = Math.min(-300, vy);
        var ay = vy * 3;
        this.setAcceleration(-vx * 1.5, ay);
    }
}
