const Game = require('../game/Game.js');

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