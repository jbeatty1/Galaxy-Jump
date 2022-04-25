import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';

/*
  This scene uses the localStorage property to show buttons to go to levels after the player reaches them
  for the first time.
*/
// Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
export default class OptionsScene extends Phaser.Scene {
  constructor () {
    super('Select');
  }
  preload () {
  }
  create () {
    this.model = this.sys.game.globals.model;

    this.course1Button = new Button(this, config.width/2 - 200, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Scene 1', 'Course1');
    if (localStorage.getItem("fullClear1") != null) {
        this.play1 = this.add.image(this.course1Button.x, this.course1Button.y - 80, 'nicePlay');
        // console.log("clear image: " + this.play1.y);
    }
    // console.log(localStorage.getItem("fullClear1"));
    
    if (Number(localStorage.levelCleared) >= 1) {
        this.course2Button = new Button(this, config.width/2, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Scene 2', 'Course2');
        if (localStorage.getItem("fullClear2") === true) {
          this.play1 = this.add.image(this.course2Button.x, this.course2Button.y + 50, 'nicePlay');
        }
    }
    if (Number(localStorage.levelCleared) >= 2) {
        this.course3Button = new Button(this, config.width/2 + 200, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Scene 3', 'Course3');
        if (localStorage.getItem("fullClear3") === true) {
          this.play1 = this.add.image(this.course3Button.x, this.course3Button.y + 50, 'nicePlay');
        }
    }

    this.menuButton = new Button(this, 400, 500, 'blueButton1', 'blueButton2', 'Menu', 'Title');
  }
};
// End modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/