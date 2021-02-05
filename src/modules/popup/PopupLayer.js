var _PopupLayer = cc.Layer.extend({
    // TODO: disable all other touch when popup
    swallow1Touch: false,

    ctor: function() {
        this._super();

        this._popupLayer = ccs.load(POPUP.BUILD_POPUP,'').node;
        this._popupLayer.retain();

        this.popupBuyRes = this._popupLayer.getChildByName("buyRes");
        this.goldLabel = this._popupLayer.getChildByName("goldIcon");
        this.elixirLabel = this._popupLayer.getChildByName("elixirIcon");
        this.darkElixirLabel = this._popupLayer.getChildByName("darkElixirIcon");

        this._popupYesNo = this._popupLayer.getChildByName("yesno");

        this._popupUpgradeLayer = ccs.load(POPUP.UPGRADE_POPUP, '').node;
        this._popupUpgradeLayer.retain();
        this._popupUpgradeInfo = this._popupUpgradeLayer.getChildByName("upgradePopup");

        this._slot = this._popupUpgradeLayer.getChildByName("slot");
        this._infoBar = this._popupUpgradeLayer.getChildByName("info_bar");

        this._popupAlert = this._popupLayer.getChildByName("alert");

        this._touchPanel = ccs.load(TEMP_PANEL, "").node;
        this._touchPanel.retain();
    },

    popupBuyResource: function (gold, elixir, darkElixir, g, releaseBuilder, cancelCallback, confirmCallback, prepare = true) {

        this.prepareShow();
        var popup = this.popupBuyRes.clone();

        if (releaseBuilder) {
            popup.getChildByName("title").setString("BUILDERS ARE ALL BUSY");
            popup.getChildByName("description").setString("Release a builder.");
        }

        // Add buying info
        var size;
        var total = (gold > 0) + (elixir > 0) + (darkElixir > 0);
        var count = 0;
        if (gold > 0) {
            var goldLabel = this.goldLabel.clone();
            goldLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(gold);
            popup.addChild(goldLabel);
            size = GuiUtils.getIconSize(goldLabel);
            goldLabel.attr({
                x: (popup.width - size.width) / 2 + size.width - goldLabel.width/2,
                y: ((total-1)/2 - count) * size.height + popup.height * 0.55
            });
            count += 1;
        }

        if (elixir > 0) {
            var elixirLabel = this.elixirLabel.clone();
            elixirLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(elixir);
            popup.addChild(elixirLabel);
            size = GuiUtils.getIconSize(elixirLabel);
            elixirLabel.attr({
                x: (popup.width - size.width) / 2 + size.width - elixirLabel.width/2,
                y: ((total-1)/2 - count) * size.height + popup.height * 0.55
            });
            count += 1;
        }

        if (darkElixir > 0) {
            var darkElixirLabel = this.darkElixirLabel.clone();
            darkElixirLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(darkElixir);
            popup.addChild(darkElixirLabel);
            size = GuiUtils.getIconSize(darkElixirLabel);
            darkElixirLabel.attr({
                x: (popup.width - size.width) / 2 + size.width - darkElixirLabel.width/2,
                y: ((total-1)/2 - count) * size.height + popup.height * 0.55
            });
        }

        var okBtn = popup.getChildByName("ok");
        var gIcon = okBtn.getChildByName("g");
        gIcon.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(g);
        var size = GuiUtils.getIconSize(gIcon);
        gIcon.x = (okBtn.width - size.width)/2 + size.width - gIcon.width/2;
        if (!User.getInstance().checkEnoughG(g)) {
            gIcon.getChildByName("amount").color = cc.color.RED;
        }

        var self = this;
        this.prepare = prepare;
        var acceptButton = popup.getChildByName("ok");
        acceptButton.setPressedActionEnabled(true);
        this.prepare = prepare;
        acceptButton.addClickEventListener(function () {
            if (self.prepare) {
                self.endShow();
            }
            popup.removeFromParent(true);
            if (!User.getInstance().checkEnoughG(g)) {
                this.popupChargeG();
            } else
                confirmCallback();
        }.bind(this));

        var cancelButton = popup.getChildByName("cancel");
        cancelButton.setPressedActionEnabled(true);
        cancelButton.addClickEventListener(function () {
            if (self.prepare) {
                self.endShow();
            }
            self.closeAnimation(popup);
            cancelCallback();
            // pop
        }.bind(this));

        this.addChild(popup);
        Responsive.center(popup, 0.6);
        this.openAnimation(popup);
    },

    popupChargeG: function() {
        this.prepareShow();

        var popup = this._popupYesNo.clone();

        var self = this;
        var acceptButton = popup.getChildByName("ok");
        acceptButton.setPressedActionEnabled(true);
        acceptButton.addClickEventListener(function() {
            self.endShow();
            cc.log("Coming soon!!!");
            popup.removeFromParent(true);
        }.bind(this));

        var cancelButton = popup.getChildByName("cancel");
        cancelButton.setPressedActionEnabled(true);
        cancelButton.addClickEventListener(function() {
            self.closeAnimation(popup);
            self.endShow();
        });

        this.addChild(popup);
        Responsive.center(popup, 0.6);
        this.openAnimation(popup);
    },

    // Popup to upgrade for selecting item
    popupInfo: function(upgrading, type, level, size) {
        this.prepareShow();

        var popup = this._popupUpgradeInfo.clone();
        this.addChild(popup);

        // Title
        popup.getChildByName("title").string = "Upgrade To Level " + (level+1);

        // Preview
        var preview = popup.getChildByName("demo").getChildByName("sprite");
        var levelDemo = level;
        if (upgrading) levelDemo += 1;
        var path = ResourceRouter.getIdlePath(type, levelDemo);
        var sprite = new cc.Sprite(path);
        sprite.attr({
            x: preview.x,
            y: preview.y
        });
        var width = preview.width * preview.scaleX;
        var height = preview.height * preview.scaleY;
        sprite.setScale(width/sprite.width, height/sprite.height);
        popup.getChildByName("demo").addChild(sprite);
        preview.removeFromParent(true);

        // Time
        var upgradeTime = popup.getChildByName("demo").getChildByName("upgrade");

        var configCurrent = ConfigAPI.getInstance().getEntityInfo(type, level);
        var configNext = configCurrent;
        if (upgrading)
            configNext = ConfigAPI.getInstance().getEntityInfo(type, level+1);
        var configMax = ConfigAPI.getInstance().getEntityInfo(type,
            ConfigAPI.getInstance().getMaxLevel(type));

        upgradeTime.getChildByName("time").string = StringUtil.convertTimeToString(configNext["buildTime"]);

        var listAttr = ResourceRouter.getUpgradedAttr(type);
        var iconW = 0;
        var infoW = 0;
        for (var i in listAttr) {
            var attr = listAttr[i];
            var current = configCurrent[attr["KEY"]] || 0;
            var next = configNext[attr["KEY"]] || 0;
            var max = configMax[attr["KEY"]] || 0;
            var res = attr["RES"];

            // ICON
            var icon = new cc.Sprite(res);
            Responsive.center(icon, 0.03);
            icon.attr({
                x: popup.width * 0.35,
                y: popup.height * 0.8 - i * (this._infoBar.height) - i * 10
            });
            if (iconW == 0)
                iconW = icon.width*1.5;
            icon.setScale(1.5, 1.5);
            popup.addChild(icon);

            // INFO BAR
            var info_bar = this._infoBar.clone();
            Responsive.center(info_bar, 0.15);
            info_bar.attr({
                anchorX: 0,
                x: icon.x + iconW/2,
                y: popup.height * 0.8 - i * (this._infoBar.height) - i * 10
            });
            if (infoW == 0) {
                infoW = popup.width * 0.95 - info_bar.x
            }
            info_bar.setScale(infoW/info_bar.width,infoW/info_bar.width);
            var current_percent = Math.max(5, current/max * 100);
            var current_bar = info_bar.getChildByName("current");
            current_bar.setPercent(current_percent);

            var next_bar = info_bar.getChildByName("next");
            if (next != current)
                next_bar.setPercent(current_percent + Math.max(5, (next-current)/max * 100));
            else
                next_bar.setPercent(current_percent);

            var description = info_bar.getChildByName("description");
            if (upgrading)
                description.setString(attr.NAME + ": " + StringUtil.convertNumberToStringWithCommas(current) + " + " + StringUtil.convertNumberToStringWithCommas(next-current));
            else
                description.setString(attr.NAME + ": " + StringUtil.convertNumberToStringWithCommas(current) + "/" + StringUtil.convertNumberToStringWithCommas(max));

            popup.addChild(info_bar);
        }

        var self = this;
        var acceptButton = popup.getChildByName("accept");

        if (upgrading) {
            var gold = configNext["gold"];
            var elixir = configNext["elixir"];
            var darkElixir = configNext["darkElixir"];
            var user = User.getInstance();
            var total = 0;
            if (gold > 0) total+=1;
            if (elixir > 0) total+=1;
            if (darkElixir > 0) total+=1;
            var start = (acceptButton.height - total*30)/2;
            if (gold > 0) {
                var goldLabel = this.goldLabel.clone();
                goldLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(gold);
                acceptButton.addChild(goldLabel);
                if (!user.checkEnoughGold(gold))
                    goldLabel.getChildByName("amount").color = cc.color.RED;
                total -= 1;
                goldLabel.attr({
                    anchorX: 0,
                    x: (acceptButton.width - goldLabel.width+goldLabel.getChildByName("amount").width)/2,
                    y: start + 30 * total + goldLabel.height/2
                });
            }
            if (elixir > 0) {
                var elixirLabel = this.elixirLabel.clone();
                elixirLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(elixir);
                acceptButton.addChild(elixirLabel);
                if (!user.checkEnoughElixir(elixir))
                    elixirLabel.getChildByName("amount").color = cc.color.RED;
                total -= 1;
                elixirLabel.attr({
                    anchorX: 0,
                    x: (acceptButton.width - elixirLabel.width+elixirLabel.getChildByName("amount").width)/2,
                    y: start + 30 * total + elixirLabel.height/2
                });
            }
            if (darkElixir > 0) {
                var darkElixirLabel = this.darkElixirLabel.clone();
                darkElixirLabel.getChildByName("amount").string = StringUtil.convertNumberToStringWithCommas(darkElixir);
                acceptButton.addChild(darkElixirLabel);
                if (!user.checkEnoughDarkElixir(darkElixir))
                    darkElixirLabel.getChildByName("amount").color = cc.color.RED;
                total -= 1;
                darkElixirLabel.attr({
                    anchorX: 0,
                    x: (acceptButton.width - darkElixirLabel.width+darkElixirLabel.getChildByName("amount").width)/2,
                    y: start + 30 * total + darkElixirLabel.height/2
                });
            }
            acceptButton.setPressedActionEnabled(true);
            acceptButton.addClickEventListener(function() {
                self.endShow();
                popup.removeFromParent(true);
                var object = MapController.getInstance().getMapLayer().selectedObject;
                MapController.getInstance().upgrade(object);
            });
        } else {
            acceptButton.setVisible(false);
            acceptButton.setTouchEnabled(false);
        }

        var cancelButton = popup.getChildByName("cancel");
        cancelButton.setPressedActionEnabled(true);
        cancelButton.addClickEventListener(function () {
            self.closeAnimation(popup);
            self.endShow();
        });

        Responsive.center(popup, 0.95);
        this.openAnimation(popup);
    },

    addRequirement: function(popup, type, level) {
        var current = ConfigAPI.getInstance().getEntityInfo(type, level);
        var next = ConfigAPI.getInstance().getEntityInfo(type, level+1);
        for (var key in current) {
            if (this._isStructureCode(key) && current[key] != next[key]) {
                var neww = next[key] - current[key];
                var slot = this._slot.clone();
                popup.getChildByName("requirement").pushBackCustomItem(slot);
            }
        }
        return popup;
    },

    _isStructureCode: function(key) {
        for (var id in STRUCTURES) {
            if (key == STRUCTURES[id]) {
                return true;
            }
        }
        return false;
    },

    popupInfoTroop: function (type, level) {
        this.prepareShow();
        // popup info troop
        this._popupTroopLayer = ccs.load(POPUP.INFO_TROOP, '').node;
        this.addChild(this._popupTroopLayer);
        let popup = this._popupTroopLayer;
        Responsive.center(popup, 0.9);
        popup.getChildByName("lb_troop_name").setString(TROOP_NAME.get(type));
        popup.getChildByName("imv_troop").loadTexture(TROOP_IMAGE.get(type));

        // load info
        let troopInfo = ConfigAPI.getInstance().getTroopInfo(type, level);
        // attribute
        let dame = troopInfo["damagePerSecond"];
        let hitPoint = troopInfo["hitpoints"];
        let trainingCost = troopInfo["trainingElixir"];
        let favoriteTarget = troopInfo["favoriteTarget"];
        let attackType = troopInfo["attackType"];
        let target = troopInfo["attackArea"];
        let speed = troopInfo["moveSpeed"];
        let trainingTime = troopInfo["trainingTime"];
        let housingSpace = troopInfo["housingSpace"];

        let troopMax = ConfigAPI.getInstance().getTroopInfo(type, 9);
        let maxDame = troopMax["damagePerSecond"];
        let maxHitPoint = troopMax["hitpoints"];
        let maxTrainingCost = troopMax["trainingElixir"];
        // ui
        popup.getChildByName("lb_dame").setString(dame);
        popup.getChildByName("imv_dame_bar").setScaleX(dame / maxDame);
        popup.getChildByName("lb_hitpoint").setString(hitPoint);
        popup.getChildByName("imv_hitpoint_bar").setScaleX(hitPoint / maxHitPoint);
        popup.getChildByName("lb_training_cost").setString(trainingCost);
        popup.getChildByName("imv_training_cost_bar").setScaleX(trainingCost / maxTrainingCost);

        if (favoriteTarget === "NONE") favoriteTarget = "All";
        else favoriteTarget = "Defensive buildings";
        if (attackType === 3) attackType = "Multi targets";
        else attackType = "Single target";
        if (target === 1) target = "Ground";
        else target = "Ground & Air";
        popup.getChildByName("lb_ft").setString(favoriteTarget);
        popup.getChildByName("lb_at").setString(attackType);
        popup.getChildByName("lb_t").setString(target);
        popup.getChildByName("lb_ms").setString(speed);
        popup.getChildByName("lb_tt").setString(StringUtil.convertTimeToString(trainingTime));
        popup.getChildByName("lb_hs").setString(housingSpace);

        popup.getChildByName("btn_close").setPressedActionEnabled(true);
        popup.getChildByName("btn_close").addClickEventListener(
            (function () {
                this.closeAnimation(popup);
                this.endShow();
            }).bind(this)
        )
        this.openAnimation(popup);

    },

    popupAlert: function (title, description, callback) {
        this.prepareShow();
        var popup = this._popupAlert.clone();

        // Title
        popup.getChildByName("title").setString(title);

        // Description
        popup.getChildByName("description").setString(description);

        // Accept Button
        var acceptButton = popup.getChildByName("ok");
        acceptButton.setPressedActionEnabled(true);
        var self = this;
        acceptButton.addClickEventListener(function() {
            self.closeAnimation(popup);
            self.endShow();

            if (callback != null)
                callback();
        });

        this.addChild(popup);
        Responsive.center(popup, 0.6);
        this.openAnimation(popup);
    },

    popupCancelBuilding: function() {
        this.prepareShow();
        var popup = this._popupYesNo.clone();

        // Title
        popup.getChildByName("title").setString("CANCEL UPGRADING?");

        // Description
        var description = popup.getChildByName("description");
        description.setString("Do you want to cancel upgrade?");
        var description1 = description.clone();
        description1.setString("You receive only half of resource.");
        description1.attr({
            x: description.x,
            anchorY: 1.0,
            y: description.y - description.height/2
        });
        popup.addChild(description1);

        // Accept Button
        var self = this;
        var acceptButton = popup.getChildByName("ok");
        acceptButton.getChildByName("okLabel").setString("ACCEPT");
        acceptButton.setPressedActionEnabled(true);
        acceptButton.addClickEventListener(function() {
            self.endShow();
            popup.removeFromParent(true);
            MapController.getInstance().getMapLayer().selectedObject.onCancelBuild();
        }.bind(this));

        // Cancel Button
        var cancelButton = popup.getChildByName("cancel");
        cancelButton.getChildByName("cancelLabel").setString("CLOSE");
        cancelButton.setPressedActionEnabled(true);
        cancelButton.addClickEventListener(function() {
            self.closeAnimation(popup);
            self.endShow();
        });

        this.addChild(popup);
        Responsive.center(popup, 0.6);
        this.openAnimation(popup);
    },

    openAnimation: function(popup) {
        var scale = popup.scale;
        popup.runAction(cc.sequence(
            cc.scaleTo(0.125, scale * 1.1, scale * 1.1),
            cc.scaleTo(0.125, scale, scale)
        ))
    },

    closeAnimation: function(popup) {
        var scale = popup.scale;
        popup.runAction(cc.sequence(
            cc.scaleTo(0.125, scale * 1.1, scale * 1.1),
            cc.callFunc(function(){
                popup.removeFromParent(true);
            }.bind(this))
        ))
    },

    prepareShow: function() {
        var panel = this._touchPanel.getChildByName("panel").clone();
        panel.retain();
        let  viewSize =cc.director.getVisibleSize();
        panel.attr({
            x: viewSize.width/2,
            y: viewSize.height/2,
            anchorX: 0.5,
            anchorY: 0.5,
            scale: Math.max(viewSize.width/panel.width, viewSize.height/panel.height)
        });
        this.addChild(panel);
        this.panel = panel;
    },

    endShow: function() {
        this.swallow1Touch = true;
        if (this.panel!=null)this.removeChild(this.panel, true);
    },

    createPreviewObject: function(type, level, size) {
        var path = ResourceRouter.getIdlePath(type, level);
        var sprite = new cc.Sprite(path);
        var grass = new cc.Sprite(MAP.BUILDING_BG[size.x - 1]);
        grass.attr({
            x: sprite.width / 2,
            y: sprite.height / 2,
            scale: TILE_WIDTH * size.x / grass.width
        });
        sprite.addChild(grass, -1);
        return sprite;
    },

    getPanel: function () {
        var panel = this._touchPanel.getChildByName("panel").clone();
        panel.retain();
        let viewSize = cc.director.getVisibleSize();
        panel.attr({
            x: viewSize.width / 2,
            y: viewSize.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            scale: Math.max(viewSize.width / panel.width, viewSize.height / panel.height)
        });
        return panel;
    }
});

var PopupLayer = (function(){
    var popupLayer = null;
    return {
        getInstance:function(){
            if (popupLayer==null){
                popupLayer = new _PopupLayer();
                popupLayer.retain();
            }
            return popupLayer;
        },
        reset: function() {
            popupLayer = null;
        }
    }
})();