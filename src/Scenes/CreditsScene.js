// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-2/
// Modified by Josiah Cornelius
import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


export default class CreditsScene extends Phaser.Scene {
  constructor () {
    super('Credits');
  }

  create () {
    this.sound.stopAll();
    this.sound.removeAll();
    this.sys.game.globals.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
    if (this.sys.game.globals.model.musicOn === true)
      this.sys.game.globals.bgMusic.play();

    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'MENU', 'Title');
    this.credits = this.add.text(config.width/2  - 200, config.height/2 - 230,  'Credits', { fontSize: '32px', fill: '#fff' });
    this.creditsText1= this.add.text(120, 200, 'Story By\n  \nJosiah Cornelius\nTony Imbesi\nNabeeha Ashfaq\nJohanna Beatty', { fontSize: '20px', fill: '#fff' });
    this.creditsText2 = this.add.text(120, 350, 'Character/Level Art\n  \nTony Imbesi\nNabeeha Ashfaq\nJohanna Beatty\nNicoletta Imbesi(outside class)', { fontSize: '20px', fill: '#fff' });
    this.creditsText3 = this.add.text(config.width/2, config.height/2 - 150, 'Music/SFX\n  \nTony Imbesi\nJohanna Beatty\n', { fontSize: '20px', fill: '#fff' });
    this.creditsText4 = this.add.text(config.width/2, config.height/2 - 30, '\nGameplay Physics/Programmers\n  \nJosiah Cornelius \nTony Imbesi\nNabeeha Ashfaq\n', { fontSize: '20px', fill: '#fff' });

    this.creditsText5 = this.add.text(config.width/2, config.height/2 + 300, 'Powered by: Phaser 3\n Copyright (c) 2017 Richard Davey', { fontSize: '20px', fill: '#fff' });
    this.creditsText6 = this.add.text(config.width/2 - 600, config.height/2 + 300, 'With assets from: http://labs.phaser.io/assets', { fontSize: '20px', fill: '#fff' });
  }
};