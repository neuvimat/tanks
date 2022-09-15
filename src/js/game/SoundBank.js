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
