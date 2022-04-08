import 'phaser';
import Item from './Item';

/**
 * Class describing item behavior.
 * @author Tony Imbesi
 * @version 4/8/2022
 * 
 * Based on code by Josiah Cornelius
 */
export default class Coin extends Item {
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
        super(scene, x, y, 'coin');
        this.setTexture('coin');
        
        this.itemType = this.itemEnum.COIN;
        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
            frameRate: 9,
            repeat: -1
        });
        this.anims.play('spin', true);
    }
}