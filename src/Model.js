// Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
/*
    This class controls the game's global settings.
    Other scenes can refer to the methods by taking the following steps:
    - Access the global instance of this model by calling this.sys.game.globals.model
    - Access properties like bgMusicPlaying by using model.bgMusicPlaying, for example
*/
export default class Model {
    constructor() {
      this._soundOn = true;
      this._musicOn = true;
      this._bgMusicPlaying = false;

      this._msUntilTick = 16;
    }
    set musicOn(value) {
      this._musicOn = value;
    }
    get musicOn() {
      return this._musicOn;
    }
    set soundOn(value) {
      this._soundOn = value;
    }
    get soundOn() {
      return this._soundOn;
    }
    set bgMusicPlaying(value) {
      this._bgMusicPlaying = value;
    }
    get bgMusicPlaying() {
      return this._bgMusicPlaying;
    }
    get msUntilTick() {
      return this._msUntilTick;
    }
  }
  // End modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/