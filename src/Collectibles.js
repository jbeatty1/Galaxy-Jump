// Code by Josiah Cornelius

import 'phaser';

export default class Collectibles extends Phaser.Physics.Arcade.Sprite {
    /**
     * Construct this element with the basic parameters
     *
     * @param {Phaser.Scene} scene
    * @param {Number} width the width
     * @param {Number} height the height
     * @param {Phaser.Tilemaps.Tilemap} map
    */

    constructor (scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.map = this.scene.map;
        this.group = this.scene.enemies;
        this.cam = this.scene.cameras.main;

        this.coinsCollected = 0;
        this.coinTiles = map.addTilesetImage('coin');
        this.coinLayer =  map.createLayer('Coin Layer', coinTiles, 0, 0);
        this.groundLayer.setCollisionBetween(1, 25);
        this.GRAVITY = 0;
        this.body.setSize(this.hitboxWidth, this.hitboxHeight);
        this.body.setOffset(0, this.height - this.hitboxHeight);
        this.body.setAllowGravity(true);
        this.tileCollider = this.scene.physics.add.collider(this, this.layer);
        this.selfCollider = this.scene.physics.add.overlap(this, this.group, this.checkSelfCollision, null, this);
        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setScrollFactor(0);
        updateCoinText();
    }

    hitCoin (map)
    {
        coinLayer.removeTileAt(map.x, map.y);
        coinsCollected += 1;
        updateCoinText();
        return false;
    }

     updateCoinText ()
{
    text.setText(
        '\nCoins collected: ' + coinsCollected
    );
}

}
