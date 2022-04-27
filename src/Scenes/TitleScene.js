// Code modified from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
import 'phaser';
import Button from '../Objects/Button';
import config from '../Config/config';


/**
 *  The Title Scene is really where the game is fully loaded.
 *  This is a game scene that shows options to enter other game scenes.
 *  Code modified by Tony, Nabeeha, and Josiah
 */
export default class TitleScene extends Phaser.Scene {
    constructor () {
        super('Title');
    }

    preload () {

        // this.load.image('background', 'assets/bg/titleBack.png');

    }

    create () {
        // Initialize the localStorage.
        // Begin modified code from https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_win_localstorage2
        if (localStorage.levelCleared === undefined) {
            localStorage.levelCleared = 0;
        }
        // End modified code from https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_win_localstorage2


        this.model = this.sys.game.globals.model;
        this.bgMusic = this.sys.game.globals.bgMusic;
        // Reset the checkpoint variables
        this.model.checkpointSet = false;
        this.model.spawnX = undefined;
        this.model.spawnY = undefined;

        // Using this.sound.add removes the reference to the sound that this.bgMusic originally was,
        // rendering that sound impossible to modify.
        // Only update the sound reference if this.bgMusic has no reference already.
        // this.bgMusic starts with a reference if this scene is entered through the PauseScreen.
        
        if (this.bgMusic == null) {
            this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
        }
        else if (this.bgMusic.key != 'titleMusic') {
            console.log("music key: " + this.bgMusic.key);
            this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
        }
            
        this.sys.game.globals.bgMusic = this.bgMusic;

        this.background = this.add.image(0, 0, "titleBg")
        .setOrigin(0, 0);
        // Based on your game size, it may "stretch" and distort.
        this.background.displayWidth = this.sys.canvas.width;
        this.background.displayHeight = this.sys.canvas.height;


        // var text = this.add.text(100,100, 'Galaxy Jump!', { color: '#00ff00', align: 'right' });


        // Game
        this.gameButton = new Button(this, config.width/2 - 100, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Play', 'Course1');
        // Scene Select
        this.selectButton = new Button(this, config.width/2 + 100, config.height/2 - 100, 'blueButton1', 'blueButton2', 'Continue', 'Select');
        
        // Options
        this.optionsButton = new Button(this, config.width/2 + 100, config.height/2 + 50, 'blueButton1', 'blueButton2', 'Options', 'Options');
        // Keybinding
        this.keybindingButtonn =  new Button(this, config.width/2 - 100, config.height/2 + 200, 'blueButton1', 'blueButton2', 'Controls', 'Keybinding');
        
        // Credits
        this.creditsButton = new Button(this, config.width/2 + 100, config.height/2 + 200, 'blueButton1', 'blueButton2', 'Credits', 'Credits');

        // Tutorial
        this.howToButton = new Button(this, config.width/2 - 100, config.height/2 + 50, 'blueButton1', 'blueButton2', 'Tutorial', 'HowToScene');
        
		

        // Music player
        
        if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
            this.bgMusic.play();
            this.model.bgMusicPlaying = true;
            this.sys.game.globals.bgMusic = this.bgMusic;
        }

        // this.sound.pauseOnBlur = false;
        console.log("music events: " + this.sound.getAll('titleMusic').length); 
        this.input.keyboard.enableGlobalCapture();
    }
}