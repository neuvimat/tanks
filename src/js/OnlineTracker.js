const Notificator = require("./Notificator");

const OnlineTracker = {
    elem: null,

    update(notify) {
        if (navigator.onLine) {
            this.elem.setAttribute('data-online', true);
            if (notify) {
                Notificator.notify('Connection restored!', {body: 'Stats would be synchronized to the cloud if backend was implemented!'});
            }
        }
        else {
            this.elem.setAttribute('data-online', false);
            if (notify) {
                Notificator.notify('Connection lost!', {body: 'Stats will still be stored locally. Once you are online again, they will be synchronized to cloud again. JK, backend is not implemented!'});
            }
        }
    }
};

window.addEventListener('load', ()=>{
    OnlineTracker.elem = document.getElementById('online');
    OnlineTracker.update(false);

    window.addEventListener('online', ()=>{OnlineTracker.update(true)});
    window.addEventListener('offline', ()=>{OnlineTracker.update(true)});
});

module.exports = OnlineTracker;