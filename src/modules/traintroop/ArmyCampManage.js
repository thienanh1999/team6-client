
var ArmyCampManage = cc.Class.extend({
    _armyCamps: [],
    _totalCapacity: null,
    _capacityUsed: null,
    _listTroop: null,
    ctor: function () {
        this._armyCamps = MapController.getInstance().getStructures(STRUCTURE.ARMY_CAMP);
        // this.reset();
    },

    reset: function () {
        this._capacityUsed = 0;
        this._listTroop = new Map([
            [TROOP.WARRIOR, 0],
            [TROOP.ARCHER, 0],
            [TROOP.GIANT, 0],
            [TROOP.FLYING_BOOM, 0],
        ])
        for (let i = 0; i < this._armyCamps.length; i++) {
            this._armyCamps[i].reset();
        }
    },

    loadTroop: function (listTroop) {
        this.reset();
        cc.log("rest troop");
        for (let i = 0; i < listTroop.length; i++) {
            let troopInfo = listTroop[i];
            for (let k = 0; k < troopInfo.quantity; k++) {
                let troop = TroopFactory.createTroop(troopInfo.type, 1, cc.p(0, 17));
                this.allocateTroopToCamp(troop, false, true);
            }
        }
    },

    loadArmyCamp: function () {
        this._totalCapacity = 0;
        for (let i = 0; i < this._armyCamps.length; i++) {
            let armyCamp = this._armyCamps[i];
            this._totalCapacity += armyCamp.getCapacity();
        }
    },

    update: function () {
        for (let i = 0; i < this._armyCamps.length; i++) {
            this._armyCamps[i].update();
        }
    },

    allocateTroopToCamp: function (troop, update = true, updatePosition = false) {
        let index = -1;
        let maxSpaceRemaining = -10000;
        let armyCamp;
        for (let i = 0; i < this._armyCamps.length; i++) {
            armyCamp = this._armyCamps[i];
            let spaceRemaining = armyCamp.getSpaceRemaining();
            if (spaceRemaining > maxSpaceRemaining) {
                index = i;
                maxSpaceRemaining = spaceRemaining;
            }
        }
        if (updatePosition) {
            let randomPosition = this._armyCamps[index].getRandomPosition();
            troop.position = cc.p(this._armyCamps[index].position.x + randomPosition.x, this._armyCamps[index].position.y + randomPosition.y);
            let randomDirection = Math.floor(Math.random() * 8);
            troop.runIdleAnimation(randomDirection);
            MapController.getInstance().getMapLayer().putTroopToMap(troop);
        } else {
            troop.goTo(this._armyCamps[index].id);
        }
        this._listTroop.set(troop.type, this._listTroop.get(troop.type) + 1);
        this._armyCamps[index].takeTroop(troop);
        this._capacityUsed += troop.houseSpace;
        if (update) {
            if (Loading.getInstance()._mainLayer !== null)
                Loading.getInstance()._mainLayer.statesLayer.updateArmy();
        }
    },

    getTotalCapacity: function () {
        this.loadArmyCamp();
        return this._totalCapacity;
    },
    getCapacityUsed: function () {
        return this._capacityUsed;
    },
    getCapacityRemaining: function () {
        return this.getTotalCapacity() - this.getCapacityUsed();
    },
    getListTroop: function () {
        return this._listTroop;
    }
})