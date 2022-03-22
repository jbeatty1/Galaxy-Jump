import 'phaser';

/**
 * This class ended up being unused. Spikes will be represented as normal tiles.
 */
export default class Spike extends Phaser.Physics.Arcade.Sprite {
    constructor (scene) {
        super(scene);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}