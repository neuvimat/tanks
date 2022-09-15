const Cfg = require("./Config");
const Mouse = require("../Mouse");

let cw = 0;
let ch = 0;
let groundLevel = 0;

/**
 *
 */
class GameRenderer {
    /**
     * @param cDyn Canvas where dynamic part of the game that change every frame are drawn
     * @param cStc Canvas where only static content is drawn, refreshed only at resize
     * @param game {Game}
     */
    constructor(cDyn, cStc, game) {
        this.cDyn = cDyn;
        this.cStc = cStc;
        this.ctxDyn = cDyn.getContext('2d');
        this.ctxStc = cStc.getContext('2d');
        this.zoom = 1; // Unused currently
        this.ratio = [4, 3]; // Unused currently
        this.game = game;

        cw = window.innerWidth;
        ch = window.innerHeight;
    }

    getWidth() {
        return cw;
    }

    getHeight() {
        return ch;
    }

    getSize() {
        return {x: cw, y: ch};
    }

    onResize() {
        cw = window.innerWidth;
        ch = window.innerHeight;
        groundLevel = ch - Cfg.GROUND_HEIGHT;
        this.cDyn.width = cw;
        this.cDyn.height = ch;
        this.cStc.width = cw;
        this.cStc.height = ch;

        this.drawStatic();
        this.drawDynamic();
    }

    drawDynamic() {
        this.ctxDyn.clearRect(0, 0, cw, ch);
        objectDrawer.clouds(this.ctxDyn, this.game.objects.clouds);
        objectDrawer.shells(this.ctxDyn, this.game.objects.shells);
        objectDrawer.tank_barrels(this.ctxDyn, this.game.objects.tanks);
        objectDrawer.fx(this.ctxDyn, this.game.objects.fx);
        objectDrawer.walls(this.ctxDyn, this.game.objects.walls);
        let power = this.game.sBank.sounds.charge.currentTime / this.game.sBank.sounds.charge.duration;
        if (power) objectDrawer.shotIndicator(this.ctxDyn, power);
    }

    drawStatic() {
        objectDrawer.ground(this.ctxStc);
        objectDrawer.sky(this.ctxStc);
        objectDrawer.tanks(this.ctxStc, this.game.objects.tanks);
    }

    /**
     * Updates the UI wind indicator in the top center of the screen
     * @param windEvent
     */
    drawWind(windEvent) {
        this.eLeft = document.querySelector('.wind-left-bar');
        this.eRight = document.querySelector('.wind-right-bar');
        let active = this.eLeft;
        let other = this.eRight;

        if (windEvent.windSpeed > 0) {
            active = this.eRight;
            other = this.eLeft;
        }
        if (windEvent.windLevel != Cfg.WIND_VARIANCE_STEPS) {
            active.style.width = 22 * windEvent.windLevel + 'px';
        }
        else {
            // The wind bar has a 7px border radius, if the bar is supposed to be full, remove the radius by
            // extending the bar additional 7 pixels
            active.style.width = 22 * windEvent.windLevel + 7 + 'px';
        }
        active.style.animationDuration = 1 / (1 + windEvent.windLevel / 3) + 's';
        other.style.width = '0px';
    }

    drawDamageNumber(tankHitEvent) {
        let e = document.createElement('div');
        e.innerHTML = '-' + tankHitEvent.dmg;
        e.classList.add('damage-number');
        e.style.top = GameRenderer.deNormalizeY(tankHitEvent.tank.y + 45) + 'px';
        e.style.left = tankHitEvent.tank.x + 'px';
        e.style.opacity = '1';
        document.getElementById('game-ui').appendChild(e);

        setTimeout(() => {
            e.style.top = GameRenderer.deNormalizeY(tankHitEvent.tank.y + 75) + 'px';
        }, 0);
        setTimeout(() => {
            e.style.opacity = '0';
        }, 1500);
        setTimeout(() => {
            document.getElementById('game-ui').removeChild(e);
        }, 2500);
    }

    /**
     * OVERTIME flyby
     */
    overtime() {
        let overtime = document.createElement('div');
        overtime.classList.add('game-overtime', 'game-flyby');
        overtime.innerText = "OVERTIME";
        overtime.addEventListener('animationend', (e)=>{
            overtime.remove();
        });
        document.body.appendChild(overtime);
    }

    /**
     * DRAW flyby
     */
    draw() {
        let draw = document.createElement('div');
        draw.classList.add('game-overtime', 'game-flyby');
        draw.innerText = "DRAW!";
        draw.addEventListener('animationend', (e)=>{
            draw.remove();
        });
        document.body.appendChild(draw);
    }

