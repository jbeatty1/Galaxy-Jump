// Code modified from https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/
import 'phaser';
import Player from './Player';

/**
 * Global object that stores information about player controls.
 * This will be accessed through the global Model as this.sys.game.controls
 * @author Tony Imbesi
 * @version 3/1/2022
 */
export default class PlayerController {
    /**
     * These are all the properties to use.
     * They will be initialized properly using the addControls method.
     */
    constructor() {
        this.scene = null;

        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
        this.jump = null;
        this.attack = null;
        this.pause = null;
        this.shift = null;


        this.actions = {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            JUMP: 4,
            ATTACK: 5,
            PAUSE: 6
        };

        this.BUFFER = 100; // Time in milliseconds before a button press is no longer counted
    }

    /**
     * Adds the controls to the current scene.
     *
     * @param {Phaser.Scene} scene the current Phaser scene
     */
    addControls(scene) {
        this.scene = scene;
        // The following will be the default controls for the game.
        // Begin modified code from https://labs.phaser.io/edit.html?src=src/input/keyboard/add%20key.js
        this.left = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.right = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.jump = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.attack = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.pause = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.shift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.mute = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        // End modified code from https://labs.phaser.io/edit.html?src=src/input/keyboard/add%20key.js
    }
    /**
     * Returns if the key was held down for no longer than a time in milliseconds.
     *
     * @param {Phaser.Input.Keyboard.Key} key the key to pass
     * @returns true if the key was just pressed, false otherwise
     */
    pressed(key) {
        return (key.getDuration() > 1 && key.getDuration() <= this.BUFFER);
    }

    /**
     * Changes the keybinding for one of the key inputs.
     *
     * @param {number | string} action the action to change the key input for, according to the this.actions enumeration
     * @param {number} keycode the code for the key to bind the action to
     */
    changeControls(action, newControl) {
        switch (action) {
            case this.actions.LEFT:
                this.left = this.scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.RIGHT:
                this.right = scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.UP:
                this.up = scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.DOWN:
                this.down = scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.JUMP:
                this.jump = scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.ATTACK:
                this.attack = scene.input.keyboard.addKey(newControl);
                break;
            case this.actions.PAUSE:
                this.pause = scene.input.keyboard.addKey(newControl);
                break;
            default:
                // Nothing. Too bad!
        }
    }


}