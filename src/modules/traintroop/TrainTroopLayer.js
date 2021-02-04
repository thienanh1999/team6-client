var QUEUE_GUI_LENGTH = 5;
var TrainTroopLayer = cc.Layer.extend({
    _layer : null,
    _visible : null,
    _btnTroop : null,
    _imvTraining : null,
    _listTraining : null,
    _lvListTroop : null,
    _listImvTroopInQueue : null,
    _listBtnTroopCanTrain : null,
    _trainQueue : null,
    // states
    _currentTroop : null,
    _barrackManage : null,
    _barrack : null,
    _oldBarrackSpace : null,
    _oldQuantity : null,
    _oldQueueSize : null,
    ctor:function (barrackManage){
        this._super();

        this.retain();
        this._initLayer();
        // init
        this._visible = false;
        this._barrackManage = barrackManage;
        this._isTraining = false;
        this._listBtnTroopCanTrain = [];
    },

    load:function(barrack){
        this._barrack = barrack;
        this._trainQueue = this._barrack.getTrainQueue();
        this._oldBarrackSpace = null;
        this._setTitle(barrack.getName());
        this.notifyIsBuilding.setVisible(false);

        this._loadListTroop();
        if (barrack.isTraining()) {
            this.update();
        } else {
            this._layer.getChildByName("imv_training_layer").setVisible(false);
        }
        this._visible = true;
        this.setVisible(true);
        let scale = this._layer.scale;
        this._layer.runAction(cc.sequence(
            cc.scaleTo(0.125, scale * 1.1, scale * 1.1),
            cc.scaleTo(0.125, scale, scale)
        ))
    },

    update:function () {
        if (!this._visible) return;
        if (this._barrack.isBuilding()) {
            this.notifyIsBuilding.setVisible(true);
            this._layer.setColor(new cc.Color(200, 200, 200, 150));
        } else {
            this.notifyIsBuilding.setVisible(false);
            this._layer.setColor(new cc.Color(255, 255, 255));
        }
        if (this._barrack.isTraining()) {
            this._layer.getChildByName("imv_training_layer").setVisible(true);
            this._checkListTroop();
            this._updateQueue();
            this._loadTimeChanged();
            this._updateQuantity();
        } else {
            this._updateQuantity();
            this._layer.getChildByName("imv_training_layer").setVisible(false);
        }
    },

    _loadTimeChanged:function (){

        let timeRemaining = Math.trunc(this._barrack.getTimeRemaining());
        let timeToTrain = this._barrack.getTimeToTrain();
        let totalTime = Math.trunc(this._barrack.getTotalTime());
        this._lbtotalTime.setString(StringUtil.convertTimeToString(totalTime));
        if (this._barrack.paused){
            this._lbTimeTrain.setString("STOP");
            this._imvTrainingTime.scaleX = 1;
        }
        else{
            this._lbTimeTrain.setString(StringUtil.convertTimeToString(timeRemaining));
            this._imvTrainingTime.scaleX = 1 - timeRemaining/timeToTrain;
        }
    },

    _loadListTroop:function(){
        this._lvListTroop.removeAllChildren(true);
        this.o = 0;
        var troopsLevel = User.getInstance().getTroopsLevel();
        for ([type, level] of troopsLevel){
            let troopType = type;
            let troopLevel = level;
            var btnTroop = this._btnTroop.clone();
            btnTroop.retain();
            btnTroop.getChildByName("imv_troop").loadTexture(TROOP_ICON_PATH.NORMAL_ICON + type + ".png");
            btnTroop.getChildByName("btn_troop_info").setPressedActionEnabled(true);
            btnTroop.getChildByName("btn_troop_info").addClickEventListener(function () {
                PopupLayer.getInstance().popupInfoTroop(troopType, troopLevel);
            })
            let barrackLevelRequire = ConfigAPI.getInstance().getTroopInfo(troopType)["barracksLevelRequired"];
            if (level !== 0 && barrackLevelRequire <= this._barrack.getLevel()) {
                btnTroop.getChildByName("lb_level").setString(level);
                var troopInfo = ConfigAPI.getInstance().getTroopInfo(type, level);
                btnTroop.getChildByName("lb_cost").setString(troopInfo["trainingElixir"]);
                if (!this._barrack.isBuilding()) {
                    btnTroop.setPressedActionEnabled(true);
                    btnTroop.addClickEventListener((function () {
                        cc.log("train " + troopType);
                        this._preTrain(troopType, troopLevel);
                    }).bind(this))
                }
                this._listBtnTroopCanTrain.push({type: troopType, level: level, button: btnTroop});
            }
            else {
                btnTroop.setBright(false);
                btnTroop.removeChildByName("imv_bg_cost");
                btnTroop.removeChildByName("imv_type_resource");
                btnTroop.getChildByName("imv_require").getChildByName("lb_barrack_level").setString(barrackLevelRequire);
                // disable button
                btnTroop.getChildByName("imv_troop").setColor(new cc.Color(120,120,120,150));
                btnTroop.getChildByName("imv_require").setVisible(true);
            }
            this._lvListTroop.pushBackCustomItem(btnTroop);
        }
    },

    _checkListTroop:function (){
        for (let i = 0; i<this._listBtnTroopCanTrain.length; i++){
            let troopCanTrain = this._listBtnTroopCanTrain[i];
            let troopInfo = ConfigAPI.getInstance().getTroopInfo(troopCanTrain.type, troopCanTrain.level);
            if (troopInfo["housingSpace"] > this._barrack.getMaxBarrackSpace() - this._barrack.getBarrackSpace()){
                troopCanTrain.button.setBright(false);
                troopCanTrain.button.setEnabled(false);
                troopCanTrain.button.getChildByName("imv_troop").setColor(new cc.Color(120,120,120,150));
            }
            else{
                troopCanTrain.button.setBright(true);
                troopCanTrain.button.setEnabled(true);
                troopCanTrain.button.getChildByName("imv_troop").setColor(new cc.Color(255,255,255,255));
                //troopCanTrain.button.set
            }
            let cost = troopInfo["trainingElixir"];
            if (cost > User.getInstance().getElixir()){
                troopCanTrain.button.getChildByName("lb_cost").setColor(new cc.Color(255,0,0));
            }
            else{
                troopCanTrain.button.getChildByName("lb_cost").setColor(new cc.Color(255,255,255));
            }
        }
    },

    _initLayer:function(){
        this._layer = ccs.load(MAIN_GUI.TRAIN_TROOP_LAYER,"").node;
        this._layer.retain();
        Responsive.center(this._layer,0.9);
        this.addChild(this._layer);
        // touch listener

        this._layer = this._layer.getChildByName("train_troop_pop_up");
        this._lvListTroop = this._layer.getChildByName("list_troop");
        this._imvTroopTraining = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training");
        this._lvListTroop.removeAllChildren();
        // queue
        this._queue0 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training");
        this._queue0.setVisible(false);
        this._queue1 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training1");
        this._queue1.setVisible(false);
        this._queue2 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training2");
        this._queue2.setVisible(false);
        this._queue3 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training3");
        this._queue3.setVisible(false);
        this._queue4 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training4");
        this._queue4.setVisible(false);
        this._queueGUI = [this._queue0, this._queue1, this._queue2, this._queue3, this._queue4]
        // component
        var widget = ccs.load(MAIN_GUI.TRAIN_TROOP_COMPONENT, "").node;
        widget.retain();
        this._imvTraining = widget.getChildByName("imv_troop_training");
        this._btnTroop = widget.getChildByName("btn_troop");
        // fast train
        this._btnFastTrain = this._layer.getChildByName("imv_training_layer").getChildByName("btn_quick_train");
        this._btnFastTrain.setPressedActionEnabled(true);
        this._btnFastTrain.addClickEventListener((function () {
            this._barrackManage.fastTrain(this._barrack);
            this._checkListTroop();
        }).bind(this))
        this._lbCostFastTrain = this._layer.getChildByName("imv_training_layer").getChildByName("lb_cost_quick_train");
        //
        this._lbTimeTrain = this._layer.getChildByName("imv_training_layer").getChildByName("lb_time_train");
        this._lbtotalTime = this._layer.getChildByName("imv_training_layer").getChildByName("lb_total_time");
        this._imvTrainingTime = this._layer.getChildByName("imv_training_layer").getChildByName("imv_train_bar");
        this._lbTotalTroopAfterTrain = this._layer.getChildByName("imv_training_layer").getChildByName("lb_total_troop");
        // close button
        this._layer.getChildByName("btn_close").setPressedActionEnabled(true);
        this._layer.getChildByName("btn_close").addClickEventListener(this._close.bind(this));

        // is building label
        this.notifyIsBuilding = cc.LabelBMFont("Barrack is updating, cant train troop", FONT.SOJI_16);
        this.notifyIsBuilding.setColor(new cc.Color(255, 0, 0));
        this.notifyIsBuilding.attr({
            x: 400,
            y: 300,
        })
        this._layer.addChild(this.notifyIsBuilding);
    },

    _setTitle:function (barrackName){
        this._layer.getChildByName("lb_intro").setString(barrackName);
    },

    _updateQuantity:function(){
        let barrackSpace = this._barrack.getBarrackSpace();
        if (this._oldBarrackSpace !== barrackSpace) {
            let maxBarrackSpace = this._barrack.getMaxBarrackSpace();
            this._layer.getChildByName("lb_quantity").setString(barrackSpace + "/" + maxBarrackSpace);
            this._oldBarrackSpace = barrackSpace;
            this._lbTotalTroopAfterTrain.setString(this._barrackManage.getTotalTroopAfterTrain());

            // updateState fast train
            let coinNeed = Math.ceil(this._barrack.getTotalTime() / 100);
            this._lbCostFastTrain.setString(coinNeed);

            if (this._barrack.getBarrackSpace() > this._barrackManage.getCapacityRemaining()) {
                this._btnFastTrain.setBright(false);
                this._btnFastTrain.setEnabled(false);
                this._btnFastTrain.setColor(new cc.Color(200, 200, 200, 100));
            } else {
                this._btnFastTrain.setEnabled(true);
                this._btnFastTrain.setColor(new cc.Color(255, 255, 255, 0));
                this._btnFastTrain.setBright(true);
            }
            if (coinNeed > User.getInstance().getG()) {
                this._lbCostFastTrain.setColor(new cc.Color(255, 0, 0));
                this._btnFastTrain.setBright(false);
                this._btnFastTrain.setEnabled(false);
                this._btnFastTrain.setColor(new cc.Color(200, 200, 200, 100));
            } else {
                this._lbCostFastTrain.setColor(new cc.Color(255, 255, 255));
            }
        }
    },

    _preTrain:function (typeTroop, troopLevel){
        let elixirNeed = ConfigAPI.getInstance().getTroopInfo(typeTroop, troopLevel)["trainingElixir"];
        let checkResource = MapController.getInstance().checkResource(0, elixirNeed, 0, 0);
        let gT = MapController.getInstance().transferG(0,elixirNeed,0);
        this._cost ={
            gold:0,
            elixir : elixirNeed,
            darkElixir : 0,
            g : 0,
        };
        this._typeTroopToTrain = typeTroop;
        if (checkResource.elixir > 0){
            PopupLayer.getInstance().popupBuyResource(0, checkResource.elixir, 0, gT, false, this._cancelCallback.bind(this), this._confirmTrain.bind(this));

        }
        else{
            MapController.getInstance().executeCostResource(this._cost);
            this._train(typeTroop);
        }
    },

    _confirmTrain: function () {
        MapController.getInstance().executeCostResource(this._cost);
        this._train(this._typeTroopToTrain)

    },

    _cancelCallback: function () {

    },

    _train: function (typeTroop) {
        testnetwork.connector.sendTrainTroop(this._barrack.id, typeTroop);
        // test
        this._barrack.train(typeTroop);
        this.update();
    },

    _cancelTrain: function (typeTroop) {
        // TODO: send to server
        testnetwork.connector.sendDeleteTrainTroop(this._barrack.id, typeTroop);
        // test
        let troopLevel = User.getInstance().getTroopsLevel().get(typeTroop);
        let elixir = -ConfigAPI.getInstance().getTroopInfo(typeTroop, troopLevel)["trainingElixir"];
        MapController.getInstance().executeCostResource({elixir:elixir});
        this._barrack.cancelTrain(typeTroop);
        this.update()
    },

    _updateQueue:function (){
        let i = 0;
        for ([typeTroop, quantity] of this._trainQueue){
            let imvTroopInQueue = this._queueGUI[i];
            imvTroopInQueue.getChildByName("imv_troop").loadTexture(TROOP_ICON_PATH.SMALL_ICON+typeTroop+".png");
            imvTroopInQueue.getChildByName("lb_quantity").setString("x"+quantity);
            imvTroopInQueue.setVisible(true);
            i += 1;
            // set cancel train button listener
            let typeCancel = typeTroop;
            imvTroopInQueue.getChildByName("btn_cancel_train").setPressedActionEnabled(true);
            imvTroopInQueue.getChildByName("btn_cancel_train").addClickEventListener((function(){
                this._cancelTrain(typeCancel);
            }).bind(this))
        }
        for (;i<QUEUE_GUI_LENGTH; i++){
            this._queueGUI[i].setVisible(false);
        }
    },

    _close: function () {
        this._visible = false;
        this.runAction(cc.sequence(
            cc.scaleTo(0.16, 0.2, 0.2),
            cc.callFunc((function () {
                this.setVisible(false);
            }).bind(this)),
            cc.scaleTo(0, 1, 1)
        ))
        // this.setVisible(false);
        Loading.getInstance()._mainLayer.removeChildByName("panel");
    }
})