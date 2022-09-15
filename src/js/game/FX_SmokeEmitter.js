const GameRenderer = require('./GameRenderer');
const Rnd = require('../util/Random');
const FX_SmokeParticle = require('./FX_SmokeParticle');

class FX_SmokeEmitter {
    constructor(x,y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.game.objects.fx.push(this);

        this.emissionDelay = 14;
        this.timeToEmit = 0;
    }

    update() {
        if (this.timeToEmit == 0) {
            this.timeToEmit = this.emissionDelay;
            new FX_SmokeParticle(Rnd.int(0,4) + this.x, Rnd.int(0,3) + this.y, this.game);
        }
        --this.timeToEmit
    }

    draw(ctx) {

    }
}

module.exports = FX_SmokeEmitter;