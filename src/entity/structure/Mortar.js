var Mortar = Defense.extend({
    size: cc.p(3, 3),
    type: STRUCTURE.MORTAR,

    ctor: function (id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        path = ResourceRouter.getAttackPath(this.type, this.level);
        cc.log("path1:" + path);
        this._listAnimationStructure = Animation.createAnimation(5, path + "/image00", 5, 0.5, 275, 356);
    },
    getIdlePath: function (level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getBasePath: function (level) {
        return null;
    },
    ani: function (x, y,time) {
        // cc.log("Mortar fire");
        // this._baseSprite.runAction(this._listAnimationStructure[1]);
        BattleController.getInstance().getMapBattle().createMortarBullet(this.position.x, this.position.y, x, y,time);
    }
});
Mortar.LEVEL = [[0, 0], [-140, -180], [-150, -150], [-150, -150], [-150, -150], [-150, -150]]