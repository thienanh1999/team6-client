/**
 * Created by GSN on 7/9/2015.
 */

var Direction =
    {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    };
var ScreenNetwork = cc.Layer.extend({
    name: "network",
    ctor: function () {
        this._super();
        var size = cc.director.getVisibleSize();
        //
        var yBtn = 2 * size.height / 3;

        this._layer = ccs.load("logingui/MainScene.json", '').node;
        this.addChild(this._layer);
        Responsive.center(this._layer,1.1);
        var buttonLogin = this._layer.getChildByName("LoginButton");
        var id = cc.sys.localStorage.getItem("id");
        if (id != null)
            this._layer.getChildByName("TextField_1").setString(id);
        buttonLogin.setPressedActionEnabled(true);
        buttonLogin.addClickEventListener(this.onSelectLogin.bind(this));


        // var p=cc.TextFieldTTF();
        // p.get
        this.lblLog = gv.commonText(fr.Localization.text(""), size.width * 0.4, size.height * 0.05);
        this.addChild(this.lblLog);
        this._addBuildVersion();

        this._debugLayer = ccs.load("guilayer/NetworkDebug.json", '').node;
        this._debugLayer.retain();
        var button = this._debugLayer.getChildByName("populateButton");
        this._populateUserBtn = button.clone();
        this._populateUserBtn.attr({
            x: this.width * 0.3,
            y: this.height * 0.7
        });
        this.addChild(this._populateUserBtn);
        this._populateUserBtn.setPressedActionEnabled(true);
        this._populateUserBtn.addClickEventListener(function() {
            testnetwork.connector.sendPopulateUser();
        })

    },

    onSelectBack: function (sender) {
        fr.view(ScreenMenu);
    },
    onSelectLogin: function (sender) {
        // cloud
        Loading.getInstance().loading();

        //error
        this.lblLog.setString("Start Connect!");
        var id = this._layer.getChildByName("TextField_1").getString();
        cc.sys.localStorage.setItem("id",id);
        this._onSelectLogin(id);
    },
    _onSelectLogin: function(id) {
        User.getInstance().setId(id);
        testnetwork.connector.setUserID(id);
        gv.gameClient.connect();
    },
    onSelectDisconnect: function (sender) {
        this.lblLog.setString("Coming soon!");
    },
    onSelectReconnect: function (sender) {
        this.lblLog.setString("Coming soon!");
    },
    onConnectSuccess: function () {
        this.lblLog.setString("Connect Success!");
    },
    onConnectFail: function (text) {
        this.lblLog.setString("Connect fail: " + text);
    },
    onFinishLogin: function () {
        this.lblLog.setString("Finish login!");
    },

    _addBuildVersion: function () {
        var lbBuildVersion = ccui.Text();
        lbBuildVersion.attr({
            anchorX: 0,
            anchorY: 0.5,
            x: 10,
            y: 100,
            string: BUILD_VERSION,
            fontSize: 25
        })
        this.addChild(lbBuildVersion);
    }
});