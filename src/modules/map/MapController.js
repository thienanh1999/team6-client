var _MapController = cc.Class.extend({
    _map: null,
    _mapLayer: null,
    _objectByID: new Map(),
    barrackManage: null,
    armyCampManage: null,
    timeStartBattle: null,
    allocatedBuilder: false,
    copy: [],
    _resetTroop: false,
    ctor: function () {
        this._buildingStructures = [];
        this._zeroTimeBuilings = [];

        this._map = {
            id: this.create2DArray(42, 42, -1),
            structure: new Map(),
            troop: new Map()
        };
        this._map.structure.set(STRUCTURE.TOWN_HALL, []);
        this._map.structure.set(STRUCTURE.ARMY_CAMP, []);
        this._map.structure.set(STRUCTURE.GOLD_MINE, []);
        this._map.structure.set(STRUCTURE.ELIXIR_MINE, []);
        this._map.structure.set(STRUCTURE.GOLD_STORAGE, []);
        this._map.structure.set(STRUCTURE.CLAN_CASTLE, []);
        this._map.structure.set(STRUCTURE.CANON, []);
        this._map.structure.set(STRUCTURE.BARRACK, []);
        this._map.structure.set(STRUCTURE.BUILDER_HUT, []);
    },

    update: function (n) {
        for (let i = 0; i < n; i++) {
            this._mapLayer.updateGame();
        }
        this._mapLayer.continueUpdate();
        this.timeStartBattle = null;
    },

    // Only call at the loading game stage as builder's been init at that time
    allocateBuilder: function() {
        var builderHuts = this.getListStructures(STRUCTURE.BUILDER_HUT);
        var i = 0;
        for (var id = 0; id < this._buildingStructures.length; id++) {
            var builderHut = builderHuts[i];
            i += 1;
            builderHut.sendBuilder(this._buildingStructures[id]);
        }
    },

    updateBuildingStructure: function(currentTimeStamp) {
        for (var i in this._buildingStructures) {
            var structure = this._buildingStructures[i];
            if (NumberUtils.getBitAt(structure.state, 1)) {
                structure.updateTimeLabel(currentTimeStamp);
            } else {
                this._buildingStructures.splice(i, 1);
            }
        }
        if (this._resetTroop) {
            this.handleResetTroop();
        }
        this.barrackManage.update(currentTimeStamp);
        this._resourceLayer.update();
        if (this.allocatedBuilder == false) {
            this.allocateBuilder();
            this.allocatedBuilder = true;
        }
    },

    handleResetTroop: function () {
        let listTroop = this.armyCampManage.getListTroop();
        let listUpdated = [];
        for ([type, quantity] of listTroop) {
            listUpdated.push({type: type, quantity: quantity - this._listTroopUsed.get(type)})
        }
        this.armyCampManage.loadTroop(listUpdated);
        this._resetTroop = false;
        this._stateLayer.updateArmy();
    },

    updateMiner: function () {
        this._updateMiner(this.getListStructures(STRUCTURE.GOLD_MINE));
        this._updateMiner(this.getListStructures(STRUCTURE.ELIXIR_MINE));
        this._updateMiner(this.getListStructures(STRUCTURE.DARK_ELIXIR_MINE));

        var object = this._mapLayer.selectedObject;
        if (object != null) {
            switch (object.type) {
                case STRUCTURE.GOLD_MINE:
                case STRUCTURE.ELIXIR_MINE:
                case STRUCTURE.DARK_ELIXIR_MINE:
                    object.updateCollectButton();
                    break;
            }
        }
    },

    _updateMiner: function(miners) {
        for (var i in miners) {
            var mine = miners[i];
            mine.displayPopup();
        }
    },

    create2DArray: function(x, y, defaultValue) {
        var array = [];
        for (var i = 0; i < x; i++) {
            array.push([]);
            array[i].push(new Array(y));

            for(var j=0; j < y; j++){
                // Initializes:
                array[i][j] = defaultValue;
            }
        }
        return array;
    },
    getQuantityStructures:function(){
        var result = new Map();
        for ([key, value] of this._map.structure){
            result.set(key,value.length);
        }
        return result;
    },
    getMapLayer:function(){
        if (this._mapLayer == null){
            this._mapLayer = new MapLayer();
            this._mapLayer.retain();
        }
        return this._mapLayer;
    },
    getLevelTownHall: function () {
        var townHall = this.getListStructures(STRUCTURE.TOWN_HALL)[0];
        return townHall.level;
    },

    initEntity:function (type, attributes){
        if (!this._map.structure.get(type)) {
            this._map.structure.set(type, []);
        }
        var newEntity = EntityFactory.createEntity(type, attributes);
        this.copy.push([type, attributes]);
        if (newEntity.id !== -1) {
            this._map.structure.get(type).push(newEntity);
            for (var i = 0; i < newEntity.size.x; i++)
                for (var j = 0; j < newEntity.size.y; j++) {
                    this._map.id[newEntity.position.x + i][newEntity.position.y + j] = newEntity.id;
                }
            this._objectByID[newEntity.id] = newEntity;

            newEntity.retain();
            if (NumberUtils.getBitAt(newEntity.state, 1)) {
                this._buildingStructures.push(newEntity);
            }
        }
        return newEntity;
    },
    getStructures:function (structureType){
        return this._map.structure.get(structureType);
    },
    logMapIds: function() {
        for (var i = 0; i <= 41; i++) {
            var row = "";
            for (var j = 0; j <= 41; j++) {
                row = row + this._map.id[i][j] + " ";
            }
            cc.log(row);
        }
    },
    getAllStructure: function() {
        var result = [];
        this._map.structure.forEach(function(value, key, map) {
            for (i in value) {
                var item = value[i];
                result.push(item);
            }
        });
        return result;
    },
    getListStructures:function(type){
        return this._map.structure.get(type);
    },
    getStorageCapacity: function(storageType) {
        var storages = this.getListStructures(storageType);
        var total = 0;
        var townHall = this.getListStructures(STRUCTURE.TOWN_HALL)[0];
        switch (storageType) {
            case STRUCTURE.GOLD_STORAGE:
                total += townHall.capacityGold;
                break;
            case STRUCTURE.ELIXIR_STORAGE:
                total += townHall.capacityElixir;
                break;
            case STRUCTURE.DARK_ELIXIR_STORAGE:
                total += townHall.capacityDarkElixir;
                break;
        }
        if (storages != null) {
            for (var i in storages) {
                var storage = storages[i];
                if (storage.isAvailable()) {
                    total += storage.capacity;
                }
            }
        }
        return total;
    },
    sendMove:function (id,posx,posy){
        this.id=id;
        testnetwork.connector.sendMove(id,posx,posy);
    },
    sendBuildRequest:function (structure, builder){
        this._stateLayer.updateBuilder();
        this.sendBuilder(builder, structure);

        if (!structure.canMove) {
            testnetwork.connector.sendDeleteObstacle(structure.id, builder.id);
            return;
        }

        // save builder ID for structure with 0s building
        if (!structure.isAvailable() && (structure.type == STRUCTURE.BUILDER_HUT || structure.type == STRUCTURE.WALL)) {
            this._zeroTimeBuilings.push({
                builderID: builder.id,
                structure: structure
            });
        }

        // draw lines
        this.getMapLayer()._arrowLayer.drawLines(this._map.id, this._objectByID);

        if (!structure.isAvailable()) {
            testnetwork.connector.sendBuild(structure.type,structure.position.x,structure.position.y, builder.id);
        } else {
            testnetwork.connector.sendUpgrade(structure.id, builder.id);
        }
    },
    sendBuilder: function(builderHut, structure) {
        if (structure.type == STRUCTURE.BUILDER_HUT || structure.type == STRUCTURE.WALL)
            return;
        builderHut.sendBuilder(structure);
    },

    // Get Builder With Minimum time
    getFreeBuilder: function() {
        var timeLeft = 60 * 60 * 24 * 30 * 365; // 1 year max
        var result = null;

        var builderHuts = this.getListStructures(STRUCTURE.BUILDER_HUT);
        for (var i in builderHuts) {
            var builderHut = builderHuts[i];
            if (builderHut.isAvailable()) {
                if (builderHut.isFree()) {
                    return builderHut;
                }
                var time = builderHut.building.updateTimeLabel(TimeUtils.getTimeStamp());
                if (time < timeLeft) {
                    timeLeft = time;
                    result = builderHut;
                }
            }
        }
        return result;
    },
    build:function(structure, config){
        this._buildingStructures.push(structure);
        this.pickingStructure = structure;

        var gold = config["gold"] || 0;
        var elixir = config["elixir"] || 0;
        var darkElixir = config["darkElixir"] || 0;
        var gem = config["gem"] || config["coin"] || 0;

        // Check Max Resource
        var maxGold = this.getStorageCapacity(STRUCTURE.GOLD_STORAGE);
        var maxElixir = this.getStorageCapacity(STRUCTURE.ELIXIR_STORAGE);
        var maxDElixir = this.getStorageCapacity(STRUCTURE.DARK_ELIXIR_STORAGE);
        if (gold > maxGold || elixir > maxElixir || darkElixir > maxDElixir) {
            if (NumberUtils.getBitAt(structure.state, 0) == 1)
                PopupLayer.getInstance().popupAlert("Storage not Enough", "Upgrade your Storage to build.", structure.onCancelBuild);
            else
                PopupLayer.getInstance().popupAlert("Storage not Enough", "Upgrade your Storage to build.", null);
            return;
        }

        // Check Current Resource
        var check = this.checkResource(gold, elixir, darkElixir, gem);
        var gLack = check.g;

        if (gLack > 0) {
            PopupLayer.getInstance().popupChargeG();
            return;
        }

        var gTransfer = this.transferG(check.gold, check.elixir, check.darkElixir);
        if (gTransfer > 0) {
            PopupLayer.getInstance().popupBuyResource(check.gold, check.elixir, check.darkElixir, gTransfer, false,
                this.onCancelBuyRes.bind(this), this.checkBuilder.bind(this));
        } else {
            this.checkBuilder();
        }
    },

    upgrade: function(structure) { // TownHall check -> Res check -> builder check
        this.pickingStructure = structure;

        // check TownHall requirement
        var config = ConfigAPI.getInstance().getEntityInfo(this.pickingStructure.type, this.pickingStructure.level+1);
        var requireTownHall = config["townHallLevelRequired"] || 0;
        if (this.getLevelTownHall() >= requireTownHall) {
            this.build(structure, config);
        } else {
            PopupLayer.getInstance().popupAlert("Building Requirement", "Upgrade your Town Hall first", null);
        }
    },

    onCancelBuyRes: function() {
        if (this.pickingStructure.level > 1)
            this.pickingStructure.level -= 1;
    },

    checkBuilder: function() {
        // Check builder
        var builderHut = this.getFreeBuilder();
        if (!builderHut.isFree()) {
            var timeLeft = builderHut.building.updateTimeLabel(TimeUtils.getTimeStamp());
            var gcost = this.timeTransferG(timeLeft);
            PopupLayer.getInstance().popupBuyResource(0, 0, 0, gcost, true,
                this.onCancelBuyRes.bind(this), this.releaseBuilder.bind(this));
        } else {
            this.confirmBuild();
        }
    },

    releaseBuilder: function() {
        var builder = this.getFreeBuilder();
        var timeLeft = builder.building.updateTimeLabel(TimeUtils.getTimeStamp());
        var gcost = this.timeTransferG(timeLeft);
        var structure = builder.building;
        structure.onBuildSuccess();
        builder.building = null;
        this._stateLayer.updateBuilder();
        this.executeCostResource({
            gold: 0,
            elixir: 0,
            darkElixir: 0,
            g: gcost
        });
        this.confirmBuild();
    },

    confirmBuild: function() {
        var level = this.pickingStructure.level + this.pickingStructure.isAvailable();
        if (this.pickingStructure.type == STRUCTURE.BUILDER_HUT) {
            var config = ConfigAPI.getInstance().getEntityInfo(STRUCTURE.BUILDER_HUT, this.getListStructures(STRUCTURE.BUILDER_HUT).length)
        } else {
            var config = this.pickingStructure.config ||
                ConfigAPI.getInstance().getEntityInfo(this.pickingStructure.type, level);
        }
        this.executeCostResource({
            gold: config["gold"] || 0,
            elixir: config["elixir"] || 0,
            darkElixir: config["darkElixir"] || 0,
            g: config["gem"] || config["coin"] || 0
        });

        var builder = this.getFreeBuilder();
        builder.building = this.pickingStructure;

        this._buildingStructures.push(this.pickingStructure);
        this.sendBuildRequest(this.pickingStructure, builder);
        this.pickingStructure.startBuild(builder);
    },

    executeCostResource: function(cost) {
        cost.gold = cost.gold || 0;
        cost.elixir = cost.elixir || 0;
        cost.darkElixir = cost.darkElixir || 0;
        cost.g = cost.g || 0;
        var check = this.checkResource(cost.gold , cost.elixir, cost.darkElixir, cost.g );
        var gCost = this.transferG(check.gold, check.elixir, check.darkElixir) + cost.g;

        var userGold = User.getInstance().getGold();
        var userElixir = User.getInstance().getElixir();
        var userDarkElixir = User.getInstance().getDarkElixir();
        var userG = User.getInstance().getG();

        User.getInstance().setUserResource(
            Math.max(0, userGold-cost.gold),
            Math.max(0, userElixir-cost.elixir),
            Math.max(0,userDarkElixir-cost.darkElixir),
            userG-gCost
        );
        this.updateResourceGUI();
    },

    checkResource: function(gold, elixir, darkElixir, g) {
        // return tai nguyen con thieu
        var userGold = User.getInstance().getGold();
        var userElixir = User.getInstance().getElixir();
        var userDarkElixir = User.getInstance().getDarkElixir();
        var userG = User.getInstance().getG();

        return {
            gold: Math.max(0, gold-userGold),
            elixir: Math.max(0, elixir-userElixir),
            darkElixir: Math.max(0, darkElixir-userDarkElixir),
            g: Math.max(0, g-userG)
        }
    },

    transferG: function(gold, elixir, darkElixir) {
        return Math.ceil(gold/G_TRANSFER.GOLD) + Math.ceil(elixir/G_TRANSFER.ELIXIR) + Math.ceil(darkElixir/G_TRANSFER.DARK_ELIXIR);
    },

    timeTransferG: function(second) {
        return Math.ceil(second/G_TRANSFER.TIME);
    },

    prepareBuild:function(structureType, position=null){
        if (position == null) {
            position = this._mapLayer._tileMap.convertTouchToTilePosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
            var config = ConfigAPI.getInstance().getEntityInfo(structureType, 1);
            position = this.getFreeSpace(cc.p(config["width"], config["height"]), position);
        }
        var id = this.getUnusedID();
        var structure = this.initEntity(structureType,
            {
                id: id,
                level: 1,
                state: 1,
                x :position.x,
                y: position.y
            });
        this._mapLayer.putStructureToMap(structure);
        structure.displayPreparingButton();

        return structure;
    },

    getUnusedID: function() {
        this.countID += 1;
        return this.countID;
    },

    getObjectByTilePos: function(tilePos) {
        if (tilePos.x < 0 || tilePos.x > 41
            || tilePos.y < 0 || tilePos.y > 41)
            return null;
        var ID = this._map.id[tilePos.x][tilePos.y];
        if (ID != -1) {
            return this._objectByID[ID];
        }
    },
    checkCollide: function(position, size, id) {
        for (var i = position.x; i < position.x+size.x; i++) {
            for (var j = position.y; j < position.y+size.y; j++) {
                if (i < 0 || i > 41 || j < 0 || j > 41)
                    return true;
                if (this._map.id[i][j] != id && this._map.id[i][j] != -1)
                    return true;
            }
        }
        return false;
    },
    updateMap: function(object, newPos, replaceID) {
        var oldPos = object.position;
        if (oldPos.x  == newPos.x && oldPos.y == newPos.y && replaceID == false) {
            return;
        }
        var size = object.size;
        for (var i = oldPos.x; i < oldPos.x+size.x; i++)
            for (var j = oldPos.y; j < oldPos.y+size.y; j++)
                this._map.id[i][j] = -1;
        for (var i = newPos.x; i < newPos.x+size.x; i++)
            for (var j = newPos.y; j < newPos.y+size.y; j++)
                this._map.id[i][j] = object.id;

        // Send request to updateState position to server
        if (replaceID)  {
            this._objectByID[object.id] = object;
        }
    },
    loadEntity:function(packet){

    },
    getFreeSpace: function(size, center) {
        var queue = [center];
        var visited = this.create2DArray(42, 42, false);
        var directionX = [0,0,1,1,1,-1,-1,-1];
        var directionY = [1,-1,-1,0,1,-1,0,1];
        visited[center.x][center.y] = true;
        while (queue.length != 0) {
            var x = queue[0].x;
            var y = queue[0].y;
            queue.shift();

            for (var i = 0; i < 8; i++) {
                var newX = directionX[i]+x;
                var newY = directionY[i]+y;
                if (newX > 0 && newX < 41 && newY > 0 && newY < 41 && !visited[newX][newY]) {
                    var newP = cc.p(newX, newY);
                    if (!this.checkCollide(newP, size, -1)) {
                        return newP;
                    } else {
                        queue.push(newP);
                        visited[newX][newY] = true;
                    }
                }
            }
        }
    },
    removeStructure: function(object) {
        // get object type
        var type = object.type;
        if (type.substring(0,3) === "OBS") {
            type = "OBS";
        }

        // remove in ID ref
        this._objectByID[object.id] = null;

        // remove in map id
        object.id = -1;
        this.updateMap(object, object.position, true);

        // clear id ref
        this._objectByID[-1] = null;

        // remove in structure list
        var index = this.getListStructures(type).indexOf(object);
        if (index > -1) {
            this.getListStructures(type).splice(index, 1);
        }

        // remove in map layer
        if (object.getParent() != null) {
            this.getMapLayer()._objectLayer.removeChild(object);
        }
    },
    initManage:function (){
        this.armyCampManage = new ArmyCampManage();
        this.barrackManage = new BarrackManage(this.armyCampManage);
        // updateState army gui
    },
    setResourceLayer:function (resourceLayer){
        this._resourceLayer = resourceLayer;
    },
    setStateLayer: function(stateLayer) {
        this._stateLayer = stateLayer;
    },
    updateResourceGUI:function () {
        this._resourceLayer.update();
    },

    getMapId: function () {
        return this._map.id;
    },

    getTimeManager: function () {
        if (this._timeManager == null) {
            this._timeManager = new TimeManager();
        }

        return this._timeManager;
    },

    findWallLine: function(x, y) {
        // rows
        var rows = [this._objectByID[this._map.id[x][y]]];
        var d1 = y-1; var d2 = y+1;
        while (this.isWall(x, d1) || this.isWall(x, d2)) {
            if (this.isWall(x, d1)) {
                rows.push(this._objectByID[this._map.id[x][d1]]);
                d1 -= 1;
            }
            if (this.isWall(x, d2)) {
                rows.push(this._objectByID[this._map.id[x][d2]]);
                d2 += 1;
            }
        }

        // cols
        var cols = [this._objectByID[this._map.id[x][y]]];
        d1 = x-1; d2 = x+1;
        while (this.isWall(d1, y) || this.isWall(d2, y)) {
            if (this.isWall(d1, y)) {
                cols.push(this._objectByID[this._map.id[d1][y]]);
                d1 -= 1;
            }
            if (this.isWall(d2, y)) {
                cols.push(this._objectByID[this._map.id[d2][y]]);
                d2 += 1;
            }
        }
        if (rows.length > cols.length)
            return rows;
        else
            return cols;
    },

    isWall: function(x, y) {
        if (x < 0 || y < 0 || x > 40 || y > 40)
            return false;
        var id = this._map.id[x][y];
        if (id != -1) {
            if (this._objectByID[id].type == "WAL_1")
                return true;
        }
        return false;
    },

    getListTroop: function () {
        return this.armyCampManage.getListTroop();
    },

    resetListTroop: function (listTroopUsed) {
        this._resetTroop = true;
        this.userLayer.update();
        this._listTroopUsed = listTroopUsed;
    },

    setUserLayer: function (layer) {
        this.userLayer = layer;
    },

    getMapIdIgnoreWall: function () {
        let listWall = this._map.structure.get(STRUCTURE.WALL);
        if (listWall === undefined) listWall = [];
        let listIdWall = [];
        listWall.forEach(function (item) {
            listIdWall.push(item.id);
        });
        let mapIIW = Arrays.create2DArray(42, 42, -1);
        for (let i = 0; i < this._map.id.length; i++) {
            for (let j = 0; j < this._map.id[i].length; j++) {
                if (listIdWall.indexOf(this._map.id[i][j]) !== -1)
                    mapIIW[i][j] = -1;
                else
                    mapIIW[i][j] = this._map.id[i][j];
            }
        }
        return mapIIW;
    }
});

var MapController = (function(){
    var mapController = null;
    return {
        getInstance:function(){
            if (mapController==null){
                mapController = new _MapController();
            }
            return mapController;
        },
        reset: function() {
            mapController = null;
        }
    }
})();
