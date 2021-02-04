/**
 * Created by KienVN on 10/2/2017.
 */

var gv = gv || {};
var testnetwork = testnetwork || {};

testnetwork.Connector = cc.Class.extend({
    ctor: function (gameClient) {
        this.gameClient = gameClient;
        gameClient.packetFactory.addPacketMap(testnetwork.packetMap);
        gameClient.receivePacketSignal.add(this.onReceivedPacket, this);
        this._userName = "username";
        cc.log(gameClient._userId);
        this._userID = gameClient._userId;
    },
    setUserID: function (userID){
        cc.log("======================"+userID);
        this._userID=parseInt(userID);
    },
    getUserID: function (){
        return this._userID;
    },
    onReceivedPacket: function (cmd, packet) {
        switch (cmd) {
            case gv.CMD.HAND_SHAKE:
                this.sendLoginRequest();
                break;
            case gv.CMD.USER_LOGIN:
                this.sendLoadEntity();
                Loading.getInstance()._networkLayer.onFinishLogin();
                break;

            case gv.CMD.MOVESTRUCTURE:
                cc.log("Response Moved OK");

                break;
            case gv.CMD.LOADENTITY:
                cc.log("Load entity");
                // TODO: load entity

                this.sendLoadResource();
                break;
            case gv.CMD.LOADRESOURCE:
                cc.log("Load resource");
                User.getInstance().update(packet);
                this.sendLoadBarrack();
                break;
            case gv.CMD.BUILD:
                var id = packet.id;
                var ok = packet.ok;
                var builder = packet.builder;
                var x = packet.x;
                var y = packet.y;
                var mapController = MapController.getInstance();
                cc.log("Response build: " + ok + " " + id + " " + builder + " " + x + " " + y);
                var object = mapController._objectByID[builder].building;
                if (object != null) {
                    if (ok === 0 && object.id != id) {
                        object.id = id;
                        mapController.updateMap(object,object.position,true);
                    } else {
                        //mapController.removeStructure(object);
                    }
                } else {
                    cc.log("Response build: Zero time building");
                    var buildings = mapController._zeroTimeBuilings;
                    for (var i in buildings) {
                        var building = buildings[i];
                        var structure = building.structure;
                        if (building.builderID = builder) {
                            cc.log("Replace ID " + structure.id + " with " + id);
                            var index = buildings.indexOf(building);
                            if (index > -1) {
                                buildings.splice(index, 1);
                            }
                            structure.id = id;
                            mapController.updateMap(structure,structure.position,true);
                        }
                    }
                }
                break;
            case gv.CMD.UPGRADE:
                var ok = packet.ok;
                cc.log("Response Upgrade " + ok);
                if (ok != 0) {
                    gv.gameClient.onDisconnected();
                }
                break;
            case gv.CMD.TRAINTROOP:
                cc.log("Server response : Train Troop");
                break;
            case gv.CMD.DELETETRAINTROOP:
                cc.log("Server response : delete train troop");
                break;
            case gv.CMD.LOADBARRACK:
                cc.log("Server response : Load barrack");
                this.sendLoadTroop();
                break;
            case gv.CMD.LOADTROOP:
                cc.log("Server response : Load troop");
                Loading.getInstance().loadingDone(Loading.getInstance().createMainLayer.bind(Loading.getInstance()));
                break;
            case gv.CMD.UPGRADEFAST:
                var ok = packet.ok;
                cc.log("Response Upgrade Fast " + ok);
                if (ok != 0) {
                    gv.gameClient.onDisconnected();
                }
                break;
            case gv.CMD.CANCEL:
                var ok = packet.ok;
                cc.log("Response Cancel Build " + ok);
                break;
            case gv.CMD.DELETE:
                var ok = packet.ok;
                cc.log("Response Delete Obstacle " + ok);
                if (ok != 0) {
                    gv.gameClient.onDisconnected();
                }
                break;
            case gv.CMD.COLLECT:
                var ok = packet.ok;
                var currentRes = packet.currentRes;
                var resType = packet.resType;
                cc.log("Response Collect: " + ok + " new balance: " + currentRes + " type of " + resType);
                if (ok != 0) {
                    gv.gameClient.onDisconnected();
                } else {
                    var user = User.getInstance();
                    var mapController = MapController.getInstance();
                    switch (resType) {
                        case 0:
                            if (user.getGold() != currentRes) {
                                user.setGold(currentRes);
                                mapController.updateResourceGUI();
                            }
                            break;
                        case 1:
                            if (user.getElixir() != currentRes) {
                                //user.setElixir(currentRes);
                                //mapController.updateResourceGUI();
                            }
                            break;
                        case 2:
                            if (user.getDarkElixir() != currentRes) {
                                user.setDarkElixir(currentRes);
                                mapController.updateResourceGUI();
                            }
                            break;
                    }
                }
                // TODO: Identify packet to know what kind of rss is
                break;
            case gv.CMD.GETTIME:
                var time = packet.time;
                // cc.log("Response Get time " + time);
                MapController.getInstance().getTimeManager().update(time);
                break;
            // case gv.CMD.GETTIME:
            //     cc.log("Get time " + packet.time);
            //     break;
            case gv.CMD.FASTTRAIN:
                cc.log("fastTrain : " + packet.ok);
                break;
            case gv.CMD.FIND_MATCH:
                var id = packet.id;
                cc.log("Response Find Match " + id);
                Loading.getInstance().loadingDone(Loading.getInstance().createBattleLayer.bind(Loading.getInstance()));
                break;
            case gv.CMD.POPULATE_USER:
                var ok = packet.ok;
                cc.log("Response Populate User " + ok);
                break;
            case gv.CMD.END_GAME:
                cc.log("Response End Game");
                Loading.getInstance().createBattleEndLayer();
                var battleEnd = Loading.getInstance()._battleEndLayer;
                battleEnd.setState(packet.trophy, packet.gold, packet.elixir, packet.darkElixir);
                for (var i in packet.troop) {
                    battleEnd.setTroop(i, packet.troop[i]["type"], packet.troop[i]["amount"]);
                }
                User.getInstance().trophy += packet.trophy;
                MapController.getInstance().userLayer.update();
                cc.log("Tro", User.getInstance().trophy)
                break;
        }
    },
    sendGetUserInfo: function () {
        cc.log("sendGetUserInfo");
        var pk = this.gameClient.getOutPacket(CmdSendUserInfo);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendLoginRequest: function () {
        cc.log("sendLoginRequest");
        var pk = this.gameClient.getOutPacket(CmdSendLogin);
        pk.pack(this._userName, this._userID);
        this.gameClient.sendPacket(pk);
    },
    sendMove: function (id,posx,posy) {
        cc.log("Send Move: " + id + " " + posx + " " + posy);
        var pk = this.gameClient.getOutPacket(CmdSendMove);
        pk.pack(id,posx,posy);
        this.gameClient.sendPacket(pk);
    },
    sendLoadEntity: function () {
        cc.log("Send Load Entity");
        var pk = this.gameClient.getOutPacket(CmdLoadEntity);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendBuild: function (type, x, y, builder) {
        cc.log("Send build " + type + " at " + x + " " + y + " with builder " + builder);
        var pk = this.gameClient.getOutPacket(CmdSendBuild);
        pk.pack(type, x, y, builder);
        this.gameClient.sendPacket(pk);
    },
    sendLoadResource: function (){
        cc.log("Send load Res");
        var pk =this.gameClient.getOutPacket(CmdSendLoadRes);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendUpgrade:function (idStructure,idBuilder){
        cc.log("Send Upgrade Request: " + idStructure + " " + idBuilder);
        var pk= this.gameClient.getOutPacket(CmdSendUpgrade);
        pk.pack(idStructure,idBuilder);
        this.gameClient.sendPacket(pk);
    },

    sendUpgradeFast:function (idStructure,idBuilder){
        cc.log("Send Upgrade Fast: " + idStructure + " builder " + idBuilder);
        var pk= this.gameClient.getOutPacket(CmdSendUpgradeFast);
        pk.pack(idStructure,idBuilder);
        this.gameClient.sendPacket(pk);
    },

    // train troop
    sendLoadBarrack:function (){
        cc.log("Send load barrack queue");
        let packet = this.gameClient.getOutPacket(CmdLoadBarrack)
        packet.pack();
        this.gameClient.sendPacket(packet);
    },
    sendLoadTroop:function (){
        cc.log("Send load troop");
        let packet = this.gameClient.getOutPacket(CmdLoadTroop)
        packet.pack();
        this.gameClient.sendPacket(packet);
    },
    sendTrainTroop:function (idBrack,typeTroop){
        cc.log("Train Troop");
        var pk= this.gameClient.getOutPacket(CmdSendTrainTroop);
        pk.pack(idBrack,typeTroop);
        this.gameClient.sendPacket(pk);
    },
    sendDeleteTrainTroop:function (idBrack,typeTroop){
        cc.log("Delete Train Troop");
        var pk= this.gameClient.getOutPacket(CmdSendDeleteTrainTroop);
        pk.pack(idBrack,typeTroop);
        this.gameClient.sendPacket(pk);
    },
    //________________________________________

    sendCollect:function (idStructure){
        cc.log("Send Collect Request: " + idStructure);
        var pk= this.gameClient.getOutPacket(CmdSendCollect);
        pk.pack(idStructure);
        this.gameClient.sendPacket(pk);
    },
    sendCancelBuild:function (idStructure,idBuilder){
        cc.log("Send Request Cancel Build: " + idStructure + " " + idBuilder);
        var pk= this.gameClient.getOutPacket(CmdSendCancelBuild);
        pk.pack(idStructure,idBuilder);
        this.gameClient.sendPacket(pk);
    },
    sendDeleteObstacle:function (idStructure,idBuilder){
        cc.log("Send Delete obstacle " + idStructure + " with builder " + idBuilder);
        var pk= this.gameClient.getOutPacket(CmdSendDeleteObstacle);
        pk.pack(idStructure,idBuilder);
        this.gameClient.sendPacket(pk);
    },
    sendCheat:function (gold,elixir,darkelixir,g){
        cc.log("Send Cheat");
        var pk = this.gameClient.getOutPacket(CmdSendCheat);
        pk.pack(gold,elixir,darkelixir,g);
        this.gameClient.sendPacket(pk);
    },
    sendGetTime:function (){
        // cc.log("Send Get Time");
        var pk = this.gameClient.getOutPacket(CmdSendGetTime);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendFastTrain:function (id){
        cc.log("Send Fast Train");
        var pk = this.gameClient.getOutPacket(CmdSendFastTrain);
        pk.pack(id);
        this.gameClient.sendPacket(pk);
    },
    sendPopulateUser: function() {
        cc.log("Send Populate User");
        var pk = this.gameClient.getOutPacket(CmdSendPopulateUser);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendFindMatch: function() {
        cc.log("Send Find Match");
        var pk = this.gameClient.getOutPacket(CmdSendFindMatch);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendDropTroop: function(inputs) {
        // cc.log("Send Drop Troop: " + inputs.length);
        var pk = this.gameClient.getOutPacket(CmdSendDropTroop);
        pk.pack(inputs);
        this.gameClient.sendPacket(pk);
    },
    sendLog: function(logs) {
        cc.log("Send Logs: " + logs.length);
        var pk = this.gameClient.getOutPacket(CmdSendLogs);
        pk.pack(logs);
        this.gameClient.sendPacket(pk);
    },
    sendEndGame: function(inputs, endTime) {
        cc.log("Send End Game: " + inputs.length + " " + endTime);
        var pk = this.gameClient.getOutPacket(CmdEndGame);
        pk.pack(inputs, endTime);
        this.gameClient.sendPacket(pk);
    }
});



