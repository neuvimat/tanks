/* SINGLETON */

class EventSystem {
    constructor() {
        this.events = {};
        EventSystem.inst = this;
    }

    fire(event) {
        for (let l of this.events[event.getId()]) {
            l(event);
        }
    }

    listen(eventId, fn) {
        if (!this.events[eventId]) {
            this.events[eventId] = [];
        }
        this.events[eventId].push(fn);
    }

    detach(eventClass, fn) {
        let i = this.events[eventClass.getId()].indexOf(fn);
        if (i >= 0) {
            this.events[eventClass.getId()].splice(i,1);
        }
    }

    static getInst() {
        if (!EventSystem.inst) {
            new EventSystem();
        }
        return EventSystem.inst;
    }
}

module.exports = EventSystem;