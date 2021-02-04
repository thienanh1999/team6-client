var BattleEnd = cc.Layer.extend({
    ctor: function () {
        BattleController.getInstance()._selectTroopLayer.setVisible(false);
        BattleController.getInstance()._resourceBattleLayer.setVisible(false);
        BattleController.getInstance()._resourceLayer.setVisible(false);
        this._super(cc.color.GREEN);
        var size = cc.director.getVisibleSize();
        //
        var yBtn = 2 * size.height / 3;
        // this.setColor(cc.c3b(144, 192, 248));
        this._layer1 = ccs.load("guilayer/End_Layer1.json", '').node;
        this._layer2 = ccs.load("guilayer/End_Layer2.json", '').node;
        this._effect = this._layer1.getChildByName("effect");
        this._elixir = this._layer1.getChildByName("elixir");
        this._darkElixir = this._layer1.getChildByName("darkE");
        this._gold = this._layer1.getChildByName("gold");
        this._cup = this._layer1.getChildByName("cup");
        this._slot = [];
        this._slot[1] = this._layer1.getChildByName("troop1");
        this._slot[2] = this._layer1.getChildByName("troop2");
        this._slot[3] = this._layer1.getChildByName("troop3");
        this._slot[0] = this._layer1.getChildByName("troop0");
        this._slot[1].setVisible(false);
        this._slot[2].setVisible(false);
        this._slot[3].setVisible(false);
        this._slot[0].setVisible(false);
        // var p= this._slot.clone();
        this._back = this._layer1.getChildByName("gohomebutton");
        this._back.setPressedActionEnabled(true);
        this._win = this._layer1.getChildByName("thang");
        // this._win.setTexture("")
        cc.log(this._effect);
        var actionBy = cc.rotateBy(1, -100);
        this._effect.runAction(cc.sequence(actionBy).repeatForever());
        Responsive.center(this._layer1, 1);
        Responsive.bottom(this._layer2, 1);
        this.addChild(this._layer2);
        this.addChild(this._layer1);
        this.end();
        this._back.addClickEventListener(function () {
            var loading = Loading.getInstance();
            loading.runAction(cc.sequence(
                cc.callFunc(function () {
                    loading.loading();
                }.bind(loading)),
                cc.delayTime(1.5),
                cc.callFunc(function () {
                    loading.switchMainLayer();
                    BattleController.getInstance()._selectTroopLayer.setVisible(true);
                    BattleController.getInstance()._resourceBattleLayer.setVisible(true);
                    BattleController.getInstance()._resourceLayer.setVisible(true);
                }),
                cc.callFunc(function () {
                    loading.loadingDone();
                })
            ))
        })
    },
    setState: function (cup, gold, elixir, darkelixir) {
        cc.log(cup + " " + gold + " " + elixir + " " + darkelixir);
        this._elixir.setString(elixir);
        this._gold.setString(gold);
        this._darkElixir.setString(darkelixir);
        this._cup.setString(cup);
    },
    setTroop: function (id, type, count) {
        // this._slot.setTexture();
        if (count == 0) return;
        var slot1 = this._slot[id];
        slot1.setVisible(true);
        slot1.getChildByName("number").setString("x" + count);
        slot1.getChildByName("image").setTexture("res/content/guis/icons/train_troop_gui/icon/" + type + ".png");
        // this.addChild(slot1);
    },
    end: function () {
        star = BattleController.getInstance().star;
        cc.log("Star", star);
        this._starLeft = this._layer1.getChildByName("saotrai");
        this._starCenter = this._layer1.getChildByName("saogiua");
        this._starRight = this._layer1.getChildByName("saophai");
        this._starLeft.setVisible(false);
        this._starCenter.setVisible(false);
        this._starRight.setVisible(false);
        if (star == 0) {
            this.win = this._layer1.getChildByName("thang");
            this.win.setTexture("/ket thuc tran/thua.png");
            return;
        }
        var actionZoom = cc.scaleBy(0.3, 1.5);
        this._starLeft.setVisible(true);
        this._starLeft.runAction(cc.sequence(
            actionZoom,
            actionZoom.reverse(),
            cc.delayTime(0.25),
            cc.callFunc(function () {
                if (star >= 2) {
                    this._starCenter.setVisible(true);
                    this._starCenter.runAction(cc.sequence(
                        actionZoom,
                        actionZoom.reverse(),
                        cc.delayTime(0.25),
                        cc.callFunc(function () {
                            if (star == 3) {
                                this._starRight.setVisible(true);
                                this._starRight.runAction(cc.sequence(
                                    actionZoom,
                                    actionZoom.reverse()));
                                cc.delayTime(0.25)
                            }
                        }.bind(this))
                    ));
                }
            }.bind(this))
        ));
    },

})