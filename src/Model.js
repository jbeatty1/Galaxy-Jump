// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

/*
    This class controls the game's global settings.
    Other scenes can refer to the methods by taking the following steps:
    - Create an instance of this class: model = new Model();
    - Access bgMusicPlaying using model.bgMusicPlaying, for example
*/
export default class Model {
    constructor() {
      this._soundOn = true;
      this._musicOn = false;
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