var _ActionLayer = cc.LayerColor.extend({

    ctor: function() {
        let  viewSize =cc.director.getVisibleSize();
        this._super(cc.color(255, 0, 0, 0), viewSize.width, ACTION_LAYER.HEIGHT);

        this._actionLayer = ccs.load(ACTIONS.ACTION_LAYER,'').node;
        this._actionLayer.retain();

        this._info = this._actionLayer.getChildByName("info").clone();
        this._info.setPressedActionEnabled(true);
        this._upgrade = this._actionLayer.getChildByName("upgrade").clone();
        this._upgrade.setPressedActionEnabled(true);
        this._train = this._actionLayer.getChildByName("train").clone();
        this._train.setPressedActionEnabled(true);
        this._research = this._actionLayer.getChildByName("research").clone();
        this._research.setPressedActionEnabled(true);
        this._harvestGold = this._actionLayer.getChildByName("harvestGold").clone();
        this._harvestGold.setPressedActionEnabled(true);
        this._harvestElixir = this._actionLayer.getChildByName("harvestElixir").clone();
        this._harvestElixir.setPressedActionEnabled(true);
        this._harvestDarkElixir = this._actionLayer.getChildByName("harvestDarkElixir").clone();
        this._harvestDarkElixir.setPressedActionEnabled(true);
        this._remove = this._actionLayer.getChildByName("remove").clone();
        this._remove.setPressedActionEnabled(true);
        this._cancelBuild = this._actionLayer.getChildByName("cancelBuild").clone();
        this._cancelBuild.setPressedActionEnabled(true);
        this._quickFinish = this._actionLayer.getChildByName("quickFinish").clone();
        this._quickFinish.setPressedActionEnabled(true);
        this._selectLine = this._actionLayer.getChildByName("select_line").clone();
        this._selectLine.setPressedActionEnabled(true);

        this.addChild(this._info); this._info.setVisible(false);
        this.addChild(this._upgrade); this._upgrade.setVisible(false);
        this.addChild(this._train); this._train.setVisible(false);
        this.addChild(this._research); this._research.setVisible(false);
        this.addChild(this._harvestGold); this._harvestGold.setVisible(false);
        this.addChild(this._harvestElixir); this._harvestElixir.setVisible(false);
        this.addChild(this._harvestDarkElixir); this._harvestDarkElixir.setVisible(false);
        this.addChild(this._remove); this._remove.setVisible(false);
        this.addChild(this._cancelBuild); this._cancelBuild.setVisible(false);
        this.addChild(this._quickFinish); this._quickFinish.setVisible(false);
        this.addChild(this._selectLine); this._selectLine.setVisible(false);

        this._actions = [this._info, this._upgrade, this._train, this._research, this._harvestGold, this._harvestElixir,
            this._harvestDarkElixir, this._remove, this._cancelBuild, this._quickFinish, this._selectLine];

        this.btnSize = cc.size(this._info.width, this._info.height);

        this.title = cc.LabelBMFont("Object", FONT.SOJI_16);
        this.title.attr({
            x: viewSize.width/2,
            anchorY: 0,
            y: this.btnSize.height
        });
        this.addChild(this.title);
    },

    setBtnAction: function(object) {
        var self = this;

        this._upgrade.addClickEventListener(function() {
            PopupLayer.getInstance().popupInfo(true, object.type, object.level, object.size);
        });
        this._train.addClickEventListener(function() {
            let id = MapController.getInstance().getMapLayer().selectedObject.id;
            cc.log("barrack id :"+id);
            MapController.getInstance().barrackManage.displayTrainTroopLayer(id);
        });
        this._quickFinish.addClickEventListener(function() {
            var mapController = MapController.getInstance();

            var structure = mapController.getMapLayer().selectedObject;
            var timeLeft = structure.updateTimeLabel(TimeUtils.getTimeStamp());
            var cost = mapController.timeTransferG(timeLeft);
            var userG = User.getInstance().getG();

            self.hide();
            if (cost > userG) {
                PopupLayer.getInstance().popupChargeG();
            } else {
                mapController.executeCostResource({
                    g: cost
                });
                var builder;
                var builders = mapController._map.structure.get(STRUCTURE.BUILDER_HUT);
                for (var i in builders) {
                    var item = builders[i];
                    if (structure == item.building) {
                        builder = item;
                        break;
                    }
                }
                testnetwork.connector.sendUpgradeFast(structure.id, builder.id);
                structure.onCancelSelect();
                structure.onBuildSuccess();
                self.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.callFunc(function () {
                        self.display(this);
                        structure.onSelect();
                    })
                ))
            }
        });
        this._remove.addClickEventListener(function() {
            var obstacle = MapController.getInstance().getMapLayer().selectedObject;
            obstacle.remove();
            self.hide();
        });
        this._harvestGold.addClickEventListener(function() {
            var mine = MapController.getInstance().getMapLayer().selectedObject;
            mine.harvest();
        });
        this._harvestElixir.addClickEventListener(function() {
            var mine = MapController.getInstance().getMapLayer().selectedObject;
            mine.harvest();
        });
        this._harvestDarkElixir.addClickEventListener(function() {
            var mine = MapController.getInstance().getMapLayer().selectedObject;
            mine.harvest();
        });
        this._info.addClickEventListener(function() {
            PopupLayer.getInstance().popupInfo(false, object.type, object.level, object.size);
        });
        this._cancelBuild.addClickEventListener(function() {
            PopupLayer.getInstance().popupCancelBuilding();
        });
        this._selectLine.addClickEventListener(function() {
            var wall = MapController.getInstance().getMapLayer().selectedObject;
            var x = wall.position.x;
            var y = wall.position.y;
            var walls = MapController.getInstance().findWallLine(x, y);
            for (var i in walls) {
                var item = walls[i];
                //item.batchSelect();
            }
        });
    },

    disableButton: function(button) {
        button.setTouchEnabled(false);
        button.setOpacity(100);
        button.runAction(
            cc.tintTo(0, 100, 100, 100)
        );
    },

    enableButton: function(button) {
        button.runAction(
            cc.tintTo(0, 255, 255, 255)
        );
        button.setOpacity(255);
        button.setTouchEnabled(true);
    },

    display: function(object) {
        if (this._object == object)
            return;

        this.stopAllActions();

        // Render Layer & Move Action
        if (this._object == null) {
            this._object = object;
            this.addBtnToLayer();
            this.runAction(cc.moveTo(0.25, 0, 0));
        } else {
            this.runAction(cc.sequence(
                cc.moveTo(0.125, 0, -ACTION_LAYER.HEIGHT),
                cc.callFunc(function(){
                    this._object = object;
                    this.addBtnToLayer();
                }.bind(this)),
                cc.moveTo(0.25, 0, 0)
            ))
        }

        // Set title
        if (object.level != null)
            this.title.setString(object.name + " Level " + object.level);
        else
            this.title.setString(object.name);

        // Disable Buttons
        this.disableButtons();
    },

    // TODO: Find right way to disable button
    disableButtons: function() {
        var object = MapController.getInstance().getMapLayer().selectedObject;
        if (object != null) {
            switch (object.type) {
                case STRUCTURE.GOLD_MINE:
                case STRUCTURE.ELIXIR_MINE:
                case STRUCTURE.DARK_ELIXIR_MINE:
                    object.updateCollectButton();
                    break;
            }
        }
    },

    removeBtns: function() {
        for (var i in this._actions) {
            this._actions[i].setVisible(false);
        }
    },

    addBtnToLayer: function() {
        this.removeBtns();
        var btns = this.getBtnList();
        var start = (this.width - btns.length*100)/2;
        for (var i in btns) {
            var btn = btns[i];
            btn.setVisible(true);
            btn.attr({
                x: start + i*100 + btn.width/2,
                y: btn.height/2
            })
        }
        var object = MapController.getInstance().getMapLayer().selectedObject;
        this.setBtnAction(object);
    },

    hide: function() {
        this._object = null;
        this.stopAllActions();
        this.runAction(cc.moveTo(0.25, 0, -ACTION_LAYER.HEIGHT));
    },

    getBtnList: function() {
        var result = [];
        var object = MapController.getInstance().getMapLayer().selectedObject;
        var listBtn = object.getListAction();
        for (var i in listBtn) {
            var actionID = listBtn[i]["ACTION"];
            var cost = listBtn[i]["COST"] || null;
            var btn = this._actions[actionID];
            btn = this.cleanBtn(btn);

            if (cost != null)
                btn = this.addCost(btn, cost);
            result.push(btn);
        }
        return result;
    },

    addCost: function(btn, cost) {
        var gold = cost["gold"] || 0;
        var elixir = cost["elixir"] || 0;
        var dElixir = cost["darkElixir"] || 0;
        var g = cost["g"] || 0;

        var total = (gold > 0) + (elixir > 0) + (dElixir > 0);
        var count = 0;
        var user = User.getInstance();
        var isEnough = false;

        if (gold > 0) {
            isEnough = user.checkEnoughGold(gold);
            this._addIcon(btn.getChildByName("goldIcon"), gold, total, count, isEnough);
            count += 1;
        }
        if (elixir > 0) {
            isEnough = user.checkEnoughElixir(elixir);
            this._addIcon(btn.getChildByName("elixirIcon"), elixir, total, count, isEnough);
            count += 1;
        }
        if (dElixir > 0) {
            isEnough = user.checkEnoughDarkElixir(dElixir);
            this._addIcon(btn.getChildByName("darkElixirIcon"), dElixir, total, count, isEnough);
            count += 1;
        }
        if (g > 0) {
            isEnough = user.checkEnoughG(g);
            this._addIcon(btn.getChildByName("gIcon"), g, total, count, isEnough);
        }

        return btn;
    },

    _addIcon: function(icon, amount, total, current, enough) {
        icon.getChildByName("amount").setString(StringUtil.convertNumberToStringWithCommas(amount));
        if (!enough)
            icon.getChildByName("amount").setColor(cc.color.RED);
        var size = GuiUtils.getIconSize(icon);
        icon.setVisible(true);
        icon.attr({
            x: (this.btnSize.width - size.width)/2 + (size.width - icon.width/2),
            y: ((total-1)/2 - current) * size.height + this.btnSize.height * 0.85
        })
    },

    cleanBtn: function(btn) {
        var gold = btn.getChildByName("goldIcon");
        var elixir = btn.getChildByName("elixirIcon");
        var dElixir = btn.getChildByName("darkElixirIcon");
        var g = btn.getChildByName("gIcon");

        if (gold != null)
            gold.setVisible(false);
        if (elixir != null)
            elixir.setVisible(false);
        if (dElixir != null)
            dElixir.setVisible(false);
        if (g != null)
            g.setVisible(false);

        return btn;
    }
});

var ActionLayer = (function(){
    var actionLayer = null;
    return {
        getInstance:function(){
            if (actionLayer==null){
                actionLayer = new _ActionLayer();
            }
            return actionLayer;
        },
        reset: function() {
            actionLayer = null;
        }
    }
})();