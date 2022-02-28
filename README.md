# Galaxy-Jump
Fundamentals of Game Design Project


## Update from Tony Imbesi, 2/28/2022

I've attached a big folder here.

The two files outside the folder will run the game as an external .js file. Put GJ_test1.js, index.html, and the assets folder in a folder together and run it on a webserver to run it properly. I found out you can use the "Live Server" extension on VS Code to do this easily.

The big folder is the result of me following the tutorial at https://phasertutorials.com/creating-a-phaser-3-template-part-1/ to create the foundation for a more involved game. The project file template comes from https://github.com/photonstorm/phaser3-project-template.

If it's done properly, the end result should be more organized, and it will be easier to work on individual parts of the software like controls, entities, and courses without messing up other .js files that refer to them. It will make the project more object-oriented. To run this, download the folder, install NPM on your terminal, go to the folder, then run 'npm install' and 'npm run start' while in the folder. If you open the folder in VS Code, it will let you autocomplete code with Phaser functions and instance variables.
I actually tried to make the Player its own class, but I couldn't get it to work. Let's see if we can make the game easier to make by working with objects and classes.
