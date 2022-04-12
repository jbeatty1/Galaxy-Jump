import 'phaser';
import Button from '../Objects/Button';

export default class KeybindingScene extends Phaser.Scene {
  constructor () {
    super('Keybinding');
  }

  create () {
    this.controlText = this.add.text(500, 170, 'Control Layout', { fontSize: '32px', fill: '#fff' });
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'Back', 'Title');
  }
}