const Env = require('./Environment');
const Cfg = require('./Config');
const Rnd = require('../util/Random');

class Wall {
    constructor(x,y, width) {
        this.x = x;
        this.y = y;
        this.width = Cfg.WALL_WIDTH;
        this.height = 60;
        this.randomizeHeight();
    }

    randomizeHeight() {
        // Reduce the wall height if the wind is too strong
        let dampening = 0;
        if (Cfg.WALL_WIND_DAMPENING[Env.windLevel] != undefined) {
            dampening = Cfg.WALL_WIND_DAMPENING[Env.windLevel];
        }
        // this.height = 70;
        this.height = (100-dampening)/100 * (Rnd.int(0,Cfg.WALL_HEIGHT_MAX - Cfg.WALL_HEIGHT_MIN) + Cfg.WALL_HEIGHT_MIN);
    }
}

module.exports = Wall;