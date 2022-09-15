const Env = require('./Environment');
const Cfg = require('./Config');
const Rnd = require('../util/Random');
const TankHit = require('./events/TankHit');
const ES = require('./EventSystem');
const FX_Explosion = require('./FX_Explosion');
const FX_Dust = require('./FX_Dust');
const Stats = require('../Stats');

class Shell {
    constructor(x, y, ax, ay, plr, game) {
        this.ax = ax;
        this.ay = ay;
        this.x = x;
        this.y = y;
        this.game = game;
        this.tank1 = this.game.objects.tanks[0];
        this.tank2 = this.game.objects.tanks[1];
        this.wall = this.game.objects.walls[0];

        this.game.objects.shells.push(this);
    }

    /**
     * The simplest way possible but w/e
     */
    checkCollision() {
        if (this.y < 0) this.y = 0;
        let distance1 = (this.x - this.tank1.x) * (this.x - this.tank1.x) + (this.y - this.tank1.y) * (this.y - this.tank1.y);
        if (distance1 < this.tank1.radius * this.tank1.radius) {
            this.collideTank(this.tank1);
            return;
        }
        let distance2 = (this.x - this.tank2.x) * (this.x - this.tank2.x) + (this.y - this.tank2.y) * (this.y - this.tank2.y);
        if (distance2 < this.tank2.radius * this.tank2.radius) {
            this.collideTank(this.tank2);
            return;
        }
        if (this.wall && (this.x > this.wall.x && this.x < this.wall.x + this.wall.width && this.y < this.wall.y + this.wall.height)) {
            this.collideWall();
            return;
        }
        if (this.y <= 0) {
            this.y = 0;
            this.collideGround(distance1, distance2);
            return;
        }
    }

    collideGround(distance1, distance2) {
        for (let i = 0; i < Rnd.int(3, 7); i++) {
            new FX_Dust(this.x, this.y, this.game);
        }

        let dist1 = Math.sqrt(distance1);
        let dmg1 = Math.round(Cfg.SHELL_DAMAGE_GROUND * this._dmgModifier(dist1));
        if (dmg1 >= 1) {
            this.tank1.hurt(dmg1);
        }

        let dist2 = Math.sqrt(distance2);
        let dmg2 = Math.round(Cfg.SHELL_DAMAGE_GROUND * this._dmgModifier(dist2));
        if (dmg2 >= 1) {
            this.tank2.hurt(dmg2);
        }
        this.collideShared();
        Stats.increment('groundHits');
    }

    collideWall() {
        this.collideShared();
        Stats.increment('wallHits');
    }

    /**
     * Returns a value from 0 to 1 that represents the damage fall off dependent on distance between the shot and a tank
     * @param distance
     * @returns {number}
     * @private
     */
    _dmgModifier(distance) {
        if (distance <= Cfg.TANK_COLLISION_RADIUS) {
            return 1;
        }
        if (distance >= Cfg.TANK_COLLISION_RADIUS + Cfg.SHELL_DAMAGE_GROUND_AOE) {
            return 0;
        }
        return 1 - (distance - Cfg.TANK_COLLISION_RADIUS) / Cfg.SHELL_DAMAGE_GROUND_AOE;
    }

    collideTank(tank) {
        this.game.sPlayer.playSound(this.game.sBank.sounds.direct_hit);
        tank.hurt(Cfg.SHELL_DAMAGE_DIRECT);
        ES.inst.fire(new TankHit(tank, Cfg.SHELL_DAMAGE_DIRECT));
        this.collideShared();
        Stats.increment('directHits');
    }

    /**
     * This part is the same for any collision possibility (wall/tank/ground)
     */
    collideShared() {
        this.game.controls.passTurn();
        this.game.sPlayer.playSound(this.game.sBank.sounds.hit);
        this.game.objects.shells.splice(this.game.objects.shells.indexOf(this), 1);
        new FX_Explosion(this.x, this.y, this.game);
    }

    /**
     * Once per frame
     */
    update() {
        this.checkCollision();
        this.x += this.ax;
        this.y += this.ay;
        let direction = this.ax > 0 ? 1 : -1;
        this.ax = (this.ax + Env.getWindSpeed()) - Cfg.SHELL_AIR_DRAG * (this.ax * this.ax) * direction;
        this.ay -= Env.getGravity();

    }
}

module.exports = Shell;