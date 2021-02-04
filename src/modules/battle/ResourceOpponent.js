var ResourceOpponent = cc.Layer.extend({
    ctor:function () {
        this._super();
        this._layer=ccs.load("guilayer/PrepareBattle.json", '').node;
        this._button=this._layer.getChildByName("background").getChildByName("FindMatch");
        this._button.setPressedActionEnabled(true);
        this._button.addClickEventListener(function () {
            testnetwork.connector.sendFindMatch();
        });
        Responsive.center(this._layer,1);
        this.addChild(this._layer);
    }
})