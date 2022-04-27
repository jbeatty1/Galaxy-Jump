import 'phaser';
import Button from '../Objects/Button';

/**
  How to play scene.
  @author Tony Imbesi
*/
export default class HowToScene extends Phaser.Scene {
  constructor () {
    super('HowToScene');
  }
  preload () {
  }
  create () {
    this.bg = this.add.image(0, 0, 'howtoplay');
    this.bg.setOrigin(0, 0);
    // Begin code from Josiah Cornelius
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'MENU', 'Title');
    // End code from Josiah Cornelius
  }
};