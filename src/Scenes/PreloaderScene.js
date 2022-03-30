// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/

import 'phaser';

/**
  The Preloader scene will show the loading graphics and
  load additional assets.
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
        this.load.image('checkedBox', 'assets/ui/blue_boxCheckmark.png');
        this.load.audio('titleMusic', ['assets/music/spelunky1.mp3']);
        
        this.load.spritesheet('dude', 'assets/player/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('cone', 'assets/entities/cone.png', { frameWidth: 32, frameHeight: 34 });
        this.load.spritesheet('supercone', 'assets/entities/supercone.png', { frameWidth: 32, frameHeight: 34 });

        this.load.image('semisolid', 'assets/tilesets/platformPack_tilesheet.png');
        this.load.image('tiles', 'assets/tilesets/fantasy-tiles_32x32.png');
        this.load.image('objects', 'assets/tilesets/objects.png');
        this.load.image('cannon', 'assets/entities/cannon.png');
        this.load.spritesheet('laser', 'assets/entities/laserCannon.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('laserbeam', 'assets/entities/laserbeam.png')
        this.load.spritesheet('copter', 'assets/entities/copter.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jumpster', 'assets/entities/jumpster.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('funbat', 'assets/entities/funbat.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('comet', 'assets/entities/comet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('spikes', 'assets/entities/spikes.png');
  }

  create () {
  }

  init () {
        this.readyCount = 0;
  }

  ready () {
        this.readyCount++;
        if (this.readyCount === 2) {
          this.scene.start('Title');
        }
  }
};