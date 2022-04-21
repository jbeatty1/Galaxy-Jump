import 'phaser';

/**
 * Class representing a checkpoint flag.
 * Touching this will remove the flag and make it so the player respawns at the flag's position from
 * that point onwards.
 * 
 * @author Tony Imbesi
 * @version 4/20/2022
 * Based on code from Josiah Cornelius
 */
export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
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
        super(scene, x, y, 'checkpoint');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.model = this.scene.model;
        this.triggered = false;

        // this.cam = this.scene.cameras.main;
        console.log("Checkpoint created");
        this.GRAVITY = 0;
        this.body.setAllowGravity(false);

        this.hitboxWidth = 32;
        this.hitboxHeight = 32;

        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        this.anims.create({
            key: 'active',
            frames: [{key: 'checkpoint', frame: 0}],
            frameRate: 20
        });
        this.anims.play('active', true);
        console.log(this.texture);
    }


    /**
     * Calling this method will cause the checkpoint to disappear.
     * @author Tony Imbesi
     * 
     * @param vx the horizontal initial velocity
     */
    trigger(vx) {
        // The UFO will only bounce downwards, not upwards.
        this.body.setAllowGravity(true);
        this.setGravityY(300);
        this.setVelocity(vx * 0.1, -300);
        this.setAngularVelocity(vx);
        this.triggered = true;
    }
}
