var BattleLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        let mapBattle = BattleController.getInstance().getMapBattle();
        this.addChild(mapBattle);
        this._mapBattle = mapBattle;
        let selectTroopLayer = BattleController.getInstance().getSelectTroopLayer(true);
        this.addChild(selectTroopLayer);
        let resourceLayer = BattleController.getInstance().getResourceLayer();
        this.addChild(resourceLayer);
        let resourceBattleLayer = BattleController.getInstance().getResourceBattleLayer();
        this.addChild(resourceBattleLayer);
        let noticeLayer = BattleController.getInstance().getNoticeLayer();
        this.addChild(noticeLayer);
        BattleController.getInstance().addResToStructure();
        this.schedule(BattleController.getInstance().update.bind(BattleController.getInstance()), GAME_TICK);

    },

});