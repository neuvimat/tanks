// The feature of clouds was put on hold, just leaving this here in case

const Env = require('./Environment.js');
const Rnd = require('../util/Random.js');

class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Rnd.float(0.5,1);
    }

    update() {
        this.x += Env.windSpeed();
    }
}

module.exports = Cloud;