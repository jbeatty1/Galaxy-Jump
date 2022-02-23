# Galaxy Jump
Fundamentals of Game Design Project

## Update from Tony Imbesi, 2/23/2022

Hi everyone,

I added the file physics-test4.html to the branch. Please download and test it for yourself.
NOTICE: You will need to have phaser.js from https://github.com/photonstorm/phaser/releases/tag/v3.55.2 in the same directory as this .html file in order to run it.
The JavaScript uses that file as a source for various useful library methods.

I have made some significant discoveries here. Here are some of the things I have found out and implemented in this file:
- Scrollable camera!! The Phaser engine has plenty of helpful methods to make a camera that follows the player around. This should be the first thing you notice upon running the file.
- Changing sprite hitboxes: I thought it would be helpful to make it so the player's sprite can be larger than its hitbox. That way, we can have sprites where the character's legs are sticking out one way, but only its main body is vulnerable to damage or collision with terrain. Again, there were some methods that made this task easy once I discovered what they were.

Things I will investigate soon:
- So far, the program has been composed of only one "scene." The scene is an object that loads all the assets and other stuff with the "preload" and "create" methods and runs the gameplay with the "update" method. You can have one scene unload itself and load up another with a "start" function. To me, each scene could represent a gameplay mode. It should be possible to make multiple levels by creating one subclass of Scene that holds all the basic game mechanics, then making children of that subclass that hold all the level-specific features like terrain and elements. Other scenes can probably be used for stuff like menus or cutscenes.
- I saw that someone made some kind of specialized Phaser editor software that lets you view a Phaser scene and move stuff around. That could be helpful for level design, but I haven't actually gotten to testing it out myself. If it's as good as I hope it is, it will be much better than fiddling with the x and y positions of every element in the scene.

I used a placeholder sprite in the project update video, but I haven't figured out how to make it so you can use it on your own computers easily. In order to load assets from your computer in Javascript, you need to make a web server and run the Javascript on the server. The easiest option for me was to use http-server at https://www.npmjs.com/package/http-server. Once you figure out how to install it, you should be able to make a server to run local software on it with one console command. We can work out the details later.

I will have my tutorial ready for everyone by the end of this week. Thanks for reading!
