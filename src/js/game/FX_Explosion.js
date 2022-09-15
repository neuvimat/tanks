const GameRenderer = require('./GameRenderer');

class FX_Explosion {
    constructor(x,y, game) {
        this.x = x;
        this.y = GameRenderer.deNormalizeY(y);
        this.opacity = 0;
        this.game = game;
        this.color = 'rgb(255, 120, 0, ';
        this.size = 0.1;

        this.game.objects.fx.push(this);
    }

    update() {
        this.opacity += 0.4;
        this.size += .8;
        if (this.opacity > 1.6) {
            this.opacity = 0.5;
            this.size = 1;
            this.color = 'rgb(25, 25, 25, ';
            this.update = ()=> {
                this.size -= 0.003;
                this.opacity -= 0.005;
                if (this.opacity < 0) {
                    this.game.objects.fx.splice(this.game.objects.fx.indexOf(this), 1);
                }
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12 * this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
    }
}

module.exports = FX_Explosion;