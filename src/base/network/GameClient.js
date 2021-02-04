/**
 * Created by KienVN on 5/21/2015.
 */

gv.CONTROLLER_ID = {
    SPECIAL_CONTROLLER:0
}

var GameClient = cc.Class.extend(
    {
        ctor: function () {
            this.loadConfig();

            this._tcpClient = fr.GsnClient.create();
            this._tcpClient.setFinishConnectListener(this.onFinishConnect.bind(this));
            this._tcpClient.setDisconnectListener(this.onDisconnected.bind(this));
            this._tcpClient.setReceiveDataListener(this._onReceived.bind(this));
            this.receivePacketSignal = new signals.Signal();
            this.packetFactory = new InPacketFactory();

            return true;
        },
        loadConfig: function () {
            var fileName = "ipConfig.json";
            var jsonData = cc.loader.getRes(fileName);
            // cc.log(jsonData.server);
            if (jsonData == null) {
                cc.log("Load ip config error");
            }else
            {
                this._serverName = jsonData.server;
                this._port = jsonData.port;
            }
            cc.get
        },
        getNetwork: function () {
            return this._tcpClient;
        },
        connect: function () {
            cc.log("Connect to server: " + this._serverName + ":" + this._port);
            this._tcpClient.connect(this._serverName, this._port);

        },
        sendPacket: function (pk) {
            this.getNetwork().send(pk);
            gv.poolObjects.push(pk);
        },
        getInPacket: function (cmd, pkg) {
            return this.packetFactory.createPacket(cmd, pkg);
        },
        getOutPacket: function (objClass) {
            var pk = gv.poolObjects.get(objClass);
            pk.reset();
            return pk;
        },

        onFinishConnect:function(isSuccess)
        {
            cc.log("onFinishConnect:" + isSuccess);
            if(isSuccess)
            {
                Loading.getInstance()._networkLayer.onConnectSuccess();

                var pk = gv.gameClient.getOutPacket(CmdSendHandshake);
                pk.putData();
                gv.gameClient.getNetwork().send(pk);
                gv.poolObjects.push(pk);
            }else{
                Loading.getInstance()._networkLayer.onConnectFail(gv.gameClient._serverName + ":" + gv.gameClient._port);
            }
        },
        onDisconnected:function()
        {
            // TODO: Not create again but re-render
            cc.log("onDisconnected");
            //MapController.reset();
            //ActionLayer.reset();
            //PopupLayer.reset();
            //ShopController.reset();
            //Loading.getInstance().createNetworkLayer();
        },
        _onReceived:function(cmd, pkg)
        {
            var packet = gv.gameClient.getInPacket(cmd,pkg);
            if(packet == null)
                return;
            this.onReceivedPacket(cmd,packet);
            //pool
            gv.poolObjects.push(packet);
        },
        onReceivedPacket:function(cmd, packet)
        {
            this.receivePacketSignal.dispatch(cmd, packet);
        }
    }
);