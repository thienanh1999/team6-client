var GoldStorage = Storage.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.GOLD_STORAGE,
    NUMBER_OF_COIN_DROP: 5,

    ctor: function (id, level, state, buildingTime, position, resource) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level), resource);
        this.capacity = ConfigAPI.getInstance().getEntityInfo(STRUCTURE.GOLD_STORAGE, level)["capacity"];
        this.createCoinDropAnimation();
    },

    createCoinDropAnimation: function () {
        var config = EFFECT.COIN_DROP;
        var nFrames = config.NFRAMES;
        var path = EFFECT.ROOT + "/" + config.RES;

        var aniFrames = [];
        var str = "";
        var sframe;
        for (var i = 0; i < nFrames; i++) {
            if (i < 10)
                str = path + "/0" + i + ".png";
            else
                str = path + "/" + i + ".png";
            sframe = new cc.SpriteFrame(str, cc.rect(0, 0, config.W, config.H));
            aniFrames.push(sframe);
        }
        var animation = new cc.Animation(aniFrames, 0.1);
        this._coindropSprite = [this.NUMBER_OF_COIN_DROP];
        var ani = cc.animate(animation);
        ani.retain();

        for (var i = 0; i < this.NUMBER_OF_COIN_DROP; i++) {
            this._coindropSprite[i] = new cc.Sprite();
            this._coindropSprite[i].setLocalZOrder(4);
            this.addChild(this._coindropSprite[i]);
            var animate = ani.clone();
            this._coindropSprite[i].runAction(animate.repeatForever());
            this._coindropSprite[i].opacity = 0;
        }
    },

    runHarvestEffect: function () {
        for (var i = 0; i < this.NUMBER_OF_COIN_DROP; i++) {
            var coindrop = this._coindropSprite[i];
            if (coindrop.getNumberOfRunningActions() != 1)
                return;
            coindrop.attr({
                x: this.width / 2,
                y: this.height / 2
            });
            var y = Math.random() * 100 + 150;
            var x = Math.random() * 50 * (i - 2);
            coindrop.runAction(cc.sequence(
                cc.fadeIn(0.4),
                cc.fadeOut(0.4)
            ));
            coindrop.runAction(cc.sequence(
                cc.moveBy(0.4, x, y),
                cc.moveBy(0.4, x, -50)
            ))
        }
    },

    getIdlePath: function (level) {
        return ResourceRouter.getIdlePath(this.type, level);
    }
});