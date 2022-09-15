const GameRenderer = require('./GameRenderer');
const Env = require('./Environment');
const Rnd = require('../util/Random');

class FX_SmokeParticle {
    constructor(x,y, game) {
        this.x = x;
        this.y = y;
        this.size = 4;
        this.ay = Rnd.float(0.18,0.25);
        this.ax = Rnd.float(-.07,.07);
        this.opacityDegradation = 0.002;
        this.sizeIncrement = 0.04;
        this.opacity = 0.6;

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
        ctx.fillStyle = 'rgba(20,20,20,' + this.opacity + ')';
        ctx.fill();
    }
}

module.exports = FX_SmokeParticle;