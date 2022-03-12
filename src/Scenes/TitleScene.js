// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


/** 
 *  The Title Scene is really where the game is fully loaded.
 *  This is a game scene that shows options to enter other game scenes.
 */
export default class TitleScene extends Phaser.Scene {
    constructor () {
        super('Title');
    }

    preload () {
    }

    create () {
        // Game
        this.gameButton = new Button(this, config.width/2, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Play', 'Game');
        // Options
        this.optionsButton = new Button(this, config.width/2, config.height/2, 'blueButton1', 'blueButton2', 'Options', 'Options');
        // Credits
        this.creditsButton = new Button(this, config.width/2, config.height/2 + 100, 'blueButton1', 'blueButton2', 'Credits', 'Credits');
        // this.model = this.sys.game.globals.model;
        // Music player
        // if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
        //     this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
        //     this.bgMusic.play();
        //     this.model.bgMusicPlaying = true;
        //     this.sys.game.globals.bgMusic = this.bgMusic;
        // }
    }
};