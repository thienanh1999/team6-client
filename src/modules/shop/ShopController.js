var _ShopController = cc.Class.extend({

    _shopLayer : null,
    _listItemLayer : null,
    _scene : null,
    _user : null,

    ctor:function(){
        this._scene = Loading.getInstance()._mainLayer;
        this._user = User.getInstance();
    },


    displayShop: function (animation = true) {
        if (this.panel == null) {
            var panel = ccs.load(TEMP_PANEL, "").node;
            panel = panel.getChildByName("panel").clone();
            let viewSize = cc.director.getVisibleSize();
            panel.attr({
                x: viewSize.width / 2,
                y: viewSize.height / 2,
                anchorX: 0.5,
                anchorY: 0.5,
                scale: Math.max(viewSize.width / panel.width, viewSize.height / panel.height)
            });
            this._scene.addChild(panel, 0);
            this.panel = panel;
        }

        this._initShopLayer();
        this._shopLayer.setVisible(true);

        // animation
        if (animation) {
            let scale = this._shopLayer.scale;
            this._shopLayer.runAction(cc.sequence(
                // cc.scaleTo(0,0.2,0.2),
                cc.scaleTo(0.16, scale * 1.1, scale * 1.1),
                cc.scaleTo(0.125, scale, scale)
            ))
        }
    },

    //
    _onCategoryButtonClick:function(category){
        this._shopLayer.setVisible(false);
        this._initListItemLayer();
        this._listItemLayer.setCategory(category);
        this._listItemLayer.setVisible(true);
    },


    _initShopLayer:function(){
        if (this._shopLayer == null){
            // create shop layer
            this._shopLayer = ccs.load(SHOP.SHOP_LAYER,'').node;
            this._shopLayer.setPosition(cc.p(DESIGN_RESOLUTION_WIDTH/2,DESIGN_RESOLUTION_HEIGHT/2));
            this._shopLayer.anchorX = 0.5;
            this._shopLayer.anchorY = 0.5;
            // close event
            var btnClose = this._shopLayer.getChildByName("btn_close");
            btnClose.addClickEventListener((function(){
                Loading.getInstance()._mainLayer.closeShop();
            }).bind(this));

            // add click listener
            var rootListView = this._shopLayer.getChildByName("root_list_view");
            // button treasures
            var btnTreasures = rootListView.getChildByName("line1").getChildByName("treasure").getChildByName("btn_treasures");
            btnTreasures.addClickEventListener(function(){cc.log("Chưa mở tính năng")});
            // button resources
            var btnResources = rootListView.getChildByName("line1").getChildByName("resources").getChildByName("btn_resources");
            btnResources.addClickEventListener(this._onCategoryButtonClick.bind(this,CATEGORY.RESOURCES));
            // button
            var btnDecorations = rootListView.getChildByName("line1").getChildByName("decorations").getChildByName("btn_decorations");
            btnDecorations.addClickEventListener(function(){cc.log("Chưa mở tính năng")});
            // button army
            var btnArmy = rootListView.getChildByName("line2").getChildByName("army").getChildByName("btn_army");
            btnArmy.addClickEventListener(this._onCategoryButtonClick.bind(this,CATEGORY.ARMY));
            // button defense
            var btnDefense = rootListView.getChildByName("line2").getChildByName("defense").getChildByName("btn_defense");
            btnDefense.addClickEventListener(this._onCategoryButtonClick.bind(this,CATEGORY.DEFENSE));
            // button shield
            var btnShield = rootListView.getChildByName("line2").getChildByName("shield").getChildByName("btn_shield");
            btnShield.addClickEventListener(function(){cc.log("Chưa mở tính năng")});
            
            // TODO: fix lỗi hiển thị mũi tên khi mở shop
            this.zOder = 1000000; // Để shop luôn hiển thị trên cùng
            this._shopLayer.setGlobalZOrder(this.zOder);
            Responsive.center(this._shopLayer,SHOP_PER_SCREEN);
            this._scene.addChild(this._shopLayer, 1);
        }
    },

    close: function () {
        this._scene.removeChild(this.panel, true);
        this.panel = null;

        let scale = this._shopLayer.scale;
        this._shopLayer.runAction(cc.sequence(
            cc.scaleTo(0.16, 0.2, 0.2),
            cc.callFunc((function () {
                this._shopLayer.setVisible(false);
            }).bind(this)),
            cc.scaleTo(0, scale, scale)
        ))
        if (this._listItemLayer !== null) {
            let scale = this._listItemLayer.scale;
            this._listItemLayer.runAction(cc.sequence(
                cc.scaleTo(0.16, 0.2, 0.2),
                cc.callFunc((function () {
                    this._listItemLayer.setVisible(false);
                    this._listItemLayer.clear();
                }).bind(this)),
                cc.scaleTo(0, scale, scale)
            ))
        }
    },

    _initListItemLayer:function(){
        if (this._listItemLayer == null){
            this._listItemLayer = new ListItemLayer(this);
            this._listItemLayer.setGlobalZOrder(this.zOder+1);
            this._scene.addChild(this._listItemLayer, 1);
        }
    },

})

var ShopController = (function(){
    var shopController = null;
    return {
        getInstance:function(){
            if (shopController===null){
                shopController = new _ShopController();
            }
            return shopController;
        },
        reset: function() {
            shopController = null;
        }
    }
})();