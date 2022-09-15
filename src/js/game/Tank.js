const FX_SmokeEmitter = require('./FX_SmokeEmitter');
const ES = require('./EventSystem');
const TankHit = require('./events/TankHit');

class Tank {
    constructor(x,y, sprite, hpBar, facing, game) {
        this.x = x;
        this.y = y;
        this.width = 42;
        this.height = 16;
        this.sprite = sprite;
        this.radius = 19;
        this.hpBar = hpBar;
        this.burning = false;
        this.facing = facing;
        this.game = game;

        this.hp = 100;

        this.barrelLength = 15;
        this.barrelHeight = 12;
        this.barrelX = this.x;
        this.barrelY = this.y;
    }

    hurt(dmg) {
        this.hp -= dmg;
        this.hpBar.value = this.hp;
        if (this.hp <= 0) {
            this.hp = 0;
        }
        if (this.hp < 35 && this.burning == false) {
            this.burning = true;
            new FX_SmokeEmitter(this.x- (13 * this.facing), this.y + 7, this.game);
        }
        // IF hurt with damage 0 is called it means to reset the value of the HP bar, for example when new tank spawns hurt(0) makes it reset back to full
        if (dmg > 0) {
            ES.inst.fire(new TankHit(this, dmg));
        }
    }

    aim(x,y) {
        let nx = x;
        let ny = y > this.y + this.barrelHeight ? y : this.barrelHeight;

        let width = this.x - nx;
        let height = ny - this.y - this.barrelHeight;

        this.barrelX = this.x - (width / Math.sqrt(width*width+height*height)) * this.barrelLength;
        this.barrelY = height / (Math.sqrt(width*width+height*height)) * this.barrelLength;

        // this.barrelY = this.y + this.barrelHeight - (height / Math.sqrt(width*width+height*height)) * this.barrelLength;

        // console.log('this.barrelY', this.barrelY);
        // console.log('this.barrelX', this.barrelX);

        // this.barrelY = ny;
        // this.barrelX = nx;
    }

    isAlive() {
        return this.hp > 0;
    }
}

module.exports = Tank;