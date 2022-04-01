import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y)
    {
        super(config.scene, config.x, config.y);
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.x = x;
        this.y = y;
        this.healthValue = 100;
        this.health = 75 / 100;
        this.makeBar();
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }

    setValue (percentage)
    {
        this.healthValue -= percentage;
        if (this.healthValue < 0){
            this.healthValue = 0;
        }
        this.makeBar();
        return (this.healthValue === 0);
    }

    makeBar ()
    {
        this.bar.clear();
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 80, 16);
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 76, 12);

        if (this.healthValue < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }
        var healthCalculation = Math.floor(this.p * this.healthValue);
        this.bar.fillRect(this.x + 2, this.y + 2, healthCalculation, 12);
    }

}
