var RESOURCE_BAR_WIDTH = 140;
var RESOURCE_BAR_HEIGHT = 18;
var ResourceLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        this._layer = ccs.load(MAIN_GUI.RESOURCE_LAYER,'').node;
        this.addChild(this._layer);
        Responsive.top(this._layer,GRAVITY.RIGHT);
    },
    update:function(){
        // TODO: Animation when updateState
        this._updateElixir();
        this._updateGold();
        this._updateG();
    },
    _updateGold:function(){
        let userGold = User.getInstance().getGold();
        let maxGold = MapController.getInstance().getStorageCapacity(STRUCTURE.GOLD_STORAGE);
        let ratio = userGold/maxGold;
        if (ratio>1) ratio = 1;
        else if (ratio<0) ratio =0;
        var imvResourceWidth =  ratio*RESOURCE_BAR_WIDTH;
        userGold = StringUtil.convertNumberToStringWithCommas(Math.floor(userGold));
        maxGold = StringUtil.convertNumberToStringWithCommas(maxGold);
        this._layer.getChildByName("imv_gold").getChildByName("lb_resource").setString(userGold);
        this._layer.getChildByName("imv_gold").getChildByName("imv_current_resource").setSize(cc.size(imvResourceWidth,RESOURCE_BAR_HEIGHT));
        this._layer.getChildByName("imv_gold").getChildByName("lb_max").setString("Max:"+maxGold);

    },
    _updateElixir:function(){
        let userElixir = User.getInstance().getElixir();
        let maxElixir = MapController.getInstance().getStorageCapacity(STRUCTURE.ELIXIR_STORAGE);
        let ratio = userElixir/maxElixir;
        if (ratio>1) ratio = 1;
        else if (ratio<0) ratio =0;
        var imvResourceWidth =  ratio*RESOURCE_BAR_WIDTH;
        userElixir = StringUtil.convertNumberToStringWithCommas(Math.floor(userElixir));
        maxElixir = StringUtil.convertNumberToStringWithCommas(maxElixir);
        this._layer.getChildByName("imv_elixir").getChildByName("lb_resource").setString(userElixir);
        this._layer.getChildByName("imv_elixir").getChildByName("imv_current_resource").setSize(cc.size(imvResourceWidth,RESOURCE_BAR_HEIGHT));
        this._layer.getChildByName("imv_elixir").getChildByName("lb_max").setString("Max:"+maxElixir);
    },
    _updateG:function(){
        var userG = StringUtil.convertNumberToStringWithCommas(User.getInstance().getG());
        this._layer.getChildByName("imv_g").getChildByName("lb_resource").setString(userG);

    },

})