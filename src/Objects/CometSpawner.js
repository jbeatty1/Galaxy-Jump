import 'phaser';
import Enemy from './Enemy';
import Comet from './Comet';
import {isOnScreen} from './Enemy';

/**
 * Class representing a comet spawner. This will periodically spawn the Comet hazard.
 * Rotating its sprite in the Tiled editor will change the angle of the comets it spawns.
 * 
 * @author Tony Imbesi
 * @version 3/29/2022
 */
export default class CometSpawner extends Phaser.Physics.Arcade.Sprite {
    /**
     * Construct this element with the basic parameters for a sprite.
     * 
     * @param {Phaser.Scene} scene the scene
     * @param {Number} x 
     * @param {Number} y 
     * @param {String | Phaser.Textures.Texture} key the texture to use
     */
     constructor(scene, x, y, key) {
        // Basic construction function calls
        super(scene, x, y, key);
        console.log(x);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setTexture('comet');
        this.scene = scene;
        this.layer = this.scene.solids;
        this.map = this.scene.map;
        this.group = this.scene.enemies;
        this.cam = this.scene.cameras.main;
        this.body.setAllowGravity(false);
        this.setVisible(false);
        this.active = false;
        this.spawner = true;

        this.INTERVAL = 16;
        this.SPAWN_TIMER = 120 * this.INTERVAL; // Time before it spawns the next comet
        this.ticks = 0;
        this.randomStartMax = 30 * this.INTERVAL; // Randomly choose a 'head start' time between 0 and this number
     }

     update(time, delta) {
        /** Timer */
        // Only update if not paused
        // if (isOnScreen())
        this.ticks += delta;
        // console.log(this.ticks);
        if (this.ticks >= this.SPAWN_TIMER) {
            var c = new Comet(this.scene, this.x, this.y, this.angle);
            this.group.add(c);
            this.ticks = Phaser.Math.Between(0, this.randomStartMax);
        }
     }
}