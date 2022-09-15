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