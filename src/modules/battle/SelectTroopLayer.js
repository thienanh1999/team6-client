var MAX_LENGTH = 13;
var SelectTroopLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this._time = ccs.load(BATTLE_RESOURCE.TIME, '').node;
        Responsive.top(this._time, GRAVITY.CENTER);
        this.addChild(this._time);

        this._layer = ccs.load(BATTLE_RESOURCE.SELECT_TROOP_LAYER, '').node;
        this._lvListTroop = this._layer.getChildByName("lv_select_troop");
        this._endBattle = this._layer.getChildByName("btn_end");
        this._endBattle.setPressedActionEnabled(true);
        this._endBattle.addClickEventListener(function () {
            BattleController.getInstance().endGame();
        });
        this._findMatch = this._layer.getChildByName("btn_next");
        this._findMatch.setPressedActionEnabled(true);
        this._findMatch.addClickEventListener(
            function () {
                BattleController.getInstance().findMatch();
            }
        )
        Responsive.bottom(this._layer);
        this.addChild(this._layer);

        // result
        this._imvResult = this._layer.getChildByName("imv_result");
        this._lbPercent = this._imvResult.getChildByName("lb_percent");
        this._star1 = this._imvResult.getChildByName("imv_star1");
        this._star2 = this._imvResult.getChildByName("imv_star2");
        this._star3 = this._imvResult.getChildByName("imv_star3");
    },
    updateHitPoint:function (percent) {
        this._lbPercent.setString(Math.floor((1-percent)*100)+"%");
    },
    updateStar:function (star) {
        if (star==1) this._star1.setVisible(true);
        else if (star==2) this._star2.setVisible(true);
        else if (star==3) this._star3.setVisible(true);
    },
    update: function () {
        this.count++;
        time = 3 * 60 - this.count * GAME_TICK;
        time = Math.ceil(time);
        if (this.count > 0) {
            this._time.getChildByName("State").setString("Battle ends in:");
            if (time % 60 > 9)
                this._time.getChildByName("Time").setString(Math.floor(time / 60) + ":" + time % 60);
            else this._time.getChildByName("Time").setString(Math.floor(time / 60) + ":0" + time % 60);
            if (time <= 0) {
                BattleController.getInstance().endGameState=true;
            }
        } else {
            time = Math.ceil(-this.count*GAME_TICK);
            this._time.getChildByName("Time").setString(Math.floor(time / 60) + ":" + time % 60);
        }
    },
    loadListTroop: function () {
        this.reset();
        let listTroop = BattleController.getInstance().getListTroop();
        let i = 0;
        let nameLv;
        for (; i < MAX_LENGTH; i++) {
            nameLv = "imv_troop_" + i;
            let imv_select_troop = this._lvListTroop.getChildByName(nameLv);
            let imvType = imv_select_troop.getChildByName("imv_type");
            if (i < listTroop.length) {
                let typeTroop = listTroop[i].type;
                let quantity = listTroop[i].quantity;
                let iconPath = TROOP_ICON_PATH.BATTLE_ICON + typeTroop + "_Battle.png";
                let btnSelectTroop = imvType.getChildByName("btn_select_type");
                btnSelectTroop.loadTextures(iconPath, iconPath, '');
                btnSelectTroop.setPressedActionEnabled(true);
                btnSelectTroop.setTouchEnabled(true);
                imvType.setColor(new cc.Color(255, 255, 255));
                let lbQuantity = imvType.getChildByName("lb_quantity");
                lbQuantity.setString("x" + quantity);
                imvType.setVisible(true);
                imv_select_troop.getChildByName("imv_border").setVisible(false);
                this._listTroop.push({
                    index: i,
                    type: typeTroop,
                    quantity: quantity,
                    imvType: imvType,
                    btnSelectTroop: btnSelectTroop,
                    lbQuantity: lbQuantity,
                    border: imv_select_troop.getChildByName("imv_border")
                })
                // add listener
                let index = i;
                btnSelectTroop.addClickEventListener((function () {
                    this._onBtnSelectTroopClick(index);
                }).bind(this));
            } else {
                imvType.setVisible(false);
                imv_select_troop.getChildByName("imv_border").setVisible(false);
            }
        }

    },

    _onBtnSelectTroopClick: function (index) {
        if (this.selected !== null) {
            this._listTroop[this.selected].border.setVisible(false);
        }
        if (this.selected === index) {
            this._listTroop[this.selected].border.setVisible(false);
            this.selected = null;
            return;
        }
        this.selected = index;
        this._listTroop[index].border.setVisible(true);
    },

    getTroopSelect: function () {
        if (this.selected === null) return null;
        let troopSelected = this._listTroop[this.selected];
        if (troopSelected.quantity === 0) {
            return {type: troopSelected.type, state: false};
        } else {
            let result = {type: troopSelected.type, state: true};
            troopSelected.quantity -= 1;
            troopSelected.lbQuantity.setString("x" + troopSelected.quantity);
            if (troopSelected.quantity === 0) {
                troopSelected.btnSelectTroop.setTouchEnabled(false);
                troopSelected.imvType.setColor(new cc.Color(100, 100, 100, 50));
            }
            return result;
        }
    },

    reset: function () {
        this.count = -30 / GAME_TICK;
        this._listTroop = [];
        this.selected = null;
        this._findMatch.setVisible(true);
        this._imvResult.setVisible(false);
        this._star1.setVisible(false);
        this._star2.setVisible(false);
        this._star3.setVisible(false);
        this._lbPercent.setString("0%");
    }
})