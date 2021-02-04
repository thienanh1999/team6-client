/**
 * Created by KienVN on 10/2/2017.
 */

gv.CMD = gv.CMD || {};
gv.CMD.HAND_SHAKE = 0;
gv.CMD.USER_LOGIN = 1;

gv.CMD.USER_INFO = 1001;
gv.CMD.USER_MAP = 2000;
gv.CMD.MOVE = 2001;
gv.CMD.LOADENTITY = 2010;
gv.CMD.BUILD = 2011;
gv.CMD.MOVESTRUCTURE = 2012;
gv.CMD.LOADRESOURCE = 2009;
gv.CMD.UPGRADE = 2015;
gv.CMD.CANCEL = 2013;
gv.CMD.DELETE = 2014;
gv.CMD.CHEAT = 2016;
gv.CMD.UPGRADEFAST = 2017;
gv.CMD.COLLECT = 2018;
gv.CMD.TRAINTROOP = 2019;
gv.CMD.DELETETRAINTROOP = 2020;
gv.CMD.LOADTROOP = 2021;
gv.CMD.LOADBARRACK = 2022;
gv.CMD.GETTIME=2023;
gv.CMD.FASTTRAIN=2024;

gv.CMD.FIND_MATCH = 3001;
gv.CMD.POPULATE_USER = 3002;
gv.CMD.DROP_TROOP = 3003;
gv.CMD.SEND_LOGS = 3004;
gv.CMD.END_GAME = 3005;

testnetwork = testnetwork || {};
testnetwork.packetMap = {};

/** Outpacket */

//Handshake
CmdSendHandshake = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setControllerId(gv.CONTROLLER_ID.SPECIAL_CONTROLLER);
            this.setCmdId(gv.CMD.HAND_SHAKE);
        },
        putData: function () {
            //pack
            this.packHeader();
            //updateState
            this.updateSize();
        }
    }
)
CmdSendUserInfo = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.USER_INFO);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)
//get time
CmdSendGetTime = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.GETTIME);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendLogin = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.USER_LOGIN);
        },
        pack: function (userName, userID) {
            this.packHeader();
            this.putString(userName);
            this.putInt(userID);
            this.updateSize();
        }
    }
);

CmdSendMove = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.MOVESTRUCTURE);
        },
        pack: function (id, posx, posy) {
            this.packHeader();
            this.putInt(id);
            this.putInt(posx);
            this.putInt(posy);
            this.updateSize();
        }
    }
)

CmdLoadEntity = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.LOADENTITY);
        },
        pack: function () {
            // MapController.getInstance()
            this.packHeader();
            // this.putShort(direction);
            // this.putString();
            // this.putShort(3);
            this.updateSize();
        }
    }
)
CmdSendLoadRes = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.LOADRESOURCE);
        },
        pack: function () {
            this.packHeader();
            // this.putShort(direction);
            // this.putString(type);
            // this.putInt(x);
            // this.putInt(y);
            this.updateSize();
        }
    }
)
CmdSendBuild = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BUILD);
        },
        pack: function (type, x, y, builder) {
            cc.log(type + " " + x + " " + y);
            this.packHeader();
            // this.putShort(direction);
            this.putString(type);
            this.putInt(x);
            this.putInt(y);
            this.putInt(builder);
            this.updateSize();
        }
    }
)
CmdSendDeleteTrainTroop = fr.OutPacket.extend( //idbrack type
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.DELETETRAINTROOP);
        },
        pack: function (idBrack, type) {
            // cc.log(type + " " + x + " " + y);
            this.packHeader();
            // this.putShort(direction);
            this.putInt(idBrack);
            this.putString(type);
            this.updateSize();
        }
    }
)
CmdSendUpgrade = fr.OutPacket.extend(//idStructure idBuilder
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.UPGRADE);
        },
        pack: function (idStructure, idBuilder) {
            this.packHeader();
            this.putInt(idStructure);
            this.putInt(idBuilder);
            this.updateSize();
        }
    }
)
CmdSendUpgradeFast = fr.OutPacket.extend( //idstructure id builder
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.UPGRADEFAST);
        },
        pack: function (idStructure, idBuilder) {
            this.packHeader();
            this.putInt(idStructure);
            this.putInt(idBuilder);
            this.updateSize();
        }
    }
)
CmdSendCancelBuild = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.CANCEL);
        },
        pack: function(idStructure, idBuilder) {
            this.packHeader();
            this.putInt(idStructure);
            this.putInt(idBuilder);
            this.updateSize();
        }
    }
)
CmdSendGetTime = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.GETTIME);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)
CmdSendTrainTroop = fr.OutPacket.extend( //idbrack type
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.TRAINTROOP);
        },
        pack: function (idBrack, type) {
            // cc.log(type + " " + x + " " + y);
            this.packHeader();
            // this.putShort(direction);
            this.putInt(idBrack);
            this.putString(type);
            this.updateSize();
        }
    }
)
CmdSendDeleteObstacle = fr.OutPacket.extend( //idStructure idBuilder
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.DELETE);
        },
        pack: function (idStructure, idBuilder) {
            this.packHeader();
            this.putInt(idStructure);
            this.putInt(idBuilder);
            this.updateSize();
        }
    }
)
CmdSendCollect = fr.OutPacket.extend( //idStructure
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.COLLECT);
        },
        pack: function (x) {
            this.packHeader();
            this.putInt(x);
            this.updateSize();
        }
    }
)


