var FlyingBoom = Troop.extend({
    ctor: function (id, level, position) {
        this.type = TROOP.FLYING_BOOM;
        this.name = "Flying Boom";
        this.sizeH = 120;
        this._super(id, level, position);
        this._targetType = TARGET_TYPE.DEFENSE;
        this.boom = null;
    },


    _updateZIndex: function () {
        this.zIndex = this.position.x * this.position.x + this.position.y * this.position.y + 20;
    },

    notifyWallIsDestroy: function (listWall) {
    },

    _getPathAndTarget: function () {
        return this._findPathToTarget(true);
    },

    _createBoom: function () {
        this.boom = cc.Sprite();
        this.boom.anchorY = 0.3;
        this.boom.scale = TILE_MAP_SCALE;
        this.boomAnimation = Animation.createSingleAnimation(BATTLE_RESOURCE.EXPLOSION, 10, 220, 250);
        BattleController.getInstance().getMapBattle()._mapLayer.addChild(this.boom);
        // this.boom.runAction(cc.Animate(this.boomAnimation));
    },

    _checkAvailablePosition: function (position, mapId) {
        let x = position.x;
        let y = position.y;
        if (x >= 0 && x < this.mapHeight && y >= 0 && y < this.mapWidth) {
            return true;
        }
        return false;
    },

    _runAnimationAttack: function () {
        this._super();
        this.boom.runAction(cc.sequence(
            cc.delayTime(this.delayAttackTime),
            cc.fadeIn(0),
            cc.Animate(this.boomAnimation),
            cc.fadeOut(0)
        ));
    },

    _resetBoom: function () {
        let targetPosition = BattleController.getInstance().convertTilePositionToPixelPosition(cc.p(this.target.position.x + this.target.size.x / 2, this.target.position.y + this.target.size.x / 2));
        this.boom.attr({
            x: targetPosition.x,
            y: targetPosition.y,
            z: this.target.position.x * this.target.position.x + this.target.position.y * this.target.position.y + 1
        })
    },

    _calAttackDirection: function () {
        this._attackDir = this._super();
        if (this.boom === null) this._createBoom();
        this._resetBoom();
        return this._attackDir;
    }

})