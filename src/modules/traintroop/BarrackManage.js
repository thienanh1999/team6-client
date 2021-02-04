var DEFAULT_FRAME_TIME = 1;
var BarrackManage = cc.Class.extend({
    _trainTroopLayer : null,
    barracks : null,
    _armyCampManage : null,
    _frameTime : null,
    _addedChild : false,
    ctor:function(armyCampManage){
        this.barracks = [];
        this._trainTroopLayer = new TrainTroopLayer(this);
        this._trainTroopLayer.retain();
        this._trainTroopLayer.setVisible(false);
        this._armyCampManage = armyCampManage;
        this._frameTime = DEFAULT_FRAME_TIME;

        this.barracks = MapController.getInstance().getStructures(STRUCTURE.BARRACK);
    },
    displayTrainTroopLayer:function(barrackId){
        //this.loadBarracks();
        if (this._addedChild === false){
            Loading.getInstance()._mainLayer.addChild(this._trainTroopLayer, 90000);
            this._addedChild = true;
        }
        for (let i = 0; i<this.barracks.length;i++){
            let barrack = this.barracks[i];
            if (barrack.id === barrackId){
                this.hideAnotherLayer();
                this._trainTroopLayer.load(barrack);
                break;
            }
        }
    },

    update:function (dt){

        for (let i = 0; i<this.barracks.length;i++){
            let barrack = this.barracks[i];
            barrack.update(DEFAULT_FRAME_TIME);
            let houseSpaceNeed = barrack.checkDone();
            if (houseSpaceNeed !== -1){
                if (houseSpaceNeed > this._armyCampManage.getCapacityRemaining()) {
                    barrack.pauseTrain();
                } else {
                    barrack.continueTrain();
                    let type = barrack.getTroop();
                    let troop = TroopFactory.createTroop(type, 1, cc.p(barrack.position.x + 3, barrack.position.y + 1));
                    MapController.getInstance().getMapLayer().putTroopToMap(troop);
                    this._armyCampManage.allocateTroopToCamp(troop);
                }
            }
        }
        this._trainTroopLayer.update(DEFAULT_FRAME_TIME);
        this._armyCampManage.update();
    },

    fastTrain: function (barrack) {
        testnetwork.connector.sendFastTrain(barrack.id);
        while (barrack.isTraining()) {
            let type = barrack.getTroop();
            let troop = TroopFactory.createTroop(type, 1, cc.p(barrack.position.x + 3, barrack.position.y + 1));
            MapController.getInstance().getMapLayer().putTroopToMap(troop);
            this._armyCampManage.allocateTroopToCamp(troop);
        }
    },

    loadBarrackQueue: function (serverResponse) {

        for (let i = 0; i < this.barracks.length; i++) {
            let barrack = this.barracks[i];
            let barrackInfo = serverResponse.get(barrack.id);
            barrack.initQueueTrain(barrackInfo.queueTroop, barrackInfo.timeRemaining);
        }
    },

    hideAnotherLayer: function () {
        let panel = PopupLayer.getInstance().getPanel();
        panel.setName("panel");
        Loading.getInstance()._mainLayer.addChild(panel, 80000);
    },

    getTotalTroopAfterTrain: function () {
        let totalTroop = this._armyCampManage.getCapacityUsed();
        for (let i = 0; i < this.barracks.length; i++) {
            let barrack = this.barracks[i];
            totalTroop += barrack.getBarrackSpace();
        }
        return totalTroop + '/' + this._armyCampManage.getTotalCapacity();
    },

    getCapacityRemaining: function () {
        return this._armyCampManage.getTotalCapacity() - this._armyCampManage.getCapacityUsed();
    }
})