var ArmyCamp = Structure.extend({
    size: cc.p(5, 5),
    type: STRUCTURE.ARMY_CAMP,

    _listTroop: null,
    capacity: null,
    capacityUsed: null,
    _oldPosition: null,
    ctor: function (id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        this._listTroop = [];
        this.reset();
        this._initMatrix();
    },

    reset: function () {
        for (let i = 0; i < this._listTroop.length; i++) {
            let troop = this._listTroop[i];
            troop.stopAllActions();
            troop.removeFromParent(true);
        }
        // train troop attr
        this._listTroop = [];
        this.capacity = ConfigAPI.getInstance().getEntityInfo(this.type, this.level)["capacity"];
        this.capacityUsed = 0;
        this._oldPosition = cc.p(this.position.x, this.position.y);
        this._changedPosition = false;
    },

    loadConfig: function (config) {
        this.hitpoints = config["hitpoints"];
        this.capacity = config["capacity"];
    },

    getIdlePath: function (level) {
        return "buildings/army_camp/amc_1_" + level + "/idle/image0000.png";
    },

    // train troop functions
    takeTroop: function (troop) {
        this._listTroop.push(troop);
        this.capacityUsed += troop.houseSpace;
    },
    getSpaceRemaining: function () {
        return this.getCapacity() - this.capacityUsed;
    },
    onBuildSuccess: function () {
        this._super();
        MapController.getInstance()._stateLayer.updateArmy();
    },

    getCapacity: function () {
        if (this.isBuilding() || NumberUtils.getBitAt(this.state, 0)) {
            if (this.level === 1) return 0;
            return ConfigAPI.getInstance().getEntityInfo(this.type, this.level - 1)["capacity"];
        } else {
            return this.capacity;
        }
    },

    update: function () {
        if (this.position.x !== this._oldPosition.x || this.position.y !== this._oldPosition.y) {
            this._changedPosition = true;
            this._oldPosition.x = this.position.x;
            this._oldPosition.y = this.position.y;
            this._countArray = [];
            for (let i = 0; i < this._listTroop.length; i++) {
                this._countArray[i] = false;
            }
            this._numberTroopChanged = 0;
        }

        if (this._changedPosition) {
            for (let i = 0; i < this._listTroop.length; i++) {
                let troop = this._listTroop[i];
                if (this._countArray[i] === false) {
                    troop.goTo(this.id);
                    this._countArray[i] = true;
                    this._numberTroopChanged += 1;
                }
            }
            if (this._numberTroopChanged === this._listTroop.length) {
                this._changedPosition = false;
            }
        } else {
            for (let i = 0; i < this._listTroop.length; i++) {
                let troop = this._listTroop[i];
                if (!troop.isRunning()) {
                    let random = Math.random();
                    if (random > 0.75) {
                        troop.goToPosition(this.position, this.getRandomPosition(), this._matrix);
                    }
                }
            }
        }
    },

    _initMatrix: function () {
        this._matrix = [
            [-1, -1, -1, -1, -1, -1],
            [-1, -1, 1, -1, -1, -1],
            [-1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, -1, -1],
            [-1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1],
        ];
    },

    getRandomPosition: function () {
        let x, y;
        let i = 0;
        while (1) {
            i += 1;
            x = Math.trunc(Math.random() * 6);
            y = Math.trunc(Math.random() * 6);
            if (this._matrix[x][y] === -1) return cc.p(x, y);
            if (i > 10) return cc.p(0, 0);
        }
    }
});