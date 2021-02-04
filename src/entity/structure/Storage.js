var Storage = Structure.extend({
    capacity: 0,
    resource: 0,

    ctor: function(id, level, state, buildingTime, position, idle, resource) {
        this.resource = resource;
        this._super(id, level, state, buildingTime, position, idle);
    },

    loadConfig: function (config) {
        this.capacity = config["capacity"];
        this.hitpoints = config["hitpoints"];
    },

    onBuildSuccess: function () {
        this._super();
        MapController.getInstance().updateResourceGUI();
    },

    animationAttack: function () {
        this._super();
        this.runHarvestEffect();
    }
});