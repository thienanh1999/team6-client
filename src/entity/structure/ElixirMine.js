var ElixirMine = Mine.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.ELIXIR_MINE,
    collectRes: COLLECT.COLLECT_ELIXIR,
    fullRes: COLLECT.FULL_ELIXIR,
    labelColor: cc.color(204, 52, 235),
    NUMBER_OF_BUBBLE: 5,

    ctor: function(id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        this.createHarvestEffect();
    },

    createHarvestEffect: function() {
        this._harvestBubbles = [this.NUMBER_OF_BUBBLE];
        for (var i = 0; i < this.NUMBER_OF_BUBBLE; i++) {
            this._harvestBubbles[i] = new cc.Sprite(EFFECT.HARVEST_ELIXIR[i]);
            this._harvestBubbles[i].opacity = 0;
            this.addChild(this._harvestBubbles[i]);
            this._harvestBubbles[i].setLocalZOrder(4);
        }
    },

    addResource: function(amount) {
        var maxElixir = MapController.getInstance().getStorageCapacity(STRUCTURE.ELIXIR_STORAGE);
        var userElixir = User.getInstance().getElixir();
        User.getInstance().setElixir(Math.min(maxElixir, userElixir+amount));
        MapController.getInstance().updateResourceGUI();
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getListAction: function() {
        var result = this._super();
        if (!NumberUtils.getBitAt(this.state, 1)) {
            result.push({"ACTION":ACTION_LAYER.HARVEST_ELIXIR});
        }
        return result;
    },
    updateCollectButton: function() {
        var amount = this.calculateRes();
        var actionLayer = ActionLayer.getInstance();
        var button = actionLayer._harvestElixir;
        if (amount == 0) {
            actionLayer.disableButton(button);
        } else {
            actionLayer.enableButton(button);
        }
    },
    runHarvestEffect: function() {
        for (var i = 0; i < this.NUMBER_OF_BUBBLE; i++) {
            var bubble = this._harvestBubbles[i];
            if (bubble.getNumberOfRunningActions() != 0)
                return;
            bubble.attr({
                x: this.width/2,
                y: this.height/2
            });
            var y = Math.random() * 100 + 150;
            var x = Math.random() * 50 * (i-2);
            bubble.runAction(cc.sequence(
                cc.fadeIn(0.4),
                cc.fadeOut(0.4)
            ));
            bubble.runAction(cc.sequence(
                cc.moveBy(0.4, x, y),
                cc.moveBy(0.4, x, -50)
            ))
        }
    }
});
