var BuilderHut = Structure.extend({
    size: cc.p(2, 2),
    type: STRUCTURE.BUILDER_HUT,
    building: null,
    builder: null,

    ctor: function(id, state, position) {
        this._super(id, 1, state, 0, position, this.getIdlePath());
    },

    sendBuilder:function(structure) {
        if (this.builder == null) {
            this.builder = new Builder(-1, this.position, this.id);
            MapController.getInstance().getMapLayer().putTroopToMap(this.builder);
        } else{
            MapController.getInstance().getMapLayer().putTroopToPosition(this.builder,this.position);
        }

        this.building = structure;
        this.builder.setVisible(true);
        this.builder.goTo(this.building.id);
        structure.builderHut = this;
    },

    recall: function() {
        this.building = null;
        this.builder.goTo(this.id, true);
    },

    getIdlePath: function() {
        return ResourceRouter.getIdlePath(this.type, level);
    },
    getListAction: function() {
        return [{"ACTION":ACTION_LAYER.INFO}];
    },

    isFree: function() {
        return (this.building == null);
    }
});