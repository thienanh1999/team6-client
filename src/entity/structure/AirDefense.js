var AirDefense = Defense.extend({
    size: cc.p(3,3),
    type: STRUCTURE.AIR_DEFENSE,

    ctor: function(id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getBasePath: function(level) {
        return null;
    }
});