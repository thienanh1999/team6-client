var Laboratory = Structure.extend({
    size: cc.p(4, 4),
    type: STRUCTURE.LABORATORY,

    ctor: function(id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
    },

    loadConfig: function(config) {
        this.hitpoints = config["hitpoints"];
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getListAction: function() {
        var result = this._super();
        result.push({"ACTION":ACTION_LAYER.RESEARCH});
        return result;
    }
});