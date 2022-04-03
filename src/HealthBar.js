import 'phaser';
// Code by Josiah Cornelius

// Modified by Tony Imbesi: Introduced more constant variable names and changed class type
// version: 3/31/2022

export default class HealthBar extends Phaser.GameObjects.Graphics {

    /**
     * Set up the health bar.
     * @param {Phaser.Scene} scene the current scene
     * @param {Number} maxHP the maximum capacity of the health bar
     */
    constructor (scene, maxHP, )
    {
        super(scene, { x: 10, y: 10 });
        this.scene = scene;
        // this.bar = new Phaser.GameObjects.Graphics(scene);
        // this.x = x;
        // this.y = y;
        this.max = maxHP;
        this.currentValue = this.max;
        this.borderThickness = 2;
        this.barWidth = 120;
        this.barHeight = 20;
        this.barOffset = this.borderThickness * 2; // Dependent on border thickness. Ensures the inner part is drawn correctly given the border thickness
        this.dangerThreshold = this.max * 0.3;
        this.borderColor = 0x000000;
        this.innerColor = 0xffffff;
        this.normalColor = 0x00ff00;
        this.dangerColor = 0xff0000;
        this.makeBar();
        this.scene.add.existing(this);
        this.setScrollFactor(0);
        // console.log("Loaded bar at " + this.x + ', ' + this.y);
    }

    /**
     * Update the currentValue bar to show this much HP remaining.
     * @param {Number} hp the current hp represented in the bar
     * @returns true if the current value is zero, false otherwise
     */
    setHP (hp)
    {
        this.currentValue = hp;
        if (this.currentValue < 0){
            this.currentValue = 0;
        }
        this.makeBar();
        return (this.currentValue === 0);
    }

    /**
     * Draws the health bar.
     */
    makeBar ()
    {
        this.clear();
        this.fillStyle(this.borderColor);
        this.fillRect(this.x, this.y, this.barWidth, this.barHeight);
        this.fillStyle(this.innerColor);
        this.fillRect(this.x + this.borderThickness, this.y + this.borderThickness, this.barWidth - this.barOffset, this.barHeight - this.barOffset);

        if (this.currentValue <= this.dangerThreshold)
        {
            this.fillStyle(this.dangerColor);
        }
        else
        {
            this.fillStyle(this.normalColor);
        }
        var healthCalculation = Math.floor((this.currentValue / this.max) * (this.barWidth - this.barOffset));
        // console.log(healthCalculation);
        this.fillRect(this.x + this.borderThickness, this.y + this.borderThickness, healthCalculation, this.barHeight - this.barOffset);
    }

}
