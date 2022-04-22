// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-1/

import 'phaser';

/* export default: Exports a function, class, or primitive
    from a file for use in a different file.
    
    This export statement exports the general config information.
*/
export default {
    type: Phaser.AUTO,
    width: 1270, // Screen width
    height: 720, // Screen height
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    pixelArt: true
};