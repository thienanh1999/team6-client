var PrepareLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super(cc.color(0, 0, 0));
        this._layer=ccs.load("guilayer/PrepareBattle.json", '').node;
        this._button=this._layer.getChildByName("background").getChildByName("FindMatch");
        this._button.setPressedActionEnabled(true);
        this._button.addClickEventListener(function () {
            // BattleController.getInstance().attackYourSelf();
            BattleController.getInstance().findMatch();
            // Loading.getInstance().loadingDone(Loading.getInstance().createBattleLayer.bind(Loading.getInstance()));
        });
        this._escapeButton=this._layer.getChildByName("Escape");
        this._escapeButton.setPressedActionEnabled(true);
        this._escapeButton.addClickEventListener(function () {
            Loading.getInstance().switchMainLayer();
        });
        Responsive.center(this._layer,1);
        this.addChild(this._layer);
    }
});