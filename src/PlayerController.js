// Code modified from https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/
import 'phaser';
import Player from './Player';

/**
 * Global object that stores information about player controls.
 * This will be accessed through the global Model as this.sys.game.controls
 * @author Tony Imbesi
 * @version 4/24/2022
 */
export default class PlayerController {
    
    /**
     * These are all the properties to use.
     * They will be initialized properly using the addControls method.
     */
    constructor() {
        this.scene = null;

        // References to the actual keys with the actions mapped to them
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
        this.jump = null;
        this.attack = null;
        this.pause = null;
        this.mute = null;
        
        // References to the keycodes for each key
        this.leftKey = Phaser.Input.Keyboard.KeyCodes.LEFT;
        this.rightKey = Phaser.Input.Keyboard.KeyCodes.RIGHT;
        this.upKey = Phaser.Input.Keyboard.KeyCodes.UP;
        this.downKey = Phaser.Input.Keyboard.KeyCodes.DOWN;
        this.jumpKey = Phaser.Input.Keyboard.KeyCodes.Z;
        this.attackKey = Phaser.Input.Keyboard.KeyCodes.X;
        this.pauseKey = Phaser.Input.Keyboard.KeyCodes.ENTER;
        this.muteKey = Phaser.Input.Keyboard.KeyCodes.M;

        // Codes for each action
        this.actions = {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            JUMP: 4,
            ATTACK: 5,
            PAUSE: 6,
            MUTE: 7
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
        this.left = scene.input.keyboard.addKey(this.leftKey);
        this.right = scene.input.keyboard.addKey(this.rightKey);
        this.up = scene.input.keyboard.addKey(this.upKey);
        this.down = scene.input.keyboard.addKey(this.downKey);
        this.jump = scene.input.keyboard.addKey(this.jumpKey);
        this.attack = scene.input.keyboard.addKey(this.attackKey);
        this.pause = scene.input.keyboard.addKey(this.pauseKey);
        this.mute = scene.input.keyboard.addKey(this.muteKey);
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
     * @param {Phaser.Input.Keyboard.KeyCodes} keycode the code for the key to bind the action to
     */
    changeControls(action, keycode) {
        switch (action) {
            case this.actions.LEFT:
                this.leftKey = keycode;
                break;
            case this.actions.RIGHT:
                this.rightKey = keycode;
                break;
            case this.actions.UP:
                this.upKey = keycode;
                break;
            case this.actions.DOWN:
                this.downKey = keycode;
                break;
            case this.actions.JUMP:
                this.jumpKey = keycode;
                break;
            case this.actions.ATTACK:
                this.attackKey = keycode;
                break;
            case this.actions.PAUSE:
                this.pauseKey = keycode;
            case this.actions.MUTE:
                this.muteKey = keycode;
                break;
            default:
                // Nothing. Too bad!        
        }
    }

    /**
     * Call this method to reset the keys back to their original settings.
     */
    resetDefaults() {
        this.leftKey = Phaser.Input.Keyboard.KeyCodes.LEFT;
        this.rightKey = Phaser.Input.Keyboard.KeyCodes.RIGHT;
        this.upKey = Phaser.Input.Keyboard.KeyCodes.UP;
        this.downKey = Phaser.Input.Keyboard.KeyCodes.DOWN;
        this.jumpKey = Phaser.Input.Keyboard.KeyCodes.Z;
        this.attackKey = Phaser.Input.Keyboard.KeyCodes.X;
        this.pauseKey = Phaser.Input.Keyboard.KeyCodes.ENTER;
        this.muteKey = Phaser.Input.Keyboard.KeyCodes.M;
    }

    /**
     * Converts a Phaser KeyCode to appropriate text.
     * 
     * @param {Phaser.Input.Keyboard.KeyCodes} keycode the code
     */
    codeToString(keycode) {
        var text = false;
        switch (keycode) {
            case Phaser.Input.Keyboard.KeyCodes.BACKSPACE:
                text = "BACKSPACE";
                break;
            case Phaser.Input.Keyboard.KeyCodes.TAB:
                text = "TAB";
                break;
            case Phaser.Input.Keyboard.KeyCodes.ENTER:
                text = "ENTER";
                break;
            case Phaser.Input.Keyboard.KeyCodes.SHIFT:
                text = "SHIFT";
                break;
            case Phaser.Input.Keyboard.KeyCodes.CTRL:
                text = "CTRL";
                break;
            case Phaser.Input.Keyboard.KeyCodes.ALT:
                text = "ALT";
                break;
            case Phaser.Input.Keyboard.KeyCodes.CAPS_LOCK:
                text = "CAPS LOCK";
                break;
            case Phaser.Input.Keyboard.KeyCodes.ESC:
                text = "ESC";
                break;
            case Phaser.Input.Keyboard.KeyCodes.SPACE:
                text = "SPACE";
                break;
            case Phaser.Input.Keyboard.KeyCodes.LEFT:
                text = "LEFT";
                break;
            case Phaser.Input.Keyboard.KeyCodes.UP:
                text = "UP";
                break;
            case Phaser.Input.Keyboard.KeyCodes.RIGHT:
                text = "RIGHT";
                break;
            case Phaser.Input.Keyboard.KeyCodes.DOWN:
                text = "DOWN";
                break;
            case Phaser.Input.Keyboard.KeyCodes.ZERO:
                text = "0";
                break;
            case Phaser.Input.Keyboard.KeyCodes.ONE:
                text = "1";
                break;
            case Phaser.Input.Keyboard.KeyCodes.TWO:
                text = "2";
                break;
            case Phaser.Input.Keyboard.KeyCodes.THREE:
                text = "3";
                break;
            case Phaser.Input.Keyboard.KeyCodes.FOUR:
            text = "4";
            break;
            case Phaser.Input.Keyboard.KeyCodes.FIVE:
            text = "5";
            break;
            case Phaser.Input.Keyboard.KeyCodes.SIX:
            text = "6";
            break;
            case Phaser.Input.Keyboard.KeyCodes.SEVEN:
            text = "7";
            break;
            case Phaser.Input.Keyboard.KeyCodes.EIGHT:
            text = "8";
            break;
            case Phaser.Input.Keyboard.KeyCodes.NINE:
            text = "9";
            break;
            case Phaser.Input.Keyboard.KeyCodes.A:
            text = "A";
            break;
            case Phaser.Input.Keyboard.KeyCodes.B:
            text = "B";
            break;
            case Phaser.Input.Keyboard.KeyCodes.C:
            text = "C";
            break;
            case Phaser.Input.Keyboard.KeyCodes.D:
            text = "D";
            break;
            case Phaser.Input.Keyboard.KeyCodes.E:
            text = "E";
            break;
            case Phaser.Input.Keyboard.KeyCodes.F:
            text = "F";
            break;
            case Phaser.Input.Keyboard.KeyCodes.G:
            text = "G";
            break;
            case Phaser.Input.Keyboard.KeyCodes.H:
            text = "H";
            break;
            case Phaser.Input.Keyboard.KeyCodes.I:
            text = "I";
            break;
            case Phaser.Input.Keyboard.KeyCodes.J:
            text = "J";
            break;
            case Phaser.Input.Keyboard.KeyCodes.K:
            text = "K";
            break;
            case Phaser.Input.Keyboard.KeyCodes.L:
            text = "L";
            break;
            case Phaser.Input.Keyboard.KeyCodes.M:
            text = "M";
            break;
            case Phaser.Input.Keyboard.KeyCodes.N:
            text = "N";
            break;
            case Phaser.Input.Keyboard.KeyCodes.O:
            text = "O";
            break;
            case Phaser.Input.Keyboard.KeyCodes.P:
            text = "P";
            break;
            case Phaser.Input.Keyboard.KeyCodes.Q:
            text = "Q";
            break;
            case Phaser.Input.Keyboard.KeyCodes.R:
            text = "R";
            break;
            case Phaser.Input.Keyboard.KeyCodes.S:
            text = "S";
            break;
            case Phaser.Input.Keyboard.KeyCodes.T:
            text = "T";
            break;
            case Phaser.Input.Keyboard.KeyCodes.U:
            text = "U";
            break;
            case Phaser.Input.Keyboard.KeyCodes.V:
            text = "V";
            break;
            case Phaser.Input.Keyboard.KeyCodes.W:
            text = "W";
            break;
            case Phaser.Input.Keyboard.KeyCodes.X:
            text = "X";
            break;
            case Phaser.Input.Keyboard.KeyCodes.Y:
            text = "Y";
            break;
            case Phaser.Input.Keyboard.KeyCodes.Z:
            text = "Z";
            break;
                    
        }
        return text;
    }

}