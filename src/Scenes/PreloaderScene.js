// Begin modified code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

import 'phaser';

/**
  The Preloader scene will show the loading graphics and
  load additional assets.

  Modified by Tony Imbesi, 4/12/2022
*/
export default class PreloaderScene extends Phaser.Scene {
  constructor () {
        super('Preloader');
  }
  preload () {
        // add logo image
        this.add.image(400, 200, 'logo');
        // display progress bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
        // Centers the loading text
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
        }
        });
        loadingText.setOrigin(0.5, 0.5);
        var percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
        });
        percentText.setOrigin(0.5, 0.5);
        var assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
        });
        assetText.setOrigin(0.5, 0.5);
        // update progress bar
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        // update file progress text
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        // remove progress bar when complete
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            this.ready();
        }.bind(this));

        this.timedEvent = this.time.delayedCall(3000, this.ready, [], this);
        
        // load assets needed in our game
        this.load.image('blueButton1', 'assets/ui/blue_button02.png');
        this.load.image('blueButton2', 'assets/ui/blue_button03.png');
        this.load.image('phaserLogo', 'assets/logo.png');
        this.load.image('box', 'assets/ui/grey_box.png');

        this.load.image('pause', 'assets/ui/pausescreen.png');

        this.load.image('checkedBox', 'assets/ui/blue_boxCheckmark.png');
        this.load.audio('titleMusic', ['assets/music/TitleTheme.ogg']);
        this.load.audio('japeFoot', ['assets/music/JapeFoot.ogg']);
        this.load.audio('heatSecret', ['assets/music/HeatSecret.ogg']);
        this.load.audio('psychoZone', ['assets/music/PsychoZone.ogg']);

        this.load.audio('pauseEnter', ['assets/sounds/pauseEnter.ogg']);
        this.load.audio('pauseExit', ['assets/sounds/pauseExit.ogg']);

        this.load.audio('jump', ['assets/sounds/jump1B.ogg']);
        this.load.audio('jump2', ['assets/sounds/jump2B.ogg']);
        this.load.audio('playerKick', ['assets/sounds/playerKick.ogg']);
        this.load.audio('playerFlip', ['assets/sounds/playerFlip.ogg']);
        this.load.audio('rebound', ['assets/sounds/reboundB.ogg']);

        this.load.audio('powerupFound', ['assets/sounds/powerupFound.ogg']);
        this.load.audio('speedupFound', ['assets/sounds/speedupFound.ogg']);
        this.load.audio('laserFound', ['assets/sounds/laserFound.ogg']);
        this.load.audio('doublejumpFound', ['assets/sounds/doublejumpFound.ogg']);

        this.load.audio('hurt', ['assets/sounds/hurt.ogg']);
        this.load.audio('hurt2', ['assets/sounds/hurt2.ogg']);
        this.load.audio('healthWarn', ['assets/sounds/healthWarn.ogg']);

        this.load.audio('dropKickCharge', ['assets/sounds/dropKickChargeE.ogg']);
        this.load.audio('dropKick', ['assets/sounds/dropKickB.ogg']);
        this.load.audio('dropKickRebound', ['assets/sounds/dropKickReboundC.ogg']);
        this.load.audio('playerLaser', ['assets/sounds/playerLaserB.ogg']);

        this.load.audio('enemyLaserCharge', ['assets/sounds/enemyLaserChargeC.ogg']);
        this.load.audio('enemyLaserFire', ['assets/sounds/enemyLaserFireC.ogg']);
        this.load.audio('enemyLaserFiring', ['assets/sounds/enemyLaserFiringE.ogg']);

        this.load.audio('lose', ['assets/sounds/lose.ogg']);
        this.load.audio('win', ['assets/sounds/win.ogg']);
        this.load.audio('checkpoint', ['assets/sounds/checkpoint.ogg']);
        
        this.load.spritesheet('dude', 'assets/player/dude.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('cone', 'assets/entities/cone.png', { frameWidth: 32, frameHeight: 34 });
        this.load.spritesheet('supercone', 'assets/entities/supercone.png', { frameWidth: 32, frameHeight: 34 });

        // this.load.image('semisolid', 'assets/tilesets/platformPack_tilesheet.png');
        this.load.image('tiles', 'assets/tilesets/fantasy-tiles_32x32.png');
        this.load.image('tiles1', 'assets/tilesets/course1.png');
        // this.load.image('tiles2', 'assets/tilesets/fantasy-tiles_32x32.png');
        // this.load.image('tiles3', 'assets/tilesets/fantasy-tiles_32x32.png');

        this.load.image('objects', 'assets/tilesets/objects.png');
        this.load.image('cannon', 'assets/entities/cannon.png');
        this.load.spritesheet('laser', 'assets/entities/laserCannon.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('laserbeam', 'assets/entities/laserbeam.png')
        this.load.spritesheet('laserdown', 'assets/entities/laserdown.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('copter', 'assets/entities/copter.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jumpster', 'assets/entities/jumpster.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('funbat', 'assets/entities/funbat.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('comet', 'assets/entities/comet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('spikes', 'assets/entities/spikes.png');
        this.load.image('heat1', 'assets/entities/warning.png');
        this.load.image('heat2', 'assets/entities/warning2a.png');
        this.load.spritesheet('laserwarn', 'assets/entities/warning3.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('coin', 'assets/items/coin.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('laserItem', 'assets/items/laserItem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('doublejump', 'assets/items/doublejump.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('speedup', 'assets/items/speedup.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('checkpoint', 'assets/entities/checkpoint.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('bg1', 'assets/bg/asteroidbg.png');
        this.load.image('bg2', 'assets/bg/desertbg.png');
        this.load.image('bg3', 'assets/bg/galaxybg.png');
        this.load.spritesheet('goal1', 'assets/entities/goal.png', { frameWidth: 56, frameHeight: 48 });
        this.load.spritesheet('goal2', 'assets/entities/goal2.png', { frameWidth: 56, frameHeight: 48 });

        this.load.image('titleBg', 'assets/bg/titleBack.png');

        this.load.image('dKickParticle', 'assets/entities/dKickParticle.png');

        
        // this.load.image('bg2', 'assets/bg/sky.png');
        // this.load.image('bg3', 'assets/bg/sky.png');
        // Increment readyCount again once all audio files are decoded:
        // this.sound.once('decodeall', function() {
        //   this.ready();
        // });
  }

  create () {
  }

  init () {
        this.readyCount = 0;
  }

  /**
   * Various parts of the preload method call this method once they're done loading stuff.
   * Ideally, this should guarantee that every asset can be deployed instantly before the game continues further.
   * When everything is ready, this will open the title scene.
   */
  ready () {
        // this.scene.start('Title'); // Comment this line out to ensure everything is loaded. Keep it in to get to the title faster.
        this.readyCount++;
        if (this.readyCount === 2) {
          this.scene.start('Title');
        }
  }
};