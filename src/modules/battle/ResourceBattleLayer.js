var ResourceBattleLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        this._layer = ccs.load("guilayer/ResourceBattle.json",'').node;
        this.gold=this._layer.getChildByName("gold");
        this.elixir=this._layer.getChildByName("elixir");
        this.darkElixir=this._layer.getChildByName("darkElixir");
        this.maxTrophy=this._layer.getChildByName("cup");
        this.addChild(this._layer);
        Responsive.top(this._layer,GRAVITY.LEFT);
    },
    update:function(){
        this.gold.setString(StringUtil.convertNumberToStringWithCommas(BattleController.getInstance().gold));
        this.elixir.setString(StringUtil.convertNumberToStringWithCommas(BattleController.getInstance().elixir));
        this.darkElixir.setString(StringUtil.convertNumberToStringWithCommas(BattleController.getInstance().darkElixir));
        this.maxTrophy.setString(StringUtil.convertNumberToStringWithCommas(BattleController.getInstance().maxTrophy));
    },
})