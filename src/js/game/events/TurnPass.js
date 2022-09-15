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