CmdSendTrainTroop = fr.OutPacket.extend( //idbrack type
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.TRAINTROOP);
        },
        pack: function (idBrack, type) {
            // cc.log(type + " " + x + " " + y);
            this.packHeader();
            // this.putShort(direction);
            this.putInt(idBrack);
            this.putString(type);
            this.updateSize();
        }
    }
)
CmdSendCheat = fr.OutPacket.extend( //idbrack type
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.CHEAT);
        },
        pack: function (gold,elixir,darkelixir,g) {
            // cc.log(type + " " + x + " " + y);
            this.packHeader();
            // this.putShort(direction);
            this.putInt(g);
            this.putInt(gold);
            this.putInt(elixir);
            this.putInt(darkelixir);
            this.updateSize();
        }
    }
)
// load troop
CmdLoadTroop = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.LOADTROOP);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)
// load queue barrack
CmdLoadBarrack = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.LOADBARRACK);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendFastTrain = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FASTTRAIN);
        },
        pack: function (id) {
            this.packHeader();
            this.putInt(id);
            this.updateSize();
        }
    }
)

CmdSendPopulateUser = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.POPULATE_USER);
        },
        pack: function() {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendFindMatch = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.FIND_MATCH);
        },
        pack: function() {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendDropTroop = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.DROP_TROOP);
        },
        pack: function(inputs) {
            this.packHeader();
            this.putInt(inputs.length);
            for (var i in inputs) { // type - id - x - y - time
                var input = inputs[i];
                this.putString(input["type"]);
                this.putInt(input["id"]);
                let x = input["pos"]["x"] * 10;
                let y = input["pos"]["y"] * 10;
                this.putInt(x);
                this.putInt(y);
                this.putInt(input["time"]);
            }
            this.updateSize();
        }
    }
)

CmdSendLogs = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.SEND_LOGS);
        },
        // TODO: implement send logs
        pack: function(logs) {
            this.packHeader();
            this.putInt(logs.length);
            for (var i in logs) {
                var log = logs[i];
                var type = log["type"];
                this.putInt(type);
                this.putInt(log["time"]);
                switch (type) {
                    case 1:
                        this.packTroop(log);
                        break;
                    case 5:
                        this.packTroop(log);
                        break;
                    case 6:
                        this.packStructure(log);
                        break;
                }
            }
            this.updateSize();
        },
        packTroop: function(log) {
            this.putString(log["tType"]);
            this.putInt(log["tId"]);
            this.putInt(log["tHp"]*10);
            this.putInt(log["tX"]*10);
            this.putInt(log["tY"]*10);
        },
        packStructure: function(log) {
            this.putString(log["sType"]);
            this.putInt(log["sId"]);
            this.putInt(log["sHp"]*10);
            this.putInt(log["sX"]);
            this.putInt(log["sY"]);
        }
    }
)

