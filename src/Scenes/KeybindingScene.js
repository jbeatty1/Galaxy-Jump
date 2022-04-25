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
    // Add the actions text
    this.controlText = this.add.text(500, 70, 'Click a control to change it', { fontSize: '32px', fill: '#fff' });
    this.backButton = new Button(this, 100, 50, 'blueButton1', 'blueButton2', 'MENU', 'Title');
    this.rightControlText = this.add.text(200, 140, 'Move Right', { fontSize: 24 });
    this.leftControlText = this.add.text(200, 185, 'Move Left', { fontSize: 24 });
    this.upControlText = this.add.text(200, 230, 'Up', { fontSize: 24 });
    this.crouchControlText = this.add.text(200, 275, 'Down', { fontSize: 24 });
    this.jumpControlText = this.add.text(200, 320, 'Jump', { fontSize: 24 });
    this.attackControlText = this.add.text(200, 365, 'Attack', { fontSize: 24 });
    
    this.pauseControlText = this.add.text(200, 410, 'Pause', { fontSize: 24 });
    this.muteControlText = this.add.text(200, 455, 'Mute', { fontSize: 24 });

    // Add the controls text
    this.newRightControl = this.add.text(700, 140, this.controls.codeToString(this.controls.rightKey),  { fontSize: 24, color:'blue'});
    this.newLeftControl = this.add.text(700, 185, this.controls.codeToString(this.controls.leftKey),   { fontSize: 24, color:'blue'});
    this.newUpControl = this.add.text(700, 230, this.controls.codeToString(this.controls.upKey),  { fontSize: 24 , color:'blue'});
    this.newCrouchControl = this.add.text(700, 275, this.controls.codeToString(this.controls.downKey),  { fontSize: 24 , color:'blue'});
    this.newJumpControl = this.add.text(700, 320, this.controls.codeToString(this.controls.jumpKey),  { fontSize: 24,   color:'blue'});
    this.newAttackControl = this.add.text(700, 365, this.controls.codeToString(this.controls.attackKey),  { fontSize: 24 , color:'blue'});
    
    this.newPauseControl = this.add.text(700, 410, this.controls.codeToString(this.controls.pauseKey),  { fontSize: 24 , color:'blue'});
    this.newMuteControl = this.add.text(700, 455, this.controls.codeToString(this.controls.muteKey),  { fontSize: 24 , color:'blue'});

    this.keysGroup = this.add.group();
    this.keysGroup.add(this.newRightControl);
    this.keysGroup.add(this.newLeftControl);
    this.keysGroup.add(this.newUpControl);
    this.keysGroup.add(this.newCrouchControl);
    this.keysGroup.add(this.newJumpControl);
    this.keysGroup.add(this.newAttackControl);
    this.keysGroup.add(this.newPauseControl);
    this.keysGroup.add(this.newMuteControl);
    // Make all the keys clickable
    this.keysGroup.children.iterate(c => {
      c.setInteractive();
    });
    // this.newRightControl.setInteractive();
    // this.newLeftControl.setInteractive();
    // this.newUpControl.setInteractive();
    // this.newCrouchControl.setInteractive();
    // this.newJumpControl.setInteractive();
    // this.newAttackControl.setInteractive();

    // this.newPauseControl.setInteractive();
    // this.newMuteControl.setInteractive();

    this.changeText = "Press a key!";
    this.invalidText = "Invalid key input";
  
    // Set up events for when each button is clicked on
    this.setKeyInput(this.newRightControl, this.controls.actions.RIGHT);
    this.setKeyInput(this.newLeftControl, this.controls.actions.LEFT);
    this.setKeyInput(this.newUpControl, this.controls.actions.UP);
    this.setKeyInput(this.newCrouchControl, this.controls.actions.DOWN);
    this.setKeyInput(this.newJumpControl, this.controls.actions.JUMP);
    this.setKeyInput(this.newAttackControl, this.controls.actions.ATTACK);

    this.setKeyInput(this.newPauseControl, this.controls.actions.PAUSE);
    this.setKeyInput(this.newMuteControl, this.controls.actions.MUTE);

    this.defaultButton = new Button(this, config.height - 100, config.height - 100, 'blueButton1', 'blueButton2', 'Reset Defaults', null);
    this.defaultButton.button.on("pointerdown", function() {
      this.controls.resetDefaults();
      this.keysGroup.children.iterate(c => {
        c.setInteractive();
      });
      this.input.keyboard.off("keydown");
      this.newRightControl.setText(this.controls.codeToString(this.controls.rightKey));
      this.newLeftControl.setText(this.controls.codeToString(this.controls.leftKey));
      this.newUpControl.setText(this.controls.codeToString(this.controls.upKey));
      this.newCrouchControl.setText(this.controls.codeToString(this.controls.downKey));
      this.newJumpControl.setText(this.controls.codeToString(this.controls.jumpKey));
      this.newAttackControl.setText(this.controls.codeToString(this.controls.attackKey));
      this.newPauseControl.setText(this.controls.codeToString(this.controls.pauseKey));
      this.newMuteControl.setText(this.controls.codeToString(this.controls.muteKey));
    }.bind(this));


    // this.newRightControl.on("pointerdown", function() {
    //     this.keysGroup.children.iterate(c => {
    //       c.disableInteractive();
    //     });
    //     this.newRightControl.setText(this.changeText);
    //     this.input.on("keydown", function(event) {
    //       if (this.controls.codeToString(event.keyCode) != false) {
    //         this.newRightControl.setText(this.controls.codeToString(event.keyCode));
    //         this.controls.changeControls(this.controls.actions.RIGHT, event.keyCode);
    //       }
    //       else {
    //         this.newRightControl.setText(event.key);
    //         this.controls.changeControls(this.controls.actions.RIGHT, event.keyCode);
    //       }
    //       this.input.off("keydown");
    //       this.keysGroup.children.iterate(c => {
    //         c.setInteractive();
    //       });
    //     }); // end keydown input
    // }.bind(this));

    // I'd rather not introduce a new plugin within 4 days of the due date.......
    // this.newLeftControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newLeftControl);
    // })

    // this.newRightControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newRightControl);
    // })

    // this.newJumpControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newJumpControl);
    // })

    // this.newAttackControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newAttackControl);
    // })

    // this.newCrouchControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newCrouchControl);
    // })

    // this.newPauseControl.setInteractive().on('pointerdown', () => {
    //   this.rexUI.edit(this.newPauseControl);
    // })

  }

  /**
   * This method will make it so each text object in the keybinding scene
   * will let you click on it.
   * Once it is clicked, you are prevented from clicking on any other control-changing
   * button, and the game will read the next keyboard input to change the controls for
   * the action you chose.
   * 
   * @author Tony Imbesi
   * 
   * @param {Phaser.GameObjects.Text} button the text object
   * @param {Number} action the code for the action to change the controls for
   */
  setKeyInput(button, action) {
    button.on("pointerdown", function() {
      // Disable other buttons
      this.keysGroup.children.iterate(c => {
        c.disableInteractive();
      });
      button.setText(this.changeText);
      // Change the controls to the key that was pressed
      this.input.keyboard.once("keydown", function(event) {
        if (this.controls.codeToString(event.keyCode) != false) {
          button.setText(this.controls.codeToString(event.keyCode));
          this.controls.changeControls(action, event.keyCode);
        }
        else {
          button.setText(event.key);
          this.controls.changeControls(action, event.keyCode);
        }
        // Disable the input
        // this.input.keyboard.off("keydown");
        this.keysGroup.children.iterate(c => {
          c.setInteractive();
        });
      }.bind(this)); // end keydown input
  }.bind(this));
}

}

