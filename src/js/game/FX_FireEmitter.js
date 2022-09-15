const Rnd = require('../util/Random');
const FX_FireParticle = require('./FX_FireParticle');

class FX_FireEmitter {
    constructor(x,y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.game.objects.fx.push(this);

        this.emissionDelay = 5;
        this.timeToEmit = 0;
    }

    update() {
        if (this.timeToEmit == 0) {
            this.timeToEmit = this.emissionDelay;
            let x = Rnd.int(-6,6);
            new FX_FireParticle(x + this.x, Rnd.int(-2,2) + this.y,1.5 - x/6, this.game);
        }
        --this.timeToEmit
    }

    draw(ctx) {

    }
}

module.exports = FX_FireEmitter;