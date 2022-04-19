// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-2/

import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


export default class CreditsScene extends Phaser.Scene {
  constructor () {
    super('Credits');
  }

  create () {
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'MENU', 'Title');
    this.credits = this.add.text(config.width/2  - 200, config.height/2 - 230,  'Credits', { fontSize: '32px', fill: '#fff' });
    this.creditsText1= this.add.text(120, 200, 'Story By\n  \nJosiah Cornelius\nTony Imbesi\nNabeeha Ashfaq\nJohanna Beatty', { fontSize: '20px', fill: '#fff' });
    this.creditsText2 = this.add.text(120, 350, 'Character/Level Art\n  \nTony Imbesi\nNabeeha Ashfaq\nJohanna Beatty\nNicoletta Imbesi(outside class)', { fontSize: '20px', fill: '#fff' });
    this.creditsText3 = this.add.text(config.width/2, config.height/2 - 150, 'Music/SFX\n  \nTony Imbesi\nNabeeha Ashfaq\n', { fontSize: '20px', fill: '#fff' });
    this.creditsText4 = this.add.text(config.width/2, config.height/2 - 30, '\nGameplay Physics/Programmers\n  \nJosiah Cornelius \nTony Imbesi\nNabeeha Ashfaq\n', { fontSize: '20px', fill: '#fff' });
  }
};