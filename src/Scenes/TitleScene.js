// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


/** 
 *  The Title Scene is really where the game is fully loaded.
 *  This is a game scene that shows options to enter other game scenes.
 */
export default class TitleScene extends Phaser.Scene {
    constructor () {
        super('Title');
    }

    preload () {
        var startScreen = (function(input) {

            var hue = 0; 
            var transitioning = false;
        
        
            var wasButtonDown = false;
        

            function centerText(ctx, text, y) {
                var measurement = ctx.measureText(text);
                var x = (ctx.canvas.width - measurement.width) / 2;
                ctx.fillText(text, x, y);
            }
            
            function draw(ctx, elapsed) {
                
             
                var y = ctx.canvas.height / 2;
                
                var color = 'rgb(' + hue + ',0,0)';
              
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
              
                ctx.fillStyle = 'white';
                ctx.font = '48px monospace';
                centerText(ctx, 'Galaxy Jump', y);
        
           
                ctx.fillStyle = color;
                ctx.font = '24px monospace';
                centerText(ctx, 'click to begin', y + 30);
            }
        

       
            function update() {
                hue += 1 * direction;
                if (hue > 255) direction = -1;
                if (hue < 0) direction = 1;
                
              
                var isButtonDown = input.isButtonDown();
        
                
                var mouseJustClicked = !isButtonDown && wasButtonDown;
        
                
                if (mouseJustClicked && !transitioning) {
                    transitioning = true;
                    // do something here to transition to the actual game
                }
        
                wasButtonDown = isButtonDown;
            }
        
            return {
                draw: draw,
                update: update
            };
        
        }());
    }

//     create () {

        
//         // Game
//         this.gameButton = new Button(this, config.width/2, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Play', 'Game');
//         // Options
//         this.optionsButton = new Button(this, config.width/2, config.height/2, 'blueButton1', 'blueButton2', 'Options', 'Options');
//         // Credits
//         this.creditsButton = new Button(this, config.width/2, config.height/2 + 100, 'blueButton1', 'blueButton2', 'Credits', 'Credits');
//         // this.model = this.sys.game.globals.model;
//         // Music player
//         // if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
//         //     this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
//         //     this.bgMusic.play();
//         //     this.model.bgMusicPlaying = true;
//         //     this.sys.game.globals.bgMusic = this.bgMusic;
//         // }
//     }
// }