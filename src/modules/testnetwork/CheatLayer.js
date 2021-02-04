/**
 * Created by GSN on 7/9/2015.
 */

var Direction =
    {
        UP:1,
        DOWN:2,
        LEFT:3,
        RIGHT:4
    };
var CheatLayer = cc.Layer.extend({
    name : "network",
    ctor:function() {
        this._super();
        var size = cc.director.getVisibleSize();
        //
        var yBtn = 2 * size.height / 3;
        self=this;
        this._layer = ccs.load("guilayer/CheatLayer.json", '').node;
        this.addChild(this._layer);
        Responsive.center(this._layer,1);
        this._layer.retain();
        this._close=this._layer.getChildByName("close_btn");
        this._close.setPressedActionEnabled(true);
        this._cheat=this._layer.getChildByName("Cheat");
        this._cheat.setPressedActionEnabled(true);
        this._close.addClickEventListener(function () {
            Loading.getInstance()._mainLayer._cheat.setVisible(false);
        });
        this._cheat.addClickEventListener(function () {
            this.gold = parseInt(self._layer.getChildByName("res_bar_2").getChildByName("gold_text").getString());
            this.elixir = parseInt(self._layer.getChildByName("res_bar_5_0").getChildByName("elixir_text").getString());
            this.g = parseInt(self._layer.getChildByName("res_bar_5").getChildByName("g_text").getString());
            cc.log(this.gold + " " + this.elixir + " " + this.g);
            cc.log(User.getInstance().getGold());
            if (isNaN(this.gold)) this.gold = User.getInstance().getGold();
            if (isNaN(this.elixir)) this.elixir = User.getInstance().getElixir();
            if (isNaN(this.g)) this.g = User.getInstance().getG();
            cc.log(this.gold + " " + this.elixir + " " + this.g);
            testnetwork.connector.sendCheat(this.gold, this.elixir, 1, this.g);
            User.getInstance().update(this);
            MapController.getInstance().updateResourceGUI();
            Loading.getInstance()._mainLayer._cheat.setVisible(false);
        })
    },


});