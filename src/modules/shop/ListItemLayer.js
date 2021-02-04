var ListItemLayer = cc.Layer.extend({

    _shopController : null,
    _layer : null,
    _listItemLayer : null,
    _resourceLayer : null,
    _iconPath : SHOP.ICON_PATH,
    ctor:function(){
        this._super();
        this._shopController = ShopController.getInstance();
        this._layer = ccs.load(SHOP.LIST_ITEM_SHOP_LAYER,'').node;
        this._layer.anchorX = 0.5;
        this._layer.anchorY = 0.5;
        this.addChild(this._layer);
        this._listItemLayer = this._layer.getChildByName("list_item_layout");
        this._resourceLayer = this._layer.getChildByName("resource_layout");
        this._itemLayer = ccs.load(SHOP.ITEM_LAYER,'').node.getChildByName("btn_item").clone();
        this._itemLayer.retain();
        Responsive.center(this._layer,SHOP_PER_SCREEN);

        // button back, close
        var btnBack = this._layer.getChildByName("btn_back");
        btnBack.addClickEventListener(this._back.bind(this));
        var btnClose = this._layer.getChildByName("btn_close");
        btnClose.addClickEventListener(this.close.bind(this));

    },



    setCategory:function(category){
        var intro = null;
        switch(category){
            case CATEGORY.TREASURES:
                // load treasures item
                intro = "Treasures";
                break;
            case CATEGORY.RESOURCES:
                this._loadStructuresItems(category);
                intro = "Resources";
                break;
            case CATEGORY.DECORATIONS:
                // load decoration item
                intro = "Decorations";
                break;
            case CATEGORY.ARMY:
                this._loadStructuresItems(category);
                intro = "Army";
                break;
            case CATEGORY.DEFENSE:
                this._loadStructuresItems(category);
                intro = "Defense";
                break;
            case CATEGORY.SHIELD:
                // load shield item
                intro = "Shield";
                break;
        }
        this._layer.getChildByName("lb_category").setString(intro);
        this._loadUserResource();
    },

    _loadStructuresItems:function(category){
        this._listItemLayer.removeAllChildren();
        //
        var mapController = MapController.getInstance();
        var configAPI = ConfigAPI.getInstance();
        var townHallLevel = mapController.getLevelTownHall();
        //

        var availableStructures = configAPI.getAllStructureAvailable(townHallLevel);
        var quantityStructures = mapController.getQuantityStructures();
        var structuresTypes = LIST_ITEM.get(category);

        structuresTypes.forEach(
            (function(structureType){
                var maxItemCanBuild = availableStructures.get(structureType);
                var numberItemBuilt = quantityStructures.get(structureType);
                if (numberItemBuilt===undefined) numberItemBuilt = 0;
                var itemLayer = this._createStructureItemButton(structureType,numberItemBuilt,maxItemCanBuild);
                this._listItemLayer.pushBackCustomItem(itemLayer);
            }).bind(this)

        );
    },

    _createStructureItemButton:function(structureType,numberItemBuilt,maxItemCanBuild){
        var itemButton = this._itemLayer.clone();

        itemButton.setPressedActionEnabled(true);
        itemButton.getChildByName("lb_cur_per_total").setString(numberItemBuilt + '/' + maxItemCanBuild);
        itemButton.getChildByName("lb_entity_name").setString(ENTITY_NAME.get(structureType));
        itemButton.getChildByName("btn_info").setPressedActionEnabled(true);
        var fileIcon = this._iconPath + structureType + ".png";
        itemButton.getChildByName("imv_entity").loadTexture(fileIcon);

        var user = User.getInstance();
        var configAPI = ConfigAPI.getInstance();
        let level = 1;
        if (structureType === STRUCTURE.BUILDER_HUT) {
            level = numberItemBuilt + 1;
        }
        var info = configAPI.getEntityInfo(structureType, level);

        // item tab
        var infoButton = itemButton.getChildByName("btn_info");
        infoButton.setPressedActionEnabled(true);
        infoButton.addClickEventListener(function() {
            PopupLayer.getInstance().popupInfo(false, structureType, level, cc.p(info["width"] || 1, info["height"] || 1));
        });

        // resource
        var lbResource = itemButton.getChildByName("lb_cost");
        var resource;
        var imvResource = itemButton.getChildByName("imv_type_resource");
        var texturePath;
        if (info["elixir"] !== undefined && info["elixir"] !== 0) {
            resource = info["elixir"];
            if (info["elixir"] > user.getElixir()) {
                lbResource.setColor(new cc.Color(255, 0, 0));
            }
            texturePath = SHOP.ICON_ELIXIR;
        } else if (info["gold"] !== undefined && info["gold"] !== 0) {
            resource = info["gold"];
            if (info["gold"] > user.getGold()) {
                lbResource.setColor(new cc.Color(255, 0, 0));
            }
            texturePath = SHOP.ICON_GOLD;
        } else if (info["darkElixir"] !== undefined && info["darkElixir"] !== 0) {
            resource = info["darkElixir"]
            if (info["darkElixir"] > user.getDarkElixir()) {
                lbResource.setColor(new cc.Color(255, 0, 0));
            }
            texturePath = SHOP.ICON_DARK_ELIXIR;
        } else if (info["coin"] !== undefined && info["coin"] !== 0) {
            resource = info["coin"];
            if (info["coin"] > user.getG()) {
                lbResource.setColor(new cc.Color(255, 0, 0));
            }
            texturePath = SHOP.ICON_G;
        }
        if (resource !== undefined) {
            lbResource.setString(StringUtil.convertNumberToStringWithCommas(resource));
            imvResource.loadTexture(texturePath);
        } else {
            itemButton.getChildByName("imv_type_resource").setVisible(false);
            lbResource.setString("FREE");
        }

        if (maxItemCanBuild === 0) {
            itemButton.setBright(false);
            itemButton.getChildByName("imv_dhc").setVisible(false);
            itemButton.getChildByName("lb_time_build").setVisible(false);
            itemButton.getChildByName("lb_cur_per_total").setVisible(false);
            itemButton.getChildByName("lb_require").setVisible(true);

            let townHallRequire = ConfigAPI.getInstance().getEntityInfo(structureType, 1)["townHallLevelRequired"];
            itemButton.getChildByName("lb_require").setString("Require town hall level " + townHallRequire);
            return itemButton;
        }
        if (numberItemBuilt >= maxItemCanBuild) {
            itemButton.setBright(false);
        } else {
            itemButton.addClickEventListener(function () {
                cc.log("Build " + ENTITY_NAME.get(structureType));
                Loading.getInstance()._mainLayer.closeShop();
                MapController.getInstance().prepareBuild(structureType);
            })
        }
        // set time build
        var timeBuild = info["buildTime"];
        if (timeBuild === undefined) timeBuild = 0;
        itemButton.getChildByName("lb_time_build").setString(StringUtil.convertTimeToString(timeBuild));
        return itemButton;
    },

    _loadUserResource:function(){
        var user = User.getInstance();
        this._resourceLayer.getChildByName("imv_gold").getChildByName("lb_gold").setString(StringUtil.convertNumberToStringWithCommas(user.getGold()));
        this._resourceLayer.getChildByName("imv_elixir").getChildByName("lb_elixir").setString(StringUtil.convertNumberToStringWithCommas(user.getElixir()));
        this._resourceLayer.getChildByName("imv_g").getChildByName("lb_g").setString(StringUtil.convertNumberToStringWithCommas(user.getG()));
    },
    

    _back:function(){
        this.setVisible(false);
        this._shopController.displayShop(false);
    },
    close:function(){
        Loading.getInstance()._mainLayer.closeShop();
    },
    clear:function (){
        this._listItemLayer.removeAllChildren();
    }
})