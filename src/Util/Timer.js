import 'phaser';

/**
 * This is a timer that can run a given callback after some time has elapsed.
 * 
 * @author Tony Imbesi
 * @version 3/19/2022
 */
export default class Timer {
    
    /**
     * Sets a timer with the specified delay and callback function.
     * 
     * @param {Number} time the time in milliseconds
     * @param {Function} callback the function to call
     */
    constructor (time, callback) {
        this.time = time;
        this.callback = callback;
    }

    update(ticks) {
        if (ticks >= this.time) {
            this.callback;
            console.log("Time working");
        }
    }
}