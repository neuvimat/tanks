const SoundPlayer = require('./game/SoundPlayer');
const SoundBank = require('./game/SoundBank');

const Notificator = {
    notify(title, options) {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
            SoundPlayer.instance.playSound(SoundBank.instance.sounds.notification);
        }
    }
};

function requestPermission() {
    // request only if we had not asked before (don't bother someone who has denied it before)
    if (Notification.permission === 'default') {
        Notification.requestPermission().then((res) => {
            if (res === 'granted') {
                Notificator.notify('Notifications allowed!', {body: 'You can expect further notifications when you online or offline.'})
                $('#notification-status').html('Allowed');
                $('#allow-notifications').hide();
            }
            if (res === 'default') {

            }
            if (res === 'denied') {
                $('#notification-status').html('Disabled');
            }
        });
    }
}

window.addEventListener('load', ()=>{
    requestPermission();

    if (Notification.permission === 'default') {
        $('#notification-status').html('Awaiting confirmation');
    }
    if (Notification.permission === 'denied') {
        $('#notification-status').html('Disabled');
    }
    if (Notification.permission === 'granted') {
        $('#notification-status').html('Allowed');
    }
});

module.exports = Notificator;