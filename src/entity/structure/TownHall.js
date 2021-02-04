var TownHall = Structure.extend({
    size: cc.p(4, 4),
    type: STRUCTURE.TOWN_HALL,

    ctor: function(id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        this.goldSto = 0;
        this.elixirSto = 0;
        this.darkElixirSto = 0;
    },

    loadConfig: function(config) {
        this.capacity = config["capacity"];
        this.capacityGold = config["capacityGold"];
        this.capacityElixir = config["capacityElixir"];
        this.capacityDarkElixir = config["capacityDarkElixir"];
        this.hitpoints = config["hitpoints"];
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level)
    },

    onBuildSuccess: function() {
        this._super();
        MapController.getInstance().updateResourceGUI();
    }
});