var ArcherTower = Defense.extend({
    size: cc.p(3,3),
    type: STRUCTURE.ARCHER_TOWER,

    ctor: function(id, level, state, buildingTime, position) {
        this._super(id, level, state, buildingTime, position, this.getIdlePath(level));
        this._defense_base.attr({
            anchorY: 0.25
        });
        this._baseSprite.attr({
            anchorX: 0.48
        })
        path = ResourceRouter.getAttackPath(this.type, this.level);
        cc.log("path1:" + path);
        this._listAnimationStructure = Animation.createAnimation(13, path + "/image00", 5, 0.4, 300, 300);
    },

    getIdlePath: function(level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    getBasePath: function(level) {
        return "buildings/defense_base/def_2_" + level + "_shadow.png";
    },
    ani: function (x,y,time) {
        BattleController.getInstance().getMapBattle().createArrow(this.position,x,y,time)
    }
});