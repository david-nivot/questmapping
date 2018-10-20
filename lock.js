var lock = false;

module.exports = {

    get: function() {
        return lock;
    },

    set: function(value) {
        lock = value;
    }

}
