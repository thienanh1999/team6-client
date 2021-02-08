var Mine = Structure.extend({
    lastHarvestTime: null,
    harvest_effect: [],

    ctor: function(id, level, state, buildingTime, position, idle) {
        this._super(id, level, state, buildingTime, position, idle);
        if (!NumberUtils.getBitAt(state, 1) && buildingTime != 0) {
            this.lastHarvestTime = buildingTime;
        }
        var config = ConfigAPI.getInstance().getEntityInfo(this.type, level);
        this.capacity = config["capacity"];
        this.createHarvestEffect();
        this.loadPopup();
        this.createHarvestLabel();
    },

    createHarvestLabel: function() {
        this._harvestLabel = cc.LabelBMFont(100, FONT.SOJI_16);
        this._harvestLabel.attr({
            x: this.width/2,
            y: this.size.y * TILE_HEIGHT/2,
            color: this.labelColor
        });
        this.addChild(this._harvestLabel);
        this._harvestLabel.setLocalZOrder(COLLECT_CONSTANT.LOCAL_Z_ORDER);
        this._harvestLabel.setVisible(false);
    },

    loadPopup: function() {
        var popupLayer = ccs.load(COLLECT.COLLECT_LAYER,'').node;
        popupLayer.retain();
        this._collectPopup = popupLayer.getChildByName(this.collectRes).clone();
        this._collectPopup.attr({
            x: this.width/2,
            y: this.size.y * TILE_HEIGHT/2
        });
        this._collectPopup.setLocalZOrder(COLLECT_CONSTANT.LOCAL_Z_ORDER);
        this._collectPopup.setVisible(false);
        this.addChild(this._collectPopup);

        this._fullPopup = popupLayer.getChildByName(this.fullRes).clone();
        this._fullPopup.attr({
            x: this.width/2,
            y: this.size.y * TILE_HEIGHT/2
        });
        this._fullPopup.setLocalZOrder(COLLECT_CONSTANT.LOCAL_Z_ORDER);
        this._fullPopup.setVisible(false);
        this.addChild(this._fullPopup);
    },

    loadConfig: function(config) {
        this.capacity = config["capacity"];
        this.productivity = config["productivity"];
        this.hitpoints = config["hitpoints"];
    },

    createHarvestEffect: function() {},

    onSelect: function() {
        this._super();
        if (!NumberUtils.getBitAt(this.state, 1)) {
            this.harvest();
        }
    },

    harvest: function() {
        var amount = this.calculateRes();
        if (amount > 0) {
            this.addResource(amount);
            this.runHarvestEffect();
            testnetwork.connector.sendCollect(this.id);

            // Animation
            this._harvestLabel.setString(Math.floor(amount));
            this._harvestLabel.y = this.size.y * TILE_HEIGHT/2;
            this._harvestLabel.setVisible(true);
            this._harvestLabel.runAction(cc.moveTo(0.5, cc.p(this.width/2, this.size.y * TILE_HEIGHT/2 + 50)));
            this._harvestLabel.runAction(cc.sequence(
                cc.delayTime(0.6),
                cc.FadeOut(0.5),
                cc.fadeIn(0),
                cc.callFunc(function(){
                    this._harvestLabel.setVisible(false);
                }.bind(this))
            ));

            this.lastHarvestTime = TimeUtils.getTimeStamp();
            this.displayPopup();
        }
    },

    addResource: function(amount) {},

    calculateRes: function() {
        if (this.lastHarvestTime == null)
            this.lastHarvestTime = TimeUtils.getTimeStamp();
        var productivity = ConfigAPI.getInstance().getEntityInfo(this.type, this.level)["productivity"];
        var time = TimeUtils.getTimeStamp() - this.lastHarvestTime;
        var amount = productivity * time / 3600;
        amount = Math.min(amount, this.capacity);
        //cc.log(this.lastHarvestTime + " " + time + " " + productivity + " " + amount);
        return Math.floor(amount)
    },

    onBuildSuccess: function() {
        this._super();
        this.lastHarvestTime = TimeUtils.getTimeStamp();
    },

    displayPopup: function() {
        if (NumberUtils.getBitAt(this.state, 1))
            return;

        var amount = this.calculateRes();
        if (amount >= this.capacity) {
            this._fullPopup.setVisible(true);
            this._collectPopup.setVisible(false);
        } else {
            if (amount >= this.productivity/360) { // popup in 10s after harvesting
                this._fullPopup.setVisible(false);
                this._collectPopup.setVisible(true);
            } else {
                this._fullPopup.setVisible(false);
                this._collectPopup.setVisible(false);
            }
        }
    },

    animationAttack: function() {
        this._super();
        this.runHarvestEffect();
    }
});