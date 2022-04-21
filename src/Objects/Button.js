// Code from https://phasertutorials.com/creating-a-phaser-3-template-part-3/
// Modified by Tony Imbesi
import 'phaser';

/**
    Constructs a default button to go to a different game scene.
    @param scene the scene this button appears in
    @param x the x position of the button
    @param y the y position of the button
    @key1 the key of the unpressed button image
    @key2 the key of the button image when hovered over with the mouse
    @text the text in the button
    @targetScene the scene to start when the button is clicked, or null for no scene
    @launch If true, the target scene will be launched instead of started. This means
            the previous scene will remain loaded after the button is pressed. (default false)
*/
export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, key1, key2, text, targetScene, launch) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.launch = launch;
        if (this.launch === undefined) {
            this.launch = false;
        }

        this.button = this.scene.add.sprite(0, 0, key1).setInteractive();
        this.text = this.scene.add.text(0, 0, text, { fontSize: '32px', fill: '#fff' });
        Phaser.Display.Align.In.Center(this.text, this.button);

        this.add(this.button);
        this.add(this.text);

        this.button.on('pointerdown', function () {
            if (targetScene != null) {
                if (!this.launch)
                    this.scene.scene.start(targetScene);
                else
                    this.scene.scene.launch(targetScene);
            }
        }.bind(this));

        this.button.on('pointerover', function () {
            this.button.setTexture(key2);
        }.bind(this));

        this.button.on('pointerout', function () {
            this.button.setTexture(key1);
        }.bind(this));

        this.scene.add.existing(this);
        console.log("Button loaded");
        
    }
}