//code by Josiah
import 'phaser';
import Button from '../Objects/Button';
import PlayerController from '../PlayerController';

export default class KeybindingScene extends Phaser.Scene {
  constructor () {
    super('Keybinding');
  }

  create () {
    this.controls = new PlayerController();
    this.controlText = this.add.text(500, 70, 'Control Layout', { fontSize: '32px', fill: '#fff' });
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'Back', 'Title');
    this.rightControlText = this.add.text(200, 200, 'Right Key(move forward)', { fontSize: 24 });
    this.leftControText = this.add.text(200, 290, 'Left Key(move backwards)', { fontSize: 24 });
    this.jumpControlText = this.add.text(200, 380, 'Z(jump)', { fontSize: 24 });
    this.attackControText = this.add.text(200, 470, 'X(attack)', { fontSize: 24 });
    this.newRightControl = this.add.text(700, 200, 'Set button',  { fontSize: 24, color:'blue'});
    this.newLeftControl = this.add.text(700, 290, 'Set button',   { fontSize: 24, color:'blue'});
    this.newJumpControl = this.add.text(700, 380, 'Set button',  { fontSize: 24,   color:'blue'});
    this.newAttackControl = this.add.text(700, 470, 'Set button',  { fontSize: 24 , color:'blue'});


    this.newLeftControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newLeftControl);
      this.controls.updateLeftControl(newLeftControl);
    })

    this.newRightControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newRightControl);
      this.controls.updateRightControl(newRightControl);
    })

    this.newJumpControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newJumpControl);
      this.controls.updateJumpControl(newJumpControl);
    })

    this.newAttackControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newAttackControl);
      this.controls.updateAttackControl(newAttackControl);
    })
  }


  updateControls(){
    this.model = this.sys.game.globals.model;

    }
}