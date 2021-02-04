/**
 * Created by Fresher_Dev on 12/2/2020.
 */
var MainLayer = cc.Layer.extend({

    name: "game_scene",
    ctor:function() {
        cc.log("Create Main Layer");

        this._super();

        //
        let timeStartBattle = MapController.getInstance().timeStartBattle;
        if (timeStartBattle !== null) {
            let deltaTime = (new Date()).getTime() - timeStartBattle;
            MapController.getInstance().update(Math.trunc(deltaTime / 1000));
        }
        //

        this._mapLayer = MapController.getInstance().getMapLayer();
        this.addChild(this._mapLayer);
        this._toolLayer = new ToolLayer();
        this.addChild(this._toolLayer);
        this._resourceLayer = new ResourceLayer();
        this.addChild(this._resourceLayer);
        this._userLayer = new UserLayer();
        this.addChild(this._userLayer);
        this._popupLayer = new PopupLayer.getInstance();
        this.addChild(this._popupLayer,100000);
        this.statesLayer = new StatesLayer();
        this.addChild(this.statesLayer);
        this._cheat= new CheatLayer();
        this._cheat.setVisible(false);
        this.addChild(this._cheat);
        MapController.getInstance().setResourceLayer(this._resourceLayer);
        MapController.getInstance().setStateLayer(this.statesLayer);
        MapController.getInstance().setUserLayer(this._userLayer);

        // init train troop
        MapController.getInstance().updateResourceGUI();
        this.statesLayer.updateArmy();
        this.statesLayer.updateBuilder();
        this._userLayer.update();


        var version = cc.LabelTTF();
        version.attr({
            anchorX: 0,
            font: "16px 'Arial'",
            color: cc.color(0, 0, 0),
            x: 5,
            y: cc.winSize.height - 10,
            string: "Version " + BUILD_VERSION
        });
        this.addChild(version);

    },

    openShop:function(){
        var selectingObject = MapController.getInstance().getMapLayer().selectedObject;
        if (selectingObject != null && NumberUtils.getBitAt(selectingObject.state, 0)) {
            selectingObject.onCancelBuild();
        }

        this._toolLayer.hide();
        ShopController.getInstance().displayShop();
    },
    closeShop:function(){
        ShopController.getInstance().close();
        this._toolLayer.unhide();
    }
});