const Stats = require('./Stats');

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