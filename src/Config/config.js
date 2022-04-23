// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-1/

import 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'


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

    pixelArt: true,
    parent: 'phaser-container',
	dom: {
        createContainer: true
    },
	plugins: {
		scene: [
			{
				key: 'rexUI',
				plugin: RexUIPlugin,
				mapping: 'rexUI'
			}
		]
    }
};