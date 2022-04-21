// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
// Import the Phaser engine content, the config, and the GameScene
import 'phaser';
import config from './Config/config';
import GameScene from './Scenes/GameScene';
import BootScene from './Scenes/BootScene';
import PreloaderScene from './Scenes/PreloaderScene';
import TitleScene from './Scenes/TitleScene';
import OptionsScene from './Scenes/OptionsScene';
import CreditsScene from './Scenes/CreditsScene';
import testCourse from './Scenes/Courses/testCourse';
import testCourse2 from './Scenes/Courses/testCourse2';
import Course1 from './Scenes/Courses/Course1';
import Course2 from './Scenes/Courses/Course2';
import Course3 from './Scenes/Courses/Course3';
import KeybindingScene from './Scenes/KeybindingScene';
import SelectScene from './Scenes/SelectScene';
// import PauseScene from './Scenes/PauseScene';

import Model from './Model';
import PlayerController from './PlayerController';


/*
    This will construct a new Phaser.Game with the config from config.js,
    then add all the scenes,
    then start the scene Boot with the key 'Boot'.

    The two major scenes that get added and loaded are 'Boot' and 'Preloader'.
    These two get loaded in order.
*/
class Game extends Phaser.Game {
  constructor () {
    super(config);
    const model = new Model();
    const controls = new PlayerController();
    // This next declares globals as an object-type property of this Phaser.Game,
    // and it adds the Model as an available globals object.
    // Access the model at any time with this.sys.game.globals.model
    this.globals = { model, controls, bgMusic: null };
    this.scene.add('Boot', BootScene);
    this.scene.add('Preloader', PreloaderScene);
    this.scene.add('Title', TitleScene);
    this.scene.add('Options', OptionsScene);
    this.scene.add('Credits', CreditsScene);
    this.scene.add('Game', GameScene);
    this.scene.add('Keybinding', KeybindingScene);
    this.scene.add('Select', SelectScene);
    // this.scene.add('Pause', PauseScene);

    this.scene.add('testCourse', testCourse);
    this.scene.add('testCourse2', testCourse2);
    this.scene.add('Course1', Course1);
    this.scene.add('Course2', Course2);
    this.scene.add('Course3', Course3);
    
    this.scene.start('Boot');
  }
}
window.game = new Game();