/** SINGLETON **/

const GameRenderer = require('./GameRenderer.js');
const GameShootingManager = require('./GameShootingManager.js');
const EventSystem = require('./EventSystem.js');
const WindChange = require('./events/WindChange.js');
const Tank = require('./Tank.js');
const Cfg = require('./Config');
const Mouse = require('../Mouse');
const SoundBank = require('./SoundBank');
const SoundPlayer = require('./SoundPlayer');
const Wall = require('./Wall');
const Env = require('./Environment');
const GM_Mirror = require('./GM_Mirror');
const GM_Classic = require('./GM_Classic');
const Stats = require('../Stats');
const FX_FireEmitter = require('./FX_FireEmitter');
const FX_Explosion = require('./FX_Explosion');
const Rnd = require('../util/Random');

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