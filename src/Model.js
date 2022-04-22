// Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
/*
    This class controls the game's global settings.
    Other scenes can refer to the methods by taking the following steps:
    - Access the global instance of this model by calling this.sys.game.globals.model
    - Access properties like bgMusicPlaying by using model.bgMusicPlaying, for example
    Modified by Tony Imbesi
*/
export default class Model {
    constructor() {
      this._soundOn = true;
      this._musicOn = true;
      this._bgMusicPlaying = false;
      this._gamePaused = false;
      this._checkpointSet = false;
      this._spawnX = undefined;
      this._spawnY = undefined;
      this._levelsCleared = 0;
      this._musicID = 0;

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
    set gamePaused(value) {
      this._gamePaused = value;
    }
    get gamePaused() {
      return this._gamePaused;
    }
    get msUntilTick() {
      return this._msUntilTick;
    }

    set checkpointSet(value) {
      this._checkpointSet = value;
    }
    get checkpointSet() {
      return this._checkpointSet;
    }
    set spawnX(value) {
      this._spawnX = value;
    }
    get spawnX() {
      return this._spawnX;
    }
    set spawnY(value) {
      this._spawnY = value;
    }
    get spawnY() {
      return this._spawnY;
    }
    set levelsCleared(value) {
      this._levelsCleared = value;
    }
    get levelsCleared() {
      return this._levelsCleared;
    }
    set musicID(value) {
      this._musicID = value;
    }
    get musicID() {
      return this._musicID;
    }
  }
  // End modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/