CmdEndGame = fr.OutPacket.extend(
    {
        ctor: function() {
            this._super();
            this.initData(1000);
            this.setCmdId(gv.CMD.END_GAME);
        },
        pack: function(inputs, endTime) {
            this.packHeader();
            this.putInt(inputs.length);
            for (var i in inputs) { // type - id - x - y - time
                var input = inputs[i];
                this.putString(input["type"]);
                this.putInt(input["id"]);
                let x = input["pos"]["x"] * 10;
                let y = input["pos"]["y"] * 10;
                this.putInt(x);
                this.putInt(y);
                this.putInt(input["time"]);
            }
            this.putInt(endTime);
            this.updateSize();
        }
    }
)
/**
 * InPacket
 */

//Handshake
testnetwork.packetMap[gv.CMD.HAND_SHAKE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.token = this.getString();
        }
    }
);

testnetwork.packetMap[gv.CMD.USER_LOGIN] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
        }
    }
);


testnetwork.packetMap[gv.CMD.USER_INFO] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.token = this.getInt();
            this.name = this.getString();
            this.x = this.getInt();
            this.y = this.getInt();
        }
    }
);
//get time
testnetwork.packetMap[gv.CMD.GETTIME] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok=this.getInt();
            this.time = this.getInt();
            cc.log(this.time);
        }
    }
);

testnetwork.packetMap[gv.CMD.MOVE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.x = this.getInt();
            this.y = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.LOADENTITY] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.n = this.getInt();
            cc.log(this.n + " Entity");
            p = [];
            s = {};
            for (i = 0; i < this.n; i++) {
                id = this.getInt();
                type = this.getString();
                x = this.getInt();
                y = this.getInt();
                level = this.getInt();
                if (level==0) level=1;
                state_ = this.getInt();
                time = this.getInt();
                var state = 0;
                if (NumberUtils.getBitAt(state_, 0)) {
                    state = NumberUtils.setBit(state, 1);
                    if (level != 1) {
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

            var countID = this.getInt();
            var mapController = MapController.getInstance();
            mapController.countID = countID;
            var arrowLayer = mapController.getMapLayer()._arrowLayer;
            arrowLayer.drawLines(mapController._map.id, mapController._objectByID);
        }
    }
);

testnetwork.packetMap[gv.CMD.UPGRADEFAST] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.FASTTRAIN] = fr.InPacket.extend(//fast train
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.BUILD] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
            this.id = this.getInt();
            this.builder = this.getInt();
            this.x = this.getInt();
            this.y = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.MOVESTRUCTURE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.id = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.LOADRESOURCE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.gold = this.getInt();
            this.elixir = this.getInt();
            this.g = this.getInt();
            this.darkElixir = this.getInt();
            this.builderNumber = this.getInt();
            this.trophy = this.getInt();
            cc.log("Trophy", this.trophy);
        }
    }
);
testnetwork.packetMap[gv.CMD.UPGRADE] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.CANCEL] = fr.InPacket.extend(
    {
        ctor: function() {
            this._super();
        },
        readData: function() {
            this.ok = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.TRAINTROOP] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.id = this.getInt();
            cc.log("_______________________ train status : " + this.id);
        }
    }
);
testnetwork.packetMap[gv.CMD.DELETETRAINTROOP] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.id = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.DELETE] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
        }
    }
);
testnetwork.packetMap[gv.CMD.COLLECT] = fr.InPacket.extend(//confirm
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok = this.getInt();
            this.currentRes = this.getInt();
            this.resType = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.LOADTROOP] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            let nTypeTroop = this.getInt();
            let listTroop = [];
            for (let i = 0; i < nTypeTroop; i++) {
                let type = this.getString();
                let quantity = this.getInt();
                listTroop.push({type: type, quantity: quantity});
            }
            cc.log("before load ", MapController.getInstance().armyCampManage._capacityUsed);
            MapController.getInstance().armyCampManage.loadTroop(listTroop);
            cc.log("before load ", MapController.getInstance().armyCampManage._capacityUsed);
        }
    }
);

