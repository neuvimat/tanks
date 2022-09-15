module.exports = {
    int(min, max) {
        // todo: check it it works correctly
        return Math.floor(min + Math.random() * (max-min+1));
    },
    float(min, max) {
        return min + Math.random() * (max-min);
    },
    sign() {
        return Math.random() < 0.5 ? -1 : 1;
    },
    bool() {
        return Math.random() < 0.5;
    }
};