
var ToolLayer = cc.Layer.extend({
    _btnShop : null,
    _btnAttack : null,
    _btnSetting : null,
    _btnBunker : null,
    _btnChat : null,
    _btnTrain : null,
    _btnClanWar : null,
    ctor:function(){
        this._super();
        this._layer = ccs.load(MAIN_GUI.TOOL_LAYER, '').node;
        this.addChild(this._layer);
        this._btnShop = this._layer.getChildByName("btn_shop");
        this._btnTrain = this._layer.getChildByName("btn_train_troop");
        this._btnAttack = this._layer.getChildByName("btn_attack");
        this._btnAttack.setPressedActionEnabled(true);
        this._btn_bunker = this._layer.getChildByName("btn_bunker");
        this._btn_bunker.setPressedActionEnabled(true);
        this._btnClanWar = this._layer.getChildByName("btn_clan_war");
        this._btnClanWar.setPressedActionEnabled(true);
        this._addButtonsListener();
        Responsive.bottom(this._layer);
    },

    _addButtonsListener:function(){
        this._btnAttack.addClickEventListener((function () {
            if (MapController.getInstance().armyCampManage.getCapacityUsed() <= 0) {
                return;
            }
            Loading.getInstance().createPrepareLayer();
            MapController.getInstance().timeStartBattle = (new Date()).getTime();
        }).bind(this));
        this._btnShop.addClickEventListener((function () {
            Loading.getInstance()._mainLayer.openShop();
        }).bind(this));
        this._btnTrain.addClickEventListener(function () {
            MapController.getInstance().barrackManage.displayTrainTroopLayer(1);
        });
        this._btn_bunker.addClickEventListener(function () {
            Loading.getInstance()._mainLayer._cheat.setVisible(true);
        })
        this._btnClanWar.addClickEventListener(
            function () {
                BattleController.getInstance().attackYourSelf();
            }
        )
    },
    hide:function(){
        this._layer.setVisible(false);
    },
    unhide:function (){
        this._layer.setVisible(true);
    }
})
