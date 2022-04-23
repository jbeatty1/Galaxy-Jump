//code by Josiah
import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


export default class KeybindingScene extends Phaser.Scene {
  constructor () {
    super('Keybinding');
  }

  create () {
    this.controls = this.sys.game.globals.controls;
    this.controls.addControls(this);
    this.controlText = this.add.text(500, 70, 'Control Layout', { fontSize: '32px', fill: '#fff' });
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'MENU', 'Title');
    this.rightControlText = this.add.text(200, 200, 'Right Key(move forward)', { fontSize: 24 });
    this.leftControText = this.add.text(200, 290, 'Left Key(move backwards)', { fontSize: 24 });
    this.jumpControlText = this.add.text(200, 380, 'Z(jump)', { fontSize: 24 });
    this.attackControText = this.add.text(200, 470, 'X(attack)', { fontSize: 24 });
    this.crouchControlText = this.add.text(200, 560, 'Crouch(Down key)', { fontSize: 24 });
    this.pauseControlText = this.add.text(200, 650, 'Pause(P)', { fontSize: 24 });
    this.newRightControl = this.add.text(700, 200, 'Set',  { fontSize: 24, color:'blue'});
    this.newLeftControl = this.add.text(700, 290, 'Set',   { fontSize: 24, color:'blue'});
    this.newJumpControl = this.add.text(700, 380, 'Set',  { fontSize: 24,   color:'blue'});
    this.newAttackControl = this.add.text(700, 470, 'Set',  { fontSize: 24 , color:'blue'});
    this.newCrouchControl = this.add.text(700, 560, 'Set',  { fontSize: 24 , color:'blue'});
    this.newPauseControl = this.add.text(700, 650, 'Set',  { fontSize: 24 , color:'blue'});

    this.newLeftControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newLeftControl);
    })

    this.newRightControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newRightControl);
    })

    this.newJumpControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newJumpControl);
    })

    this.newAttackControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newAttackControl);
    })

    this.newCrouchControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newCrouchControl);
    })

    this.newPauseControl.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(this.newPauseControl);
    })


  }

}