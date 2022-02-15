# Galaxy-Jump
Fundamentals of Game Design Project

## Update from Tony Imbesi, 1/30/2022

Hi everyone,

I added the file physics-test1.html to the branch. Please download and test it for yourself.
NOTICE: You will need to have phaser.js from https://github.com/photonstorm/phaser/releases/tag/v3.55.2 in the same directory as this .html file in order to run it.
The JavaScript uses that file as a source for various useful library methods.


I decided to commit to the Phaser 3 game engine. I followed a tutorial at http://phaser.io/tutorials/making-your-first-phaser-3-game/part7 to learn how to implement basic platform game features. 
When I got to part 7, I took the opportunity to code in a rough draft of some of the most fundamental player movement mechanics.
These include more fluid horizontal movement, conservation of momentum, and the ability to move faster than your normal running speed.
Please look into how you can change the jump height with longer or shorter key presses, as I believe that will also be helpful.
After that, I believe we can look into adding in other moves and physics-based objects to interact with.


The player character and platforms use the Arcade Physics engine found in Phaser 3, which is good for simple physics. 
For things like movable boxes or balls that would benefit from more complex physics, we will need Matter.js, the other supported physics engine.
Please look into how we can get Matter.js to work with what we have currently.
See the difference between the two engines for yourself at http://labs.phaser.io/view.html?src=src\physics\multi\arcade%20and%20matter.js&rnd=0.18382359977898455

This link has all the official physics demos for both engines. We won't need everything in here, of course, but it's good to see things demonstrated. http://labs.phaser.io/index.html?dir=physics/&q=


I feel like we can build up a lot of momentum by researching all these things further. Please see what you can do to contribute to this project!

Thank you

-Tony Imbesi


## Update from Tony Imbesi, 2/14/2022

I've managed to implement variable jump height and a side kick. All this can be found in physics-test3.html. Hold down the up arrow to jump higher. Pressing space will create a hitbox in the direction you're facing. If the hitbox collides with the terrain, you will be kicked away. You can conserve the momentum from the kick by jumping repeatedly. Pressing shift teleports you back to the top for testing purposes.
