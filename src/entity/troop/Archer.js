var ANGLE_DIR = [
    135,
    180,
]
var Archer = Troop.extend({
    ctor: function (id, level, position) {
        this.type = TROOP.ARCHER;
        this.name = "Archer";
        this.sizeH = 55;
        this.arrowSpeed = 200 * BATTLE_SPEED;
        this.delayAttackTime = 0.2 / BATTLE_SPEED;
        this._super(id, level, position);
        this._targetType = TARGET_TYPE.STRUCTURE;
        this.arrow = null;
    },

    _createArrow: function () {
        this.arrow = cc.Sprite(BATTLE_RESOURCE.ARCHER_ARROW);
        this.arrow.attr({
            scale: TILE_MAP_SCALE
        });
        BattleController.getInstance().getMapBattle()._mapLayer.addChild(this.arrow);
    },

    _resetArrowDirection: function () {
        // reset direction
        if (this._attackDir !== null) {
            let posEnd = BattleController.getInstance().convertTilePositionToPixelPosition(cc.p(this.target.position.x + this.target.size.x / 2, this.target.position.y + this.target.size.x / 2));
            let posStart = BattleController.getInstance().convertTilePositionToPixelPosition(this.position);
            posStart.y += 5;
            let vector = cc.p(posEnd.x - posStart.x, posEnd.y - posStart.y);
            let distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            this.timeMoveArrow = distance / this.arrowSpeed;
            this.endArrowPoint = posEnd;
            this.midPoint = cc.p((posEnd.x + posStart.x) / 2, (posEnd.y + posStart.y) / 2 + 40);
            this.startArrowPoint = posStart;
            let rad;
            if (vector.x === 0) {
                if (y > 0) rad = Math.PI / 2;
                else rad = Math.PI / 2 + 180;
            } else rad = Math.atan(vector.y / vector.x);
            this.arrow.setRotation(90 - (rad / Math.PI * 180));
            if (vector.x < 0) {
                this.arrow.setFlippedX(true);
                this.arrow.setFlippedY(true);
            } else {
                this.arrow.setFlippedY(false);
                this.arrow.setFlippedX(false);
            }
        }
    },

    _resetArrowPosition: function () {
        if (this.arrow.getNumberOfRunningActions() > 0) this.arrow.stopAllActions();
        this.arrow.attr({
            x: this.startArrowPoint.x,
            y: this.startArrowPoint.y,
            scale: TILE_MAP_SCALE
        })
    },

    _runAnimationAttack: function () {
        this._super();
        this._resetArrowPosition();
        this.arrow.setOpacity(255);
        // this.arrow.runAction(cc.moveTo(this.timeMoveArrow, this.endArrowPoint.x, this.endArrowPoint.y));
        this.arrow.runAction(cc.sequence(
            cc.bezierTo(this.timeMoveArrow, [this.startArrowPoint, this.midPoint, this.endArrowPoint]),
            cc.fadeOut(0)
        ));
    },

    _calAttackDirection: function () {
        this._attackDir = this._super();
        if (this.arrow === null) this._createArrow();
        this._resetArrowDirection();
        return this._attackDir;
    }

})
