// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

import 'phaser';
import Button from '../Objects/Button';

/*
  This is a basic options menu.
  Modified by Tony Imbesi, 4/18/2022
*/
export default class OptionsScene extends Phaser.Scene {
  constructor () {
    super('Options');
  }
  preload () {
  }
  create () {
    this.model = this.sys.game.globals.model;

    this.text = this.add.text(300, 100, 'Options', { fontSize: 40 });
    this.musicButton = this.add.image(200, 200, 'checkedBox');
    this.musicText = this.add.text(250, 190, 'Music Enabled', { fontSize: 24 });

    this.soundButton = this.add.image(200, 300, 'checkedBox');
    this.soundText = this.add.text(250, 290, 'Sound Enabled', { fontSize: 24 });

    this.musicButton.setInteractive();
    this.soundButton.setInteractive();

    this.musicButton.on('pointerdown', function () {
      this.model.musicOn = !this.model.musicOn;
      this.updateAudio();
    }.bind(this));

    this.soundButton.on('pointerdown', function () {
      this.model.soundOn = !this.model.soundOn;
      this.updateAudio();
    }.bind(this));

    
    this.menuButton = new Button(this, 400, 500, 'blueButton1', 'blueButton2', 'Menu', 'Title');

    this.resetButton = new Button(this, 600, 500, 'blueButton1', 'blueButton2', 'Reset data?', null);
    this.resetButton.button.on('pointerdown', function() {
        localStorage.clear();
        this.resetButton.text.setText('Data reset...');
    }.bind(this));

    this.updateAudio();
  }

  updateAudio() {
    this.bgMusic = this.sys.game.globals.bgMusic;
    if (this.model.musicOn === false) {
        this.musicButton.setTexture('box');
        this.bgMusic.pause();
        this.model.bgMusicPlaying = false;
    }
    else {
        this.musicButton.setTexture('checkedBox');
        if (this.model.bgMusicPlaying === false) {
          if (this.bgMusic.isPaused) {
            this.bgMusic.resume();
          }
          else {
            this.bgMusic.play();
          }
            this.model.bgMusicPlaying = true;
        }
    }
    if (this.model.soundOn === false) {
        this.soundButton.setTexture('box');
    } else {
        this.soundButton.setTexture('checkedBox');
    }
  }
};