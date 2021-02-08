var QUEUE_GUI_LENGTH = 5;
var DEFAULT_DELAY_TIME = 0.2;
var TIME_TO_TRIGGER_LONG_PRESS = 800; // ms
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
    // touch event
    _touchedToTrain: false,
    _typeTrain : null,
    _levelTrain : null,
    _touchedToCancelTrain: false,
    _typeCancel : null,
    _timeStartTouch : 0,
    _delayTime :0,
    _pauseTouchEvent: false,
    ctor:function (barrackManage){
        this._super();

        this.retain();
        this._initLayer();
        // init
        this._visible = false;
        this._barrackManage = barrackManage;
        this._isTraining = false;
        this._listBtnTroopCanTrain = [];
        this.schedule(this._updateTouchEvent.bind(this),0.02);
    },

    _updateTouchEvent: function (dt){
        if (!this._visible) return;
        if (this._pauseTouchEvent) return;
        let deltaTime = (new Date()).getTime() - this._timeStartTouch;
        if (deltaTime<TIME_TO_TRIGGER_LONG_PRESS) return;
        this._delayTime -= dt;
        if (this._delayTime>0) return;
        this._delayTime = DEFAULT_DELAY_TIME/(deltaTime/1000);
        if (this._touchedToTrain===true){
            this._checkListTroop();
            if (this._troopCanTrain.canTrain) this._preTrain(this._typeTrain,this._levelTrain);
        }
        else if (this._touchedToCancelTrain===true){
            this._cancelTrain(this._typeCancel);
            this._updateQueue();
        }
    },

    reset: function (){
        this._pauseTouchEvent=false;
        this._timeStartTouch = 0;
        this._touchedToTrain = false;
        this._touchedToCancelTrain = false;
        this._delayTime = DEFAULT_DELAY_TIME;
        this._lvListTroop.removeAllChildren(true);
        this._listTraining = [];
        for (let i=0;i<QUEUE_GUI_LENGTH;i++){
            this._listTraining.push(null);
        }
    },

    load:function(barrack){
        this.reset();
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
                let troopCanTrain = {type: troopType, level: troopLevel, button: btnTroop, canTrain: true};
                if (!this._barrack.isBuilding()) {
                    this._addBTNTrainListener(troopCanTrain);
                }
                this._listBtnTroopCanTrain.push(troopCanTrain);
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

    _addBTNCancelTrainListener:function (imageView, index){
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event){
                if (!self._visible) return false;
                let target = event.getCurrentTarget();
                let locationInNode = target.convertToNodeSpace(touch.getLocation());
                let size = target.getContentSize();
                let rect = cc.rect(0,0,size.width,size.height);
                if (cc.rectContainsPoint(rect,locationInNode)){
                    self._timeStartTouch = (new Date()).getTime();
                    self._touchedToCancelTrain = true;
                    self._typeCancel = self._listTraining[index];
                    imageView.scale = 1.1;
                    return true;
                }
                return false;
            },
            onTouchEnded: function (){
                imageView.scale = 1;
                self._touchedToCancelTrain = false;
                let deltaTime = (new Date()).getTime() - self._timeStartTouch;
                if (deltaTime<TIME_TO_TRIGGER_LONG_PRESS){
                    self._cancelTrain(self._listTraining[index]);
                    self._updateQueue();
                }
            }
        },imageView)
    },

    _addBTNTrainListener: function (troopCanTrain){
        let type = troopCanTrain.type;
        let level = troopCanTrain.level;
        let button = troopCanTrain.button.getChildByName("imv_troop");
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event){
                if (!self._visible) return false;
                let target = event.getCurrentTarget();
                let locationInNode = target.convertToNodeSpace(touch.getLocation());
                let size = target.getContentSize();
                let rect = cc.rect(0,0,size.width,size.height);
                if (cc.rectContainsPoint(rect,locationInNode)){
                    self._timeStartTouch = (new Date()).getTime();
                    self._touchedToTrain = true;
                    self._typeTrain = type;
                    self._levelTrain = level;
                    self._troopCanTrain = troopCanTrain;
                    troopCanTrain.button.scale = 1.1;
                    return true;
                }
                return false;
            },
            onTouchMoved: function (){
            },
            onTouchEnded:function (){
                let deltaTime = (new Date()).getTime()- self._timeStartTouch;
                if (deltaTime<TIME_TO_TRIGGER_LONG_PRESS){
                    self._checkListTroop();
                    if (self._troopCanTrain.canTrain){
                        self._preTrain(self._typeTrain,self._levelTrain);
                    }
                }
                self._touchedToTrain = false;
                self._troopCanTrain.button.scale = 1;
            }
        },button);
    },

    _checkListTroop:function (){
        for (let i = 0; i<this._listBtnTroopCanTrain.length; i++){
            let troopCanTrain = this._listBtnTroopCanTrain[i];
            let troopInfo = ConfigAPI.getInstance().getTroopInfo(troopCanTrain.type, troopCanTrain.level);
            if (troopInfo["housingSpace"] > this._barrack.getMaxBarrackSpace() - this._barrack.getBarrackSpace()){
                troopCanTrain.button.setBright(false);
                troopCanTrain.button.setEnabled(false);
                troopCanTrain.button.getChildByName("imv_troop").setColor(new cc.Color(120,120,120,150));
                troopCanTrain.canTrain = false;
            }
            else{
                troopCanTrain.button.setBright(true);
                troopCanTrain.button.setEnabled(true);
                troopCanTrain.button.getChildByName("imv_troop").setColor(new cc.Color(255,255,255,255));
                troopCanTrain.canTrain = true;
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
        this._addBTNCancelTrainListener(this._queue0,0);
        this._queue1 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training1");
        this._queue1.setVisible(false);
        this._addBTNCancelTrainListener(this._queue1,1);
        this._queue2 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training2");
        this._queue2.setVisible(false);
        this._addBTNCancelTrainListener(this._queue2,2);
        this._queue3 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training3");
        this._queue3.setVisible(false);
        this._addBTNCancelTrainListener(this._queue3,3);
        this._queue4 = this._layer.getChildByName("imv_training_layer").getChildByName("imv_troop_training4");
        this._queue4.setVisible(false);
        this._addBTNCancelTrainListener(this._queue4,4);
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
        this._pauseTouchEvent = true;
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
        this._pauseTouchEvent = false;
    },

    _train: function (typeTroop) {
        testnetwork.connector.sendTrainTroop(this._barrack.id, typeTroop);
        this._pauseTouchEvent = false;
        this._barrack.train(typeTroop);
        this.update();
    },

    _cancelTrain: function (typeTroop) {
        if (this._trainQueue.has(typeTroop))
        {
            testnetwork.connector.sendDeleteTrainTroop(this._barrack.id, typeTroop);
            let troopLevel = User.getInstance().getTroopsLevel().get(typeTroop);
            let elixir = -ConfigAPI.getInstance().getTroopInfo(typeTroop, troopLevel)["trainingElixir"];
            MapController.getInstance().executeCostResource({elixir:elixir});
            this._barrack.cancelTrain(typeTroop);
            this.update()
        }
    },

    _updateQueue:function (){
        let i = 0;
        for (let [typeTroop, quantity] of this._trainQueue){
            let imvTroopInQueue = this._queueGUI[i];
            if (typeTroop!==this._listTraining[i]) {
                cc.log("load textures");
                imvTroopInQueue.getChildByName("imv_troop").loadTexture(TROOP_ICON_PATH.SMALL_ICON+typeTroop+".png");
                this._listTraining[i] = typeTroop;
            }
            imvTroopInQueue.getChildByName("lb_quantity").setString("x"+quantity);
            imvTroopInQueue.setVisible(true);
            i += 1;
            // set cancel train button listener
            let typeCancel = typeTroop;
            // imvTroopInQueue.getChildByName("btn_cancel_train").setPressedActionEnabled(true);
            // imvTroopInQueue.getChildByName("btn_cancel_train").addClickEventListener((function(){
            //     this._cancelTrain(typeCancel);
            // }).bind(this))
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