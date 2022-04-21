// Begin code modified from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
// Code modified by Nabeeha and Tony

import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


/** 
 *  This scene handles the pause menu that appears when you press the pause button in game.
 *  It shows a menu and a set of buttons that will let you resume, change options, or quit the game.
 *  Modified by Nabeeha Ashfaq and Tony Imbesi
 */
export default class PauseScene extends Phaser.Scene {
    constructor () {
        super('Pause');
    }

    preload () {

        // this.load.image('background', 'assets/bg/titleBack.png');
      
    }


    create() {
        
        /*
            Code for the pause menu
            By Nabeeha
        */

        var w = config.width;
        var h = config.height;


        // Create a label to show at the corner of the screen
        this.pause_label = this.add.text(w - 100, 20, 'PAUSED', { fontFamily: 'Arial', fontSize: 30, fill: '#ffffff' });
        this.pause_label.setScrollFactor(0);
        console.log("width: " + w);
        // pause_label.inputEnabled = true;
        
        // When the paus button is pressed, we pause the game
        this.model = this.sys.game.globals.model;
        this.paused = this.model.gamePaused;

        // Then add the menu
        

        // And a label to illustrate which menu item was chosen. (This is not necessary)
        this.choiceLabel = this.add.text(w/2, h-150, '', { font: '30px Arial', fill: '#ffffff' });
        this.choiceLabel.setScrollFactor(0);

        // Add a input listener that can help us return from being paused
        // this.input.onDown.add(unpause, self);

        // And finally the method that handels the pause menu
        // function unpause(event){
        //     // Only act if paused
        //     if(game.paused){
        // Calculate the corners of the menu
        var menuWidth = 270;
        var menuHeight = 180;
        var x1 = w/2 - menuWidth/2, x2 = menuWidth,
            y1 = h/2 - menuHeight/2, y2 = menuHeight;

        this.menu = this.add.rectangle(x1, y1, x2, y2, 0x123456);
        this.menu.setScrollFactor(0);

        // Add the buttons
        this.buttonGroup = this.add.group();
        this.resumeButton = new Button(this, this.menu.x/2, this.menu.y/2, 'blueButton1', 'blueButton2', 'Resume', null);

        this.optionsButton = new Button(this, this.menu.x/2, this.menu.y/2 + 100, 'blueButton1', 'blueButton2', 'Options', 'Options', true);

        this.quitButton = new Button(this, this.menu.x/2, this.menu.y/2 + 200, 'blueButton1', 'blueButton2', 'Quit', 'Title', false);
        
        this.buttonGroup.add(this.resumeButton);
        this.buttonGroup.add(this.optionsButton);
        this.buttonGroup.add(this.quitButton);
        this.buttonGroup.on('pointerdown', function() {
            this.children.iterate(c => {
                c.setVisible(false);
            });
        });
        this.buttonGroup.children.iterate(c => {
            c.setScrollFactor(0);
        });

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
     * By calling this function, the pause scene immediately removes itself and everything it loaded.
     * @author Tony Imbesi
     */
    unpause() {
        this.scene.stop(this);
    }
}