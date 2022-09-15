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