    /**
     * WIN flyby
     * @param winner
     */
    win(winner) {
        let flyby = document.createElement('div');
        flyby.classList.add('game-win', 'game-flyby');
        flyby.innerHTML = winner + "<br/>WINS!";
        flyby.addEventListener('animationend', (e) => {
            flyby.remove();
        });
        document.body.appendChild(flyby);
    }

    /**
     * Draw endgame buttons - EXIT or RESTART
     */
    endgameButtons() {
        let wrapper = document.createElement('div');
        wrapper.className = 'button-wrapper';

        let resetButton = document.createElement('button');
        resetButton.innerHTML = 'Restart';
        resetButton.className = 'button';
        resetButton.addEventListener('click',(e)=>{this.game.restart(); wrapper.remove()});

        let exitButton = document.createElement('button');
        exitButton.innerHTML = 'Exit';
        exitButton.className = 'button';
        exitButton.addEventListener('click',(e)=>{this.game.exit(); wrapper.remove()});

        wrapper.append(resetButton, exitButton);

        $("#game-ui").append(wrapper);
    }

    /**
     * Convert between absolute screen coord and the relative ground coordinate
     * @param y
     * @returns {number}
     */
    static normalizeY(y) {
        return ch - y - Cfg.GROUND_HEIGHT;
    }

    /**
     * Convert between absolute screen coord and the relative ground coordinate
     * @param normalY
     * @returns {number}
     */
    static deNormalizeY(normalY) {
        return -normalY + ch - Cfg.GROUND_HEIGHT;
    }
}

/**
 * Box that holds methods for rendering specific part of the game
 * @type {{sprite_t1: HTMLElement | null, sprite_t2: HTMLElement | null, ground(*): void, sky(*): void, clouds(*, *): void, shells(*, *): void, tanks(*, *): void, tank_barrels(*, *): void, fx(*=, *): void, walls(*, *): void, shotIndicator(*, *): void}}
 */
const objectDrawer = {
    sprite_t1: document.getElementById('g_tank1'),
    sprite_t2: document.getElementById('g_tank2'),
    ground(ctx) {
        ctx.fillStyle = '#78d13f';
        ctx.fillRect(0, ch - Cfg.GROUND_HEIGHT, cw, ch);
    },
    sky(ctx) {
        let grad = ctx.createLinearGradient(0, 0, cw, ch - Cfg.GROUND_HEIGHT);
        grad.addColorStop(0, '#85b2ff');
        grad.addColorStop(1, '#90d0ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch - Cfg.GROUND_HEIGHT);
    },
    /**
     * Currently unused, but prepared for later
     * @param ctx
     * @param clouds
     */
    clouds(ctx, clouds) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        for (let c of clouds) {
            ctx.beginPath();
            ctx.arc(c.x - 40, c.y, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x + 40, c.y, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x + 0, c.y, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x - 20, c.y - 32, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x + 25, c.y - 32, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    shells(ctx, shells) {
        ctx.fillStyle = 'black';
        for (let shell of shells) {
            ctx.beginPath();
            ctx.arc(shell.x, GameRenderer.deNormalizeY(shell.y), 3, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    tanks(ctx, tanks) {
        for (let tank of tanks) {
            ctx.drawImage(tank.sprite, tank.x - tank.width / 2, groundLevel - tank.y - tank.height);
            // tank collision radius - 19
        }
    },
    tank_barrels(ctx, tanks) {
        for (let tank of tanks) {
            ctx.beginPath();
            ctx.moveTo(tank.x, GameRenderer.deNormalizeY(tank.y + tank.barrelHeight));
            ctx.lineTo(tank.barrelX, GameRenderer.deNormalizeY(tank.barrelY + tank.barrelHeight + tank.y));
            ctx.stroke();
        }
    },
    fx(ctx, fxs) {
        for (let fx of fxs) {
            fx.draw(ctx);
        }
    },
    walls(ctx, walls) {
        ctx.fillStyle = '#cc7a30';
        for (let wall of walls) {
            ctx.fillRect(wall.x, GameRenderer.deNormalizeY(wall.y), wall.width, -wall.height)
        }
    },
    shotIndicator(ctx, power) {
        ctx.fillStyle = "#CC2020";
        ctx.beginPath();
        ctx.moveTo(Mouse.x, Mouse.y);
        ctx.arc(Mouse.x, Mouse.y, 14, -Math.PI/2, -Math.PI/2 +  Math.PI * 2 * power);
        ctx.closePath();
        ctx.fill();
    }
};

module.exports = GameRenderer;