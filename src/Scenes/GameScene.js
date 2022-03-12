// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-2/

import 'phaser';

/** 
 *  export default: Exports a function, class, or primitive
 *  from a file for use in a different file.
 *  This export statement exports the main game content.
*/
export default class GameScene extends Phaser.Scene {
    constructor () {
        super('Game');
    }

    preload () {
        // Preload whatever you like
    }

    create () {
        // Create whatever you like
        this.scene.start('testCourse');
    }

    update () {
        // Update whatever you like
    }
};