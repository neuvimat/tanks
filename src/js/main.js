const Game = require('./game/Game.js');
const Cfg = require('./game/Config.js');
const CfgWgt = require('./game/ConfigWidget.js');
const GameState = require('./states/GameState.js');
const VideoControls = require("./VideoControls");
const Stats = require("./Stats");
const OnlineTracker = require("./OnlineTracker");
const Notificator = require("./Notificator");
const Router = require('./Router.js');
const Customization = require('./Customization.js');

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