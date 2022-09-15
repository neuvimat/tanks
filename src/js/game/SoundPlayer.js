class SoundPlayer {
    constructor() {
        SoundPlayer.instance = this;
        this.activeSounds = new Map();
    }

    playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    cancelSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}
SoundPlayer.instance = null;

module.exports = SoundPlayer;