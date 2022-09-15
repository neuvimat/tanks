/** SINGILETON **/

const Rnd = require('../util/Random');
const Cfg = require('./Config');
const ES = require('./EventSystem');
const WindChange = require('./events/WindChange');

class Environment {
    constructor() {
        this.windSpeed = 0;
        this.windLevel = 0;
        this.gravity = Cfg.GRAVITY;
    }

    getWindSpeed() {
        return this.windSpeed;
    }

    getWindLevel() {
        return this.windLevel;
    }

    getGravity() {
        return Cfg.GRAVITY;
    }

    /**
     * Randomized the wind speed and direction
     */
    randomize() {
        let steps = Rnd.int(0, Cfg.WIND_VARIANCE_STEPS);
        this.windLevel = steps; // Used for building a wall (Mexico pays ofc)
        let sign = Rnd.sign();
        this.windSpeed = steps * sign * Cfg.WIND_VARIANCE_INCREMENT * Cfg.WIND_POWER;
        ES.getInst().fire(new WindChange(this.windSpeed, this.windLevel))
    }

    /**
     * Only swaps the wind direction. Used for the mirror gamemode
     */
    swapWind() {
        this.windSpeed = -this.windSpeed;
        ES.getInst().fire(new WindChange(this.windSpeed, this.windLevel))
    }
}

module.exports = new Environment();