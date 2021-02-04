var _Loading= cc.Layer.extend({
    _networkLayer: null,
    _mainLayer: null,
    _prepareLayer: null,
    _battleLayer: null,
    _battleEndLayer: null,
    topZ: 0,

    ctor: function () {
        this._super();

        this.createCloud();
        this.createNetworkLayer();
    },
    createCloud: function() {
        let  viewSize =cc.director.getVisibleSize();

        var batchNodeLeft = new cc.SpriteBatchNode("map/cloud_1.png");
        this._left = cc.Scale9Sprite();
        this._left.updateWithBatchNode(batchNodeLeft, cc.rect(0, 0, 800, 480), false, cc.rect(400, 240, 0, 0));
        this._left.attr({
            anchorX: 1,
            x: 0,
            y: viewSize.height/2,
            scale: Math.max(viewSize.width/this._left.width, viewSize.height/this._left.height)
        });
        this.addChild(this._left, 2);

        var batchNodeRight = new cc.SpriteBatchNode("map/cloud_2.png");
        this._right = cc.Scale9Sprite();
        this._right.updateWithBatchNode(batchNodeRight, cc.rect(0, 0, 800, 480), false, cc.rect(400, 240, 0, 0));
        this._right.attr({
            anchorX: 0,
            x: viewSize.width,
            y: viewSize.height/2,
            scale: Math.max(viewSize.width/this._right.width, viewSize.height/this._right.height)
        });
        this.addChild(this._right, 2);

        this._actionIn = cc.moveTo(1, viewSize.width, viewSize.height/2);
        this._actionIn.retain();
        this._actionIn1 = cc.moveTo(1, 0, viewSize.height/2);
        this._actionIn1.retain();

        this._actionOut = cc.moveTo(1, 0, viewSize.height/2);
        this._actionOut.retain();
        this._actionOut1 = cc.moveTo(1, viewSize.width, viewSize.height/2);
        this._actionOut1.retain();

        // Create Loading Animation
        var loadingSprite = new cc.Sprite();
        loadingSprite.attr({
            x: viewSize.width/2,
            y: viewSize.height/2
        });
        this.addChild(loadingSprite, 0);
        var aniFrames = [];
        var str = "";
        var sframe;
        var path = EFFECT.ROOT + "/" + EFFECT.LOADING.RES;
        var nFrames = EFFECT.LOADING.NFRAMES;
        for (var i = 0; i < nFrames; i++) {
            if (i < 10)
                str = path + "/0" + i + ".png";
            else
                str = path + "/" + i + ".png";
            sframe = new cc.SpriteFrame(str, cc.rect(0, 0, EFFECT.LOADING.W, EFFECT.LOADING.H));
            aniFrames.push(sframe);
        }
        var animation = new cc.Animation(aniFrames, 0.1);
        loadingSprite.runAction(cc.animate(animation).repeatForever());
        this._loadingSprite = loadingSprite;
    },
    loading: function() {
        this._left.setLocalZOrder(this.topZ);
        this._left.runAction(this._actionIn);
        this._right.setLocalZOrder(this.topZ);
        this._right.runAction(this._actionIn1);
        this.topZ += 1;
        this._loadingSprite.setLocalZOrder(this.topZ);
        this.topZ += 1;
    },
    loadingDone: function (callback=null) {
        if (callback != null)
            callback();
        this._left.stopAllActions();
        this._left.setLocalZOrder(this.topZ);
        this._left.runAction(this._actionOut);
        this._right.stopAllActions();
        this._right.setLocalZOrder(this.topZ);
        this._right.runAction(this._actionOut1);
        this.topZ += 1;
    },
    switchMainLayer: function() {
        this.moveLayerToTop(this._mainLayer);
    },
    createMainLayer: function() {
        this._mainLayer = new MainLayer();
        this.addChild(this._mainLayer);
        this.moveLayerToTop(this._mainLayer);
    },
    createNetworkLayer: function() {
        if (this._networkLayer == null) {
            this._networkLayer = new ScreenNetwork();
            this.addChild(this._networkLayer);
        }
        this.moveLayerToTop(this._networkLayer);
    },
    createPrepareLayer: function() {
        if (this._prepareLayer == null) {
            this._prepareLayer = new PrepareLayer();
            this.addChild(this._prepareLayer);
        }
        this.moveLayerToTop(this._prepareLayer);
    },
    createBattleLayer: function() {
        if (this._battleLayer == null) {
            // BattleController.getInstance().reset();
            this._battleLayer = new BattleLayer();
            this.addChild(this._battleLayer);
        }
        // debug
        // BattleController.getInstance().copy(MapController.getInstance()._objectByID);
        // this.addChild(this._battleLayer, this.topZ);
        this.moveLayerToTop(this._battleLayer);
    },
    createBattleEndLayer: function() {
        this._battleEndLayer = new BattleEnd();
        this.addChild(this._battleEndLayer, this.topZ);
        this.topZ += 1;
    },
    moveLayerToTop: function(layer) {
        if (this._networkLayer != null)
            this._networkLayer.setVisible(false);
        if (this._mainLayer != null)
            this._mainLayer.setVisible(false);
        if (this._prepareLayer != null)
            this._prepareLayer.setVisible(false);
        if (this._battleLayer != null)
            this._battleLayer.setVisible(false);
        if (this._battleEndLayer != null)
            this._battleEndLayer.setVisible(false);
        layer.setVisible(true);
        layer.setLocalZOrder(this.topZ);
        this.topZ += 1;
    }
});

var Loading = (function () {
    var loading = null;
    return {
        getInstance: function () {
            if (loading == null) {
                loading = new _Loading();
            }
            return loading;
        }
    }
})();