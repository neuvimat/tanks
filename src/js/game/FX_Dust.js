const GameRenderer = require('./GameRenderer');
const Env = require('./Environment');
const Rnd = require('../util/Random');

class FX_Dust {
    constructor(x,y, game) {
        this.x = x;
        this.y = y;
        this.ax = Rnd.float(-3,3);
        this.ay = Rnd.float(4,10);
        this.opacity = 1.2;
        this.game = game;
        this.color = 'rgb(110, 96, 31, ';
        this.size = Rnd.float(1,2);
        this.sizeDegradation = Rnd.float(0.001,0.015);
        this.opacityDegradation = Rnd.float(0.001,0.015);

        this.game.objects.fx.push(this);
    }

    update() {
        this.opacity -= this.opacityDegradation;
        this.size -= this.sizeDegradation;
        if (this.opacity < 0 || this.y < 0 || this.size < 0) {
            this.game.objects.fx.splice(this.game.objects.fx.indexOf(this), 1);
        }
        this.ay -= Env.getGravity();
        this.x +=this.ax;
        this.y +=this.ay;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, GameRenderer.deNormalizeY(this.y), this.size * this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
    }
}

module.exports = FX_Dust;