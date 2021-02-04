var DarkElixirStorage = Storage.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.DARK_ELIXIR_STORAGE,
    NUMBER_OF_BUBBLE: 5,

    ctor: function (id, level, state, buildingTime, position, resource) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level), resource);
        this.createHarvestEffect();
    },

    getIdlePath: function (level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    createHarvestEffect: function () {
        this._harvestBubbles = [this.NUMBER_OF_BUBBLE];
        for (var i = 0; i < this.NUMBER_OF_BUBBLE; i++) {
            this._harvestBubbles[i] = new cc.Sprite(EFFECT.HARVEST_DARK_ELIXIR[i]);
            this._harvestBubbles[i].opacity = 0;
            this.addChild(this._harvestBubbles[i]);
            this._harvestBubbles[i].setLocalZOrder(4);
        }
    },

    runHarvestEffect: function () {
        for (var i = 0; i < this.NUMBER_OF_BUBBLE; i++) {
            var bubble = this._harvestBubbles[i];
            if (bubble.getNumberOfRunningActions() != 0)
                return;
            bubble.attr({
                x: this.width / 2,
                y: this.height / 2
            });
            var y = Math.random() * 100 + 150;
            var x = Math.random() * 50 * (i - 2);
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