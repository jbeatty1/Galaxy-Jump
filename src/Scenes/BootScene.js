// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-1/

import 'phaser';


/*
    The Boot scene will start the process of loading everything,
    starting with all preloader assets.
*/
export default class BootScene extends Phaser.Scene {
    constructor () {
        super('Boot');
    }

    preload () {
        this.load.image('logo', 'assets/custom_logo.png');
    }

    create () {
        // The this.scene.start function stops the current scene and starts the scene
        // represented by the key.
        this.scene.start('Preloader');
    }
};