// load barrack queue in packet
testnetwork.packetMap[gv.CMD.LOADBARRACK] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.nBarrack = this.getInt();
            let listBarrack = new Map();
            cc.log(this.nBarrack + " Barrack number");
            for (let i = 0; i < this.nBarrack; i++) {
                let barrack = {};
                barrack.id = this.getInt(); // get id
                barrack.timeStart = this.getInt() //time start
                barrack.timeRemaining = this.getInt();//time first troop
                barrack.queueTroop = new Map();
                let queueLength = this.getInt();
                for (let j = 0; j < queueLength; j++) {
                    barrack.queueTroop.set(this.getString(), this.getInt());
                }
                listBarrack.set(barrack.id, barrack);
            }
            MapController.getInstance().initManage();
            MapController.getInstance().barrackManage.loadBarrackQueue(listBarrack);
        }
    }
);

testnetwork.packetMap[gv.CMD.GETTIME] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.ok=this.getInt();
            this.time = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.FIND_MATCH] = fr.InPacket.extend(
    {
        ctor: function() {
            this._super();
        },
        readData: function() {
            // Load Opponent info
            this.id = this.getInt();
            this.maxTrophy = this.getInt();
            this.gold = this.getLong();
            this.elixir = this.getLong();
            this.darkElixir = this.getLong();
            // Load Map
            this.n=this.getInt();
            cc.log("Data:"+this.id+" "+this.gold+"blood="+this.n);
            for (i = 0; i < this.n; i++) {
                id = this.getInt();
                type = this.getString();
                x = this.getInt();
                y = this.getInt();
                level = this.getInt();
                state_ = this.getInt();
                time = this.getInt();
                var state = 0;

                state = NumberUtils.setBit(state, 2);
                if (type.substring(0, 3) === "OBS")
                    BattleController.getInstance().initEntity(STRUCTURE.OBSTACLE, {
                        id: id,
                        x: x,
                        y: y,
                        time: time,
                        state: state,
                        type: type
                    });
                else {
                    let g = 0;
                    let e = 0;
                    let d = 0;
                    if (type != STRUCTURE.WALL) {
                        g = this.getLong();
                        e = this.getLong();
                        d = this.getLong();
                    }
                    BattleController.getInstance().initEntity(type, {
                        id: id,
                        x: x,
                        y: y,
                        level: level,
                        state: state,
                        time: time
                    }, g, e, d);
                }
            }

            // // Load Troop
            let listTroop = [];
            var nTroopType = this.getInt();
            for (var i = 0; i < nTroopType; i++) {
                var troopType = this.getString();
                var amount = this.getInt();
                if (amount <= 0) continue;
                cc.log("troop type", troopType, " quantity: ", String(amount));
                listTroop.push({type: troopType, quantity: amount});
            }
            BattleController.getInstance().setListTroop(listTroop);
            // load battle map
            BattleController.getInstance().setUpResource(this.gold, this.elixir, this.darkElixir, this.maxTrophy);
            BattleController.getInstance().findDone();
        }
    }
);

testnetwork.packetMap[gv.CMD.POPULATE_USER] = fr.InPacket.extend(
    {
        ctor: function() {
            this._super();
        },
        readData: function() {
            this.ok = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.END_GAME] = fr.InPacket.extend(
    {
        ctor: function() {
            this._super();
        },
        readData: function() {
            this.gold = this.getLong();
            this.elixir = this.getLong();
            this.darkElixir = this.getLong();
            this.trophy = this.getInt();
            var nTroop = this.getInt();
            this.troop = [];
            for (var i= 0; i < nTroop; i++) {
                var troopType = this.getString();
                var amount = this.getInt();
                this.troop.push({
                    "type": troopType,
                    "amount": amount
                })
            }
        }
    }
);
