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