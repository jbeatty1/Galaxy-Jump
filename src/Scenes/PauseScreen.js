// Begin code modified from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
// Code modified by Nabeeha and Tony

import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


/** 
 *  This class handles the pause menu that appears when you press the pause button in game.
 *  It shows a menu and a set of buttons that will let you resume, change options, or quit the game.
 *  Modified by Nabeeha Ashfaq and Tony Imbesi
 */
export default class PauseScreen extends Phaser.GameObjects.Image {
    /**
     * Set up the health bar.
     * @param {Phaser.Scene} scene the current scene
     * @param {Number} x the x position
     * @param {Number} y the y position
     */
    constructor (scene, x, y)
    {
        super(scene, x, y, "pause");
        this.scene = scene;
        this.model = this.scene.model;
        // this.bar = new Phaser.GameObjects.Graphics(scene);
        // this.x = x;
        // this.y = y;
        this.scene.add.existing(this);
        // this.setScrollFactor(0);
        this.setDepth(10);
        console.log("Pause X: " + this.x);
        console.log("Pause Y: " + this.y);
        this.setDisplaySize(this.width * 2, this.height * 2);
        // console.log("Loaded bar at " + this.x + ', ' + this.y);

         /*
            Code for the pause menu
            By Nabeeha
        */

        var w = config.width;
        var h = config.height;


        // Create a label to show at the corner of the screen
        // this.pause_label = this.scene.add.text(w - 300, 20, 'PAUSED', { fontFamily: 'Impact', fontSize: 30, fill: '#ffffff' });
        // this.pause_label.setScrollFactor(0);
        console.log("width: " + w);
        // pause_label.inputEnabled = true;
        
        // When the paus button is pressed, we pause the game

        // Then add the menu
        this.UI = this.scene.add.group();
        // And a label to illustrate which menu item was chosen. (This is not necessary)
        this.choiceLabel = this.scene.add.text(0, 0, 'PAUSE', { fontSize: 60, fill: '#000000' });
        Phaser.Display.Align.In.Center(this.choiceLabel, this, 0, -140);
        // this.choiceLabel.setScrollFactor(0);
        console.log("Text X: " + this.choiceLabel.x);
        console.log("Text Y: " + this.choiceLabel.y);

        this.UI.add(this.choiceLabel);

        // Add a input listener that can help us return from being paused
        // this.input.onDown.add(unpause, self);

        // And finally the method that handels the pause menu
        // function unpause(event){
        //     // Only act if paused
        //     if(game.paused){
        // Calculate the corners of the menu
        // var menuWidth = 270;
        // var menuHeight = 180;
        // var x1 = w/2 - menuWidth/2, x2 = menuWidth,
        //     y1 = h/2 - menuHeight/2, y2 = menuHeight;

        // this.menu = this.scene.add.rectangle(x1, y1, x2, y2, 0x123456);
        // this.menu.setScrollFactor(0);

        // Add the buttons. Note that the x and y positions refer to the menu's center unless you specify otherwise using the setOrigin() function.
        this.buttonGroup = this.scene.add.group();
        
        // Add all buttons to a group and assign an event to trigger when clicked
        this.makeInitialButtons();

        this.UI.setDepth(11);

        // Check if the click was inside the menu
        
        // The choicemap is an array that will help us see which item was clicked
        // var choisemap = ['one', 'two', 'three', 'four', 'five', 'six'];

        // Get menu local coordinates for the click
        // var x = event.x - x1,
        //     y = event.y - y1;

        // Calculate the choice 
        // var choise = Math.floor(x / 90) + 3 * Math.floor(y / 90);

        // Display the choice
        // choiceLabel.text = 'You chose menu item: ' + choisemap[choise];
        //     }
        // };
    }

