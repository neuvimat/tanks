const GameRenderer = require('./GameRenderer');
const Rnd = require('../util/Random');

class FX_FireParticle {
    constructor(x,y, ttl, game) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.ay = Rnd.float(0.5,.7);
        this.ax = Rnd.float(-.03,.03);
        this.opacityDegradation = 0.01;
        this.sizeIncrement = -0.16;
        this.opacity = 0.9;

        this.game = game;

        this.game.objects.fx.push(this);
    }

    update() {
        this.opacity -= this.opacityDegradation;
        this.size += this.sizeIncrement;
        if (this.opacity < 0 || this.y < 0 || this.size < 0) {
            this.game.objects.fx.splice(this.game.objects.fx.indexOf(this), 1);
        }
        this.x +=this.ax;
        this.y +=this.ay;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, GameRenderer.deNormalizeY(this.y), this.size, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(170,80,20,' + this.opacity + ')';
        ctx.fill();
    }
}

let x= '#aaaaaa';

module.exports = FX_FireParticle;