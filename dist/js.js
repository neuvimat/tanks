/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(1);
const Cfg = __webpack_require__(3);
const CfgWgt = __webpack_require__(26);
const GameState = __webpack_require__(27);
const VideoControls = __webpack_require__(28);
const Stats = __webpack_require__(14);
const OnlineTracker = __webpack_require__(29);
const Notificator = __webpack_require__(30);
const Router = __webpack_require__(31);
const Customization = __webpack_require__(32);

(function () {
    console.log('Setting up...');
    window.addEventListener('load', onLoad);
})();

function onLoad() {
    // Prepare debug menu for the game
    // Possibly should be in its own module but w/e
    let debug = document.getElementById('game-debug-content');
    debug.appendChild(CfgWgt.getDebugNode());
    $("#game-debug-button").click((e)=>{
        if (debug.classList.contains('visible')) {
            debug.classList.remove('visible');
        }
        else {
            debug.classList.add('visible');
        }
    });
    $("#game-exit-button").click((e)=>{
        if (confirm('Are you sure u want to leave the game? (You can resume it later or start a brand new one)')) {
            this.router.route('#r_game');
        }
    });

    console.log('Creating game state (and initializing game with it)');
    let gameState = new GameState();

    let router = new Router(gameState);
    VideoControls.init(); // Sets up the video controls on Home
    Stats.update(); // Loads the proper stats from localStorage
    window.router = router;

    // Set the default route
    if (document.location.hash === '') {
        router.route('#r_home');
        history.replaceState(null, document.location, '#r_home');
    }

    console.log('Loading finished!');
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/** SINGLETON **/

const GameRenderer = __webpack_require__(2);
const GameShootingManager = __webpack_require__(5);
const EventSystem = __webpack_require__(9);
const WindChange = __webpack_require__(10);
const Tank = __webpack_require__(16);
const Cfg = __webpack_require__(3);
const Mouse = __webpack_require__(4);
const SoundBank = __webpack_require__(19);
const SoundPlayer = __webpack_require__(20);
const Wall = __webpack_require__(21);
const Env = __webpack_require__(7);
const GM_Mirror = __webpack_require__(22);
const GM_Classic = __webpack_require__(23);
const Stats = __webpack_require__(14);
const FX_FireEmitter = __webpack_require__(24);
const FX_Explosion = __webpack_require__(12);
const Rnd = __webpack_require__(8);

const gStatus = {
    PLAYING: 0,
    PAUSED: 1,
    SETUP: 2,
};

class Game {
    constructor(state) {
        this.elems = {
            canvas: {
                dynamic: document.getElementById('game-canvas-dynamic'),
                static: document.getElementById('game-canvas-static')
            },
            ui: {
                wind: document.querySelector('#game-ui .wind'),
                player1: {
                    wrapper: document.querySelector('#game-ui .first-player-status'),
                    hpBar: document.querySelector('#game-ui .first-player-status progress'),
                    name: document.querySelector('#game-ui .first-player-status .player-name'),
                },
                player2: {
                    wrapper: document.querySelector('#game-ui .second-player-status'),
                    hpBar: document.querySelector('#game-ui .second-player-status progress'),
                    name: document.querySelector('#game-ui .second-player-status .player-name'),
                }
            }
        };

        this.status = gStatus.SETUP;
        this.player1 = null; // Shortcut
        this.player2 = null; // Shortcut
        this.activePlayer = null;
        this.canAim = true; // If true, then the active tank aims at the cursor and the game reacts to mouse clicks

        this.sBank = new SoundBank();
        this.sPlayer = new SoundPlayer();
        this.renderer = new GameRenderer(this.elems.canvas.dynamic, this.elems.canvas.static, this);
        this.controls = new GameShootingManager(this);

        this.isRunning = false; // Used for pausing when out of focus

        this.objects = {
            tanks: [],
            shells: [],
            clouds: [],
            fx: [],
            walls: [],
        };

        this.es = new EventSystem();
        this._setupClicks();
        this._setupEvents();
        this.state = state;

        // For easier debug
        // window.renderer = this.renderer;
        // window.game = this;
    }

    _setupClicks() {
        document.getElementById('game-ui').addEventListener('mousedown', (e) => {
            this.controls.startShot();
        });
        document.getElementById('game-ui').addEventListener('mouseup', (e) => {
            this.controls.shoot();
        });
    }

    createNew() {
        this._basicSetup();
        this._formSetup(); // The form cannot be updated while the game is running, so the game cannot be restarted with different settings
        this.start();
    }

    _basicSetup() {
        $('#game-debug-content').removeClass('visible');
        this.sPlayer.playSound(this.sBank.sounds.intro);

        // Center the tanks around the current screen size, maximum size of 1366 (my notebook)
        let edgeOffset = this.renderer.getWidth() / 2;
        if (edgeOffset > 683) edgeOffset = 683;
        else if (edgeOffset < 200) edgeOffset = 200; // Since the browser cannot be shrinked too much, this settings seems OK even for the minimum size possible
        edgeOffset -= 100;

        this.objects.tanks[0] = new Tank(this.renderer.getWidth() / 2 - edgeOffset, 0, document.getElementById('g_tank1'), this.elems.ui.player1.hpBar, 1, this);
        this.objects.tanks[1] = new Tank(this.renderer.getWidth() / 2 + edgeOffset, 0, document.getElementById('g_tank2'), this.elems.ui.player2.hpBar, -1, this);
        this.objects.tanks[0].hurt(0); // Ping the hpBar to trigger visual reset
        this.objects.tanks[1].hurt(0); // Ping the hpBar to trigger visual reset
        this.objects.tanks[0].aim(200, 0);
        this.objects.tanks[1].aim(200, 0);
        this.player1 = this.objects.tanks[0]; // shortcut
        this.player2 = this.objects.tanks[1]; // shortcut
        this.activePlayer = this.objects.tanks[0];
        this.objects.walls = []; // Clear any walls from last game, in _setupForm we may add it in again
        this.objects.fx = [];
        this.objects.shells = [];
        this.canAim = true;

        Env.randomize();
    }
    _formSetup() {
        this.mode = this._setGamemode($('#form-gamemode').val());
        this.player1.name = $('#form-plr1-name').val();
        this.player2.name = $('#form-plr2-name').val();

        // The model is separated from the view
        this.elems.ui.player1.name.innerText = this.player1.name;
        this.elems.ui.player2.name.innerText = this.player2.name;

        if ($('#form-wall').is(':checked')) {
            this.objects.walls[0] = new Wall((this.renderer.getWidth()) / 2 - Cfg.WALL_WIDTH / 2, 0, 4);
        }

        let debugButton = $('#game-debug-button');
        if ($('#form-debug').is(':checked')) {
            debugButton.show();
        }
        else {
            debugButton.hide();
        }
    }

    restart() {
        this._basicSetup();
        this._formSetup(); // The form cannot be updated while the game is running, so the game cannot be restarted with different settings
    }

    start() {
        this.status = gStatus.PLAYING;
        if (!this.isRunning) {
            this.isRunning = true;
            this._loop();
        }
    }

    pause() {
        this.status = gStatus.PAUSED;
        this.isRunning = false;
        this.sPlayer.cancelSound(this.sBank.sounds.overtime);
    }

    _loop() {
        if (!this.isRunning) return;
        if (this.canAim) {
            this.activePlayer.aim(Mouse.x, GameRenderer.normalizeY(Mouse.y));
        }
        for (let obj of this.objects.shells) {
            obj.update();
        }
        for (let obj of this.objects.fx) {
            obj.update();
        }
        this.renderer.drawDynamic();
        // this.renderer._prediction(Mouse.x, GameRenderer.normalizeY(Mouse.y));
        requestAnimationFrame(() => {this._loop()});
    }

    _setupEvents() {
        this.es.listen('WindChange', (e) => {
            this.renderer.drawWind(e);
        });

        if (this.objects.walls.length > 0)
            this.es.listen('WindChange', (e) => {
            });

        this.es.listen('TankHit', (e) => {
            Stats.increment('damageDone', e.dmg);
            if (e.tank === this.player1)
                Stats.increment('leftDamageReceived', e.dmg);
            else
                Stats.increment('rightDamageReceived', e.dmg);
            this.renderer.drawDamageNumber(e);
        });

        this.es.listen('TurnPass', (e) => {
            if (e.newTank == this.player1) {
                if (!this.mode.roundEnd()) {
                    this.mode.turnEnd();
                }
            }
            else this.mode.turnEnd();
        });
    }

    /**
     * Used to force repainting the scene when resizing
     */
    redraw() {
        this.renderer.redraw();
    }

    winner(winner) {
        let loser = winner == this.player1 ? this.player2 : this.player1;
        Stats.increment('totalMatches');
        if (winner == this.player1)
            Stats.increment('leftWins');
        else
            Stats.increment('rightWins');
        Stats.set('leftWinrate', Stats.get('leftWins') / Stats.get('totalMatches'));
        Stats.set('rightWinrate', Stats.get('rightWins') / Stats.get('totalMatches'));
        this.canAim = false;
        this.sPlayer.playSound(this.sBank.sounds.explosion);
        setTimeout(()=>{
            this.sPlayer.playSound(this.sBank.sounds.victory);
            if (winner == this.player1) {
                this.renderer.win(this.player1.name);
            }
            else {
                this.renderer.win(this.player2.name);
            }
        }, 1000);
        setTimeout(()=>{
            this.sPlayer.cancelSound(this.sBank.sounds.overtime);
            this.renderer.endgameButtons();
        }, 3000);

        // Do some explosions!
        for (let i = 0; i < 10; i++) {
            setTimeout(()=>{
                new FX_Explosion(loser.x + Rnd.float(-12,12), loser.y + 4 + Rnd.float(-4,4) + (i*12), this);
            }, i*105)
        }
    }

    overtime() {
        this.renderer.overtime();
        this.sBank.sounds.overtime.loop = true;
        this.sPlayer.playSound(this.sBank.sounds.overtime);
        Stats.increment('overtimes');
        new FX_FireEmitter(this.player2.x + 13, this.player2.y, this);
    }

    /**
     * Does not have anything to do with painting the scene, instead it means none of the players are winners
     */
    draw() {
        Stats.increment('draws');
        Stats.increment('totalMatches');
        this.canAim = false;
        this.sPlayer.playSound(this.sBank.sounds.explosion);
        setTimeout(()=>{
            this.renderer.draw();
        }, 1000);
        setTimeout(()=>{
            this.sPlayer.cancelSound(this.sBank.sounds.overtime);
            this.renderer.endgameButtons();
        }, 3000);

        // Do some explosions!
        for (let i = 0; i < 10; i++) {
            setTimeout(()=>{
                new FX_Explosion(this.player1.x + Rnd.float(-12,12), this.player1.y + 4 + Rnd.float(-4,4) + (i*12), this);
                new FX_Explosion(this.player2.x + Rnd.float(-12,12), this.player2.y + 4 + Rnd.float(-4,4) + (i*12), this);
            }, i*105)
        }
    }

    _setGamemode(modeString) {
        switch (modeString) {
            case 'mirror':
                return this.mode = new GM_Mirror(this);
            default:
                return this.mode = new GM_Classic(this);
        }
    }

    exit() {
        this.pause();
        this.status = gStatus.SETUP;
        this.state._hideGame();
        this.state.enter();
    }
}

module.exports = Game;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Cfg = __webpack_require__(3);
const Mouse = __webpack_require__(4);

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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
    // Environment
    WIND_VARIANCE_STEPS: 7,
    WIND_VARIANCE_INCREMENT: 2,
    WIND_POWER: 0.01,

    GRAVITY: .24,

    // Shooting
    WIND_BREAKER_SHELL_POWER: 1.06,
    SHELL_MAX_SHOT_SPEED: 1366/50,
    SHELL_AIR_DRAG: .0005,
    SHELL_DAMAGE_DIRECT: 50,
    SHELL_DAMAGE_GROUND: 40,
    SHELL_DAMAGE_GROUND_AOE: 40,

    TANK_COLLISION_RADIUS: 19,

    WALL_HEIGHT_MIN: 70,
    WALL_HEIGHT_MAX: 260,
    WALL_WIDTH: 24,
    WALL_WIND_DAMPENING: [0,0,0,0,0,10,30,60],

    // Clouds
    CLOUD_SPEED: 1,
    CLOUD_MAX: 4,
    CLOUD_SPAWN_MIN: 6,
    CLOUD_SPAWN_MAX: 18,


    // GRAPHICS
    GROUND_HEIGHT: 60,
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/**
 * This nice class ensures anywhere where it is requested than we get the much desired mouse info
 * @type {{x: number, y: number}}
 */
const mouse = {
    x: 0,
    y: 0
};

window.addEventListener('mousemove', (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

module.exports = mouse;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const Cfg = __webpack_require__(3);
const Shell = __webpack_require__(6);
const Env = __webpack_require__(7);
const ES = __webpack_require__(9);
const TurnPass = __webpack_require__(15);
const Stats = __webpack_require__(14);

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

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const Env = __webpack_require__(7);
const Cfg = __webpack_require__(3);
const Rnd = __webpack_require__(8);
const TankHit = __webpack_require__(11);
const ES = __webpack_require__(9);
const FX_Explosion = __webpack_require__(12);
const FX_Dust = __webpack_require__(13);
const Stats = __webpack_require__(14);

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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/** SINGILETON **/

const Rnd = __webpack_require__(8);
const Cfg = __webpack_require__(3);
const ES = __webpack_require__(9);
const WindChange = __webpack_require__(10);

class Environment {
    constructor() {
        this.windSpeed = 0;
        this.windLevel = 0;
        this.gravity = Cfg.GRAVITY;
    }

    getWindSpeed() {
        return this.windSpeed;
    }

    getWindLevel() {
        return this.windLevel;
    }

    getGravity() {
        return Cfg.GRAVITY;
    }

    /**
     * Randomized the wind speed and direction
     */
    randomize() {
        let steps = Rnd.int(0, Cfg.WIND_VARIANCE_STEPS);
        this.windLevel = steps; // Used for building a wall (Mexico pays ofc)
        let sign = Rnd.sign();
        this.windSpeed = steps * sign * Cfg.WIND_VARIANCE_INCREMENT * Cfg.WIND_POWER;
        ES.getInst().fire(new WindChange(this.windSpeed, this.windLevel))
    }

    /**
     * Only swaps the wind direction. Used for the mirror gamemode
     */
    swapWind() {
        this.windSpeed = -this.windSpeed;
        ES.getInst().fire(new WindChange(this.windSpeed, this.windLevel))
    }
}

module.exports = new Environment();

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = {
    int(min, max) {
        // todo: check it it works correctly
        return Math.floor(min + Math.random() * (max-min+1));
    },
    float(min, max) {
        return min + Math.random() * (max-min);
    },
    sign() {
        return Math.random() < 0.5 ? -1 : 1;
    },
    bool() {
        return Math.random() < 0.5;
    }
};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* SINGLETON */

class EventSystem {
    constructor() {
        this.events = {};
        EventSystem.inst = this;
    }

    fire(event) {
        for (let l of this.events[event.getId()]) {
            l(event);
        }
    }

    listen(eventId, fn) {
        if (!this.events[eventId]) {
            this.events[eventId] = [];
        }
        this.events[eventId].push(fn);
    }

    detach(eventClass, fn) {
        let i = this.events[eventClass.getId()].indexOf(fn);
        if (i >= 0) {
            this.events[eventClass.getId()].splice(i,1);
        }
    }

    static getInst() {
        if (!EventSystem.inst) {
            new EventSystem();
        }
        return EventSystem.inst;
    }
}

module.exports = EventSystem;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

class WindChange {
    constructor(windSpeed, windLevel) {
        this.windSpeed = windSpeed;
        this.windLevel = windLevel;
    }

    getId() {
        return 'WindChange';
    }
    static getId() {
        return 'WindChange';
    }
}

// Before I realized I could do this
// NewRound.id = 'NewRound';
// I was using the way above [both instance methods and static method]
// and then when I finally knew the better way I was too lazy to refactor

module.exports = WindChange;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

class TankHit {
    constructor(tank, dmg) {
        this.tank = tank;
        this.dmg = dmg;
    }
    getId() {
        return 'TankHit';
    }
    static getId() {
        return 'TankHit';
    }
}

// Before I realized I could do this
// NewRound.id = 'NewRound';
// I was using the way above [both instance methods and static method]
// and then when I finally knew the better way I was too lazy to refactor

module.exports = TankHit;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const GameRenderer = __webpack_require__(2);

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

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

const GameRenderer = __webpack_require__(2);
const Env = __webpack_require__(7);
const Rnd = __webpack_require__(8);

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

/***/ }),
/* 14 */
/***/ (function(module, exports) {

const keys = [
    'shellsFired',
    'directHits',
    'wallHits',
    'groundHits',
    'damageDone',
    'leftDamageReceived',
    'rightDamageReceived',
    'totalMatches',
    'leftWins',
    'rightWins',
    'overtimes',
    'draws'
];

const Stats = {
    tds: null,
    stats: [],

    update() {
        for (let i = 0; i < keys.length; i++) {
            this.tds[i*2+1].innerHTML = this.stats[keys[i]];
        }
    },

    increment(key, value = 1) {
        this.stats[key] += value;
    },
    set(key, value) {
        this.stats[key] = value;
    },
    get(key) {
        return this.stats[key];
    },
    save() {
        for (let i = 0; i < keys.length; i++) {
            localStorage.setItem(keys[i], '' + this.stats[keys[i]]);
        }
    },
    clear() {
        for (let i = 0; i < keys.length; i++) {
            this.stats[keys[i]] = 0;
        }
        this.save();
        this.update();
    }
};

for (let i = 0; i < keys.length; i++) {
    Stats.stats[keys[i]] = localStorage.getItem(keys[i]) | 0;
}

$(window).on('load', ()=>{
    Stats.tds = document.querySelectorAll('#stats table td');
    $('#clear-stats').click(()=>{
        if (confirm('Are you sure you want to clear your stats? It cannot be reverted!')) {
            Stats.clear();
        }
    });
});

// Using window.addEventListener('beforeunload', ...) was not working for some reason, using window.onbeforeunload instead
window.onbeforeunload = (e)=>{
    // Store the locally kept scores to localStorage
    Stats.save(); // Local save

    // todo: create a backend db and make a sync to it here
};

module.exports = Stats;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

class TurnPass {
    constructor(lastTank, newTank) {
        this.lastTank = lastTank;
        this.newTank = newTank;
    }
    getId() {
        return 'TurnPass';
    }
    static getId() {
        return 'TurnPass';
    }
}

// Before I realized I could do this
// NewRound.id = 'NewRound';
// I was using the way above [both instance methods and static method]
// and then when I finally knew the better way I was too lazy to refactor

module.exports = TurnPass;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const FX_SmokeEmitter = __webpack_require__(17);
const ES = __webpack_require__(9);
const TankHit = __webpack_require__(11);

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

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

const GameRenderer = __webpack_require__(2);
const Rnd = __webpack_require__(8);
const FX_SmokeParticle = __webpack_require__(18);

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

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

const GameRenderer = __webpack_require__(2);
const Env = __webpack_require__(7);
const Rnd = __webpack_require__(8);

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

/***/ }),
/* 19 */
/***/ (function(module, exports) {

/**
 * The way this is implemented may not be the best one since playing sound is kinda annoying but it works so we cool
 */
class SoundBank {
    constructor() {
        SoundBank.instance = this;
        let ids = ['shot', 'shot_weak', 'explosion', 'charge', 'hit', 'intro', 'direct_hit', 'overtime', 'victory', 'notification'];
        this.sounds = {};
        for (let id of ids) {
            this.sounds[id] = document.getElementById('sfx_' + id);
        }
        this.sounds.shot_weak.volume = .65;
        this.sounds.hit.volume = .35;
        this.sounds.victory.volume = .5;
    }
}
SoundBank.instance = null;

module.exports = SoundBank;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

class SoundPlayer {
    constructor() {
        SoundPlayer.instance = this;
        this.activeSounds = new Map();
    }

    playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    cancelSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}
SoundPlayer.instance = null;

module.exports = SoundPlayer;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

const Env = __webpack_require__(7);
const Cfg = __webpack_require__(3);
const Rnd = __webpack_require__(8);

class Wall {
    constructor(x,y, width) {
        this.x = x;
        this.y = y;
        this.width = Cfg.WALL_WIDTH;
        this.height = 60;
        this.randomizeHeight();
    }

    randomizeHeight() {
        // Reduce the wall height if the wind is too strong
        let dampening = 0;
        if (Cfg.WALL_WIND_DAMPENING[Env.windLevel] != undefined) {
            dampening = Cfg.WALL_WIND_DAMPENING[Env.windLevel];
        }
        // this.height = 70;
        this.height = (100-dampening)/100 * (Rnd.int(0,Cfg.WALL_HEIGHT_MAX - Cfg.WALL_HEIGHT_MIN) + Cfg.WALL_HEIGHT_MIN);
    }
}

module.exports = Wall;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

const Env = __webpack_require__(7);
const Cfg = __webpack_require__(3);

// Turn - each player has a turn (shot), when it ends, the turn ends and turnEnd is called
// Round - after all turns are finished, new round begins; 1 round contains 2 turns
// If turn that triggers an end of round is finished, first the roundEnd is called, and after that turnEnd is called
// To stop the turnEnd after processing roundEnd, return true in the roundEnd

class GM_Mirror {
    constructor(game) {
        this.game = game;
        this.overtime = false;
    }

    turnEnd() {
        // player 2 ended his turn
        if (this.game.activePlayer == this.game.player1) {
            Env.randomize();
            for (let wall of this.game.objects.walls) {
                wall.randomizeHeight();
            }
            // do nothing
        }
        // player 1 ended his turn
        else {
            Env.swapWind();
            if (!this.game.player2.isAlive()) {
                if (this.game.player1.hp > Cfg.SHELL_DAMAGE_DIRECT) {
                    this.game.winner(this.game.player1);
                }
                else {
                    this.game.overtime();
                }
            }
            // Check if the first player (whose turn just ended) did not kill himself
            else if (!this.game.player1.isAlive()) {
                this.game.winner(this.game.player2);
            }
        }
    }

    roundEnd() {
        if (!this.game.player1.isAlive() && !this.game.player2.isAlive()) {
            this.game.draw();
            return true;
        }
        else if (!this.game.player1.isAlive()) {
            this.game.winner(this.game.player2);
            return true;
        }
        else if (!this.game.player2.isAlive()) {
            this.game.winner(this.game.player1);
            return true;
        }
    }
}

module.exports = GM_Mirror;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

const Env = __webpack_require__(7);
const Cfg = __webpack_require__(3);

// Turn - each player has a turn (shot), when it ends, the turn ends and turnEnd is called
// Round - after all turns are finished, new round begins; 1 round contains 2 turns
// If turn that triggers an end of round is finished, first the roundEnd is called, and after that turnEnd is called
// To stop the turnEnd after processing roundEnd, return true in the roundEnd

class GM_Classic {
    constructor(game) {
        this.game = game;
        this.overtime = false;
    }

    turnEnd() {
        Env.randomize();
        for (let wall of this.game.objects.walls) {
            wall.randomizeHeight();
        }
        // player 2 ended his turn
        if (this.game.activePlayer == this.game.player1) {
            // do nothing
        }
        // player 1 ended his turn
        else {
            if (!this.game.player2.isAlive()) {
                if (this.game.player1.hp > Cfg.SHELL_DAMAGE_DIRECT) {
                    this.game.winner(this.game.player1);
                }
                else {
                    this.game.overtime();
                }
            }
            // Check if the first player (whose turn just ended) did not kill himself
            else if (!this.game.player1.isAlive()) {
                this.game.winner(this.game.player2);
            }
        }
    }

    roundEnd() {
        if (!this.game.player1.isAlive() && !this.game.player2.isAlive()) {
            this.game.draw();
            return true;
        }
        else if (!this.game.player1.isAlive()) {
            this.game.winner(this.game.player2);
            return true;
        }
        else if (!this.game.player2.isAlive()) {
            this.game.winner(this.game.player1);
            return true;
        }
    }
}

module.exports = GM_Classic;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

const Rnd = __webpack_require__(8);
const FX_FireParticle = __webpack_require__(25);

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

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

const GameRenderer = __webpack_require__(2);
const Rnd = __webpack_require__(8);

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

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

const Cfg = __webpack_require__(3);

// This module renders the interactive fields that allow changing the game configuration on the fly
// The only way to reset it is either manually or by reloading the page

function makeInput(attr) {
    let input = document.createElement('input');
    input.type = 'number';
    input.value = Cfg[attr];
    // Fix step
    if (input.value - Math.floor(input.value) !== 0) input.step = 0.1;
    // Add event to input
    input.addEventListener('input', (e) => {
        Cfg[attr] = Number.parseFloat(e.target.value);
    });
    // Wrap result in td
    let tdInput = document.createElement('td');
    tdInput.appendChild(input);

    return tdInput;
}

module.exports = {
    /**
     * Creates the HTML for the the debug widget
     * @returns {HTMLDivElement}
     */
    getDebugNode: function () {
        let table = document.createElement('table');
        table.innerHTML = "<tr><th>Property</th><th>Value</th></tr>";

        let tbody = table.querySelector('tbody');

        for (let attr in Cfg) {
            let row = document.createElement('tr');

            // Text
            let text = document.createElement('td');
            text.innerText = attr;

            // Input
            let tdInput = makeInput(attr);
            // Append input
            row.appendChild(text);
            row.appendChild(tdInput);
            tbody.appendChild(row);
        }
        let wrapper = document.createElement('div');
        wrapper.className = 'properties';
        wrapper.appendChild(table);
        return wrapper;
    }
};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(1);

/**
 * Since showing and hiding the game is a bit more complicated this class exists
 * There are 2 views for the site, one with header and footer and stuff
 * and the second one that is full screen canvas
 * This class handles them transitions between the two views
 */
class GameState {
    constructor() {
        this.game = new Game(this);
        this.router = null;
        GameState.instance = this;

        window.game = this.game; // todo: delete me

        // Prepapre a bound version of the method for adding and removing for listening
        this._resize = this.game.renderer.onResize.bind(this.game.renderer);
    }

    enter() {
        // A little hardcode here, but w/e; 0=playing, 1=paused, 2=needs setup first
        // There is private 'enum' inside Game.js, but I was too lazy to export them
        this.exit();
        if (this.game.status === 2)
        {
            this._showSetup();
        }
        if (this.game.status === 1 || this.game.status === 0) {
            this._showResume();
        }
    }

    exit() {
        if (this.game.status === 0 || this.game.status === 1) {
            this.game.pause();
            $('#normal-view').show();
            $('#game-view').hide();
            $("#setup-back-section").hide();
            window.removeEventListener('resize', this._resize);
        }
        if (this.game.status === 2) {
            $("article[data-route='#r_game']").hide();
            $("#setup-form-section").hide();
        }
    }

    _showGame() {
        $('#normal-view').hide();
        $('#game-view').show();
        window.addEventListener('resize', this._resize);
        this.game.renderer.onResize();
    }
    _showSetup() {
        $("#game-setup").show();
        $("#setup-form-section").show();
        $("#setup-back-section").hide();
    }
    _showResume() {
        $("#game-setup").show();
        $("#setup-form-section").hide();
        $("#setup-back-section").show();
    }
    _hideGame() {
        $('#normal-view').show();
        $('#game-view').hide();
    }
}


window.addEventListener('load', (e)=>{
    let jFormWrapper = $("#setup-form-section");
    $(jFormWrapper).on('submit','form',(e)=>{
        e.preventDefault();
        GameState.instance.game.createNew();
        GameState.instance._showGame();
        // Hide the article itself + the setup form section, need to be done to ensure smooth transitions on the future
        jFormWrapper.hide();
        $("article[data-route='#r_game']").hide();
    });

    let jRes = $("#setup-back-section");
    let buttons = $("#setup-back-section button");
    $(buttons[0]).on('click', (e)=>{
        jRes.hide();
        jFormWrapper.hide();
        GameState.instance.game.start();
        GameState.instance._showGame();
    });

    $(buttons[1]).on('click', (e)=>{
        jRes.hide();
        jFormWrapper.hide();
        GameState.instance.game.status = 2;
        GameState.instance.router.route('#r_game');
    });
});

module.exports = GameState;

/***/ }),
/* 28 */
/***/ (function(module, exports) {

const VideoControls = {
    init() {
        let videos = document.querySelectorAll('.video-holder');
        for (let v of videos) {
            let video = v.querySelector('video');
            let play = v.querySelector('.play');
            let seek = v.querySelector('.seek input');
            let volume = v.querySelector('.volume');
            let volumeRange = v.querySelector('.volume-range input');
            let fullscreen = v.querySelector('.fullscreen');

            volumeRange.value = video.volume;
            seek.value = video.currentTime / video.duration;

            $(video).click((e)=>{
                if (video.paused) {
                    $(play).attr('data-playing', 'true');
                    video.play();
                }
                else {
                    $(play).attr('data-playing', 'false');
                    video.pause();
                }
            });
            $(play).click((e)=>{
                if (video.paused) {
                    $(play).attr('data-playing', 'true');
                    video.play();
                }
                else {
                    $(play).attr('data-playing', 'false');
                    video.pause();
                }
            });

            $(seek).on('input', (e)=>{
                video.currentTime = video.duration * e.target.value;
            });

            $(volume).on('click', (e)=>{
                video.muted = !video.muted;
                if (video.muted === true) {
                    $(volume).attr('data-muted','true')
                }
                else {
                    $(volume).attr('data-muted','false')
                }
            });

            $(volumeRange).on('input', (e)=>{
                if (e.target.value === "0") {
                    $(volume).attr('data-muted','true')
                }
                else {
                    $(volume).attr('data-muted', 'false');
                    video.muted = false;
                }
                video.volume = e.target.value;
            });

            $(fullscreen).on('click', (e)=>{
                console.log('request fullscreen');
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.mozRequestFullScreen) { /* Firefox */
                    video.mozRequestFullScreen();
                } else if (video.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) { /* IE/Edge */
                    video.msRequestFullscreen();
                }
            });

            // No need for the callback below since we are hooked to all ways of changing the volume (by UI), hence it is commented out
            // $(video).on('volumechange', (e)=>{
            //
            // });

            $(video).on('timeupdate', (e)=>{
                seek.value = video.currentTime / video.duration;
            });

            $(video).on('ended', (e)=>{
                // Do we want to do anything, actually?
            });
        }
    }
};

module.exports = VideoControls;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

const Notificator = __webpack_require__(30);

const OnlineTracker = {
    elem: null,

    update(notify) {
        if (navigator.onLine) {
            this.elem.setAttribute('data-online', true);
            if (notify) {
                Notificator.notify('Connection restored!', {body: 'Stats would be synchronized to the cloud if backend was implemented!'});
            }
        }
        else {
            this.elem.setAttribute('data-online', false);
            if (notify) {
                Notificator.notify('Connection lost!', {body: 'Stats will still be stored locally. Once you are online again, they will be synchronized to cloud again. JK, backend is not implemented!'});
            }
        }
    }
};

window.addEventListener('load', ()=>{
    OnlineTracker.elem = document.getElementById('online');
    OnlineTracker.update(false);

    window.addEventListener('online', ()=>{OnlineTracker.update(true)});
    window.addEventListener('offline', ()=>{OnlineTracker.update(true)});
});

module.exports = OnlineTracker;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

const SoundPlayer = __webpack_require__(20);
const SoundBank = __webpack_require__(19);

const Notificator = {
    notify(title, options) {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
            SoundPlayer.instance.playSound(SoundBank.instance.sounds.notification);
        }
    }
};

function requestPermission() {
    // request only if we had not asked before (don't bother someone who has denied it before)
    if (Notification.permission === 'default') {
        Notification.requestPermission().then((res) => {
            if (res === 'granted') {
                Notificator.notify('Notifications allowed!', {body: 'You can expect further notifications when you online or offline.'})
                $('#notification-status').html('Allowed');
                $('#allow-notifications').hide();
            }
            if (res === 'default') {

            }
            if (res === 'denied') {
                $('#notification-status').html('Disabled');
            }
        });
    }
}

window.addEventListener('load', ()=>{
    requestPermission();

    if (Notification.permission === 'default') {
        $('#notification-status').html('Awaiting confirmation');
    }
    if (Notification.permission === 'denied') {
        $('#notification-status').html('Disabled');
    }
    if (Notification.permission === 'granted') {
        $('#notification-status').html('Allowed');
    }
});

module.exports = Notificator;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

const Stats = __webpack_require__(14);

class Router {
    constructor(gameState) {
        this.normalView = $("#normal-view").get(0);
        this.gameView = $("#game-view").get(0);
        this.currentHash = null;
        this.hashes = ['#r_stats', '#r_help', '#r_home', '#r_game', '#r_skins'];
        this.gameState = gameState;
        this.gameState.router = this;

        $(window).on('popstate', (e) => {
            this.route(document.location.hash);
        });

        this.route(document.location.hash);
    }

    // The route method is a bit of a mess, but it makes sense, the ifs could be a bit refined, but w/e
    route(newHash) {
        if (this.currentHash === newHash && this.currentHash !== '#r_game') return; // DO nothing if the same hash EXCEPT r_game, which has logic bound to it being refreshed

        // Special logic for #r_game
        if (newHash === '#r_game') {
            // logic for showing game is a bit more complicated and is delegated to its own class
            if (this.currentHash !== null) {
                $(`[data-route='${this.currentHash}']`).hide();
            }
            this.currentHash = newHash;
            this.gameState.enter();
        }
        else {
            if (newHash === '#r_stats'){
                Stats.update();
            }
            if (this.hashes.indexOf(newHash) !== -1) {
                if (this.currentHash != null) {
                    if (this.currentHash !== '#r_game') {
                        $(`[data-route='${this.currentHash}']`).hide();
                    }
                    else {
                        // logic for hiding game is a bit more complicated and is delegated to its own class
                        this.gameState.exit();
                    }
                }
                this.currentHash = newHash;
                $(`[data-route='${this.currentHash}']`).show();
            }
        }
    }
}

module.exports = Router;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

const SoundBank = __webpack_require__(19);

$(window).on('load', () => {
    let here = $('#drop-here');
    let hereDummy = $('#drop-here-dummy');
    let reset = $('#drop-reset button');
    let info = $('#drop-info div');


    // Stuff does not work without this
    here[0].addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    let counter = 0; // Required to properly add and remove CSS class as the event is fired for both the wrapper and the inside div that has transforms on it
    here[0].addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();

        counter++;
        hereDummy.addClass('pulse');
    }, true);

    here[0].addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();

        counter--;
        if (counter === 0) {
            hereDummy.removeClass('pulse');
        }
    }, true);

    // for whatever reason jQuerry.on() was causing some issues
    here[0].addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        hereDummy.removeClass('pulse');
        counter = 0;
        if (e.dataTransfer.files.length > 0) // Is it even possible for this if ever to be false?
        {
            // We care only about the first file in case some doofus uploaded more than one
            if (e.dataTransfer.files[0].type.indexOf('audio') !== -1) {
                // The much better way:
                let url = URL.createObjectURL(e.dataTransfer.files[0]);
                let file = e.dataTransfer.files[0];
                info.html(`Filename: ${file.name}<br/><audio src='${url}' controls="controls">`);

                // The file reader way for the third API
                let fr = new FileReader();
                fr.addEventListener('load', (ev) => {
                    info.html(`Filename: ${file.name}<br/><audio src='${ev.target.result}' controls="controls">`);
                    SoundBank.instance.sounds.shot.src = ev.target.result;
                });
                fr.readAsDataURL(e.dataTransfer.files[0]);
            }
            else {
                SoundBank.instance.sounds.shot.src = 'sfx/shot.wav';
                info.html('File was not recognized as an audio file! The default sound will be used instead.');
                alert('The file was not recognized as an audio file! Try again.');
            }
        }
    });

    reset.click((e)=>{
        SoundBank.instance.sounds.shot.src = 'sfx/shot.wav';
        info.html('');
    });
});

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvR2FtZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9HYW1lUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvQ29uZmlnLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9Nb3VzZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9HYW1lU2hvb3RpbmdNYW5hZ2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL1NoZWxsLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL0Vudmlyb25tZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9qcy91dGlsL1JhbmRvbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9FdmVudFN5c3RlbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9ldmVudHMvV2luZENoYW5nZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9ldmVudHMvVGFua0hpdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvZ2FtZS9GWF9FeHBsb3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvRlhfRHVzdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvU3RhdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvZXZlbnRzL1R1cm5QYXNzLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL1RhbmsuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvRlhfU21va2VFbWl0dGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL0ZYX1Ntb2tlUGFydGljbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvU291bmRCYW5rLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL1NvdW5kUGxheWVyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL1dhbGwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvR01fTWlycm9yLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL0dNX0NsYXNzaWMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvRlhfRmlyZUVtaXR0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2dhbWUvRlhfRmlyZVBhcnRpY2xlLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nYW1lL0NvbmZpZ1dpZGdldC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvc3RhdGVzL0dhbWVTdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvVmlkZW9Db250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvT25saW5lVHJhY2tlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvTm90aWZpY2F0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL1JvdXRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvQ3VzdG9taXphdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2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Q0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxhQUFhO0FBQ2xEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0EsdUJBQXVCLFFBQVE7QUFDL0I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQSx1QkFBdUIsUUFBUTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNCOzs7Ozs7QUN2U0EsWUFBWSxtQkFBTyxDQUFDLENBQVU7QUFDOUIsY0FBYyxtQkFBTyxDQUFDLENBQVU7O0FBRWhDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxpQkFBaUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsaUJBQWlCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCOzs7Ozs7QUNwREEsa0JBQWtCLG1CQUFPLENBQUMsRUFBa0I7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUwsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxVQUFVLG1CQUFtQixJQUFJOztBQUV4RTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsVUFBVSxtQkFBbUIsaUJBQWlCO0FBQ3pGO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDLEUiLCJmaWxlIjoianMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCJjb25zdCBHYW1lID0gcmVxdWlyZSgnLi9nYW1lL0dhbWUuanMnKTtcclxuY29uc3QgQ2ZnID0gcmVxdWlyZSgnLi9nYW1lL0NvbmZpZy5qcycpO1xyXG5jb25zdCBDZmdXZ3QgPSByZXF1aXJlKCcuL2dhbWUvQ29uZmlnV2lkZ2V0LmpzJyk7XHJcbmNvbnN0IEdhbWVTdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGVzL0dhbWVTdGF0ZS5qcycpO1xyXG5jb25zdCBWaWRlb0NvbnRyb2xzID0gcmVxdWlyZShcIi4vVmlkZW9Db250cm9sc1wiKTtcclxuY29uc3QgU3RhdHMgPSByZXF1aXJlKFwiLi9TdGF0c1wiKTtcclxuY29uc3QgT25saW5lVHJhY2tlciA9IHJlcXVpcmUoXCIuL09ubGluZVRyYWNrZXJcIik7XHJcbmNvbnN0IE5vdGlmaWNhdG9yID0gcmVxdWlyZShcIi4vTm90aWZpY2F0b3JcIik7XHJcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJy4vUm91dGVyLmpzJyk7XHJcbmNvbnN0IEN1c3RvbWl6YXRpb24gPSByZXF1aXJlKCcuL0N1c3RvbWl6YXRpb24uanMnKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU2V0dGluZyB1cC4uLicpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xyXG59KSgpO1xyXG5cclxuZnVuY3Rpb24gb25Mb2FkKCkge1xyXG4gICAgLy8gUHJlcGFyZSBkZWJ1ZyBtZW51IGZvciB0aGUgZ2FtZVxyXG4gICAgLy8gUG9zc2libHkgc2hvdWxkIGJlIGluIGl0cyBvd24gbW9kdWxlIGJ1dCB3L2VcclxuICAgIGxldCBkZWJ1ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lLWRlYnVnLWNvbnRlbnQnKTtcclxuICAgIGRlYnVnLmFwcGVuZENoaWxkKENmZ1dndC5nZXREZWJ1Z05vZGUoKSk7XHJcbiAgICAkKFwiI2dhbWUtZGVidWctYnV0dG9uXCIpLmNsaWNrKChlKT0+e1xyXG4gICAgICAgIGlmIChkZWJ1Zy5jbGFzc0xpc3QuY29udGFpbnMoJ3Zpc2libGUnKSkge1xyXG4gICAgICAgICAgICBkZWJ1Zy5jbGFzc0xpc3QucmVtb3ZlKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWJ1Zy5jbGFzc0xpc3QuYWRkKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAkKFwiI2dhbWUtZXhpdC1idXR0b25cIikuY2xpY2soKGUpPT57XHJcbiAgICAgICAgaWYgKGNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB1IHdhbnQgdG8gbGVhdmUgdGhlIGdhbWU/IChZb3UgY2FuIHJlc3VtZSBpdCBsYXRlciBvciBzdGFydCBhIGJyYW5kIG5ldyBvbmUpJykpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIucm91dGUoJyNyX2dhbWUnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgZ2FtZSBzdGF0ZSAoYW5kIGluaXRpYWxpemluZyBnYW1lIHdpdGggaXQpJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSgpO1xyXG5cclxuICAgIGxldCByb3V0ZXIgPSBuZXcgUm91dGVyKGdhbWVTdGF0ZSk7XHJcbiAgICBWaWRlb0NvbnRyb2xzLmluaXQoKTsgLy8gU2V0cyB1cCB0aGUgdmlkZW8gY29udHJvbHMgb24gSG9tZVxyXG4gICAgU3RhdHMudXBkYXRlKCk7IC8vIExvYWRzIHRoZSBwcm9wZXIgc3RhdHMgZnJvbSBsb2NhbFN0b3JhZ2VcclxuICAgIHdpbmRvdy5yb3V0ZXIgPSByb3V0ZXI7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IHJvdXRlXHJcbiAgICBpZiAoZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9PT0gJycpIHtcclxuICAgICAgICByb3V0ZXIucm91dGUoJyNyX2hvbWUnKTtcclxuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBkb2N1bWVudC5sb2NhdGlvbiwgJyNyX2hvbWUnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnTG9hZGluZyBmaW5pc2hlZCEnKTtcclxufSIsIi8qKiBTSU5HTEVUT04gKiovXHJcblxyXG5jb25zdCBHYW1lUmVuZGVyZXIgPSByZXF1aXJlKCcuL0dhbWVSZW5kZXJlci5qcycpO1xyXG5jb25zdCBHYW1lU2hvb3RpbmdNYW5hZ2VyID0gcmVxdWlyZSgnLi9HYW1lU2hvb3RpbmdNYW5hZ2VyLmpzJyk7XHJcbmNvbnN0IEV2ZW50U3lzdGVtID0gcmVxdWlyZSgnLi9FdmVudFN5c3RlbS5qcycpO1xyXG5jb25zdCBXaW5kQ2hhbmdlID0gcmVxdWlyZSgnLi9ldmVudHMvV2luZENoYW5nZS5qcycpO1xyXG5jb25zdCBUYW5rID0gcmVxdWlyZSgnLi9UYW5rLmpzJyk7XHJcbmNvbnN0IENmZyA9IHJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbmNvbnN0IE1vdXNlID0gcmVxdWlyZSgnLi4vTW91c2UnKTtcclxuY29uc3QgU291bmRCYW5rID0gcmVxdWlyZSgnLi9Tb3VuZEJhbmsnKTtcclxuY29uc3QgU291bmRQbGF5ZXIgPSByZXF1aXJlKCcuL1NvdW5kUGxheWVyJyk7XHJcbmNvbnN0IFdhbGwgPSByZXF1aXJlKCcuL1dhbGwnKTtcclxuY29uc3QgRW52ID0gcmVxdWlyZSgnLi9FbnZpcm9ubWVudCcpO1xyXG5jb25zdCBHTV9NaXJyb3IgPSByZXF1aXJlKCcuL0dNX01pcnJvcicpO1xyXG5jb25zdCBHTV9DbGFzc2ljID0gcmVxdWlyZSgnLi9HTV9DbGFzc2ljJyk7XHJcbmNvbnN0IFN0YXRzID0gcmVxdWlyZSgnLi4vU3RhdHMnKTtcclxuY29uc3QgRlhfRmlyZUVtaXR0ZXIgPSByZXF1aXJlKCcuL0ZYX0ZpcmVFbWl0dGVyJyk7XHJcbmNvbnN0IEZYX0V4cGxvc2lvbiA9IHJlcXVpcmUoJy4vRlhfRXhwbG9zaW9uJyk7XHJcbmNvbnN0IFJuZCA9IHJlcXVpcmUoJy4uL3V0aWwvUmFuZG9tJyk7XHJcblxyXG5jb25zdCBnU3RhdHVzID0ge1xyXG4gICAgUExBWUlORzogMCxcclxuICAgIFBBVVNFRDogMSxcclxuICAgIFNFVFVQOiAyLFxyXG59O1xyXG5cclxuY2xhc3MgR2FtZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMuZWxlbXMgPSB7XHJcbiAgICAgICAgICAgIGNhbnZhczoge1xyXG4gICAgICAgICAgICAgICAgZHluYW1pYzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtY2FudmFzLWR5bmFtaWMnKSxcclxuICAgICAgICAgICAgICAgIHN0YXRpYzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtY2FudmFzLXN0YXRpYycpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVpOiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2FtZS11aSAud2luZCcpLFxyXG4gICAgICAgICAgICAgICAgcGxheWVyMToge1xyXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNnYW1lLXVpIC5maXJzdC1wbGF5ZXItc3RhdHVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaHBCYXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNnYW1lLXVpIC5maXJzdC1wbGF5ZXItc3RhdHVzIHByb2dyZXNzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2dhbWUtdWkgLmZpcnN0LXBsYXllci1zdGF0dXMgLnBsYXllci1uYW1lJyksXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGxheWVyMjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNnYW1lLXVpIC5zZWNvbmQtcGxheWVyLXN0YXR1cycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGhwQmFyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2FtZS11aSAuc2Vjb25kLXBsYXllci1zdGF0dXMgcHJvZ3Jlc3MnKSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2FtZS11aSAuc2Vjb25kLXBsYXllci1zdGF0dXMgLnBsYXllci1uYW1lJyksXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1cyA9IGdTdGF0dXMuU0VUVVA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIxID0gbnVsbDsgLy8gU2hvcnRjdXRcclxuICAgICAgICB0aGlzLnBsYXllcjIgPSBudWxsOyAvLyBTaG9ydGN1dFxyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNhbkFpbSA9IHRydWU7IC8vIElmIHRydWUsIHRoZW4gdGhlIGFjdGl2ZSB0YW5rIGFpbXMgYXQgdGhlIGN1cnNvciBhbmQgdGhlIGdhbWUgcmVhY3RzIHRvIG1vdXNlIGNsaWNrc1xyXG5cclxuICAgICAgICB0aGlzLnNCYW5rID0gbmV3IFNvdW5kQmFuaygpO1xyXG4gICAgICAgIHRoaXMuc1BsYXllciA9IG5ldyBTb3VuZFBsYXllcigpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgR2FtZVJlbmRlcmVyKHRoaXMuZWxlbXMuY2FudmFzLmR5bmFtaWMsIHRoaXMuZWxlbXMuY2FudmFzLnN0YXRpYywgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBHYW1lU2hvb3RpbmdNYW5hZ2VyKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlOyAvLyBVc2VkIGZvciBwYXVzaW5nIHdoZW4gb3V0IG9mIGZvY3VzXHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0cyA9IHtcclxuICAgICAgICAgICAgdGFua3M6IFtdLFxyXG4gICAgICAgICAgICBzaGVsbHM6IFtdLFxyXG4gICAgICAgICAgICBjbG91ZHM6IFtdLFxyXG4gICAgICAgICAgICBmeDogW10sXHJcbiAgICAgICAgICAgIHdhbGxzOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmVzID0gbmV3IEV2ZW50U3lzdGVtKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBDbGlja3MoKTtcclxuICAgICAgICB0aGlzLl9zZXR1cEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICAgICAgLy8gRm9yIGVhc2llciBkZWJ1Z1xyXG4gICAgICAgIC8vIHdpbmRvdy5yZW5kZXJlciA9IHRoaXMucmVuZGVyZXI7XHJcbiAgICAgICAgLy8gd2luZG93LmdhbWUgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIF9zZXR1cENsaWNrcygpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS11aScpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbHMuc3RhcnRTaG90KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtdWknKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9scy5zaG9vdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZU5ldygpIHtcclxuICAgICAgICB0aGlzLl9iYXNpY1NldHVwKCk7XHJcbiAgICAgICAgdGhpcy5fZm9ybVNldHVwKCk7IC8vIFRoZSBmb3JtIGNhbm5vdCBiZSB1cGRhdGVkIHdoaWxlIHRoZSBnYW1lIGlzIHJ1bm5pbmcsIHNvIHRoZSBnYW1lIGNhbm5vdCBiZSByZXN0YXJ0ZWQgd2l0aCBkaWZmZXJlbnQgc2V0dGluZ3NcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2Jhc2ljU2V0dXAoKSB7XHJcbiAgICAgICAgJCgnI2dhbWUtZGVidWctY29udGVudCcpLnJlbW92ZUNsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgdGhpcy5zUGxheWVyLnBsYXlTb3VuZCh0aGlzLnNCYW5rLnNvdW5kcy5pbnRybyk7XHJcblxyXG4gICAgICAgIC8vIENlbnRlciB0aGUgdGFua3MgYXJvdW5kIHRoZSBjdXJyZW50IHNjcmVlbiBzaXplLCBtYXhpbXVtIHNpemUgb2YgMTM2NiAobXkgbm90ZWJvb2spXHJcbiAgICAgICAgbGV0IGVkZ2VPZmZzZXQgPSB0aGlzLnJlbmRlcmVyLmdldFdpZHRoKCkgLyAyO1xyXG4gICAgICAgIGlmIChlZGdlT2Zmc2V0ID4gNjgzKSBlZGdlT2Zmc2V0ID0gNjgzO1xyXG4gICAgICAgIGVsc2UgaWYgKGVkZ2VPZmZzZXQgPCAyMDApIGVkZ2VPZmZzZXQgPSAyMDA7IC8vIFNpbmNlIHRoZSBicm93c2VyIGNhbm5vdCBiZSBzaHJpbmtlZCB0b28gbXVjaCwgdGhpcyBzZXR0aW5ncyBzZWVtcyBPSyBldmVuIGZvciB0aGUgbWluaW11bSBzaXplIHBvc3NpYmxlXHJcbiAgICAgICAgZWRnZU9mZnNldCAtPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0cy50YW5rc1swXSA9IG5ldyBUYW5rKHRoaXMucmVuZGVyZXIuZ2V0V2lkdGgoKSAvIDIgLSBlZGdlT2Zmc2V0LCAwLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ190YW5rMScpLCB0aGlzLmVsZW1zLnVpLnBsYXllcjEuaHBCYXIsIDEsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMub2JqZWN0cy50YW5rc1sxXSA9IG5ldyBUYW5rKHRoaXMucmVuZGVyZXIuZ2V0V2lkdGgoKSAvIDIgKyBlZGdlT2Zmc2V0LCAwLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ190YW5rMicpLCB0aGlzLmVsZW1zLnVpLnBsYXllcjIuaHBCYXIsIC0xLCB0aGlzKTtcclxuICAgICAgICB0aGlzLm9iamVjdHMudGFua3NbMF0uaHVydCgwKTsgLy8gUGluZyB0aGUgaHBCYXIgdG8gdHJpZ2dlciB2aXN1YWwgcmVzZXRcclxuICAgICAgICB0aGlzLm9iamVjdHMudGFua3NbMV0uaHVydCgwKTsgLy8gUGluZyB0aGUgaHBCYXIgdG8gdHJpZ2dlciB2aXN1YWwgcmVzZXRcclxuICAgICAgICB0aGlzLm9iamVjdHMudGFua3NbMF0uYWltKDIwMCwgMCk7XHJcbiAgICAgICAgdGhpcy5vYmplY3RzLnRhbmtzWzFdLmFpbSgyMDAsIDApO1xyXG4gICAgICAgIHRoaXMucGxheWVyMSA9IHRoaXMub2JqZWN0cy50YW5rc1swXTsgLy8gc2hvcnRjdXRcclxuICAgICAgICB0aGlzLnBsYXllcjIgPSB0aGlzLm9iamVjdHMudGFua3NbMV07IC8vIHNob3J0Y3V0XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgPSB0aGlzLm9iamVjdHMudGFua3NbMF07XHJcbiAgICAgICAgdGhpcy5vYmplY3RzLndhbGxzID0gW107IC8vIENsZWFyIGFueSB3YWxscyBmcm9tIGxhc3QgZ2FtZSwgaW4gX3NldHVwRm9ybSB3ZSBtYXkgYWRkIGl0IGluIGFnYWluXHJcbiAgICAgICAgdGhpcy5vYmplY3RzLmZ4ID0gW107XHJcbiAgICAgICAgdGhpcy5vYmplY3RzLnNoZWxscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FuQWltID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgRW52LnJhbmRvbWl6ZSgpO1xyXG4gICAgfVxyXG4gICAgX2Zvcm1TZXR1cCgpIHtcclxuICAgICAgICB0aGlzLm1vZGUgPSB0aGlzLl9zZXRHYW1lbW9kZSgkKCcjZm9ybS1nYW1lbW9kZScpLnZhbCgpKTtcclxuICAgICAgICB0aGlzLnBsYXllcjEubmFtZSA9ICQoJyNmb3JtLXBscjEtbmFtZScpLnZhbCgpO1xyXG4gICAgICAgIHRoaXMucGxheWVyMi5uYW1lID0gJCgnI2Zvcm0tcGxyMi1uYW1lJykudmFsKCk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBtb2RlbCBpcyBzZXBhcmF0ZWQgZnJvbSB0aGUgdmlld1xyXG4gICAgICAgIHRoaXMuZWxlbXMudWkucGxheWVyMS5uYW1lLmlubmVyVGV4dCA9IHRoaXMucGxheWVyMS5uYW1lO1xyXG4gICAgICAgIHRoaXMuZWxlbXMudWkucGxheWVyMi5uYW1lLmlubmVyVGV4dCA9IHRoaXMucGxheWVyMi5uYW1lO1xyXG5cclxuICAgICAgICBpZiAoJCgnI2Zvcm0td2FsbCcpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0cy53YWxsc1swXSA9IG5ldyBXYWxsKCh0aGlzLnJlbmRlcmVyLmdldFdpZHRoKCkpIC8gMiAtIENmZy5XQUxMX1dJRFRIIC8gMiwgMCwgNCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVidWdCdXR0b24gPSAkKCcjZ2FtZS1kZWJ1Zy1idXR0b24nKTtcclxuICAgICAgICBpZiAoJCgnI2Zvcm0tZGVidWcnKS5pcygnOmNoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICBkZWJ1Z0J1dHRvbi5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWJ1Z0J1dHRvbi5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5fYmFzaWNTZXR1cCgpO1xyXG4gICAgICAgIHRoaXMuX2Zvcm1TZXR1cCgpOyAvLyBUaGUgZm9ybSBjYW5ub3QgYmUgdXBkYXRlZCB3aGlsZSB0aGUgZ2FtZSBpcyBydW5uaW5nLCBzbyB0aGUgZ2FtZSBjYW5ub3QgYmUgcmVzdGFydGVkIHdpdGggZGlmZmVyZW50IHNldHRpbmdzXHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBnU3RhdHVzLlBMQVlJTkc7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzUnVubmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmlzUnVubmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBnU3RhdHVzLlBBVVNFRDtcclxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc1BsYXllci5jYW5jZWxTb3VuZCh0aGlzLnNCYW5rLnNvdW5kcy5vdmVydGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2xvb3AoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzUnVubmluZykgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkFpbSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBsYXllci5haW0oTW91c2UueCwgR2FtZVJlbmRlcmVyLm5vcm1hbGl6ZVkoTW91c2UueSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBvYmogb2YgdGhpcy5vYmplY3RzLnNoZWxscykge1xyXG4gICAgICAgICAgICBvYmoudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IG9iaiBvZiB0aGlzLm9iamVjdHMuZngpIHtcclxuICAgICAgICAgICAgb2JqLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmRyYXdEeW5hbWljKCk7XHJcbiAgICAgICAgLy8gdGhpcy5yZW5kZXJlci5fcHJlZGljdGlvbihNb3VzZS54LCBHYW1lUmVuZGVyZXIubm9ybWFsaXplWShNb3VzZS55KSk7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHt0aGlzLl9sb29wKCl9KTtcclxuICAgIH1cclxuXHJcbiAgICBfc2V0dXBFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lcy5saXN0ZW4oJ1dpbmRDaGFuZ2UnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmRyYXdXaW5kKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vYmplY3RzLndhbGxzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIHRoaXMuZXMubGlzdGVuKCdXaW5kQ2hhbmdlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXMubGlzdGVuKCdUYW5rSGl0JywgKGUpID0+IHtcclxuICAgICAgICAgICAgU3RhdHMuaW5jcmVtZW50KCdkYW1hZ2VEb25lJywgZS5kbWcpO1xyXG4gICAgICAgICAgICBpZiAoZS50YW5rID09PSB0aGlzLnBsYXllcjEpXHJcbiAgICAgICAgICAgICAgICBTdGF0cy5pbmNyZW1lbnQoJ2xlZnREYW1hZ2VSZWNlaXZlZCcsIGUuZG1nKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgU3RhdHMuaW5jcmVtZW50KCdyaWdodERhbWFnZVJlY2VpdmVkJywgZS5kbWcpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmRyYXdEYW1hZ2VOdW1iZXIoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXMubGlzdGVuKCdUdXJuUGFzcycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLm5ld1RhbmsgPT0gdGhpcy5wbGF5ZXIxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW9kZS5yb3VuZEVuZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLnR1cm5FbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHRoaXMubW9kZS50dXJuRW5kKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIHRvIGZvcmNlIHJlcGFpbnRpbmcgdGhlIHNjZW5lIHdoZW4gcmVzaXppbmdcclxuICAgICAqL1xyXG4gICAgcmVkcmF3KCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVkcmF3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgd2lubmVyKHdpbm5lcikge1xyXG4gICAgICAgIGxldCBsb3NlciA9IHdpbm5lciA9PSB0aGlzLnBsYXllcjEgPyB0aGlzLnBsYXllcjIgOiB0aGlzLnBsYXllcjE7XHJcbiAgICAgICAgU3RhdHMuaW5jcmVtZW50KCd0b3RhbE1hdGNoZXMnKTtcclxuICAgICAgICBpZiAod2lubmVyID09IHRoaXMucGxheWVyMSlcclxuICAgICAgICAgICAgU3RhdHMuaW5jcmVtZW50KCdsZWZ0V2lucycpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgU3RhdHMuaW5jcmVtZW50KCdyaWdodFdpbnMnKTtcclxuICAgICAgICBTdGF0cy5zZXQoJ2xlZnRXaW5yYXRlJywgU3RhdHMuZ2V0KCdsZWZ0V2lucycpIC8gU3RhdHMuZ2V0KCd0b3RhbE1hdGNoZXMnKSk7XHJcbiAgICAgICAgU3RhdHMuc2V0KCdyaWdodFdpbnJhdGUnLCBTdGF0cy5nZXQoJ3JpZ2h0V2lucycpIC8gU3RhdHMuZ2V0KCd0b3RhbE1hdGNoZXMnKSk7XHJcbiAgICAgICAgdGhpcy5jYW5BaW0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNQbGF5ZXIucGxheVNvdW5kKHRoaXMuc0Jhbmsuc291bmRzLmV4cGxvc2lvbik7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnNQbGF5ZXIucGxheVNvdW5kKHRoaXMuc0Jhbmsuc291bmRzLnZpY3RvcnkpO1xyXG4gICAgICAgICAgICBpZiAod2lubmVyID09IHRoaXMucGxheWVyMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci53aW4odGhpcy5wbGF5ZXIxLm5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci53aW4odGhpcy5wbGF5ZXIyLm5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnNQbGF5ZXIuY2FuY2VsU291bmQodGhpcy5zQmFuay5zb3VuZHMub3ZlcnRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmVuZGdhbWVCdXR0b25zKCk7XHJcbiAgICAgICAgfSwgMzAwMCk7XHJcblxyXG4gICAgICAgIC8vIERvIHNvbWUgZXhwbG9zaW9ucyFcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICAgICAgbmV3IEZYX0V4cGxvc2lvbihsb3Nlci54ICsgUm5kLmZsb2F0KC0xMiwxMiksIGxvc2VyLnkgKyA0ICsgUm5kLmZsb2F0KC00LDQpICsgKGkqMTIpLCB0aGlzKTtcclxuICAgICAgICAgICAgfSwgaSoxMDUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG92ZXJ0aW1lKCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIub3ZlcnRpbWUoKTtcclxuICAgICAgICB0aGlzLnNCYW5rLnNvdW5kcy5vdmVydGltZS5sb29wID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNQbGF5ZXIucGxheVNvdW5kKHRoaXMuc0Jhbmsuc291bmRzLm92ZXJ0aW1lKTtcclxuICAgICAgICBTdGF0cy5pbmNyZW1lbnQoJ292ZXJ0aW1lcycpO1xyXG4gICAgICAgIG5ldyBGWF9GaXJlRW1pdHRlcih0aGlzLnBsYXllcjIueCArIDEzLCB0aGlzLnBsYXllcjIueSwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIG5vdCBoYXZlIGFueXRoaW5nIHRvIGRvIHdpdGggcGFpbnRpbmcgdGhlIHNjZW5lLCBpbnN0ZWFkIGl0IG1lYW5zIG5vbmUgb2YgdGhlIHBsYXllcnMgYXJlIHdpbm5lcnNcclxuICAgICAqL1xyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBTdGF0cy5pbmNyZW1lbnQoJ2RyYXdzJyk7XHJcbiAgICAgICAgU3RhdHMuaW5jcmVtZW50KCd0b3RhbE1hdGNoZXMnKTtcclxuICAgICAgICB0aGlzLmNhbkFpbSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc1BsYXllci5wbGF5U291bmQodGhpcy5zQmFuay5zb3VuZHMuZXhwbG9zaW9uKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuZHJhdygpO1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgdGhpcy5zUGxheWVyLmNhbmNlbFNvdW5kKHRoaXMuc0Jhbmsuc291bmRzLm92ZXJ0aW1lKTtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5lbmRnYW1lQnV0dG9ucygpO1xyXG4gICAgICAgIH0sIDMwMDApO1xyXG5cclxuICAgICAgICAvLyBEbyBzb21lIGV4cGxvc2lvbnMhXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIG5ldyBGWF9FeHBsb3Npb24odGhpcy5wbGF5ZXIxLnggKyBSbmQuZmxvYXQoLTEyLDEyKSwgdGhpcy5wbGF5ZXIxLnkgKyA0ICsgUm5kLmZsb2F0KC00LDQpICsgKGkqMTIpLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIG5ldyBGWF9FeHBsb3Npb24odGhpcy5wbGF5ZXIyLnggKyBSbmQuZmxvYXQoLTEyLDEyKSwgdGhpcy5wbGF5ZXIyLnkgKyA0ICsgUm5kLmZsb2F0KC00LDQpICsgKGkqMTIpLCB0aGlzKTtcclxuICAgICAgICAgICAgfSwgaSoxMDUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9zZXRHYW1lbW9kZShtb2RlU3RyaW5nKSB7XHJcbiAgICAgICAgc3dpdGNoIChtb2RlU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ21pcnJvcic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlID0gbmV3IEdNX01pcnJvcih0aGlzKTtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGUgPSBuZXcgR01fQ2xhc3NpYyh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhpdCgpIHtcclxuICAgICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBnU3RhdHVzLlNFVFVQO1xyXG4gICAgICAgIHRoaXMuc3RhdGUuX2hpZGVHYW1lKCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZS5lbnRlcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7IiwiY29uc3QgQ2ZnID0gcmVxdWlyZShcIi4vQ29uZmlnXCIpO1xyXG5jb25zdCBNb3VzZSA9IHJlcXVpcmUoXCIuLi9Nb3VzZVwiKTtcclxuXHJcbmxldCBjdyA9IDA7XHJcbmxldCBjaCA9IDA7XHJcbmxldCBncm91bmRMZXZlbCA9IDA7XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmNsYXNzIEdhbWVSZW5kZXJlciB7XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBjRHluIENhbnZhcyB3aGVyZSBkeW5hbWljIHBhcnQgb2YgdGhlIGdhbWUgdGhhdCBjaGFuZ2UgZXZlcnkgZnJhbWUgYXJlIGRyYXduXHJcbiAgICAgKiBAcGFyYW0gY1N0YyBDYW52YXMgd2hlcmUgb25seSBzdGF0aWMgY29udGVudCBpcyBkcmF3biwgcmVmcmVzaGVkIG9ubHkgYXQgcmVzaXplXHJcbiAgICAgKiBAcGFyYW0gZ2FtZSB7R2FtZX1cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoY0R5biwgY1N0YywgZ2FtZSkge1xyXG4gICAgICAgIHRoaXMuY0R5biA9IGNEeW47XHJcbiAgICAgICAgdGhpcy5jU3RjID0gY1N0YztcclxuICAgICAgICB0aGlzLmN0eER5biA9IGNEeW4uZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmN0eFN0YyA9IGNTdGMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLnpvb20gPSAxOyAvLyBVbnVzZWQgY3VycmVudGx5XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IFs0LCAzXTsgLy8gVW51c2VkIGN1cnJlbnRseVxyXG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgICAgIGN3ID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgY2ggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0V2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIGN3O1xyXG4gICAgfVxyXG5cclxuICAgIGdldEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gY2g7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4ge3g6IGN3LCB5OiBjaH07XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNpemUoKSB7XHJcbiAgICAgICAgY3cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICBjaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICBncm91bmRMZXZlbCA9IGNoIC0gQ2ZnLkdST1VORF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy5jRHluLndpZHRoID0gY3c7XHJcbiAgICAgICAgdGhpcy5jRHluLmhlaWdodCA9IGNoO1xyXG4gICAgICAgIHRoaXMuY1N0Yy53aWR0aCA9IGN3O1xyXG4gICAgICAgIHRoaXMuY1N0Yy5oZWlnaHQgPSBjaDtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3U3RhdGljKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3RHluYW1pYygpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdEeW5hbWljKCkge1xyXG4gICAgICAgIHRoaXMuY3R4RHluLmNsZWFyUmVjdCgwLCAwLCBjdywgY2gpO1xyXG4gICAgICAgIG9iamVjdERyYXdlci5jbG91ZHModGhpcy5jdHhEeW4sIHRoaXMuZ2FtZS5vYmplY3RzLmNsb3Vkcyk7XHJcbiAgICAgICAgb2JqZWN0RHJhd2VyLnNoZWxscyh0aGlzLmN0eER5biwgdGhpcy5nYW1lLm9iamVjdHMuc2hlbGxzKTtcclxuICAgICAgICBvYmplY3REcmF3ZXIudGFua19iYXJyZWxzKHRoaXMuY3R4RHluLCB0aGlzLmdhbWUub2JqZWN0cy50YW5rcyk7XHJcbiAgICAgICAgb2JqZWN0RHJhd2VyLmZ4KHRoaXMuY3R4RHluLCB0aGlzLmdhbWUub2JqZWN0cy5meCk7XHJcbiAgICAgICAgb2JqZWN0RHJhd2VyLndhbGxzKHRoaXMuY3R4RHluLCB0aGlzLmdhbWUub2JqZWN0cy53YWxscyk7XHJcbiAgICAgICAgbGV0IHBvd2VyID0gdGhpcy5nYW1lLnNCYW5rLnNvdW5kcy5jaGFyZ2UuY3VycmVudFRpbWUgLyB0aGlzLmdhbWUuc0Jhbmsuc291bmRzLmNoYXJnZS5kdXJhdGlvbjtcclxuICAgICAgICBpZiAocG93ZXIpIG9iamVjdERyYXdlci5zaG90SW5kaWNhdG9yKHRoaXMuY3R4RHluLCBwb3dlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd1N0YXRpYygpIHtcclxuICAgICAgICBvYmplY3REcmF3ZXIuZ3JvdW5kKHRoaXMuY3R4U3RjKTtcclxuICAgICAgICBvYmplY3REcmF3ZXIuc2t5KHRoaXMuY3R4U3RjKTtcclxuICAgICAgICBvYmplY3REcmF3ZXIudGFua3ModGhpcy5jdHhTdGMsIHRoaXMuZ2FtZS5vYmplY3RzLnRhbmtzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIFVJIHdpbmQgaW5kaWNhdG9yIGluIHRoZSB0b3AgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB3aW5kRXZlbnRcclxuICAgICAqL1xyXG4gICAgZHJhd1dpbmQod2luZEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5lTGVmdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53aW5kLWxlZnQtYmFyJyk7XHJcbiAgICAgICAgdGhpcy5lUmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2luZC1yaWdodC1iYXInKTtcclxuICAgICAgICBsZXQgYWN0aXZlID0gdGhpcy5lTGVmdDtcclxuICAgICAgICBsZXQgb3RoZXIgPSB0aGlzLmVSaWdodDtcclxuXHJcbiAgICAgICAgaWYgKHdpbmRFdmVudC53aW5kU3BlZWQgPiAwKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZSA9IHRoaXMuZVJpZ2h0O1xyXG4gICAgICAgICAgICBvdGhlciA9IHRoaXMuZUxlZnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3aW5kRXZlbnQud2luZExldmVsICE9IENmZy5XSU5EX1ZBUklBTkNFX1NURVBTKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZS5zdHlsZS53aWR0aCA9IDIyICogd2luZEV2ZW50LndpbmRMZXZlbCArICdweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUaGUgd2luZCBiYXIgaGFzIGEgN3B4IGJvcmRlciByYWRpdXMsIGlmIHRoZSBiYXIgaXMgc3VwcG9zZWQgdG8gYmUgZnVsbCwgcmVtb3ZlIHRoZSByYWRpdXMgYnlcclxuICAgICAgICAgICAgLy8gZXh0ZW5kaW5nIHRoZSBiYXIgYWRkaXRpb25hbCA3IHBpeGVsc1xyXG4gICAgICAgICAgICBhY3RpdmUuc3R5bGUud2lkdGggPSAyMiAqIHdpbmRFdmVudC53aW5kTGV2ZWwgKyA3ICsgJ3B4JztcclxuICAgICAgICB9XHJcbiAgICAgICAgYWN0aXZlLnN0eWxlLmFuaW1hdGlvbkR1cmF0aW9uID0gMSAvICgxICsgd2luZEV2ZW50LndpbmRMZXZlbCAvIDMpICsgJ3MnO1xyXG4gICAgICAgIG90aGVyLnN0eWxlLndpZHRoID0gJzBweCc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0RhbWFnZU51bWJlcih0YW5rSGl0RXZlbnQpIHtcclxuICAgICAgICBsZXQgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGUuaW5uZXJIVE1MID0gJy0nICsgdGFua0hpdEV2ZW50LmRtZztcclxuICAgICAgICBlLmNsYXNzTGlzdC5hZGQoJ2RhbWFnZS1udW1iZXInKTtcclxuICAgICAgICBlLnN0eWxlLnRvcCA9IEdhbWVSZW5kZXJlci5kZU5vcm1hbGl6ZVkodGFua0hpdEV2ZW50LnRhbmsueSArIDQ1KSArICdweCc7XHJcbiAgICAgICAgZS5zdHlsZS5sZWZ0ID0gdGFua0hpdEV2ZW50LnRhbmsueCArICdweCc7XHJcbiAgICAgICAgZS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lLXVpJykuYXBwZW5kQ2hpbGQoZSk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0eWxlLnRvcCA9IEdhbWVSZW5kZXJlci5kZU5vcm1hbGl6ZVkodGFua0hpdEV2ZW50LnRhbmsueSArIDc1KSArICdweCc7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB9LCAxNTAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtdWknKS5yZW1vdmVDaGlsZChlKTtcclxuICAgICAgICB9LCAyNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9WRVJUSU1FIGZseWJ5XHJcbiAgICAgKi9cclxuICAgIG92ZXJ0aW1lKCkge1xyXG4gICAgICAgIGxldCBvdmVydGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIG92ZXJ0aW1lLmNsYXNzTGlzdC5hZGQoJ2dhbWUtb3ZlcnRpbWUnLCAnZ2FtZS1mbHlieScpO1xyXG4gICAgICAgIG92ZXJ0aW1lLmlubmVyVGV4dCA9IFwiT1ZFUlRJTUVcIjtcclxuICAgICAgICBvdmVydGltZS5hZGRFdmVudExpc3RlbmVyKCdhbmltYXRpb25lbmQnLCAoZSk9PntcclxuICAgICAgICAgICAgb3ZlcnRpbWUucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVydGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEUkFXIGZseWJ5XHJcbiAgICAgKi9cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGRyYXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkcmF3LmNsYXNzTGlzdC5hZGQoJ2dhbWUtb3ZlcnRpbWUnLCAnZ2FtZS1mbHlieScpO1xyXG4gICAgICAgIGRyYXcuaW5uZXJUZXh0ID0gXCJEUkFXIVwiO1xyXG4gICAgICAgIGRyYXcuYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgKGUpPT57XHJcbiAgICAgICAgICAgIGRyYXcucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmF3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdJTiBmbHlieVxyXG4gICAgICogQHBhcmFtIHdpbm5lclxyXG4gICAgICovXHJcbiAgICB3aW4od2lubmVyKSB7XHJcbiAgICAgICAgbGV0IGZseWJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZmx5YnkuY2xhc3NMaXN0LmFkZCgnZ2FtZS13aW4nLCAnZ2FtZS1mbHlieScpO1xyXG4gICAgICAgIGZseWJ5LmlubmVySFRNTCA9IHdpbm5lciArIFwiPGJyLz5XSU5TIVwiO1xyXG4gICAgICAgIGZseWJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGZseWJ5LnJlbW92ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZmx5YnkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhdyBlbmRnYW1lIGJ1dHRvbnMgLSBFWElUIG9yIFJFU1RBUlRcclxuICAgICAqL1xyXG4gICAgZW5kZ2FtZUJ1dHRvbnMoKSB7XHJcbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdidXR0b24td3JhcHBlcic7XHJcblxyXG4gICAgICAgIGxldCByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHJlc2V0QnV0dG9uLmlubmVySFRNTCA9ICdSZXN0YXJ0JztcclxuICAgICAgICByZXNldEJ1dHRvbi5jbGFzc05hbWUgPSAnYnV0dG9uJztcclxuICAgICAgICByZXNldEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKGUpPT57dGhpcy5nYW1lLnJlc3RhcnQoKTsgd3JhcHBlci5yZW1vdmUoKX0pO1xyXG5cclxuICAgICAgICBsZXQgZXhpdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGV4aXRCdXR0b24uaW5uZXJIVE1MID0gJ0V4aXQnO1xyXG4gICAgICAgIGV4aXRCdXR0b24uY2xhc3NOYW1lID0gJ2J1dHRvbic7XHJcbiAgICAgICAgZXhpdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKGUpPT57dGhpcy5nYW1lLmV4aXQoKTsgd3JhcHBlci5yZW1vdmUoKX0pO1xyXG5cclxuICAgICAgICB3cmFwcGVyLmFwcGVuZChyZXNldEJ1dHRvbiwgZXhpdEJ1dHRvbik7XHJcblxyXG4gICAgICAgICQoXCIjZ2FtZS11aVwiKS5hcHBlbmQod3JhcHBlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGJldHdlZW4gYWJzb2x1dGUgc2NyZWVuIGNvb3JkIGFuZCB0aGUgcmVsYXRpdmUgZ3JvdW5kIGNvb3JkaW5hdGVcclxuICAgICAqIEBwYXJhbSB5XHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbm9ybWFsaXplWSh5KSB7XHJcbiAgICAgICAgcmV0dXJuIGNoIC0geSAtIENmZy5HUk9VTkRfSEVJR0hUO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBiZXR3ZWVuIGFic29sdXRlIHNjcmVlbiBjb29yZCBhbmQgdGhlIHJlbGF0aXZlIGdyb3VuZCBjb29yZGluYXRlXHJcbiAgICAgKiBAcGFyYW0gbm9ybWFsWVxyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGRlTm9ybWFsaXplWShub3JtYWxZKSB7XHJcbiAgICAgICAgcmV0dXJuIC1ub3JtYWxZICsgY2ggLSBDZmcuR1JPVU5EX0hFSUdIVDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEJveCB0aGF0IGhvbGRzIG1ldGhvZHMgZm9yIHJlbmRlcmluZyBzcGVjaWZpYyBwYXJ0IG9mIHRoZSBnYW1lXHJcbiAqIEB0eXBlIHt7c3ByaXRlX3QxOiBIVE1MRWxlbWVudCB8IG51bGwsIHNwcml0ZV90MjogSFRNTEVsZW1lbnQgfCBudWxsLCBncm91bmQoKik6IHZvaWQsIHNreSgqKTogdm9pZCwgY2xvdWRzKCosICopOiB2b2lkLCBzaGVsbHMoKiwgKik6IHZvaWQsIHRhbmtzKCosICopOiB2b2lkLCB0YW5rX2JhcnJlbHMoKiwgKik6IHZvaWQsIGZ4KCo9LCAqKTogdm9pZCwgd2FsbHMoKiwgKik6IHZvaWQsIHNob3RJbmRpY2F0b3IoKiwgKik6IHZvaWR9fVxyXG4gKi9cclxuY29uc3Qgb2JqZWN0RHJhd2VyID0ge1xyXG4gICAgc3ByaXRlX3QxOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ190YW5rMScpLFxyXG4gICAgc3ByaXRlX3QyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ190YW5rMicpLFxyXG4gICAgZ3JvdW5kKGN0eCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnIzc4ZDEzZic7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIGNoIC0gQ2ZnLkdST1VORF9IRUlHSFQsIGN3LCBjaCk7XHJcbiAgICB9LFxyXG4gICAgc2t5KGN0eCkge1xyXG4gICAgICAgIGxldCBncmFkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIGN3LCBjaCAtIENmZy5HUk9VTkRfSEVJR0hUKTtcclxuICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgwLCAnIzg1YjJmZicpO1xyXG4gICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsICcjOTBkMGZmJyk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGN3LCBjaCAtIENmZy5HUk9VTkRfSEVJR0hUKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnRseSB1bnVzZWQsIGJ1dCBwcmVwYXJlZCBmb3IgbGF0ZXJcclxuICAgICAqIEBwYXJhbSBjdHhcclxuICAgICAqIEBwYXJhbSBjbG91ZHNcclxuICAgICAqL1xyXG4gICAgY2xvdWRzKGN0eCwgY2xvdWRzKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcclxuICAgICAgICBmb3IgKGxldCBjIG9mIGNsb3Vkcykge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5hcmMoYy54IC0gNDAsIGMueSwgMzUsIDAsIE1hdGguUEkgKiAyKTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICBjdHguYXJjKGMueCArIDQwLCBjLnksIDM1LCAwLCBNYXRoLlBJICogMik7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LmFyYyhjLnggKyAwLCBjLnksIDM1LCAwLCBNYXRoLlBJICogMik7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LmFyYyhjLnggLSAyMCwgYy55IC0gMzIsIDM1LCAwLCBNYXRoLlBJICogMik7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LmFyYyhjLnggKyAyNSwgYy55IC0gMzIsIDI1LCAwLCBNYXRoLlBJICogMik7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNoZWxscyhjdHgsIHNoZWxscykge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgICAgIGZvciAobGV0IHNoZWxsIG9mIHNoZWxscykge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5hcmMoc2hlbGwueCwgR2FtZVJlbmRlcmVyLmRlTm9ybWFsaXplWShzaGVsbC55KSwgMywgMCwgTWF0aC5QSSAqIDIpO1xyXG4gICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0YW5rcyhjdHgsIHRhbmtzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgdGFuayBvZiB0YW5rcykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRhbmsuc3ByaXRlLCB0YW5rLnggLSB0YW5rLndpZHRoIC8gMiwgZ3JvdW5kTGV2ZWwgLSB0YW5rLnkgLSB0YW5rLmhlaWdodCk7XHJcbiAgICAgICAgICAgIC8vIHRhbmsgY29sbGlzaW9uIHJhZGl1cyAtIDE5XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRhbmtfYmFycmVscyhjdHgsIHRhbmtzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgdGFuayBvZiB0YW5rcykge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8odGFuay54LCBHYW1lUmVuZGVyZXIuZGVOb3JtYWxpemVZKHRhbmsueSArIHRhbmsuYmFycmVsSGVpZ2h0KSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8odGFuay5iYXJyZWxYLCBHYW1lUmVuZGVyZXIuZGVOb3JtYWxpemVZKHRhbmsuYmFycmVsWSArIHRhbmsuYmFycmVsSGVpZ2h0ICsgdGFuay55KSk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZngoY3R4LCBmeHMpIHtcclxuICAgICAgICBmb3IgKGxldCBmeCBvZiBmeHMpIHtcclxuICAgICAgICAgICAgZnguZHJhdyhjdHgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB3YWxscyhjdHgsIHdhbGxzKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjY2M3YTMwJztcclxuICAgICAgICBmb3IgKGxldCB3YWxsIG9mIHdhbGxzKSB7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCh3YWxsLngsIEdhbWVSZW5kZXJlci5kZU5vcm1hbGl6ZVkod2FsbC55KSwgd2FsbC53aWR0aCwgLXdhbGwuaGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzaG90SW5kaWNhdG9yKGN0eCwgcG93ZXIpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjQ0MyMDIwXCI7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oTW91c2UueCwgTW91c2UueSk7XHJcbiAgICAgICAgY3R4LmFyYyhNb3VzZS54LCBNb3VzZS55LCAxNCwgLU1hdGguUEkvMiwgLU1hdGguUEkvMiArICBNYXRoLlBJICogMiAqIHBvd2VyKTtcclxuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVJlbmRlcmVyOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gRW52aXJvbm1lbnRcclxuICAgIFdJTkRfVkFSSUFOQ0VfU1RFUFM6IDcsXHJcbiAgICBXSU5EX1ZBUklBTkNFX0lOQ1JFTUVOVDogMixcclxuICAgIFdJTkRfUE9XRVI6IDAuMDEsXHJcblxyXG4gICAgR1JBVklUWTogLjI0LFxyXG5cclxuICAgIC8vIFNob290aW5nXHJcbiAgICBXSU5EX0JSRUFLRVJfU0hFTExfUE9XRVI6IDEuMDYsXHJcbiAgICBTSEVMTF9NQVhfU0hPVF9TUEVFRDogMTM2Ni81MCxcclxuICAgIFNIRUxMX0FJUl9EUkFHOiAuMDAwNSxcclxuICAgIFNIRUxMX0RBTUFHRV9ESVJFQ1Q6IDUwLFxyXG4gICAgU0hFTExfREFNQUdFX0dST1VORDogNDAsXHJcbiAgICBTSEVMTF9EQU1BR0VfR1JPVU5EX0FPRTogNDAsXHJcblxyXG4gICAgVEFOS19DT0xMSVNJT05fUkFESVVTOiAxOSxcclxuXHJcbiAgICBXQUxMX0hFSUdIVF9NSU46IDcwLFxyXG4gICAgV0FMTF9IRUlHSFRfTUFYOiAyNjAsXHJcbiAgICBXQUxMX1dJRFRIOiAyNCxcclxuICAgIFdBTExfV0lORF9EQU1QRU5JTkc6IFswLDAsMCwwLDAsMTAsMzAsNjBdLFxyXG5cclxuICAgIC8vIENsb3Vkc1xyXG4gICAgQ0xPVURfU1BFRUQ6IDEsXHJcbiAgICBDTE9VRF9NQVg6IDQsXHJcbiAgICBDTE9VRF9TUEFXTl9NSU46IDYsXHJcbiAgICBDTE9VRF9TUEFXTl9NQVg6IDE4LFxyXG5cclxuXHJcbiAgICAvLyBHUkFQSElDU1xyXG4gICAgR1JPVU5EX0hFSUdIVDogNjAsXHJcbn07IiwiLyoqXHJcbiAqIFRoaXMgbmljZSBjbGFzcyBlbnN1cmVzIGFueXdoZXJlIHdoZXJlIGl0IGlzIHJlcXVlc3RlZCB0aGFuIHdlIGdldCB0aGUgbXVjaCBkZXNpcmVkIG1vdXNlIGluZm9cclxuICogQHR5cGUge3t4OiBudW1iZXIsIHk6IG51bWJlcn19XHJcbiAqL1xyXG5jb25zdCBtb3VzZSA9IHtcclxuICAgIHg6IDAsXHJcbiAgICB5OiAwXHJcbn07XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpPT57XHJcbiAgICBtb3VzZS54ID0gZS5jbGllbnRYO1xyXG4gICAgbW91c2UueSA9IGUuY2xpZW50WTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlOyIsImNvbnN0IENmZyA9IHJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbmNvbnN0IFNoZWxsID0gcmVxdWlyZSgnLi9TaGVsbCcpO1xyXG5jb25zdCBFbnYgPSByZXF1aXJlKCcuL0Vudmlyb25tZW50Jyk7XHJcbmNvbnN0IEVTID0gcmVxdWlyZSgnLi9FdmVudFN5c3RlbScpO1xyXG5jb25zdCBUdXJuUGFzcyA9IHJlcXVpcmUoJy4vZXZlbnRzL1R1cm5QYXNzJyk7XHJcbmNvbnN0IFN0YXRzID0gcmVxdWlyZSgnLi4vU3RhdHMnKTtcclxuXHJcbmNsYXNzIEdhbWVTaG9vdGluZ01hbmFnZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGdhbWUge0dhbWV9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcclxuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgICAgIHRoaXMuZm9yY2VkU2hvdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY2FuU2hvb3QgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUuc0Jhbmsuc291bmRzLmNoYXJnZS5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvb3QoKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZWRTaG90ID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydFNob3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5jYW5BaW0pIHtcclxuICAgICAgICAgICAgdGhpcy5jYW5TaG9vdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VkU2hvdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUuc1BsYXllci5wbGF5U291bmQodGhpcy5nYW1lLnNCYW5rLnNvdW5kcy5jaGFyZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG9vdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5TaG9vdCkge1xyXG4gICAgICAgICAgICBTdGF0cy5pbmNyZW1lbnQoJ3NoZWxsc0ZpcmVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5jYW5BaW0gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jYW5TaG9vdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5mb3JjZWRTaG90KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlZFNob3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgc291bmQgPSB0aGlzLmdhbWUuc0Jhbmsuc291bmRzLmNoYXJnZTtcclxuICAgICAgICAgICAgbGV0IHBvd2VyID0gMC4xICsgc291bmQuY3VycmVudFRpbWUgLyBzb3VuZC5kdXJhdGlvbiAqIDAuOTtcclxuICAgICAgICAgICAgaWYgKHBvd2VyID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHBvd2VyID0gQ2ZnLldJTkRfQlJFQUtFUl9TSEVMTF9QT1dFUlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zUGxheWVyLmNhbmNlbFNvdW5kKHRoaXMuZ2FtZS5zQmFuay5zb3VuZHMuY2hhcmdlKTtcclxuICAgICAgICAgICAgaWYgKHBvd2VyIDwgMC40KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUuc1BsYXllci5wbGF5U291bmQodGhpcy5nYW1lLnNCYW5rLnNvdW5kcy5zaG90X3dlYWspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnNQbGF5ZXIucGxheVNvdW5kKHRoaXMuZ2FtZS5zQmFuay5zb3VuZHMuc2hvdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YW5rID0gdGhpcy5nYW1lLmFjdGl2ZVBsYXllcjtcclxuICAgICAgICAgICAgbGV0IHNwZCA9IHBvd2VyICogQ2ZnLlNIRUxMX01BWF9TSE9UX1NQRUVEO1xyXG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gdGFuay5iYXJyZWxMZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBwb3dlclggPSAodGFuay5iYXJyZWxYIC0gdGFuay54KSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHBvd2VyWSA9ICh0YW5rLmJhcnJlbFkgKyB0YW5rLnkpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICBuZXcgU2hlbGwodGFuay5iYXJyZWxYLCB0YW5rLmJhcnJlbFkgKyB0YW5rLmJhcnJlbEhlaWdodCxcclxuICAgICAgICAgICAgICAgIHNwZCAqIHBvd2VyWCxcclxuICAgICAgICAgICAgICAgIHNwZCAqIHBvd2VyWSxcclxuICAgICAgICAgICAgICAgIG51bGwsIHRoaXMuZ2FtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBhc3NUdXJuKCkge1xyXG4gICAgICAgIGxldCBldmVudDtcclxuICAgICAgICBpZiAodGhpcy5nYW1lLmFjdGl2ZVBsYXllciA9PSB0aGlzLmdhbWUub2JqZWN0cy50YW5rc1swXSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUuYWN0aXZlUGxheWVyID0gdGhpcy5nYW1lLm9iamVjdHMudGFua3NbMV07XHJcbiAgICAgICAgICAgIGV2ZW50ID0gbmV3IFR1cm5QYXNzKHRoaXMuZ2FtZS5vYmplY3RzLnRhbmtzWzBdLCB0aGlzLmdhbWUuYWN0aXZlUGxheWVyID0gdGhpcy5nYW1lLm9iamVjdHMudGFua3NbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmFjdGl2ZVBsYXllciA9IHRoaXMuZ2FtZS5vYmplY3RzLnRhbmtzWzBdO1xyXG4gICAgICAgICAgICBldmVudCA9IG5ldyBUdXJuUGFzcyh0aGlzLmdhbWUub2JqZWN0cy50YW5rc1sxXSwgdGhpcy5nYW1lLmFjdGl2ZVBsYXllciA9IHRoaXMuZ2FtZS5vYmplY3RzLnRhbmtzWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nYW1lLmNhbkFpbSA9IHRydWU7XHJcbiAgICAgICAgRVMuZ2V0SW5zdCgpLmZpcmUoZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVuZEdhbWUoKSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTaG9vdGluZ01hbmFnZXI7IiwiY29uc3QgRW52ID0gcmVxdWlyZSgnLi9FbnZpcm9ubWVudCcpO1xyXG5jb25zdCBDZmcgPSByZXF1aXJlKCcuL0NvbmZpZycpO1xyXG5jb25zdCBSbmQgPSByZXF1aXJlKCcuLi91dGlsL1JhbmRvbScpO1xyXG5jb25zdCBUYW5rSGl0ID0gcmVxdWlyZSgnLi9ldmVudHMvVGFua0hpdCcpO1xyXG5jb25zdCBFUyA9IHJlcXVpcmUoJy4vRXZlbnRTeXN0ZW0nKTtcclxuY29uc3QgRlhfRXhwbG9zaW9uID0gcmVxdWlyZSgnLi9GWF9FeHBsb3Npb24nKTtcclxuY29uc3QgRlhfRHVzdCA9IHJlcXVpcmUoJy4vRlhfRHVzdCcpO1xyXG5jb25zdCBTdGF0cyA9IHJlcXVpcmUoJy4uL1N0YXRzJyk7XHJcblxyXG5jbGFzcyBTaGVsbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBheCwgYXksIHBsciwgZ2FtZSkge1xyXG4gICAgICAgIHRoaXMuYXggPSBheDtcclxuICAgICAgICB0aGlzLmF5ID0gYXk7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgdGhpcy50YW5rMSA9IHRoaXMuZ2FtZS5vYmplY3RzLnRhbmtzWzBdO1xyXG4gICAgICAgIHRoaXMudGFuazIgPSB0aGlzLmdhbWUub2JqZWN0cy50YW5rc1sxXTtcclxuICAgICAgICB0aGlzLndhbGwgPSB0aGlzLmdhbWUub2JqZWN0cy53YWxsc1swXTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lLm9iamVjdHMuc2hlbGxzLnB1c2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2ltcGxlc3Qgd2F5IHBvc3NpYmxlIGJ1dCB3L2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlMSA9ICh0aGlzLnggLSB0aGlzLnRhbmsxLngpICogKHRoaXMueCAtIHRoaXMudGFuazEueCkgKyAodGhpcy55IC0gdGhpcy50YW5rMS55KSAqICh0aGlzLnkgLSB0aGlzLnRhbmsxLnkpO1xyXG4gICAgICAgIGlmIChkaXN0YW5jZTEgPCB0aGlzLnRhbmsxLnJhZGl1cyAqIHRoaXMudGFuazEucmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGlkZVRhbmsodGhpcy50YW5rMSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlMiA9ICh0aGlzLnggLSB0aGlzLnRhbmsyLngpICogKHRoaXMueCAtIHRoaXMudGFuazIueCkgKyAodGhpcy55IC0gdGhpcy50YW5rMi55KSAqICh0aGlzLnkgLSB0aGlzLnRhbmsyLnkpO1xyXG4gICAgICAgIGlmIChkaXN0YW5jZTIgPCB0aGlzLnRhbmsyLnJhZGl1cyAqIHRoaXMudGFuazIucmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGlkZVRhbmsodGhpcy50YW5rMik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMud2FsbCAmJiAodGhpcy54ID4gdGhpcy53YWxsLnggJiYgdGhpcy54IDwgdGhpcy53YWxsLnggKyB0aGlzLndhbGwud2lkdGggJiYgdGhpcy55IDwgdGhpcy53YWxsLnkgKyB0aGlzLndhbGwuaGVpZ2h0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxpZGVXYWxsKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMueSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMueSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGlkZUdyb3VuZChkaXN0YW5jZTEsIGRpc3RhbmNlMik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29sbGlkZUdyb3VuZChkaXN0YW5jZTEsIGRpc3RhbmNlMikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUm5kLmludCgzLCA3KTsgaSsrKSB7XHJcbiAgICAgICAgICAgIG5ldyBGWF9EdXN0KHRoaXMueCwgdGhpcy55LCB0aGlzLmdhbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRpc3QxID0gTWF0aC5zcXJ0KGRpc3RhbmNlMSk7XHJcbiAgICAgICAgbGV0IGRtZzEgPSBNYXRoLnJvdW5kKENmZy5TSEVMTF9EQU1BR0VfR1JPVU5EICogdGhpcy5fZG1nTW9kaWZpZXIoZGlzdDEpKTtcclxuICAgICAgICBpZiAoZG1nMSA+PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFuazEuaHVydChkbWcxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkaXN0MiA9IE1hdGguc3FydChkaXN0YW5jZTIpO1xyXG4gICAgICAgIGxldCBkbWcyID0gTWF0aC5yb3VuZChDZmcuU0hFTExfREFNQUdFX0dST1VORCAqIHRoaXMuX2RtZ01vZGlmaWVyKGRpc3QyKSk7XHJcbiAgICAgICAgaWYgKGRtZzIgPj0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnRhbmsyLmh1cnQoZG1nMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29sbGlkZVNoYXJlZCgpO1xyXG4gICAgICAgIFN0YXRzLmluY3JlbWVudCgnZ3JvdW5kSGl0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbGxpZGVXYWxsKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGlkZVNoYXJlZCgpO1xyXG4gICAgICAgIFN0YXRzLmluY3JlbWVudCgnd2FsbEhpdHMnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSB2YWx1ZSBmcm9tIDAgdG8gMSB0aGF0IHJlcHJlc2VudHMgdGhlIGRhbWFnZSBmYWxsIG9mZiBkZXBlbmRlbnQgb24gZGlzdGFuY2UgYmV0d2VlbiB0aGUgc2hvdCBhbmQgYSB0YW5rXHJcbiAgICAgKiBAcGFyYW0gZGlzdGFuY2VcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZG1nTW9kaWZpZXIoZGlzdGFuY2UpIHtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPD0gQ2ZnLlRBTktfQ09MTElTSU9OX1JBRElVUykge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlID49IENmZy5UQU5LX0NPTExJU0lPTl9SQURJVVMgKyBDZmcuU0hFTExfREFNQUdFX0dST1VORF9BT0UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAxIC0gKGRpc3RhbmNlIC0gQ2ZnLlRBTktfQ09MTElTSU9OX1JBRElVUykgLyBDZmcuU0hFTExfREFNQUdFX0dST1VORF9BT0U7XHJcbiAgICB9XHJcblxyXG4gICAgY29sbGlkZVRhbmsodGFuaykge1xyXG4gICAgICAgIHRoaXMuZ2FtZS5zUGxheWVyLnBsYXlTb3VuZCh0aGlzLmdhbWUuc0Jhbmsuc291bmRzLmRpcmVjdF9oaXQpO1xyXG4gICAgICAgIHRhbmsuaHVydChDZmcuU0hFTExfREFNQUdFX0RJUkVDVCk7XHJcbiAgICAgICAgRVMuaW5zdC5maXJlKG5ldyBUYW5rSGl0KHRhbmssIENmZy5TSEVMTF9EQU1BR0VfRElSRUNUKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsaWRlU2hhcmVkKCk7XHJcbiAgICAgICAgU3RhdHMuaW5jcmVtZW50KCdkaXJlY3RIaXRzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIHBhcnQgaXMgdGhlIHNhbWUgZm9yIGFueSBjb2xsaXNpb24gcG9zc2liaWxpdHkgKHdhbGwvdGFuay9ncm91bmQpXHJcbiAgICAgKi9cclxuICAgIGNvbGxpZGVTaGFyZWQoKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lLmNvbnRyb2xzLnBhc3NUdXJuKCk7XHJcbiAgICAgICAgdGhpcy5nYW1lLnNQbGF5ZXIucGxheVNvdW5kKHRoaXMuZ2FtZS5zQmFuay5zb3VuZHMuaGl0KTtcclxuICAgICAgICB0aGlzLmdhbWUub2JqZWN0cy5zaGVsbHMuc3BsaWNlKHRoaXMuZ2FtZS5vYmplY3RzLnNoZWxscy5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgICBuZXcgRlhfRXhwbG9zaW9uKHRoaXMueCwgdGhpcy55LCB0aGlzLmdhbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT25jZSBwZXIgZnJhbWVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24oKTtcclxuICAgICAgICB0aGlzLnggKz0gdGhpcy5heDtcclxuICAgICAgICB0aGlzLnkgKz0gdGhpcy5heTtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5heCA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgdGhpcy5heCA9ICh0aGlzLmF4ICsgRW52LmdldFdpbmRTcGVlZCgpKSAtIENmZy5TSEVMTF9BSVJfRFJBRyAqICh0aGlzLmF4ICogdGhpcy5heCkgKiBkaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5heSAtPSBFbnYuZ2V0R3Jhdml0eSgpO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGVsbDsiLCIvKiogU0lOR0lMRVRPTiAqKi9cclxuXHJcbmNvbnN0IFJuZCA9IHJlcXVpcmUoJy4uL3V0aWwvUmFuZG9tJyk7XHJcbmNvbnN0IENmZyA9IHJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbmNvbnN0IEVTID0gcmVxdWlyZSgnLi9FdmVudFN5c3RlbScpO1xyXG5jb25zdCBXaW5kQ2hhbmdlID0gcmVxdWlyZSgnLi9ldmVudHMvV2luZENoYW5nZScpO1xyXG5cclxuY2xhc3MgRW52aXJvbm1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy53aW5kU3BlZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2luZExldmVsID0gMDtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBDZmcuR1JBVklUWTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXaW5kU3BlZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud2luZFNwZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFdpbmRMZXZlbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy53aW5kTGV2ZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0R3Jhdml0eSgpIHtcclxuICAgICAgICByZXR1cm4gQ2ZnLkdSQVZJVFk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSYW5kb21pemVkIHRoZSB3aW5kIHNwZWVkIGFuZCBkaXJlY3Rpb25cclxuICAgICAqL1xyXG4gICAgcmFuZG9taXplKCkge1xyXG4gICAgICAgIGxldCBzdGVwcyA9IFJuZC5pbnQoMCwgQ2ZnLldJTkRfVkFSSUFOQ0VfU1RFUFMpO1xyXG4gICAgICAgIHRoaXMud2luZExldmVsID0gc3RlcHM7IC8vIFVzZWQgZm9yIGJ1aWxkaW5nIGEgd2FsbCAoTWV4aWNvIHBheXMgb2ZjKVxyXG4gICAgICAgIGxldCBzaWduID0gUm5kLnNpZ24oKTtcclxuICAgICAgICB0aGlzLndpbmRTcGVlZCA9IHN0ZXBzICogc2lnbiAqIENmZy5XSU5EX1ZBUklBTkNFX0lOQ1JFTUVOVCAqIENmZy5XSU5EX1BPV0VSO1xyXG4gICAgICAgIEVTLmdldEluc3QoKS5maXJlKG5ldyBXaW5kQ2hhbmdlKHRoaXMud2luZFNwZWVkLCB0aGlzLndpbmRMZXZlbCkpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPbmx5IHN3YXBzIHRoZSB3aW5kIGRpcmVjdGlvbi4gVXNlZCBmb3IgdGhlIG1pcnJvciBnYW1lbW9kZVxyXG4gICAgICovXHJcbiAgICBzd2FwV2luZCgpIHtcclxuICAgICAgICB0aGlzLndpbmRTcGVlZCA9IC10aGlzLndpbmRTcGVlZDtcclxuICAgICAgICBFUy5nZXRJbnN0KCkuZmlyZShuZXcgV2luZENoYW5nZSh0aGlzLndpbmRTcGVlZCwgdGhpcy53aW5kTGV2ZWwpKVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBFbnZpcm9ubWVudCgpOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaW50KG1pbiwgbWF4KSB7XHJcbiAgICAgICAgLy8gdG9kbzogY2hlY2sgaXQgaXQgd29ya3MgY29ycmVjdGx5XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobWluICsgTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKzEpKTtcclxuICAgIH0sXHJcbiAgICBmbG9hdChtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heC1taW4pO1xyXG4gICAgfSxcclxuICAgIHNpZ24oKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAwLjUgPyAtMSA6IDE7XHJcbiAgICB9LFxyXG4gICAgYm9vbCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IDAuNTtcclxuICAgIH1cclxufTsiLCIvKiBTSU5HTEVUT04gKi9cclxuXHJcbmNsYXNzIEV2ZW50U3lzdGVtIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICAgICAgRXZlbnRTeXN0ZW0uaW5zdCA9IHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZShldmVudCkge1xyXG4gICAgICAgIGZvciAobGV0IGwgb2YgdGhpcy5ldmVudHNbZXZlbnQuZ2V0SWQoKV0pIHtcclxuICAgICAgICAgICAgbChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbihldmVudElkLCBmbikge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNbZXZlbnRJZF0pIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRJZF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRJZF0ucHVzaChmbik7XHJcbiAgICB9XHJcblxyXG4gICAgZGV0YWNoKGV2ZW50Q2xhc3MsIGZuKSB7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmV2ZW50c1tldmVudENsYXNzLmdldElkKCldLmluZGV4T2YoZm4pO1xyXG4gICAgICAgIGlmIChpID49IDApIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRDbGFzcy5nZXRJZCgpXS5zcGxpY2UoaSwxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEluc3QoKSB7XHJcbiAgICAgICAgaWYgKCFFdmVudFN5c3RlbS5pbnN0KSB7XHJcbiAgICAgICAgICAgIG5ldyBFdmVudFN5c3RlbSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRXZlbnRTeXN0ZW0uaW5zdDtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFN5c3RlbTsiLCJjbGFzcyBXaW5kQ2hhbmdlIHtcclxuICAgIGNvbnN0cnVjdG9yKHdpbmRTcGVlZCwgd2luZExldmVsKSB7XHJcbiAgICAgICAgdGhpcy53aW5kU3BlZWQgPSB3aW5kU3BlZWQ7XHJcbiAgICAgICAgdGhpcy53aW5kTGV2ZWwgPSB3aW5kTGV2ZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICdXaW5kQ2hhbmdlJztcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRJZCgpIHtcclxuICAgICAgICByZXR1cm4gJ1dpbmRDaGFuZ2UnO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBCZWZvcmUgSSByZWFsaXplZCBJIGNvdWxkIGRvIHRoaXNcclxuLy8gTmV3Um91bmQuaWQgPSAnTmV3Um91bmQnO1xyXG4vLyBJIHdhcyB1c2luZyB0aGUgd2F5IGFib3ZlIFtib3RoIGluc3RhbmNlIG1ldGhvZHMgYW5kIHN0YXRpYyBtZXRob2RdXHJcbi8vIGFuZCB0aGVuIHdoZW4gSSBmaW5hbGx5IGtuZXcgdGhlIGJldHRlciB3YXkgSSB3YXMgdG9vIGxhenkgdG8gcmVmYWN0b3JcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2luZENoYW5nZTsiLCJjbGFzcyBUYW5rSGl0IHtcclxuICAgIGNvbnN0cnVjdG9yKHRhbmssIGRtZykge1xyXG4gICAgICAgIHRoaXMudGFuayA9IHRhbms7XHJcbiAgICAgICAgdGhpcy5kbWcgPSBkbWc7XHJcbiAgICB9XHJcbiAgICBnZXRJZCgpIHtcclxuICAgICAgICByZXR1cm4gJ1RhbmtIaXQnO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldElkKCkge1xyXG4gICAgICAgIHJldHVybiAnVGFua0hpdCc7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEJlZm9yZSBJIHJlYWxpemVkIEkgY291bGQgZG8gdGhpc1xyXG4vLyBOZXdSb3VuZC5pZCA9ICdOZXdSb3VuZCc7XHJcbi8vIEkgd2FzIHVzaW5nIHRoZSB3YXkgYWJvdmUgW2JvdGggaW5zdGFuY2UgbWV0aG9kcyBhbmQgc3RhdGljIG1ldGhvZF1cclxuLy8gYW5kIHRoZW4gd2hlbiBJIGZpbmFsbHkga25ldyB0aGUgYmV0dGVyIHdheSBJIHdhcyB0b28gbGF6eSB0byByZWZhY3RvclxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYW5rSGl0OyIsImNvbnN0IEdhbWVSZW5kZXJlciA9IHJlcXVpcmUoJy4vR2FtZVJlbmRlcmVyJyk7XHJcblxyXG5jbGFzcyBGWF9FeHBsb3Npb24ge1xyXG4gICAgY29uc3RydWN0b3IoeCx5LCBnYW1lKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSBHYW1lUmVuZGVyZXIuZGVOb3JtYWxpemVZKHkpO1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gJ3JnYigyNTUsIDEyMCwgMCwgJztcclxuICAgICAgICB0aGlzLnNpemUgPSAwLjE7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZS5vYmplY3RzLmZ4LnB1c2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSArPSAwLjQ7XHJcbiAgICAgICAgdGhpcy5zaXplICs9IC44O1xyXG4gICAgICAgIGlmICh0aGlzLm9wYWNpdHkgPiAxLjYpIHtcclxuICAgICAgICAgICAgdGhpcy5vcGFjaXR5ID0gMC41O1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9yID0gJ3JnYigyNSwgMjUsIDI1LCAnO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSA9ICgpPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaXplIC09IDAuMDAzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGFjaXR5IC09IDAuMDA1O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3BhY2l0eSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUub2JqZWN0cy5meC5zcGxpY2UodGhpcy5nYW1lLm9iamVjdHMuZnguaW5kZXhPZih0aGlzKSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgpIHtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgMTIgKiB0aGlzLnNpemUsIDAsIE1hdGguUEkqMik7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3IgKyB0aGlzLm9wYWNpdHkgKyAnKSc7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGWF9FeHBsb3Npb247IiwiY29uc3QgR2FtZVJlbmRlcmVyID0gcmVxdWlyZSgnLi9HYW1lUmVuZGVyZXInKTtcclxuY29uc3QgRW52ID0gcmVxdWlyZSgnLi9FbnZpcm9ubWVudCcpO1xyXG5jb25zdCBSbmQgPSByZXF1aXJlKCcuLi91dGlsL1JhbmRvbScpO1xyXG5cclxuY2xhc3MgRlhfRHVzdCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LHksIGdhbWUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5heCA9IFJuZC5mbG9hdCgtMywzKTtcclxuICAgICAgICB0aGlzLmF5ID0gUm5kLmZsb2F0KDQsMTApO1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IDEuMjtcclxuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSAncmdiKDExMCwgOTYsIDMxLCAnO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IFJuZC5mbG9hdCgxLDIpO1xyXG4gICAgICAgIHRoaXMuc2l6ZURlZ3JhZGF0aW9uID0gUm5kLmZsb2F0KDAuMDAxLDAuMDE1KTtcclxuICAgICAgICB0aGlzLm9wYWNpdHlEZWdyYWRhdGlvbiA9IFJuZC5mbG9hdCgwLjAwMSwwLjAxNSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZS5vYmplY3RzLmZ4LnB1c2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSAtPSB0aGlzLm9wYWNpdHlEZWdyYWRhdGlvbjtcclxuICAgICAgICB0aGlzLnNpemUgLT0gdGhpcy5zaXplRGVncmFkYXRpb247XHJcbiAgICAgICAgaWYgKHRoaXMub3BhY2l0eSA8IDAgfHwgdGhpcy55IDwgMCB8fCB0aGlzLnNpemUgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5vYmplY3RzLmZ4LnNwbGljZSh0aGlzLmdhbWUub2JqZWN0cy5meC5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5heSAtPSBFbnYuZ2V0R3Jhdml0eSgpO1xyXG4gICAgICAgIHRoaXMueCArPXRoaXMuYXg7XHJcbiAgICAgICAgdGhpcy55ICs9dGhpcy5heTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGN0eCkge1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKHRoaXMueCwgR2FtZVJlbmRlcmVyLmRlTm9ybWFsaXplWSh0aGlzLnkpLCB0aGlzLnNpemUgKiB0aGlzLnNpemUsIDAsIE1hdGguUEkqMik7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3IgKyB0aGlzLm9wYWNpdHkgKyAnKSc7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGWF9EdXN0OyIsImNvbnN0IGtleXMgPSBbXHJcbiAgICAnc2hlbGxzRmlyZWQnLFxyXG4gICAgJ2RpcmVjdEhpdHMnLFxyXG4gICAgJ3dhbGxIaXRzJyxcclxuICAgICdncm91bmRIaXRzJyxcclxuICAgICdkYW1hZ2VEb25lJyxcclxuICAgICdsZWZ0RGFtYWdlUmVjZWl2ZWQnLFxyXG4gICAgJ3JpZ2h0RGFtYWdlUmVjZWl2ZWQnLFxyXG4gICAgJ3RvdGFsTWF0Y2hlcycsXHJcbiAgICAnbGVmdFdpbnMnLFxyXG4gICAgJ3JpZ2h0V2lucycsXHJcbiAgICAnb3ZlcnRpbWVzJyxcclxuICAgICdkcmF3cydcclxuXTtcclxuXHJcbmNvbnN0IFN0YXRzID0ge1xyXG4gICAgdGRzOiBudWxsLFxyXG4gICAgc3RhdHM6IFtdLFxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy50ZHNbaSoyKzFdLmlubmVySFRNTCA9IHRoaXMuc3RhdHNba2V5c1tpXV07XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBpbmNyZW1lbnQoa2V5LCB2YWx1ZSA9IDEpIHtcclxuICAgICAgICB0aGlzLnN0YXRzW2tleV0gKz0gdmFsdWU7XHJcbiAgICB9LFxyXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcclxuICAgICAgICB0aGlzLnN0YXRzW2tleV0gPSB2YWx1ZTtcclxuICAgIH0sXHJcbiAgICBnZXQoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHNba2V5XTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXlzW2ldLCAnJyArIHRoaXMuc3RhdHNba2V5c1tpXV0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0c1trZXlzW2ldXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgIFN0YXRzLnN0YXRzW2tleXNbaV1dID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5c1tpXSkgfCAwO1xyXG59XHJcblxyXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKT0+e1xyXG4gICAgU3RhdHMudGRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3N0YXRzIHRhYmxlIHRkJyk7XHJcbiAgICAkKCcjY2xlYXItc3RhdHMnKS5jbGljaygoKT0+e1xyXG4gICAgICAgIGlmIChjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gY2xlYXIgeW91ciBzdGF0cz8gSXQgY2Fubm90IGJlIHJldmVydGVkIScpKSB7XHJcbiAgICAgICAgICAgIFN0YXRzLmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuLy8gVXNpbmcgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIC4uLikgd2FzIG5vdCB3b3JraW5nIGZvciBzb21lIHJlYXNvbiwgdXNpbmcgd2luZG93Lm9uYmVmb3JldW5sb2FkIGluc3RlYWRcclxud2luZG93Lm9uYmVmb3JldW5sb2FkID0gKGUpPT57XHJcbiAgICAvLyBTdG9yZSB0aGUgbG9jYWxseSBrZXB0IHNjb3JlcyB0byBsb2NhbFN0b3JhZ2VcclxuICAgIFN0YXRzLnNhdmUoKTsgLy8gTG9jYWwgc2F2ZVxyXG5cclxuICAgIC8vIHRvZG86IGNyZWF0ZSBhIGJhY2tlbmQgZGIgYW5kIG1ha2UgYSBzeW5jIHRvIGl0IGhlcmVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhdHM7IiwiY2xhc3MgVHVyblBhc3Mge1xyXG4gICAgY29uc3RydWN0b3IobGFzdFRhbmssIG5ld1RhbmspIHtcclxuICAgICAgICB0aGlzLmxhc3RUYW5rID0gbGFzdFRhbms7XHJcbiAgICAgICAgdGhpcy5uZXdUYW5rID0gbmV3VGFuaztcclxuICAgIH1cclxuICAgIGdldElkKCkge1xyXG4gICAgICAgIHJldHVybiAnVHVyblBhc3MnO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldElkKCkge1xyXG4gICAgICAgIHJldHVybiAnVHVyblBhc3MnO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBCZWZvcmUgSSByZWFsaXplZCBJIGNvdWxkIGRvIHRoaXNcclxuLy8gTmV3Um91bmQuaWQgPSAnTmV3Um91bmQnO1xyXG4vLyBJIHdhcyB1c2luZyB0aGUgd2F5IGFib3ZlIFtib3RoIGluc3RhbmNlIG1ldGhvZHMgYW5kIHN0YXRpYyBtZXRob2RdXHJcbi8vIGFuZCB0aGVuIHdoZW4gSSBmaW5hbGx5IGtuZXcgdGhlIGJldHRlciB3YXkgSSB3YXMgdG9vIGxhenkgdG8gcmVmYWN0b3JcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHVyblBhc3M7IiwiY29uc3QgRlhfU21va2VFbWl0dGVyID0gcmVxdWlyZSgnLi9GWF9TbW9rZUVtaXR0ZXInKTtcclxuY29uc3QgRVMgPSByZXF1aXJlKCcuL0V2ZW50U3lzdGVtJyk7XHJcbmNvbnN0IFRhbmtIaXQgPSByZXF1aXJlKCcuL2V2ZW50cy9UYW5rSGl0Jyk7XHJcblxyXG5jbGFzcyBUYW5rIHtcclxuICAgIGNvbnN0cnVjdG9yKHgseSwgc3ByaXRlLCBocEJhciwgZmFjaW5nLCBnYW1lKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMud2lkdGggPSA0MjtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDE2O1xyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMTk7XHJcbiAgICAgICAgdGhpcy5ocEJhciA9IGhwQmFyO1xyXG4gICAgICAgIHRoaXMuYnVybmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZmFjaW5nID0gZmFjaW5nO1xyXG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgICAgIHRoaXMuaHAgPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuYmFycmVsTGVuZ3RoID0gMTU7XHJcbiAgICAgICAgdGhpcy5iYXJyZWxIZWlnaHQgPSAxMjtcclxuICAgICAgICB0aGlzLmJhcnJlbFggPSB0aGlzLng7XHJcbiAgICAgICAgdGhpcy5iYXJyZWxZID0gdGhpcy55O1xyXG4gICAgfVxyXG5cclxuICAgIGh1cnQoZG1nKSB7XHJcbiAgICAgICAgdGhpcy5ocCAtPSBkbWc7XHJcbiAgICAgICAgdGhpcy5ocEJhci52YWx1ZSA9IHRoaXMuaHA7XHJcbiAgICAgICAgaWYgKHRoaXMuaHAgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmhwID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaHAgPCAzNSAmJiB0aGlzLmJ1cm5pbmcgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5idXJuaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3IEZYX1Ntb2tlRW1pdHRlcih0aGlzLngtICgxMyAqIHRoaXMuZmFjaW5nKSwgdGhpcy55ICsgNywgdGhpcy5nYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSUYgaHVydCB3aXRoIGRhbWFnZSAwIGlzIGNhbGxlZCBpdCBtZWFucyB0byByZXNldCB0aGUgdmFsdWUgb2YgdGhlIEhQIGJhciwgZm9yIGV4YW1wbGUgd2hlbiBuZXcgdGFuayBzcGF3bnMgaHVydCgwKSBtYWtlcyBpdCByZXNldCBiYWNrIHRvIGZ1bGxcclxuICAgICAgICBpZiAoZG1nID4gMCkge1xyXG4gICAgICAgICAgICBFUy5pbnN0LmZpcmUobmV3IFRhbmtIaXQodGhpcywgZG1nKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFpbSh4LHkpIHtcclxuICAgICAgICBsZXQgbnggPSB4O1xyXG4gICAgICAgIGxldCBueSA9IHkgPiB0aGlzLnkgKyB0aGlzLmJhcnJlbEhlaWdodCA/IHkgOiB0aGlzLmJhcnJlbEhlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy54IC0gbng7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IG55IC0gdGhpcy55IC0gdGhpcy5iYXJyZWxIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYmFycmVsWCA9IHRoaXMueCAtICh3aWR0aCAvIE1hdGguc3FydCh3aWR0aCp3aWR0aCtoZWlnaHQqaGVpZ2h0KSkgKiB0aGlzLmJhcnJlbExlbmd0aDtcclxuICAgICAgICB0aGlzLmJhcnJlbFkgPSBoZWlnaHQgLyAoTWF0aC5zcXJ0KHdpZHRoKndpZHRoK2hlaWdodCpoZWlnaHQpKSAqIHRoaXMuYmFycmVsTGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmJhcnJlbFkgPSB0aGlzLnkgKyB0aGlzLmJhcnJlbEhlaWdodCAtIChoZWlnaHQgLyBNYXRoLnNxcnQod2lkdGgqd2lkdGgraGVpZ2h0KmhlaWdodCkpICogdGhpcy5iYXJyZWxMZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmJhcnJlbFknLCB0aGlzLmJhcnJlbFkpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmJhcnJlbFgnLCB0aGlzLmJhcnJlbFgpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmJhcnJlbFkgPSBueTtcclxuICAgICAgICAvLyB0aGlzLmJhcnJlbFggPSBueDtcclxuICAgIH1cclxuXHJcbiAgICBpc0FsaXZlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhwID4gMDtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYW5rOyIsImNvbnN0IEdhbWVSZW5kZXJlciA9IHJlcXVpcmUoJy4vR2FtZVJlbmRlcmVyJyk7XHJcbmNvbnN0IFJuZCA9IHJlcXVpcmUoJy4uL3V0aWwvUmFuZG9tJyk7XHJcbmNvbnN0IEZYX1Ntb2tlUGFydGljbGUgPSByZXF1aXJlKCcuL0ZYX1Ntb2tlUGFydGljbGUnKTtcclxuXHJcbmNsYXNzIEZYX1Ntb2tlRW1pdHRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LHksIGdhbWUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgICAgICB0aGlzLmdhbWUub2JqZWN0cy5meC5wdXNoKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmVtaXNzaW9uRGVsYXkgPSAxNDtcclxuICAgICAgICB0aGlzLnRpbWVUb0VtaXQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy50aW1lVG9FbWl0ID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lVG9FbWl0ID0gdGhpcy5lbWlzc2lvbkRlbGF5O1xyXG4gICAgICAgICAgICBuZXcgRlhfU21va2VQYXJ0aWNsZShSbmQuaW50KDAsNCkgKyB0aGlzLngsIFJuZC5pbnQoMCwzKSArIHRoaXMueSwgdGhpcy5nYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLS10aGlzLnRpbWVUb0VtaXRcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGN0eCkge1xyXG5cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGWF9TbW9rZUVtaXR0ZXI7IiwiY29uc3QgR2FtZVJlbmRlcmVyID0gcmVxdWlyZSgnLi9HYW1lUmVuZGVyZXInKTtcclxuY29uc3QgRW52ID0gcmVxdWlyZSgnLi9FbnZpcm9ubWVudCcpO1xyXG5jb25zdCBSbmQgPSByZXF1aXJlKCcuLi91dGlsL1JhbmRvbScpO1xyXG5cclxuY2xhc3MgRlhfU21va2VQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LHksIGdhbWUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zaXplID0gNDtcclxuICAgICAgICB0aGlzLmF5ID0gUm5kLmZsb2F0KDAuMTgsMC4yNSk7XHJcbiAgICAgICAgdGhpcy5heCA9IFJuZC5mbG9hdCgtLjA3LC4wNyk7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5RGVncmFkYXRpb24gPSAwLjAwMjtcclxuICAgICAgICB0aGlzLnNpemVJbmNyZW1lbnQgPSAwLjA0O1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IDAuNjtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lLm9iamVjdHMuZngucHVzaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5IC09IHRoaXMub3BhY2l0eURlZ3JhZGF0aW9uO1xyXG4gICAgICAgIHRoaXMuc2l6ZSArPSB0aGlzLnNpemVJbmNyZW1lbnQ7XHJcbiAgICAgICAgaWYgKHRoaXMub3BhY2l0eSA8IDAgfHwgdGhpcy55IDwgMCB8fCB0aGlzLnNpemUgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5vYmplY3RzLmZ4LnNwbGljZSh0aGlzLmdhbWUub2JqZWN0cy5meC5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54ICs9dGhpcy5heDtcclxuICAgICAgICB0aGlzLnkgKz10aGlzLmF5O1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY3R4KSB7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmModGhpcy54LCBHYW1lUmVuZGVyZXIuZGVOb3JtYWxpemVZKHRoaXMueSksIHRoaXMuc2l6ZSwgMCwgTWF0aC5QSSoyKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjAsMjAsMjAsJyArIHRoaXMub3BhY2l0eSArICcpJztcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZYX1Ntb2tlUGFydGljbGU7IiwiLyoqXHJcbiAqIFRoZSB3YXkgdGhpcyBpcyBpbXBsZW1lbnRlZCBtYXkgbm90IGJlIHRoZSBiZXN0IG9uZSBzaW5jZSBwbGF5aW5nIHNvdW5kIGlzIGtpbmRhIGFubm95aW5nIGJ1dCBpdCB3b3JrcyBzbyB3ZSBjb29sXHJcbiAqL1xyXG5jbGFzcyBTb3VuZEJhbmsge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgU291bmRCYW5rLmluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBsZXQgaWRzID0gWydzaG90JywgJ3Nob3Rfd2VhaycsICdleHBsb3Npb24nLCAnY2hhcmdlJywgJ2hpdCcsICdpbnRybycsICdkaXJlY3RfaGl0JywgJ292ZXJ0aW1lJywgJ3ZpY3RvcnknLCAnbm90aWZpY2F0aW9uJ107XHJcbiAgICAgICAgdGhpcy5zb3VuZHMgPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBpZCBvZiBpZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHNbaWRdID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NmeF8nICsgaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvdW5kcy5zaG90X3dlYWsudm9sdW1lID0gLjY1O1xyXG4gICAgICAgIHRoaXMuc291bmRzLmhpdC52b2x1bWUgPSAuMzU7XHJcbiAgICAgICAgdGhpcy5zb3VuZHMudmljdG9yeS52b2x1bWUgPSAuNTtcclxuICAgIH1cclxufVxyXG5Tb3VuZEJhbmsuaW5zdGFuY2UgPSBudWxsO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3VuZEJhbms7XHJcbiIsImNsYXNzIFNvdW5kUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFNvdW5kUGxheWVyLmluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmFjdGl2ZVNvdW5kcyA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5U291bmQoc291bmQpIHtcclxuICAgICAgICBzb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgc291bmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbFNvdW5kKHNvdW5kKSB7XHJcbiAgICAgICAgc291bmQucGF1c2UoKTtcclxuICAgICAgICBzb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICB9XHJcbn1cclxuU291bmRQbGF5ZXIuaW5zdGFuY2UgPSBudWxsO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3VuZFBsYXllcjsiLCJjb25zdCBFbnYgPSByZXF1aXJlKCcuL0Vudmlyb25tZW50Jyk7XHJcbmNvbnN0IENmZyA9IHJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbmNvbnN0IFJuZCA9IHJlcXVpcmUoJy4uL3V0aWwvUmFuZG9tJyk7XHJcblxyXG5jbGFzcyBXYWxsIHtcclxuICAgIGNvbnN0cnVjdG9yKHgseSwgd2lkdGgpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IENmZy5XQUxMX1dJRFRIO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjA7XHJcbiAgICAgICAgdGhpcy5yYW5kb21pemVIZWlnaHQoKTtcclxuICAgIH1cclxuXHJcbiAgICByYW5kb21pemVIZWlnaHQoKSB7XHJcbiAgICAgICAgLy8gUmVkdWNlIHRoZSB3YWxsIGhlaWdodCBpZiB0aGUgd2luZCBpcyB0b28gc3Ryb25nXHJcbiAgICAgICAgbGV0IGRhbXBlbmluZyA9IDA7XHJcbiAgICAgICAgaWYgKENmZy5XQUxMX1dJTkRfREFNUEVOSU5HW0Vudi53aW5kTGV2ZWxdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBkYW1wZW5pbmcgPSBDZmcuV0FMTF9XSU5EX0RBTVBFTklOR1tFbnYud2luZExldmVsXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdGhpcy5oZWlnaHQgPSA3MDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9ICgxMDAtZGFtcGVuaW5nKS8xMDAgKiAoUm5kLmludCgwLENmZy5XQUxMX0hFSUdIVF9NQVggLSBDZmcuV0FMTF9IRUlHSFRfTUlOKSArIENmZy5XQUxMX0hFSUdIVF9NSU4pO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGw7IiwiY29uc3QgRW52ID0gcmVxdWlyZSgnLi9FbnZpcm9ubWVudCcpO1xyXG5jb25zdCBDZmcgPSByZXF1aXJlKCcuL0NvbmZpZycpO1xyXG5cclxuLy8gVHVybiAtIGVhY2ggcGxheWVyIGhhcyBhIHR1cm4gKHNob3QpLCB3aGVuIGl0IGVuZHMsIHRoZSB0dXJuIGVuZHMgYW5kIHR1cm5FbmQgaXMgY2FsbGVkXHJcbi8vIFJvdW5kIC0gYWZ0ZXIgYWxsIHR1cm5zIGFyZSBmaW5pc2hlZCwgbmV3IHJvdW5kIGJlZ2luczsgMSByb3VuZCBjb250YWlucyAyIHR1cm5zXHJcbi8vIElmIHR1cm4gdGhhdCB0cmlnZ2VycyBhbiBlbmQgb2Ygcm91bmQgaXMgZmluaXNoZWQsIGZpcnN0IHRoZSByb3VuZEVuZCBpcyBjYWxsZWQsIGFuZCBhZnRlciB0aGF0IHR1cm5FbmQgaXMgY2FsbGVkXHJcbi8vIFRvIHN0b3AgdGhlIHR1cm5FbmQgYWZ0ZXIgcHJvY2Vzc2luZyByb3VuZEVuZCwgcmV0dXJuIHRydWUgaW4gdGhlIHJvdW5kRW5kXHJcblxyXG5jbGFzcyBHTV9NaXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xyXG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgdGhpcy5vdmVydGltZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHR1cm5FbmQoKSB7XHJcbiAgICAgICAgLy8gcGxheWVyIDIgZW5kZWQgaGlzIHR1cm5cclxuICAgICAgICBpZiAodGhpcy5nYW1lLmFjdGl2ZVBsYXllciA9PSB0aGlzLmdhbWUucGxheWVyMSkge1xyXG4gICAgICAgICAgICBFbnYucmFuZG9taXplKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHdhbGwgb2YgdGhpcy5nYW1lLm9iamVjdHMud2FsbHMpIHtcclxuICAgICAgICAgICAgICAgIHdhbGwucmFuZG9taXplSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwbGF5ZXIgMSBlbmRlZCBoaXMgdHVyblxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBFbnYuc3dhcFdpbmQoKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmdhbWUucGxheWVyMi5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWUucGxheWVyMS5ocCA+IENmZy5TSEVMTF9EQU1BR0VfRElSRUNUKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLndpbm5lcih0aGlzLmdhbWUucGxheWVyMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUub3ZlcnRpbWUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlyc3QgcGxheWVyICh3aG9zZSB0dXJuIGp1c3QgZW5kZWQpIGRpZCBub3Qga2lsbCBoaW1zZWxmXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLmdhbWUucGxheWVyMS5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS53aW5uZXIodGhpcy5nYW1lLnBsYXllcjIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvdW5kRW5kKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5nYW1lLnBsYXllcjEuaXNBbGl2ZSgpICYmICF0aGlzLmdhbWUucGxheWVyMi5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmdhbWUucGxheWVyMS5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLndpbm5lcih0aGlzLmdhbWUucGxheWVyMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdGhpcy5nYW1lLnBsYXllcjIuaXNBbGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aW5uZXIodGhpcy5nYW1lLnBsYXllcjEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR01fTWlycm9yOyIsImNvbnN0IEVudiA9IHJlcXVpcmUoJy4vRW52aXJvbm1lbnQnKTtcclxuY29uc3QgQ2ZnID0gcmVxdWlyZSgnLi9Db25maWcnKTtcclxuXHJcbi8vIFR1cm4gLSBlYWNoIHBsYXllciBoYXMgYSB0dXJuIChzaG90KSwgd2hlbiBpdCBlbmRzLCB0aGUgdHVybiBlbmRzIGFuZCB0dXJuRW5kIGlzIGNhbGxlZFxyXG4vLyBSb3VuZCAtIGFmdGVyIGFsbCB0dXJucyBhcmUgZmluaXNoZWQsIG5ldyByb3VuZCBiZWdpbnM7IDEgcm91bmQgY29udGFpbnMgMiB0dXJuc1xyXG4vLyBJZiB0dXJuIHRoYXQgdHJpZ2dlcnMgYW4gZW5kIG9mIHJvdW5kIGlzIGZpbmlzaGVkLCBmaXJzdCB0aGUgcm91bmRFbmQgaXMgY2FsbGVkLCBhbmQgYWZ0ZXIgdGhhdCB0dXJuRW5kIGlzIGNhbGxlZFxyXG4vLyBUbyBzdG9wIHRoZSB0dXJuRW5kIGFmdGVyIHByb2Nlc3Npbmcgcm91bmRFbmQsIHJldHVybiB0cnVlIGluIHRoZSByb3VuZEVuZFxyXG5cclxuY2xhc3MgR01fQ2xhc3NpYyB7XHJcbiAgICBjb25zdHJ1Y3RvcihnYW1lKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgICAgICB0aGlzLm92ZXJ0aW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdHVybkVuZCgpIHtcclxuICAgICAgICBFbnYucmFuZG9taXplKCk7XHJcbiAgICAgICAgZm9yIChsZXQgd2FsbCBvZiB0aGlzLmdhbWUub2JqZWN0cy53YWxscykge1xyXG4gICAgICAgICAgICB3YWxsLnJhbmRvbWl6ZUhlaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwbGF5ZXIgMiBlbmRlZCBoaXMgdHVyblxyXG4gICAgICAgIGlmICh0aGlzLmdhbWUuYWN0aXZlUGxheWVyID09IHRoaXMuZ2FtZS5wbGF5ZXIxKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcGxheWVyIDEgZW5kZWQgaGlzIHR1cm5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmdhbWUucGxheWVyMi5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWUucGxheWVyMS5ocCA+IENmZy5TSEVMTF9EQU1BR0VfRElSRUNUKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLndpbm5lcih0aGlzLmdhbWUucGxheWVyMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUub3ZlcnRpbWUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlyc3QgcGxheWVyICh3aG9zZSB0dXJuIGp1c3QgZW5kZWQpIGRpZCBub3Qga2lsbCBoaW1zZWxmXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLmdhbWUucGxheWVyMS5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS53aW5uZXIodGhpcy5nYW1lLnBsYXllcjIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvdW5kRW5kKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5nYW1lLnBsYXllcjEuaXNBbGl2ZSgpICYmICF0aGlzLmdhbWUucGxheWVyMi5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmRyYXcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmdhbWUucGxheWVyMS5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLndpbm5lcih0aGlzLmdhbWUucGxheWVyMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdGhpcy5nYW1lLnBsYXllcjIuaXNBbGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aW5uZXIodGhpcy5nYW1lLnBsYXllcjEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR01fQ2xhc3NpYzsiLCJjb25zdCBSbmQgPSByZXF1aXJlKCcuLi91dGlsL1JhbmRvbScpO1xyXG5jb25zdCBGWF9GaXJlUGFydGljbGUgPSByZXF1aXJlKCcuL0ZYX0ZpcmVQYXJ0aWNsZScpO1xyXG5cclxuY2xhc3MgRlhfRmlyZUVtaXR0ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCx5LCBnYW1lKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICAgICAgdGhpcy5nYW1lLm9iamVjdHMuZngucHVzaCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbWlzc2lvbkRlbGF5ID0gNTtcclxuICAgICAgICB0aGlzLnRpbWVUb0VtaXQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy50aW1lVG9FbWl0ID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lVG9FbWl0ID0gdGhpcy5lbWlzc2lvbkRlbGF5O1xyXG4gICAgICAgICAgICBsZXQgeCA9IFJuZC5pbnQoLTYsNik7XHJcbiAgICAgICAgICAgIG5ldyBGWF9GaXJlUGFydGljbGUoeCArIHRoaXMueCwgUm5kLmludCgtMiwyKSArIHRoaXMueSwxLjUgLSB4LzYsIHRoaXMuZ2FtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC0tdGhpcy50aW1lVG9FbWl0XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgpIHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRlhfRmlyZUVtaXR0ZXI7IiwiY29uc3QgR2FtZVJlbmRlcmVyID0gcmVxdWlyZSgnLi9HYW1lUmVuZGVyZXInKTtcclxuY29uc3QgUm5kID0gcmVxdWlyZSgnLi4vdXRpbC9SYW5kb20nKTtcclxuXHJcbmNsYXNzIEZYX0ZpcmVQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LHksIHR0bCwgZ2FtZSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnNpemUgPSA4O1xyXG4gICAgICAgIHRoaXMuYXkgPSBSbmQuZmxvYXQoMC41LC43KTtcclxuICAgICAgICB0aGlzLmF4ID0gUm5kLmZsb2F0KC0uMDMsLjAzKTtcclxuICAgICAgICB0aGlzLm9wYWNpdHlEZWdyYWRhdGlvbiA9IDAuMDE7XHJcbiAgICAgICAgdGhpcy5zaXplSW5jcmVtZW50ID0gLTAuMTY7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gMC45O1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUub2JqZWN0cy5meC5wdXNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLm9wYWNpdHkgLT0gdGhpcy5vcGFjaXR5RGVncmFkYXRpb247XHJcbiAgICAgICAgdGhpcy5zaXplICs9IHRoaXMuc2l6ZUluY3JlbWVudDtcclxuICAgICAgICBpZiAodGhpcy5vcGFjaXR5IDwgMCB8fCB0aGlzLnkgPCAwIHx8IHRoaXMuc2l6ZSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLm9iamVjdHMuZnguc3BsaWNlKHRoaXMuZ2FtZS5vYmplY3RzLmZ4LmluZGV4T2YodGhpcyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnggKz10aGlzLmF4O1xyXG4gICAgICAgIHRoaXMueSArPXRoaXMuYXk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgpIHtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh0aGlzLngsIEdhbWVSZW5kZXJlci5kZU5vcm1hbGl6ZVkodGhpcy55KSwgdGhpcy5zaXplLCAwLCBNYXRoLlBJKjIpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgxNzAsODAsMjAsJyArIHRoaXMub3BhY2l0eSArICcpJztcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgeD0gJyNhYWFhYWEnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGWF9GaXJlUGFydGljbGU7IiwiY29uc3QgQ2ZnID0gcmVxdWlyZSgnLi9Db25maWcuanMnKTtcclxuXHJcbi8vIFRoaXMgbW9kdWxlIHJlbmRlcnMgdGhlIGludGVyYWN0aXZlIGZpZWxkcyB0aGF0IGFsbG93IGNoYW5naW5nIHRoZSBnYW1lIGNvbmZpZ3VyYXRpb24gb24gdGhlIGZseVxyXG4vLyBUaGUgb25seSB3YXkgdG8gcmVzZXQgaXQgaXMgZWl0aGVyIG1hbnVhbGx5IG9yIGJ5IHJlbG9hZGluZyB0aGUgcGFnZVxyXG5cclxuZnVuY3Rpb24gbWFrZUlucHV0KGF0dHIpIHtcclxuICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBpbnB1dC50eXBlID0gJ251bWJlcic7XHJcbiAgICBpbnB1dC52YWx1ZSA9IENmZ1thdHRyXTtcclxuICAgIC8vIEZpeCBzdGVwXHJcbiAgICBpZiAoaW5wdXQudmFsdWUgLSBNYXRoLmZsb29yKGlucHV0LnZhbHVlKSAhPT0gMCkgaW5wdXQuc3RlcCA9IDAuMTtcclxuICAgIC8vIEFkZCBldmVudCB0byBpbnB1dFxyXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xyXG4gICAgICAgIENmZ1thdHRyXSA9IE51bWJlci5wYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIH0pO1xyXG4gICAgLy8gV3JhcCByZXN1bHQgaW4gdGRcclxuICAgIGxldCB0ZElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgIHRkSW5wdXQuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG5cclxuICAgIHJldHVybiB0ZElucHV0O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyB0aGUgSFRNTCBmb3IgdGhlIHRoZSBkZWJ1ZyB3aWRnZXRcclxuICAgICAqIEByZXR1cm5zIHtIVE1MRGl2RWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgZ2V0RGVidWdOb2RlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICB0YWJsZS5pbm5lckhUTUwgPSBcIjx0cj48dGg+UHJvcGVydHk8L3RoPjx0aD5WYWx1ZTwvdGg+PC90cj5cIjtcclxuXHJcbiAgICAgICAgbGV0IHRib2R5ID0gdGFibGUucXVlcnlTZWxlY3RvcigndGJvZHknKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgYXR0ciBpbiBDZmcpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBUZXh0XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICAgICAgdGV4dC5pbm5lclRleHQgPSBhdHRyO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5wdXRcclxuICAgICAgICAgICAgbGV0IHRkSW5wdXQgPSBtYWtlSW5wdXQoYXR0cik7XHJcbiAgICAgICAgICAgIC8vIEFwcGVuZCBpbnB1dFxyXG4gICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQodGV4dCk7XHJcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZCh0ZElucHV0KTtcclxuICAgICAgICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdwcm9wZXJ0aWVzJztcclxuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRhYmxlKTtcclxuICAgICAgICByZXR1cm4gd3JhcHBlcjtcclxuICAgIH1cclxufTsiLCJjb25zdCBHYW1lID0gcmVxdWlyZSgnLi4vZ2FtZS9HYW1lLmpzJyk7XHJcblxyXG4vKipcclxuICogU2luY2Ugc2hvd2luZyBhbmQgaGlkaW5nIHRoZSBnYW1lIGlzIGEgYml0IG1vcmUgY29tcGxpY2F0ZWQgdGhpcyBjbGFzcyBleGlzdHNcclxuICogVGhlcmUgYXJlIDIgdmlld3MgZm9yIHRoZSBzaXRlLCBvbmUgd2l0aCBoZWFkZXIgYW5kIGZvb3RlciBhbmQgc3R1ZmZcclxuICogYW5kIHRoZSBzZWNvbmQgb25lIHRoYXQgaXMgZnVsbCBzY3JlZW4gY2FudmFzXHJcbiAqIFRoaXMgY2xhc3MgaGFuZGxlcyB0aGVtIHRyYW5zaXRpb25zIGJldHdlZW4gdGhlIHR3byB2aWV3c1xyXG4gKi9cclxuY2xhc3MgR2FtZVN0YXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucm91dGVyID0gbnVsbDtcclxuICAgICAgICBHYW1lU3RhdGUuaW5zdGFuY2UgPSB0aGlzO1xyXG5cclxuICAgICAgICB3aW5kb3cuZ2FtZSA9IHRoaXMuZ2FtZTsgLy8gdG9kbzogZGVsZXRlIG1lXHJcblxyXG4gICAgICAgIC8vIFByZXBhcHJlIGEgYm91bmQgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGZvciBhZGRpbmcgYW5kIHJlbW92aW5nIGZvciBsaXN0ZW5pbmdcclxuICAgICAgICB0aGlzLl9yZXNpemUgPSB0aGlzLmdhbWUucmVuZGVyZXIub25SZXNpemUuYmluZCh0aGlzLmdhbWUucmVuZGVyZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGVudGVyKCkge1xyXG4gICAgICAgIC8vIEEgbGl0dGxlIGhhcmRjb2RlIGhlcmUsIGJ1dCB3L2U7IDA9cGxheWluZywgMT1wYXVzZWQsIDI9bmVlZHMgc2V0dXAgZmlyc3RcclxuICAgICAgICAvLyBUaGVyZSBpcyBwcml2YXRlICdlbnVtJyBpbnNpZGUgR2FtZS5qcywgYnV0IEkgd2FzIHRvbyBsYXp5IHRvIGV4cG9ydCB0aGVtXHJcbiAgICAgICAgdGhpcy5leGl0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5zdGF0dXMgPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93U2V0dXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5zdGF0dXMgPT09IDEgfHwgdGhpcy5nYW1lLnN0YXR1cyA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93UmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4aXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5zdGF0dXMgPT09IDAgfHwgdGhpcy5nYW1lLnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUucGF1c2UoKTtcclxuICAgICAgICAgICAgJCgnI25vcm1hbC12aWV3Jykuc2hvdygpO1xyXG4gICAgICAgICAgICAkKCcjZ2FtZS12aWV3JykuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI3NldHVwLWJhY2stc2VjdGlvblwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9yZXNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5nYW1lLnN0YXR1cyA9PT0gMikge1xyXG4gICAgICAgICAgICAkKFwiYXJ0aWNsZVtkYXRhLXJvdXRlPScjcl9nYW1lJ11cIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI3NldHVwLWZvcm0tc2VjdGlvblwiKS5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9zaG93R2FtZSgpIHtcclxuICAgICAgICAkKCcjbm9ybWFsLXZpZXcnKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnI2dhbWUtdmlldycpLnNob3coKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplKTtcclxuICAgICAgICB0aGlzLmdhbWUucmVuZGVyZXIub25SZXNpemUoKTtcclxuICAgIH1cclxuICAgIF9zaG93U2V0dXAoKSB7XHJcbiAgICAgICAgJChcIiNnYW1lLXNldHVwXCIpLnNob3coKTtcclxuICAgICAgICAkKFwiI3NldHVwLWZvcm0tc2VjdGlvblwiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNzZXR1cC1iYWNrLXNlY3Rpb25cIikuaGlkZSgpO1xyXG4gICAgfVxyXG4gICAgX3Nob3dSZXN1bWUoKSB7XHJcbiAgICAgICAgJChcIiNnYW1lLXNldHVwXCIpLnNob3coKTtcclxuICAgICAgICAkKFwiI3NldHVwLWZvcm0tc2VjdGlvblwiKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNzZXR1cC1iYWNrLXNlY3Rpb25cIikuc2hvdygpO1xyXG4gICAgfVxyXG4gICAgX2hpZGVHYW1lKCkge1xyXG4gICAgICAgICQoJyNub3JtYWwtdmlldycpLnNob3coKTtcclxuICAgICAgICAkKCcjZ2FtZS12aWV3JykuaGlkZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZSk9PntcclxuICAgIGxldCBqRm9ybVdyYXBwZXIgPSAkKFwiI3NldHVwLWZvcm0tc2VjdGlvblwiKTtcclxuICAgICQoakZvcm1XcmFwcGVyKS5vbignc3VibWl0JywnZm9ybScsKGUpPT57XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIEdhbWVTdGF0ZS5pbnN0YW5jZS5nYW1lLmNyZWF0ZU5ldygpO1xyXG4gICAgICAgIEdhbWVTdGF0ZS5pbnN0YW5jZS5fc2hvd0dhbWUoKTtcclxuICAgICAgICAvLyBIaWRlIHRoZSBhcnRpY2xlIGl0c2VsZiArIHRoZSBzZXR1cCBmb3JtIHNlY3Rpb24sIG5lZWQgdG8gYmUgZG9uZSB0byBlbnN1cmUgc21vb3RoIHRyYW5zaXRpb25zIG9uIHRoZSBmdXR1cmVcclxuICAgICAgICBqRm9ybVdyYXBwZXIuaGlkZSgpO1xyXG4gICAgICAgICQoXCJhcnRpY2xlW2RhdGEtcm91dGU9JyNyX2dhbWUnXVwiKS5oaWRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgalJlcyA9ICQoXCIjc2V0dXAtYmFjay1zZWN0aW9uXCIpO1xyXG4gICAgbGV0IGJ1dHRvbnMgPSAkKFwiI3NldHVwLWJhY2stc2VjdGlvbiBidXR0b25cIik7XHJcbiAgICAkKGJ1dHRvbnNbMF0pLm9uKCdjbGljaycsIChlKT0+e1xyXG4gICAgICAgIGpSZXMuaGlkZSgpO1xyXG4gICAgICAgIGpGb3JtV3JhcHBlci5oaWRlKCk7XHJcbiAgICAgICAgR2FtZVN0YXRlLmluc3RhbmNlLmdhbWUuc3RhcnQoKTtcclxuICAgICAgICBHYW1lU3RhdGUuaW5zdGFuY2UuX3Nob3dHYW1lKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGJ1dHRvbnNbMV0pLm9uKCdjbGljaycsIChlKT0+e1xyXG4gICAgICAgIGpSZXMuaGlkZSgpO1xyXG4gICAgICAgIGpGb3JtV3JhcHBlci5oaWRlKCk7XHJcbiAgICAgICAgR2FtZVN0YXRlLmluc3RhbmNlLmdhbWUuc3RhdHVzID0gMjtcclxuICAgICAgICBHYW1lU3RhdGUuaW5zdGFuY2Uucm91dGVyLnJvdXRlKCcjcl9nYW1lJyk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTdGF0ZTsiLCJjb25zdCBWaWRlb0NvbnRyb2xzID0ge1xyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBsZXQgdmlkZW9zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnZpZGVvLWhvbGRlcicpO1xyXG4gICAgICAgIGZvciAobGV0IHYgb2YgdmlkZW9zKSB7XHJcbiAgICAgICAgICAgIGxldCB2aWRlbyA9IHYucXVlcnlTZWxlY3RvcigndmlkZW8nKTtcclxuICAgICAgICAgICAgbGV0IHBsYXkgPSB2LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5Jyk7XHJcbiAgICAgICAgICAgIGxldCBzZWVrID0gdi5xdWVyeVNlbGVjdG9yKCcuc2VlayBpbnB1dCcpO1xyXG4gICAgICAgICAgICBsZXQgdm9sdW1lID0gdi5xdWVyeVNlbGVjdG9yKCcudm9sdW1lJyk7XHJcbiAgICAgICAgICAgIGxldCB2b2x1bWVSYW5nZSA9IHYucXVlcnlTZWxlY3RvcignLnZvbHVtZS1yYW5nZSBpbnB1dCcpO1xyXG4gICAgICAgICAgICBsZXQgZnVsbHNjcmVlbiA9IHYucXVlcnlTZWxlY3RvcignLmZ1bGxzY3JlZW4nKTtcclxuXHJcbiAgICAgICAgICAgIHZvbHVtZVJhbmdlLnZhbHVlID0gdmlkZW8udm9sdW1lO1xyXG4gICAgICAgICAgICBzZWVrLnZhbHVlID0gdmlkZW8uY3VycmVudFRpbWUgLyB2aWRlby5kdXJhdGlvbjtcclxuXHJcbiAgICAgICAgICAgICQodmlkZW8pLmNsaWNrKChlKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZGVvLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocGxheSkuYXR0cignZGF0YS1wbGF5aW5nJywgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBsYXkpLmF0dHIoJ2RhdGEtcGxheWluZycsICdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKHBsYXkpLmNsaWNrKChlKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZGVvLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQocGxheSkuYXR0cignZGF0YS1wbGF5aW5nJywgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHBsYXkpLmF0dHIoJ2RhdGEtcGxheWluZycsICdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJChzZWVrKS5vbignaW5wdXQnLCAoZSk9PntcclxuICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnRUaW1lID0gdmlkZW8uZHVyYXRpb24gKiBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKHZvbHVtZSkub24oJ2NsaWNrJywgKGUpPT57XHJcbiAgICAgICAgICAgICAgICB2aWRlby5tdXRlZCA9ICF2aWRlby5tdXRlZDtcclxuICAgICAgICAgICAgICAgIGlmICh2aWRlby5tdXRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodm9sdW1lKS5hdHRyKCdkYXRhLW11dGVkJywndHJ1ZScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHZvbHVtZSkuYXR0cignZGF0YS1tdXRlZCcsJ2ZhbHNlJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKHZvbHVtZVJhbmdlKS5vbignaW5wdXQnLCAoZSk9PntcclxuICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC52YWx1ZSA9PT0gXCIwXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHZvbHVtZSkuYXR0cignZGF0YS1tdXRlZCcsJ3RydWUnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh2b2x1bWUpLmF0dHIoJ2RhdGEtbXV0ZWQnLCAnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmlkZW8udm9sdW1lID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJChmdWxsc2NyZWVuKS5vbignY2xpY2snLCAoZSk9PntcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IGZ1bGxzY3JlZW4nKTtcclxuICAgICAgICAgICAgICAgIGlmICh2aWRlby5yZXF1ZXN0RnVsbHNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnJlcXVlc3RGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZGVvLm1velJlcXVlc3RGdWxsU2NyZWVuKSB7IC8qIEZpcmVmb3ggKi9cclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2aWRlby53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbikgeyAvKiBDaHJvbWUsIFNhZmFyaSBhbmQgT3BlcmEgKi9cclxuICAgICAgICAgICAgICAgICAgICB2aWRlby53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2aWRlby5tc1JlcXVlc3RGdWxsc2NyZWVuKSB7IC8qIElFL0VkZ2UgKi9cclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5tc1JlcXVlc3RGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTm8gbmVlZCBmb3IgdGhlIGNhbGxiYWNrIGJlbG93IHNpbmNlIHdlIGFyZSBob29rZWQgdG8gYWxsIHdheXMgb2YgY2hhbmdpbmcgdGhlIHZvbHVtZSAoYnkgVUkpLCBoZW5jZSBpdCBpcyBjb21tZW50ZWQgb3V0XHJcbiAgICAgICAgICAgIC8vICQodmlkZW8pLm9uKCd2b2x1bWVjaGFuZ2UnLCAoZSk9PntcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgICAgICAkKHZpZGVvKS5vbigndGltZXVwZGF0ZScsIChlKT0+e1xyXG4gICAgICAgICAgICAgICAgc2Vlay52YWx1ZSA9IHZpZGVvLmN1cnJlbnRUaW1lIC8gdmlkZW8uZHVyYXRpb247XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCh2aWRlbykub24oJ2VuZGVkJywgKGUpPT57XHJcbiAgICAgICAgICAgICAgICAvLyBEbyB3ZSB3YW50IHRvIGRvIGFueXRoaW5nLCBhY3R1YWxseT9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWRlb0NvbnRyb2xzOyIsImNvbnN0IE5vdGlmaWNhdG9yID0gcmVxdWlyZShcIi4vTm90aWZpY2F0b3JcIik7XHJcblxyXG5jb25zdCBPbmxpbmVUcmFja2VyID0ge1xyXG4gICAgZWxlbTogbnVsbCxcclxuXHJcbiAgICB1cGRhdGUobm90aWZ5KSB7XHJcbiAgICAgICAgaWYgKG5hdmlnYXRvci5vbkxpbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1vbmxpbmUnLCB0cnVlKTtcclxuICAgICAgICAgICAgaWYgKG5vdGlmeSkge1xyXG4gICAgICAgICAgICAgICAgTm90aWZpY2F0b3Iubm90aWZ5KCdDb25uZWN0aW9uIHJlc3RvcmVkIScsIHtib2R5OiAnU3RhdHMgd291bGQgYmUgc3luY2hyb25pemVkIHRvIHRoZSBjbG91ZCBpZiBiYWNrZW5kIHdhcyBpbXBsZW1lbnRlZCEnfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb25saW5lJywgZmFsc2UpO1xyXG4gICAgICAgICAgICBpZiAobm90aWZ5KSB7XHJcbiAgICAgICAgICAgICAgICBOb3RpZmljYXRvci5ub3RpZnkoJ0Nvbm5lY3Rpb24gbG9zdCEnLCB7Ym9keTogJ1N0YXRzIHdpbGwgc3RpbGwgYmUgc3RvcmVkIGxvY2FsbHkuIE9uY2UgeW91IGFyZSBvbmxpbmUgYWdhaW4sIHRoZXkgd2lsbCBiZSBzeW5jaHJvbml6ZWQgdG8gY2xvdWQgYWdhaW4uIEpLLCBiYWNrZW5kIGlzIG5vdCBpbXBsZW1lbnRlZCEnfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpPT57XHJcbiAgICBPbmxpbmVUcmFja2VyLmVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb25saW5lJyk7XHJcbiAgICBPbmxpbmVUcmFja2VyLnVwZGF0ZShmYWxzZSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsICgpPT57T25saW5lVHJhY2tlci51cGRhdGUodHJ1ZSl9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvZmZsaW5lJywgKCk9PntPbmxpbmVUcmFja2VyLnVwZGF0ZSh0cnVlKX0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT25saW5lVHJhY2tlcjsiLCJjb25zdCBTb3VuZFBsYXllciA9IHJlcXVpcmUoJy4vZ2FtZS9Tb3VuZFBsYXllcicpO1xyXG5jb25zdCBTb3VuZEJhbmsgPSByZXF1aXJlKCcuL2dhbWUvU291bmRCYW5rJyk7XHJcblxyXG5jb25zdCBOb3RpZmljYXRvciA9IHtcclxuICAgIG5vdGlmeSh0aXRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2dyYW50ZWQnKSB7XHJcbiAgICAgICAgICAgIG5ldyBOb3RpZmljYXRpb24odGl0bGUsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBTb3VuZFBsYXllci5pbnN0YW5jZS5wbGF5U291bmQoU291bmRCYW5rLmluc3RhbmNlLnNvdW5kcy5ub3RpZmljYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIHJlcXVlc3RQZXJtaXNzaW9uKCkge1xyXG4gICAgLy8gcmVxdWVzdCBvbmx5IGlmIHdlIGhhZCBub3QgYXNrZWQgYmVmb3JlIChkb24ndCBib3RoZXIgc29tZW9uZSB3aG8gaGFzIGRlbmllZCBpdCBiZWZvcmUpXHJcbiAgICBpZiAoTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT09ICdkZWZhdWx0Jykge1xyXG4gICAgICAgIE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzID09PSAnZ3JhbnRlZCcpIHtcclxuICAgICAgICAgICAgICAgIE5vdGlmaWNhdG9yLm5vdGlmeSgnTm90aWZpY2F0aW9ucyBhbGxvd2VkIScsIHtib2R5OiAnWW91IGNhbiBleHBlY3QgZnVydGhlciBub3RpZmljYXRpb25zIHdoZW4geW91IG9ubGluZSBvciBvZmZsaW5lLid9KVxyXG4gICAgICAgICAgICAgICAgJCgnI25vdGlmaWNhdGlvbi1zdGF0dXMnKS5odG1sKCdBbGxvd2VkJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcjYWxsb3ctbm90aWZpY2F0aW9ucycpLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzID09PSAnZGVmYXVsdCcpIHtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlcyA9PT0gJ2RlbmllZCcpIHtcclxuICAgICAgICAgICAgICAgICQoJyNub3RpZmljYXRpb24tc3RhdHVzJykuaHRtbCgnRGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpPT57XHJcbiAgICByZXF1ZXN0UGVybWlzc2lvbigpO1xyXG5cclxuICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgJCgnI25vdGlmaWNhdGlvbi1zdGF0dXMnKS5odG1sKCdBd2FpdGluZyBjb25maXJtYXRpb24nKTtcclxuICAgIH1cclxuICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2RlbmllZCcpIHtcclxuICAgICAgICAkKCcjbm90aWZpY2F0aW9uLXN0YXR1cycpLmh0bWwoJ0Rpc2FibGVkJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT09ICdncmFudGVkJykge1xyXG4gICAgICAgICQoJyNub3RpZmljYXRpb24tc3RhdHVzJykuaHRtbCgnQWxsb3dlZCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0b3I7IiwiY29uc3QgU3RhdHMgPSByZXF1aXJlKCcuL1N0YXRzJyk7XHJcblxyXG5jbGFzcyBSb3V0ZXIge1xyXG4gICAgY29uc3RydWN0b3IoZ2FtZVN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy5ub3JtYWxWaWV3ID0gJChcIiNub3JtYWwtdmlld1wiKS5nZXQoMCk7XHJcbiAgICAgICAgdGhpcy5nYW1lVmlldyA9ICQoXCIjZ2FtZS12aWV3XCIpLmdldCgwKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIYXNoID0gbnVsbDtcclxuICAgICAgICB0aGlzLmhhc2hlcyA9IFsnI3Jfc3RhdHMnLCAnI3JfaGVscCcsICcjcl9ob21lJywgJyNyX2dhbWUnLCAnI3Jfc2tpbnMnXTtcclxuICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IGdhbWVTdGF0ZTtcclxuICAgICAgICB0aGlzLmdhbWVTdGF0ZS5yb3V0ZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yb3V0ZShkb2N1bWVudC5sb2NhdGlvbi5oYXNoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3V0ZShkb2N1bWVudC5sb2NhdGlvbi5oYXNoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgcm91dGUgbWV0aG9kIGlzIGEgYml0IG9mIGEgbWVzcywgYnV0IGl0IG1ha2VzIHNlbnNlLCB0aGUgaWZzIGNvdWxkIGJlIGEgYml0IHJlZmluZWQsIGJ1dCB3L2VcclxuICAgIHJvdXRlKG5ld0hhc2gpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50SGFzaCA9PT0gbmV3SGFzaCAmJiB0aGlzLmN1cnJlbnRIYXNoICE9PSAnI3JfZ2FtZScpIHJldHVybjsgLy8gRE8gbm90aGluZyBpZiB0aGUgc2FtZSBoYXNoIEVYQ0VQVCByX2dhbWUsIHdoaWNoIGhhcyBsb2dpYyBib3VuZCB0byBpdCBiZWluZyByZWZyZXNoZWRcclxuXHJcbiAgICAgICAgLy8gU3BlY2lhbCBsb2dpYyBmb3IgI3JfZ2FtZVxyXG4gICAgICAgIGlmIChuZXdIYXNoID09PSAnI3JfZ2FtZScpIHtcclxuICAgICAgICAgICAgLy8gbG9naWMgZm9yIHNob3dpbmcgZ2FtZSBpcyBhIGJpdCBtb3JlIGNvbXBsaWNhdGVkIGFuZCBpcyBkZWxlZ2F0ZWQgdG8gaXRzIG93biBjbGFzc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SGFzaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgJChgW2RhdGEtcm91dGU9JyR7dGhpcy5jdXJyZW50SGFzaH0nXWApLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIYXNoID0gbmV3SGFzaDtcclxuICAgICAgICAgICAgdGhpcy5nYW1lU3RhdGUuZW50ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChuZXdIYXNoID09PSAnI3Jfc3RhdHMnKXtcclxuICAgICAgICAgICAgICAgIFN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc2hlcy5pbmRleE9mKG5ld0hhc2gpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEhhc2ggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRIYXNoICE9PSAnI3JfZ2FtZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChgW2RhdGEtcm91dGU9JyR7dGhpcy5jdXJyZW50SGFzaH0nXWApLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ2ljIGZvciBoaWRpbmcgZ2FtZSBpcyBhIGJpdCBtb3JlIGNvbXBsaWNhdGVkIGFuZCBpcyBkZWxlZ2F0ZWQgdG8gaXRzIG93biBjbGFzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZS5leGl0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGFzaCA9IG5ld0hhc2g7XHJcbiAgICAgICAgICAgICAgICAkKGBbZGF0YS1yb3V0ZT0nJHt0aGlzLmN1cnJlbnRIYXNofSddYCkuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJjb25zdCBTb3VuZEJhbmsgPSByZXF1aXJlKCcuL2dhbWUvU291bmRCYW5rJyk7XHJcblxyXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICBsZXQgaGVyZSA9ICQoJyNkcm9wLWhlcmUnKTtcclxuICAgIGxldCBoZXJlRHVtbXkgPSAkKCcjZHJvcC1oZXJlLWR1bW15Jyk7XHJcbiAgICBsZXQgcmVzZXQgPSAkKCcjZHJvcC1yZXNldCBidXR0b24nKTtcclxuICAgIGxldCBpbmZvID0gJCgnI2Ryb3AtaW5mbyBkaXYnKTtcclxuXHJcblxyXG4gICAgLy8gU3R1ZmYgZG9lcyBub3Qgd29yayB3aXRob3V0IHRoaXNcclxuICAgIGhlcmVbMF0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBjb3VudGVyID0gMDsgLy8gUmVxdWlyZWQgdG8gcHJvcGVybHkgYWRkIGFuZCByZW1vdmUgQ1NTIGNsYXNzIGFzIHRoZSBldmVudCBpcyBmaXJlZCBmb3IgYm90aCB0aGUgd3JhcHBlciBhbmQgdGhlIGluc2lkZSBkaXYgdGhhdCBoYXMgdHJhbnNmb3JtcyBvbiBpdFxyXG4gICAgaGVyZVswXS5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvdW50ZXIrKztcclxuICAgICAgICBoZXJlRHVtbXkuYWRkQ2xhc3MoJ3B1bHNlJyk7XHJcbiAgICB9LCB0cnVlKTtcclxuXHJcbiAgICBoZXJlWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvdW50ZXItLTtcclxuICAgICAgICBpZiAoY291bnRlciA9PT0gMCkge1xyXG4gICAgICAgICAgICBoZXJlRHVtbXkucmVtb3ZlQ2xhc3MoJ3B1bHNlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gZm9yIHdoYXRldmVyIHJlYXNvbiBqUXVlcnJ5Lm9uKCkgd2FzIGNhdXNpbmcgc29tZSBpc3N1ZXNcclxuICAgIGhlcmVbMF0uYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIGhlcmVEdW1teS5yZW1vdmVDbGFzcygncHVsc2UnKTtcclxuICAgICAgICBjb3VudGVyID0gMDtcclxuICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoID4gMCkgLy8gSXMgaXQgZXZlbiBwb3NzaWJsZSBmb3IgdGhpcyBpZiBldmVyIHRvIGJlIGZhbHNlP1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gV2UgY2FyZSBvbmx5IGFib3V0IHRoZSBmaXJzdCBmaWxlIGluIGNhc2Ugc29tZSBkb29mdXMgdXBsb2FkZWQgbW9yZSB0aGFuIG9uZVxyXG4gICAgICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF0udHlwZS5pbmRleE9mKCdhdWRpbycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIG11Y2ggYmV0dGVyIHdheTpcclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF07XHJcbiAgICAgICAgICAgICAgICBpbmZvLmh0bWwoYEZpbGVuYW1lOiAke2ZpbGUubmFtZX08YnIvPjxhdWRpbyBzcmM9JyR7dXJsfScgY29udHJvbHM9XCJjb250cm9sc1wiPmApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmaWxlIHJlYWRlciB3YXkgZm9yIHRoZSB0aGlyZCBBUElcclxuICAgICAgICAgICAgICAgIGxldCBmciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBmci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mby5odG1sKGBGaWxlbmFtZTogJHtmaWxlLm5hbWV9PGJyLz48YXVkaW8gc3JjPScke2V2LnRhcmdldC5yZXN1bHR9JyBjb250cm9scz1cImNvbnRyb2xzXCI+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgU291bmRCYW5rLmluc3RhbmNlLnNvdW5kcy5zaG90LnNyYyA9IGV2LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyLnJlYWRBc0RhdGFVUkwoZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgU291bmRCYW5rLmluc3RhbmNlLnNvdW5kcy5zaG90LnNyYyA9ICdzZngvc2hvdC53YXYnO1xyXG4gICAgICAgICAgICAgICAgaW5mby5odG1sKCdGaWxlIHdhcyBub3QgcmVjb2duaXplZCBhcyBhbiBhdWRpbyBmaWxlISBUaGUgZGVmYXVsdCBzb3VuZCB3aWxsIGJlIHVzZWQgaW5zdGVhZC4nKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGUgZmlsZSB3YXMgbm90IHJlY29nbml6ZWQgYXMgYW4gYXVkaW8gZmlsZSEgVHJ5IGFnYWluLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmVzZXQuY2xpY2soKGUpPT57XHJcbiAgICAgICAgU291bmRCYW5rLmluc3RhbmNlLnNvdW5kcy5zaG90LnNyYyA9ICdzZngvc2hvdC53YXYnO1xyXG4gICAgICAgIGluZm8uaHRtbCgnJyk7XHJcbiAgICB9KTtcclxufSk7Il0sInNvdXJjZVJvb3QiOiIifQ==