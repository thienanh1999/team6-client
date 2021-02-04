var TimeManager = cc.Class.extend({

    ctor: function() {
        this.time = 0;
        this.getServerTime();
    },

    update: function(time) {
        this.time = time;
    },

    getTime: function() {
        return this.time;
    },

    getServerTime: function() {
        testnetwork.connector.sendGetTime();
    }
});