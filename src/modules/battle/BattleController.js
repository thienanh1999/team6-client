var _BattleController = cc.Class.extend({
    _selectTroopLayer: null,
    _mapBattle: null,
    _resourceLayer: null,
    _noticeLayer: null,

    _map: null,
    _objectByID: null,
    _wall: null,
    _listStructure: null,
    _listTroopDrop: null,
    _listTroop: null,
    _listTroopUsed: null,
    _tick: 0,
    _startedTick: -1,
    _troopListToSend: [],
    _logs: [],
    _resourceBattleLayer: null,
    _isLoading: false,
    ctor: function () {
        this.tickGame = 0;
        this._numTickToDropTroop = Math.floor(TIME_TO_DROP_TROOP / GAME_TICK);
        this.totalHitPoint = 0;
        this.star = 0;
        this.townHallDestroy = false;
        this.destroyHalf = false;
        this.gold = 0;
        this.elixir = 0;
        this.darkElixir = 0;
        this.maxTrophy = 0;
        this.reset();
        this.endGameState = false;
        this.goldMax = 1000;
        this.elixirMax = 1000;
        this.darkElixirMax = 1000;
        this.setUpResource(1000, 1000, 1000, 1000);
    },

    getResourceBattleLayer: function () {
        if (this._resourceBattleLayer === null) {
            this._resourceBattleLayer = new ResourceBattleLayer();
        }
        // this._resourceBattleLayer.update();
        return this._resourceBattleLayer;
    },

    addResToStructure: function () {
        this._objectByID.forEach(function (structure, key) {
            if (structure.type == STRUCTURE.GOLD_STORAGE) {

                cc.log("Structure" + structure.type + " " + structure.resource);
            }
            if (structure.type == STRUCTURE.ELIXIR_STORAGE) {

                cc.log("Structure" + structure.type + " " + structure.resource);
            }
            if (structure.type == STRUCTURE.DARK_ELIXIR_STORAGE) {

                cc.log("Structure" + structure.type + " " + structure.resource);
            }
        });
        this._objectByID.forEach(function (structure, key) {
            if (structure.type == STRUCTURE.TOWN_HALL) {

                cc.log("TownHall" + structure.type + " " + structure.goldSto + " " + structure.elixirSto + " " + structure.darkElixirSto);
            }
        });
    },

    updateResource: function (gold, elixir, darkElixir) {
        this.gold -= gold;
        this.elixir -= elixir;
        this.darkElixir -= darkElixir;
        let user = User.getInstance();
        let userGold = user.getGold() + gold;
        let userElixir = user.getElixir() + elixir;
        let userDarkElixir = user.getDarkElixir() + darkElixir;
        let maxGold = MapController.getInstance().getStorageCapacity(STRUCTURE.GOLD_STORAGE);
        let maxElixir = MapController.getInstance().getStorageCapacity(STRUCTURE.ELIXIR_STORAGE);
        let maxDarkElixir = MapController.getInstance().getStorageCapacity(STRUCTURE.DARK_ELIXIR_STORAGE);
        if (userGold > maxGold) userGold = maxGold;
        if (userElixir > maxElixir) userElixir = maxElixir;
        if (userDarkElixir > maxDarkElixir) userDarkElixir = maxDarkElixir;
        user.setGold(userGold);
        user.setElixir(userElixir);
        user.setDarkElixir(userDarkElixir);
    },

    setUpResource: function (gold, elixir, darkElixir, trophy) {
        this.gold = gold;
        this.elixir = elixir;
        this.darkElixir = darkElixir;
        this.maxTrophy = trophy;
    },

    reset: function () {
        jsb.fileUtils.writeStringToFile("res/logs.txt\n", "res/logs.txt");
        this.endGameState = false;
        this._objectByID = new Map();
        this._map = {
            id: Arrays.create2DArray(42, 42, -1),
            wall: Arrays.create2DArray(42, 42, -1),
            obstacles: Arrays.create2DArray(42, 42, -1)
        }
        this._wall = [];
        this.destroyHalf = false;
        this.townHallDestroy = false;
        this._listStructure = [];
        this.numberOfDefense = 0;
        this.numberOfStructures = 0;
        this._listTroop = [];
        this._listTroopUsed = new Map([
            [TROOP.WARRIOR, 0],
            [TROOP.ARCHER, 0],
            [TROOP.GIANT, 0],
            [TROOP.FLYING_BOOM, 0],
        ]);

        if (this._noticeLayer != null) this._noticeLayer.reset();
        TroopFactory.resetId();
        this._listWallIsDestroyed = [];
        this._tick = -1;
        this._startedTick = -1;
        this.offline = false;
        this.star = 0;
        this.totalHitPoint = 0;
    },

    copy: function () {
        let listEntity = MapController.getInstance()._objectByID;
        this.numberOfCopyEntity = 0;
        for (let i = 0; i < 2000; i++) {
            let entity = listEntity[i];
            if (entity !== undefined && entity !== null) {
                let type = entity.type;
                if (type.substring(0, 3) === "OBS") {
                    type = "OBS";
                }
                let attribute = {};
                cc.log(entity);
                attribute.id = entity.id;
                attribute.level = entity.level;
                attribute.state = 0;
                attribute.time = 0;
                attribute.x = entity.position.x;
                attribute.y = entity.position.y;
                attribute.type = entity.type;
                cc.log(JSON.stringify(attribute));
                this.initEntity(type, attribute, 1000, 1000, 1000);
                this.numberOfCopyEntity += 1;
            }
        }
    },

    findMatch: function () {
        if (this._isLoading) return;
        this._isLoading = true;
        Loading.getInstance().loading();
        this.reset();
        testnetwork.connector.sendFindMatch();
    },

    findDone: function () {
        // process
        cc.log("load done");
        this._isLoading = false;
        Loading.getInstance().loadingDone(Loading.getInstance().createBattleLayer.bind(Loading.getInstance()));
        this._mapBattle.render();
        this.handleWall();
        // this.addResToStructure();
        this._selectTroopLayer.loadListTroop();
    },

    attackYourSelf: function () {
        // save user info
        this.savePoint = {};
        this.savePoint.userGold = User.getInstance().getGold();
        this.savePoint.userElixir = User.getInstance().getElixir();
        this.savePoint.userDarkElixir = User.getInstance().getDarkElixir();
        this.savePoint.trophy = User.getInstance().trophy;

        Loading.getInstance().loading();
        this.reset();
        this.copy();
        // this.updateResource(1000*this.numberOfCopyEntity,1000*this.numberOfCopyEntity,1000*this.numberOfCopyEntity);
        this.listTroopCanUse = [
            {type: TROOP.WARRIOR, quantity: 200},
            {type: TROOP.ARCHER, quantity: 200},
            {type: TROOP.GIANT, quantity: 200},
            {type: TROOP.FLYING_BOOM, quantity: 200},
        ]
        Loading.getInstance().loadingDone(Loading.getInstance().createBattleLayer.bind(Loading.getInstance()));
        this._mapBattle.render();
        this.handleWall();
        this._selectTroopLayer.loadListTroop();
        this.offline = true;
    },

    readData: function () {
        let packet = Loading.getInstance().packet;
        packet.n = packet.getInt();
        cc.log(packet.n + " Entity");
        p = [];
        s = {};
        for (i = 0; i < packet.n; i++) {
            id = packet.getInt();
            type = packet.getString();
            x = packet.getInt();
            y = packet.getInt();
            level = packet.getInt();
            state_ = packet.getInt();
            time = packet.getInt();
            var state = 0;
            if (NumberUtils.getBitAt(state_, 0)) {
                state = NumberUtils.setBit(state, 1);
                if (packet.level != 1) {
                    state = NumberUtils.setBit(state, 2);
                }
            } else {
                state = NumberUtils.setBit(state, 2);
            }
            if (type.substring(0, 3) === "OBS")
                MapController.getInstance().initEntity(STRUCTURE.OBSTACLE, {
                    id: id,
                    x: x,
                    y: y,
                    time: time,
                    state: state,
                    type: type
                });
            else
                MapController.getInstance().initEntity(type, {
                    id: id,
                    x: x,
                    y: y,
                    level: level,
                    state: state,
                    time: time
                })
        }
    },

    setListTroop: function (listTroop) {
        this.listTroopCanUse = listTroop;
    },

    getListTroop: function () {
        // let listTroop = [];
        // let mapTroop = MapController.getInstance().getListTroop();
        // for (let [type, quantity] of mapTroop) {
        //     if (quantity > 0) {
        //         listTroop.push({type: type, quantity: quantity});
        //     }
        // }
        // this.listTroopCanUse = [{type: TROOP.ARCHER, quantity: 100}];
        return this.listTroopCanUse;
    },

    update: function () {
        this.tickGame++;
        if (this.endGameState) return;
        if (this.numberOfStructures === 0) return;
        this._selectTroopLayer.update();
        this._resourceBattleLayer.update();
        this._resourceLayer.update();

        // updateState send to server
        this._tick += 1;
        if (this._startedTick !== -1 && (this._startedTick - this._tick) % (BATCH_REQUEST_DURATION / GAME_TICK) === 0) {
            if (!this.offline) testnetwork.connector.sendDropTroop(this._troopListToSend);
            this._troopListToSend = [];
        }

        // notify troop if wall is destroyed
        if (this._listWallIsDestroyed.length !== 0) {
            for (let i = 0; i < this._listTroop.length; i++) {
                this._listTroop[i].notifyWallIsDestroy(this._listWallIsDestroyed);
            }
            this._listWallIsDestroyed = [];
        }

        // updateState structure
        for (let i = 0; i < this._listTroop.length; i++) {
            this._listTroop[i].update();
        }
        // updateState structure
        this._objectByID.forEach(function (value, key) {
            if (!value.destroyState) {
                value.updateMau();
                if (value.targetType === TARGET_TYPE.DEFENSE) {
                    value.update();
                }
            }

        });
        // handle map battle event
        this._mapBattle.updateTouchState();
        this._numTickToDropTroop -= 1;
        if (this._mapBattle.mode === TOUCH_MODE.DROP_TROOP && this._numTickToDropTroop <= 0) {
            this.handleDropTroopEvent(this._mapBattle.touchPosition);
            this._numTickToDropTroop = Math.floor(TIME_TO_DROP_TROOP / GAME_TICK);
        } else if (this._mapBattle.mode === TOUCH_MODE.DROP_ONE) {
            this.handleDropTroopEvent(this._mapBattle.getDropPosition());
        }

        if (this.numberOfStructures === 0 || this._totalTroop === 0) {
            this.endGame();
        }

        // update notice
        this._noticeLayer.update();
    },

    setListTroop: function (listTroop) {
        let totalTroop = 0;
        listTroop.forEach(function (item) {
            totalTroop += item.quantity;
        })
        this._totalTroop = totalTroop;
        this.listTroopCanUse = listTroop;
    },
    getTarget: function (troopPosition, targetType) {
        let index = -1;
        let minDistance = 100000;
        if (this.numberOfStructures === 0) return null;
        for (let i = 0; i < this._listStructure.length; i++) {
            let structure = this._listStructure[i];
            if (structure.destroyState === false && structure.targetType >= targetType) {
                let distance = NumberUtils.getEulerDistance(structure.position, troopPosition);
                if (distance < minDistance) {
                    index = i;
                    minDistance = distance;
                }
            }
        }
        if (index === -1 || index === this._listStructure.length) return null;
        return this._listStructure[index];
    },

    handleDropTroopEvent: function (tilePosition) {
        // check and get available drop position
        tilePosition = this._getAvailablePosition(tilePosition);
        if (tilePosition === null) {
            this._noticeLayer.showNotice("Cant drop army too close to the buildings!");
            return;
        }

        // handle drop troop
        let troopSelected = this._selectTroopLayer.getTroopSelect();
        if (troopSelected === null) {
            this._noticeLayer.showNotice("Choose a army to drop!");
        } else if (troopSelected.state === false) {
            this._noticeLayer.showNotice("Run out of " + TROOP_NAME.get(troopSelected.type) + ". Choose other army");
        } else {
            if (this._selectTroopLayer.count < 0) this._selectTroopLayer.count = 0;
            BattleController.getInstance().getSelectTroopLayer()._findMatch.setVisible(false);
            BattleController.getInstance().getSelectTroopLayer()._imvResult.setVisible(true);
            let troop = TroopFactory.createTroop(troopSelected.type, 1, tilePosition);
            this._mapBattle.putTroopToMap(troop);
            this._listTroop.push(troop);
            this._listTroopUsed.set(troop.type, this._listTroopUsed.get(troop.type) + 1);
            // cc.log(String(this._tick), "DROP TROOP\t: id", String(troop.id), " type:", troop.type, " x:", String(troop.position.x), " y:", String(troop.position.y));
            // Push Troop to send to server
            if (this._startedTick === -1) {
                this._startedTick = this._tick = 0;
            }
            this._troopListToSend.push({
                "id": troop.id,
                "type": troop.type,
                "pos": {
                    "x": troop.position.x,
                    "y": troop.position.y
                },
                "time": this._tick - this._startedTick
            });

            // Battle Log: Drop Troop
            this.logDropTroop(troop);
            //cc.log(1 + " " + (this._tick-this._startedTick) + " " + troop.type + " " + troop.id + " " + 100 + " " + troop.position.x + " " + troop.position.y);
        }
    },

    _getAvailablePosition: function (tilePosition) {
        let x = tilePosition.x;
        let y = tilePosition.y;
        if (x < 0) tilePosition.x = 0;
        else if (x >= MAP_SIZE.x) tilePosition.x = MAP_SIZE.x - 1;
        if (y < 0) tilePosition.y = 0;
        else if (y >= MAP_SIZE.y) tilePosition.y = MAP_SIZE.y - 1;
        // check available drop position
        for (let i = 0; i < 8; i++) {
            let direction = DELTA_POSITION.get(i);
            x = Math.floor(tilePosition.x + direction.x);
            y = Math.floor(tilePosition.y + direction.y);
            if (x >= 0 && y >= 0 && x < MAP_SIZE.x && y < MAP_SIZE.y && this._map.id[x][y] !== -1 && this._map.obstacles[x][y] !== 1) {
                cc.log("cant drop troop on structure");
                return null;
            }
        }

        x = Math.floor(tilePosition.x);
        y = Math.floor(tilePosition.y);
        if (this._map.obstacles[x][y] === 1) {
            let obstacle = this._objectByID.get(this._map.id[x][y]);
            let dx = tilePosition.x - obstacle.position.x;
            let dy = tilePosition.y - obstacle.position.y;
            if (dx === 0 || dx === obstacle.size.x || dy === 0 || dy === obstacle.size.y) {
                return tilePosition;
            }
            tilePosition.x = obstacle.position.x;
        }

        return tilePosition;
    },

    noticeStructureIsDestroyed: function (id) {
        cc.log("Update Structure");
        let structure = this._objectByID.get(id);
        if (structure.type == STRUCTURE.TOWN_HALL && !this.townHallDestroy) {
            this._selectTroopLayer.updateStar(++this.star);
            this.townHallDestroy = true;
        }
        Arrays.fillArray(this._map.id, structure.position, structure.size, -1);
        if (structure.type === STRUCTURE.WALL) {
            // save list wall is destroyed to notify troop
            this._listWallIsDestroyed.push(structure);
            Arrays.fillArray(this._map.wall, structure.position, structure.size, -1);
        } else {
            this.numberOfStructures -= 1;
            cc.log("update1111");
            this.totalHitPoint -= structure.hitPointMax;
            this._selectTroopLayer.updateHitPoint(this.totalHitPoint / this.totalHitPointMax);
            if (this.totalHitPoint / this.totalHitPointMax <= 0.5 && !this.destroyHalf) {
                this.destroyHalf = true;
                this._selectTroopLayer.updateStar(++this.star);
            }
            if (structure.targetType === TARGET_TYPE.DEFENSE) {
                this.numberOfDefense -= 1;
            }
            Arrays.fillArray(this.mapIIW, structure.position, structure.size, -1);
        }
        if (this.numberOfStructures == 0) {
            this._selectTroopLayer.updateStar(++this.star);
        }
    },

    noticeTroopIsDied: function () {
        this._totalTroop -= 1;
    },

    getSelectTroopLayer: function (reset = false) {
        if (this._selectTroopLayer === null) {
            this._selectTroopLayer = new SelectTroopLayer();
        }
        if (reset) this._selectTroopLayer.reset();
        return this._selectTroopLayer;
    },

    getResourceLayer: function () {
        if (this._resourceLayer === null) {
            this._resourceLayer = new ResourceLayer();
        }
        this._resourceLayer.update();
        return this._resourceLayer;
    },

    getNoticeLayer: function () {
        if (this._noticeLayer == null) {
            this._noticeLayer = new NoticeLayer();
            this._noticeLayer.retain();
        }
        return this._noticeLayer;
    },

    getMapBattle: function () {
        if (this._mapBattle === null) {
            this._mapBattle = new MapBattle();
        }
        return this._mapBattle;
    },

    convertTilePositionToPixelPosition: function (tilePosition) {
        let posInTileMap = this._mapBattle._tileMap.convertTilePositionToNodeSpace(tilePosition);
        let position = cc.p(posInTileMap.x * TILE_MAP_SCALE - this._mapBattle._tileMap.width / 2 * TILE_MAP_SCALE + this._mapBattle._tileMap.x,
            posInTileMap.y * TILE_MAP_SCALE - this._mapBattle._tileMap.height / 2 * TILE_MAP_SCALE + this._mapBattle._tileMap.y);
        return position;
    },

    initEntity: function (type, attributes, gold, elixir, dElixir) {
        var newEntity = EntityFactory.createEntity(type, attributes);
        newEntity.retain();
        if (type == STRUCTURE.GOLD_STORAGE) {
            newEntity.resource = gold;
        }
        if (type == STRUCTURE.ELIXIR_STORAGE) {
            newEntity.resource = elixir;
            cc.log(type + "a====" + elixir);
        }
        if (type == STRUCTURE.DARK_ELIXIR_STORAGE) {
            newEntity.resource = dElixir;
        }
        if (type == STRUCTURE.TOWN_HALL) {
            newEntity.goldSto = gold;
            newEntity.elixirSto = elixir;
            newEntity.darkElixirSto = dElixir;
        }
        if (newEntity.id !== -1) {
            Arrays.fillArray(this._map.id, newEntity.position, newEntity.size, newEntity.id);
            this._objectByID.set(newEntity.id, newEntity);
            if (type === STRUCTURE.WALL) {
                this._wall.push(newEntity);
                this._map.wall[newEntity.position.x][newEntity.position.y] = newEntity.id;
                Arrays.fillArray(this._map.id, newEntity.position, newEntity.size, -2);
            } else if (type !== STRUCTURE.OBSTACLE) {
                this._listStructure.push(newEntity);
                this.totalHitPoint += newEntity.hitPoint;
                this.numberOfStructures += 1;
                // TODO: cal total hp structure
                if (newEntity.targetType === TARGET_TYPE.DEFENSE) {
                    this.numberOfDefense += 1;
                }
            } else if (type === STRUCTURE.OBSTACLE) {
                Arrays.fillArray(this._map.obstacles, newEntity.position, newEntity.size, 1);
            }
        }
        this.totalHitPointMax = this.totalHitPoint;
        return newEntity;
    },

    getAllStructure: function () {
        let result = [];
        this._objectByID.forEach(function (value, key) {
            result.push(value);
        });
        return result;
    },

    getAllWall: function () {
        return this._wall;
    },

    getWallByPosition: function (position) {
        let id = this._map.wall[position.x][position.y];
        // cc.log("id walll ", id);
        // cc.log(this._objectByID.get(id));
        return this._objectByID.get(id);
    },

    getMapId: function () {
        return this._map.id;
    },

    getMapWall: function () {
        return this._map.wall;
    },

    getEntityById: function (id) {
        return this._objectByID.get(id)
    },

    getMapIdIgnoreWall: function () {
        if (this.mapIIW === undefined) {
            this.mapIIW = Arrays.create2DArray(this._map.id.length, this._map.id[0].length);
            for (let i = 0; i < this._map.id.length; i++) {
                for (let j = 0; j < this._map.id[i].length; j++) {
                    if (this._map.id[i][j] === -2)
                        this.mapIIW[i][j] = -1;
                    else this.mapIIW[i][j] = this._map.id[i][j];
                }
            }
        }
        return this.mapIIW;
    },

    handleWall: function () {
        let mapWall = this.getMapWall();
        for (let i = 0; i < MAP_SIZE.x; i++) {
            for (let j = 0; j < MAP_SIZE.y; j++) {
                if (mapWall[i][j] !== -1) {

                    let wall = this.getEntityById(mapWall[i][j]);
                    // add neighbor
                    let x = wall.position.x;
                    let y = wall.position.y;
                    let xMin = x - RANGE_NEIGHBOR;
                    let yMin = y - RANGE_NEIGHBOR;
                    let xMax = x + RANGE_NEIGHBOR;
                    let yMax = y + RANGE_NEIGHBOR;
                    if (xMin < 0) xMin = 0;
                    if (xMax >= MAP_SIZE.x) xMax = MAP_SIZE.x - 1;
                    if (yMin < 0) yMin = 0;
                    if (yMax >= MAP_SIZE.y) yMax = MAP_SIZE.y - 1;
                    for (let h = xMin; h <= xMax; h++) {
                        for (let k = yMin; k <= yMax; k++) {
                            if (mapWall[h][k] !== -1) {
                                let neighborWall = BattleController.getInstance().getEntityById(mapWall[h][k]);
                                if (neighborWall.id !== wall.id) {
                                    wall.listNeighbor.push(neighborWall);
                                }
                            }
                        }
                    }
                }
            }
        }

    },

    endGame: function () {
        testnetwork.connector.sendLog(this._logs);
        this._startedTick = -1;
        if (!this.offline) testnetwork.connector.sendEndGame(this._troopListToSend, this._tick - this._startedTick);
        else {
            Loading.getInstance().createBattleEndLayer();
            this.endGameState = true;
            //
            User.getInstance().setGold(this.savePoint.userGold);
            User.getInstance().setElixir(this.savePoint.userElixir);
            User.getInstance().setDarkElixir(this.savePoint.userDarkElixir);
            User.getInstance().trophy = (this.savePoint.trophy);
            return;
        }
        this._troopListToSend = [];
        this.endGameState = true;
        cc.log("set list troop used");
        MapController.getInstance().resetListTroop(this._listTroopUsed);
        // run end game screen
    },

    mapShaking: function () {
        var moveUp = cc.moveBy(0.1, 10, 10);
        if (this._mapBattle.getNumberOfRunningActions() == 0) {
            this._mapBattle.runAction(cc.sequence(
                moveUp,
                moveUp.reverse(),
                moveUp,
                moveUp.reverse()
            ))
        }
    },

    logDropTroop: function (troop) {
        var textValue = jsb.fileUtils.getStringFromFile("res/logs.txt");
        textValue += "1 " + (this._tick - this._startedTick) + " " + troop.type + " " + troop.id + " " + troop.position.x + " " + troop.position.y + "\n";
        jsb.fileUtils.writeStringToFile(textValue, "res/logs.txt");
        this._logs.push({
            "type": 1,
            "time": this._tick - this._startedTick,
            "tType": troop.type,
            "tId": troop.id,
            "tHp": troop.hitPoint,
            "tX": troop.position.x,
            "tY": troop.position.y
        })
    },

    logDestroyTroop: function (troop) { // 5 - time - troopType - troopID - troopHP - troopX - troopY
        var textValue = jsb.fileUtils.getStringFromFile("res/logs.txt");
        textValue += "5 " + (this._tick - this._startedTick) + " " + troop.type + " " + troop.id + " " + troop.position.x + " " + troop.position.y + "\n";
        jsb.fileUtils.writeStringToFile(textValue, "res/logs.txt");
        this._logs.push({
            "type": 5,
            "time": this._tick - this._startedTick,
            "tType": troop.type,
            "tId": troop.id,
            "tHp": 0,
            "tX": troop.position.x,
            "tY": troop.position.y
        })
    },

    logDestroyStructure: function (structure) { // 6 - time - structureType - ID - HP - sX - xY
        var textValue = jsb.fileUtils.getStringFromFile("res/logs.txt");
        textValue += "6 " + (this._tick - this._startedTick) + " " + structure.type + " " + structure.id + " " + structure.position.x + " " + structure.position.y + "\n";
        jsb.fileUtils.writeStringToFile(textValue, "res/logs.txt");
        this._logs.push({
            "type": 6,
            "time": this._tick - this._startedTick,
            "sType": structure.type,
            "sId": structure.id,
            "sHp": structure.hitPoint,
            "sX": structure.position.x,
            "sY": structure.position.y
        });
    }
});

var BattleController = (function () {
    var controller = null;
    return {
        getInstance: function () {
            if (controller == null) {
                controller = new _BattleController();
            }
            return controller;
        },
        reset: function () {
            controller = null;
        }
    }
})();