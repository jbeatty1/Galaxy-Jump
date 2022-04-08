// Code by Josiah Cornelius
// Modified by Tony Imbesi
// Version: 4/7/2022
import 'phaser';

/**
 * Class describing item behavior.
 */
export default class Item extends Phaser.Physics.Arcade.Sprite {
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
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.map = this.scene.map;
        this.cam = this.scene.cameras.main;
        console.log("Item created");
        this.GRAVITY = 0;
        this.body.setAllowGravity(false);
        this.itemEnum = {
            COIN: 0,
            LASER: 1,
            DOUBLEJUMP: 2,
            SPEEDUP: 3
        };

        this.itemType = null;

        this.hitboxWidth = 30;
        this.hitboxHeight = 30;

        this.body.setSize(this.hitboxWidth, this.hitboxHeight);

        // Text handling moved to Player.js
        // this.text = this.add.text(16, 16, '', {
        //     fontSize: '20px',
        //     fill: '#ffffff'
        // });
        // text.setScrollFactor(0);
        // updateCoinText();
    }

    /**
     * After being created using createFromObjects(), run this method to
     * update the item's type and texture.
     * @author Tony Imbesi
     * @version 4/8/2022
     */
    updateItemType() {
        if (this.itemType === "coin") {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
                frameRate: 9,
                repeat: -1
            });
        }
        else if (this.itemType === "laseritem") {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('laserItem', { start: 0, end: 1 }),
                frameRate: 9,
                repeat: -1
            });
        }
        else if (this.itemType === "doublejump") {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('doublejump', { start: 0, end: 1 }),
                frameRate: 9,
                repeat: -1
            });
        }
        else if (this.itemType === "speedup") {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('speedup', { start: 0, end: 1 }),
                frameRate: 9,
                repeat: -1
            });
        }

        this.anims.play('spin', true);
    }

    /** Item collision handling moved to Player.js */
    // hitCoin (map)
    // {
    //     coinLayer.removeTileAt(map.x, map.y);
    //     coinsCollected += 1;
    //     updateCoinText();
    //     return false;
    // }

//      updateCoinText ()
// {
//     text.setText(
//         '\nCoins collected: ' + coinsCollected
//     );
// }
}