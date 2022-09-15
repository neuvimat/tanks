const Env = require('./Environment');
const Cfg = require('./Config');

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