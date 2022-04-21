import 'phaser';
import Item from './Item';

/**
 * Class describing item behavior.
 * @author Tony Imbesi
 * @version 4/8/2022
 * 
 * Based on code by Josiah Cornelius
 */
export default class LaserItem extends Item {
    /**
     * Construct this element with the basic parameters
     *
     * @param {Phaser.Scene} scene
     * @param {Number} width the width
     * @param {Number} height the height
     * @param {String | Phaser.Textures.Texture} key the texture to use
    */
     constructor (scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        this.setTexture('laserItem');
        this.textureKey = 'laserItem';
        
        this.itemType = this.itemEnum.LASER;

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('laserItem', { start: 0, end: 1 }),
            frameRate: 9,
            repeat: -1
        });
        this.anims.play('spin', true);
    }
}