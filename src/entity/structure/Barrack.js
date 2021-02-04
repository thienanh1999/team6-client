var TRAIN_STATE = {
    STOP : 0,
    PAUSED : 1,
    TRAINING : 2,
}
var Barrack = Structure.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.BARRACK,

    _trainQueue: null,
    _maxBarrackSpace: null,
    _isTraining: null,
    _barrackSpace: null,
    _totalTimeToTrain: null,
    _timeRemaining: null,
    _currentTroop: null,
    paused: null,
    _oldTrainState: null,
    _oldTroop: null,
    _isLoaded: false,
    ctor: function (id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        this._totalTimeToTrain = 0;
        this._currentTroop = {type: null, houseSpaceNeed: null, timeToTrain: null};
        this._maxBarrackSpace = ConfigAPI.getInstance().getEntityInfo(STRUCTURE.BARRACK, this.level)["queueLength"];
        this._createTrainInfo();
        this.initQueueTrain(new Map(), 0);
    },

    loadConfig: function (config) {
        this.hitpoints = config["hitpoints"];
        this._maxBarrackSpace = config["queueLength"];
    },

    initQueueTrain: function (queue, timeRemaining) {
        // server response
        this._trainQueue = queue;
        this._barrackSpace = 0;
        if (this._trainQueue.size === 0) {
            this._isTraining = false;
            return;
        }
        // init state
        this._isLoaded = true;
        this._updateCurrentTroop();
        this._timeRemaining = timeRemaining;
        for ([typeTroop, quantity] of this._trainQueue){
            let troopInfo = ConfigAPI.getInstance().getTroopInfo(typeTroop);
            this._barrackSpace += troopInfo["housingSpace"]*quantity;
            this._totalTimeToTrain += troopInfo["trainingTime"]*quantity;
        }
        this._totalTimeToTrain -= (this._currentTroop.timeToTrain - this._timeRemaining);
        //
        this._isTraining = true;
    },

    update:function(dt){
        if (this._isTraining){
            this._train(dt);
        }
        this._updateGUI();
    },

    /**
     *  kiểm tra xem con lính đang train đã hoàn thành hay chưa
     * @returns house space của con lính đó nếu đã train xong, trả về -1 nếu chưa train xong
     */
    checkDone:function (){
        if (this.isTraining() && this._timeRemaining<=0){
            return this._currentTroop.houseSpaceNeed;
        }
        else{
            return -1;
        }
    },

    getTroop:function(){
        let headQueue = this._trainQueue.get(this._currentTroop.type)-1;
        this._trainQueue.set(this._currentTroop.type,headQueue);
        var typeTroopTrained = this._currentTroop.type;
        // debug
        cc.log( " train done :" + typeTroopTrained + " from barrack id:"+this.id);
        //
        this._barrackSpace -= this._currentTroop.houseSpaceNeed;
        if (headQueue === 0){
            this._trainQueue.delete(typeTroopTrained);
            if (this._trainQueue.size === 0) {
                this._isTraining = false;
                this._totalTimeToTrain = 0;
                cc.log("train finish !!!!!!!!!!!!!")
            }
            else{
                this._updateCurrentTroop();
            }
        }
        this._timeRemaining = this._currentTroop.timeToTrain;
        return typeTroopTrained;
    },

    train:function (troopType, quantity=1){
        if (this._trainQueue.size === 0){
            this._trainQueue.set(troopType,quantity);
            this.continueTrain();
            this._updateCurrentTroop();
        }
        else if (this._trainQueue.has(troopType)){
            this._trainQueue.set(troopType,this._trainQueue.get(troopType)+quantity);
        }
        else{
            this._trainQueue.set(troopType,quantity);
        }
        this._barrackSpace += ConfigAPI.getInstance().getTroopInfo(troopType)["housingSpace"]*quantity;
        this._totalTimeToTrain += ConfigAPI.getInstance().getTroopInfo(troopType)["trainingTime"]*quantity;
    },

    cancelTrain:function (troopType, quantity=1){
        if (this._trainQueue.has(troopType)){
            let newQuantity = this._trainQueue.get(troopType) - quantity;
            if (newQuantity <=0){
                let headTroop = this._trainQueue.entries().next().value[0];
                this._trainQueue.delete(troopType);
                cc.log("Cancel train type : "+troopType);
                if (this._trainQueue.size === 0) {
                    this._isTraining = false;
                    this._totalTimeToTrain = 0;
                    this._barrackSpace = 0;
                    return;
                }
                else if (headTroop === troopType){
                    this._updateCurrentTroop();
                    this.continueTrain();
                }
            }
            else{
                this._trainQueue.set(troopType,newQuantity);
            }
            this._barrackSpace -= ConfigAPI.getInstance().getTroopInfo(troopType)["housingSpace"]*quantity;
            this._totalTimeToTrain -= ConfigAPI.getInstance().getTroopInfo(troopType)["trainingTime"]*quantity
        }
    },

    _train:function (dt){
        if (this.isBuilding()) {
            return;
        }
        if (!this.paused) {
            this._timeRemaining -= dt;
            this._totalTimeToTrain -= dt;
        }
    },

    _updateGUI:function(dt) {
        if (this.isBuilding()) {
            this._trainTimeBG.setVisible(false);
            this._stopTrainBG.setVisible(false);
            return;
        }
        let state;
        if (this.isTraining()) {
            if (this.paused) {
                state = TRAIN_STATE.PAUSED;
            } else {
                state = TRAIN_STATE.TRAINING;
            }
        } else {
            state = TRAIN_STATE.STOP;
        }
        if (state === TRAIN_STATE.TRAINING){
            this._trainTimeBG.setVisible(true);
            this._stopTrainBG.setVisible(false);
            if (this._timeRemaining < 0) this._timeRemaining = 0;
            let ratio = this._timeRemaining/this._currentTroop.timeToTrain;
            if (ratio< 0) ratio = 0;
            else if (ratio>1) ratio = 1;
            this._trainTimeBar.scaleX = 1 - ratio;
            this._lbTimeTrain.setString(StringUtil.convertTimeToString(this._timeRemaining));
            if (this._currentTroop.type !== this._oldTroop){
                this._imvTypeTroop.setTexture(TROOP_ICON_PATH.SMALL_ICON + this._currentTroop.type +".png");
                this._oldTroop = this._currentTroop.type;
            }
        }
        else {
            this._trainTimeBG.setVisible(false);
            this._stopTrainBG.setVisible(true);
            if (state === TRAIN_STATE.STOP) {
                this._lbTrainState.setString("Free");
            }
            else{
                this._lbTrainState.setString("!!!");
            }
        }
    },

    pauseTrain:function(){
        this.paused = true;
        // this._trainTimeBG.setVisible(false);
        // this._stopTrainBG.setVisible(true);
        // this._lbTrainState.setString("!!!");
    },

    continueTrain:function (){
        this.paused = false;
        this._isTraining = true;
    },

    getTrainQueue:function(){
        return this._trainQueue;
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getName:function (){
        return ENTITY_NAME.get(STRUCTURE.BARRACK) + " " + this.level;
    },

    getMaxBarrackSpace:function (){
        return this._maxBarrackSpace;
    },

    getBarrackSpace:function (){
        return this._barrackSpace;
    },

    isTraining:function (){
        return this._isTraining;
    },

    getTimeRemaining:function (){
        if (this._timeRemaining < 0 ) return 0;
        return this._timeRemaining;
    },

    getTimeToTrain:function (){
        return this._currentTroop.timeToTrain;
    },

    getTotalTime:function (){
        return this._totalTimeToTrain;
    },

    _updateCurrentTroop:function (){
        cc.log("train new type "+ this._trainQueue.entries().next().value[0]);
        this._currentTroop.type = this._trainQueue.entries().next().value[0];
        this._currentTroop.houseSpaceNeed = ConfigAPI.getInstance().getTroopInfo(this._trainQueue.entries().next().value[0])["housingSpace"];
        this._currentTroop.timeToTrain = ConfigAPI.getInstance().getTroopInfo(this._trainQueue.entries().next().value[0])["trainingTime"];
        this._timeRemaining = this._currentTroop.timeToTrain;
    },

    _createTrainInfo:function (){
        // training info
        this._trainTimeBG = new cc.Sprite(BUILD.BUILDING_TIME_BG);
        this._trainTimeBG.attr({
            anchorY: 0,
            x:10,
            y: this.size.y/2*TILE_HEIGHT
        });
        this._trainTimeBG.setLocalZOrder(2);
        this.addChild(this._trainTimeBG);

        this._trainTimeBar = new cc.Sprite(BUILD.BUILDING_TIME_BAR);
        this._trainTimeBar.attr({
            anchorX: 0,
            x: 1,
            y: this._buildingBar.height / 2
        });
        this._trainTimeBG.addChild(this._trainTimeBar);

        this._lbTimeTrain = new cc.LabelBMFont("", FONT.SOJI_16);
        this._lbTimeTrain.attr({
            x: this._trainTimeBG.width / 2,
            y: 25
        })
        this._trainTimeBG.addChild(this._lbTimeTrain);


        this._imvTypeTroop = new cc.Sprite();
        this._imvTypeTroop.setTexture(TROOP_ICON_PATH.SMALL_ICON + "ARM_2.png");
        this._imvTypeTroop.setLocalZOrder(3);
        this._imvTypeTroop.attr({
            x: -30, y: 10
        })
        this._trainTimeBG.addChild(this._imvTypeTroop);
        this._trainTimeBG.setVisible(false);


        // stop training info
        this._stopTrainBG = new cc.Sprite();
        this._stopTrainBG.setTexture(TROOP_ICON_PATH.STOP_TRAIN_BG);
        this._stopTrainBG.attr({
            anchorY: 0,
            x: 10,
            y: this.size.y / 2 * TILE_HEIGHT - 10
        });
        this._stopTrainBG.setVisible(false);
        this.addChild(this._stopTrainBG);
        this._lbTrainState = new cc.LabelBMFont("!!!", FONT.SOJI_16);
        this._lbTrainState.attr({
            anchorY: 0.5,
            anchorX: 0.5,
            x: this._stopTrainBG.width / 2,
            y: this._stopTrainBG.height / 2
        })
        this._stopTrainBG.addChild(this._lbTrainState);
    },

    getListAction: function() {
        var result = this._super();
        result.push({"ACTION":ACTION_LAYER.TRAIN});
        return result;
    }
});