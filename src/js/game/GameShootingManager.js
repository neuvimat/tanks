const Cfg = require('./Config');
const Shell = require('./Shell');
const Env = require('./Environment');
const ES = require('./EventSystem');
const TurnPass = require('./events/TurnPass');
const Stats = require('../Stats');

class GameShootingManager {
    /**
     *
     * @param game {Game}
     */
    constructor(game) {
        this.game = game;
        this.forcedShot = false;
        this.canShoot = true;

        this.game.sBank.sounds.charge.addEventListener('ended', (e) => {
            this.shoot();
            this.forcedShot = true;
        });
    }

    startShot() {
        if (this.game.canAim) {
            this.canShoot = true;
            this.forcedShot = false;
            this.game.sPlayer.playSound(this.game.sBank.sounds.charge);
        }
    }

    shoot() {
        if (this.canShoot) {
            Stats.increment('shellsFired');
            this.game.canAim = false;
            this.canShoot = false;
            if (this.forcedShot) {
                this.forcedShot = false;
                return;
            }
            let sound = this.game.sBank.sounds.charge;
            let power = 0.1 + sound.currentTime / sound.duration * 0.9;
            if (power == 1) {
                power = Cfg.WIND_BREAKER_SHELL_POWER
            }
            this.game.sPlayer.cancelSound(this.game.sBank.sounds.charge);
            if (power < 0.4) {
                this.game.sPlayer.playSound(this.game.sBank.sounds.shot_weak);
            }
            else {
                this.game.sPlayer.playSound(this.game.sBank.sounds.shot);
            }

            let tank = this.game.activePlayer;
            let spd = power * Cfg.SHELL_MAX_SHOT_SPEED;
            let length = tank.barrelLength;
            let powerX = (tank.barrelX - tank.x) / length;
            let powerY = (tank.barrelY + tank.y) / length;
            new Shell(tank.barrelX, tank.barrelY + tank.barrelHeight,
                spd * powerX,
                spd * powerY,
                null, this.game);
        }
    }

    passTurn() {
        let event;
        if (this.game.activePlayer == this.game.objects.tanks[0]) {
            this.game.activePlayer = this.game.objects.tanks[1];
            event = new TurnPass(this.game.objects.tanks[0], this.game.activePlayer = this.game.objects.tanks[1]);
        }
        else {
            this.game.activePlayer = this.game.objects.tanks[0];
            event = new TurnPass(this.game.objects.tanks[1], this.game.activePlayer = this.game.objects.tanks[0]);
        }
        this.game.canAim = true;
        ES.getInst().fire(event);
    }

    endGame() {

    }
}

module.exports = GameShootingManager;