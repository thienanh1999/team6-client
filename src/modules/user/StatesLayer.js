var StatesLayer = cc.Layer.extend({
    ctor:function (){
        this._super();
        this._layer = ccs.load(MAIN_GUI.STATES_LAYER,"").node;
        this.addChild(this._layer);
        Responsive.top(this._layer,GRAVITY.CENTER);
        this._layer = this._layer.getChildByName("lv_states");
        this._stateArmy = this._layer.getChildByName("imv_state_camp").getChildByName("lb_current_per_max");
        this._stateBuilder = this._layer.getChildByName("imv_state_builder").getChildByName("lb_current_per_max");
    },
    update: function () {
        // TODO : updateState builder number, troop capacity ...
    },
    updateArmy: function () {
        let armyManage = MapController.getInstance().armyCampManage;
        let capacityUsed = armyManage.getCapacityUsed();
        let totalCapacity = armyManage.getTotalCapacity();
        this._stateArmy.setString(capacityUsed + '/' + totalCapacity);
    },
    updateBuilder: function () {
        let builders = MapController.getInstance().getStructures(STRUCTURE.BUILDER_HUT);
        let totalBuilder = builders.length;
        let freeBuilder = 0;
        for (let i = 0; i < totalBuilder; i++) {
            if (builders[i].building === null) {
                freeBuilder += 1;
            }
        }
        this._stateBuilder.setString(freeBuilder + "/" + totalBuilder);
    }
})