    /**
     * Create the initial set of buttons with options to resume, go to game options, or quit.
     * @author Tony Imbesi
     */
    makeInitialButtons() {
        this.buttonGroup.clear(true, true);
        this.choiceLabel.setText("PAUSE");
        this.resumeButton = new Button(this.scene, this.x, this.y - 70, 'blueButton1', 'blueButton2', 'Resume', null);
        this.optionsButton = new Button(this.scene, this.x, this.y + 30, 'blueButton1', 'blueButton2', 'Options', null);
        this.quitButton = new Button(this.scene, this.x, this.y + 130, 'blueButton1', 'blueButton2', 'Quit', null);

        this.buttonGroup.add(this.resumeButton);
        this.buttonGroup.add(this.optionsButton);
        this.buttonGroup.add(this.quitButton);
        this.buttonGroup.children.iterate(c => {
            console.log(c.y);
            this.UI.add(c);
            console.log("Button added");
        });
        // Set specific button actions here:
        this.resumeButton.button.on('pointerdown', function() {
            this.scene.unpause();
        }.bind(this));

        this.optionsButton.button.on('pointerdown', function() {
            // Create the checkboxes to change music and sound settings
            this.makeOptionsButtons();
        }.bind(this));

        this.quitButton.button.on('pointerdown', function() {
            // Stop music and go to title screen
            this.scene.sys.game.globals.bgMusic.stop();
            this.scene.sys.game.globals.bgMusic = this.scene.sound.add('titleMusic', { volume: 0.5, loop: true });
            if (this.model.musicOn === true) {
                this.scene.sys.game.globals.bgMusic.play();
            }
            this.scene.scene.start('Title');
        }.bind(this));
        this.UI.setDepth(11);
    }

    /**
     * Create the checkbox buttons from the OptionsScene inside the pause screen.
     * @author Tony Imbesi
     */
    makeOptionsButtons() {
        this.buttonGroup.clear(true, true);
        // Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
        this.choiceLabel.setText("OPTIONS");
        this.musicButton = this.scene.add.image(this.x - 100, this.y - 50, 'checkedBox');
        this.musicText = this.scene.add.text(this.x - 50, this.y - 60, 'Music Enabled', { fontSize: 24, fill: '#000000' });
    
        this.soundButton = this.scene.add.image(this.x - 100, this.y + 50, 'checkedBox');
        this.soundText = this.scene.add.text(this.x - 50, this.y + 40, 'Sound Enabled', { fontSize: 24, fill: '#000000' });
    
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
    
        
        this.menuButton = new Button(this.scene, this.x, this.y + 130, 'blueButton1', 'blueButton2', 'Back', null, false);
        this.menuButton.button.on('pointerdown', function () {
            // Create the normal set of buttons
            this.makeInitialButtons();
        }.bind(this));

        
        this.buttonGroup.add(this.musicButton);
        this.buttonGroup.add(this.musicText);
        this.buttonGroup.add(this.soundButton);
        this.buttonGroup.add(this.soundText);
        this.buttonGroup.add(this.menuButton);

        this.buttonGroup.children.iterate(c => {
            console.log(c.y);
            this.UI.add(c);
            console.log("Button added");
        });


    
        this.updateAudio();
        this.UI.setDepth(11);
        // End modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
    }

    // Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
    updateAudio() {
        if (this.model.musicOn === false) {
            this.musicButton.setTexture('box');
            // this.sys.game.globals.bgMusic.pause();
            // this.model.bgMusicPlaying = false;
        }
        else {
            this.musicButton.setTexture('checkedBox');
            // if (this.model.bgMusicPlaying === false) {
            //     // this.sys.game.globals.bgMusic.resume();
            //     // this.model.bgMusicPlaying = true;
            // }
        }
        if (this.model.soundOn === false) {
            this.soundButton.setTexture('box');
        } else {
            this.soundButton.setTexture('checkedBox');
        }
    }
    // End modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/


    /**
     * Remove every element created by this pause screen, and remove the pause screen itself.
     */
    removeEverything() {
        console.log("remove everything");
        this.UI.clear(true, true);
        this.destroy();
    }

    
}