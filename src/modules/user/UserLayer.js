var UserLayer = cc.Layer.extend({
    ctor:function (){
        this._super();
        this._layer = ccs.load(MAIN_GUI.USER_LAYER, '').node;
        this.addChild(this._layer);
        Responsive.top(this._layer, GRAVITY.LEFT);
        this._layer.getChildByName("lb_username").setString("ID:" + User.getInstance().getId());
    },
    update:function(){
        this._layer.getChildByName("lb_trophy").setString(User.getInstance().trophy);
    },
    _setPosition:function(){
        var screenSize = cc.view.getFrameSize();
        var layerSize = this._layer.getContentSize();
        this.attr({
            anchorX : 0,
            anchorY : 0,
            x : 0,
            y : screenSize.height - layerSize.height
        })
    },
    _centerStates:function(){
        var lvStates = this._layer.getChildByName("lv_states");
        lvStates.attr({
            anchorX:0.5,
            anchorY:0.5,
            x: 480*cc.view.getScaleX()
        })
    }
})