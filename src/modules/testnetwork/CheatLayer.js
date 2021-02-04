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
            this.gold=parseInt(self._layer.getChildByName("res_bar_2").getChildByName("gold_text").getString());
            this.elixir=parseInt(self._layer.getChildByName("res_bar_5_0").getChildByName("elixir_text").getString());
            this.g=parseInt(self._layer.getChildByName("res_bar_5").getChildByName("g_text").getString());
            cc.log(this.gold+" "+this.elixir+" "+this.g);
            testnetwork.connector.sendCheat(this.gold,this.elixir,1,this.g);
            User.getInstance().update(this);
            MapController.getInstance().updateResourceGUI();
            Loading.getInstance()._mainLayer._cheat.setVisible(false);
        })
        // this.
        // var buttonLogin = this._layer.getChildByName("LoginButton");
        // var id = jsb.fileUtils.getStringFromFile("res/content/user.json");
        // this._layer.getChildByName("TextField_1").setString(id);
        // buttonLogin.setPressedActionEnabled(true);
        // buttonLogin.addClickEventListener(this.onSelectLogin.bind(this));
        //
        //
        // // var p=cc.TextFieldTTF();
        // // p.get
        // this.lblLog = gv.commonText(fr.Localization.text(""), size.width * 0.4, size.height * 0.05);
        // this.addChild(this.lblLog);
        // this._addBuildVersion();
    },


});