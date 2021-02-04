var Canon = Defense.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.CANON,
    ctor: function (id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        path = ResourceRouter.getAttackPath(this.type, this.level);
        cc.log("path1:" + path);
        this._listAnimationStructure = Animation.createAnimation(7, path + "/image00", 5, 0.4, 200, 252);
        // this.ani(500, 500);
        // this.destroy();
    },
    getIdlePath: function (level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getBasePath: function (level) {
        return "buildings/defense_base/def_1_" + level + "_shadow.png";
    },
    ani: function (x, y, time, dx, dy) {
        // cc.log("Canon Fire");
        // this._baseSprite.runAction(this._listAnimationStructure[1]);
        BattleController.getInstance().getMapBattle().createCanonBullet(cc.p(this.position.x + dx, this.position.y + dy), x, y, time)
    },
    moveBullet: function (x, y) {
        this._bullet.stopAllActions();
        this._bullet.runAction(cc.sequence(
            cc.moveTo(3, 500, 500),
            cc.fadeOut(0),
            cc.targetedAction(this._hit, this._hitAnimation[0])
        ));
    }
});
Canon.LEVEL = [[0, 0], [-95, -95], [-85, -115]];