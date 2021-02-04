var ArrowLayer = cc.Layer.extend({
    _mapping: new Map(),

    ctor: function(size) {
        this._super(size);

        this.draw = new cc.DrawNode();
        this.addChild(this.draw, 1);
        this.draw.setVisible(false);

        this.attackRange = new cc.DrawNode();
        this.addChild(this.attackRange, 1);
    },

    drawLines: function(mapId, objectByIds) {
        this.mapId = mapId;
        this.objectByIds = objectByIds;
        this.draw.setVisible(true);
        this.draw.clear();
        var tileMap = MapController.getInstance().getMapLayer()._tileMap;

        for (var i = 0; i < 42; i++) {
            for (var j = 0; j < 42; j++) {
                var state = this.isNextToStructure(i,j);
                // right line
                if (state != this.isNextToStructure(i,j-1)) {
                    var p1 = tileMap.convertTilePositionToNodeSpace(cc.p(i,j));
                    var p2 = tileMap.convertTilePositionToNodeSpace(cc.p(i+1,j));
                    this.draw.drawSegment(this.convertFromTileMapToCurrent(p1), this.convertFromTileMapToCurrent(p2), LINE_WIDTH, cc.color(255, 255, 255));
                }
                // up line
                if (state != this.isNextToStructure(i-1,j)) {
                    var p1 = tileMap.convertTilePositionToNodeSpace(cc.p(i,j));
                    var p2 = tileMap.convertTilePositionToNodeSpace(cc.p(i,j+1));
                    this.draw.drawSegment(this.convertFromTileMapToCurrent(p1), this.convertFromTileMapToCurrent(p2), LINE_WIDTH, cc.color(255, 255, 255));
                }
            }
        }

        this.draw.stopAllActions();
        this.draw.runAction(cc.sequence(
            cc.delayTime(5),
            cc.callFunc(function(){
                this.draw.setVisible(false);
            }.bind(this))
        ))
    },

    drawAttackRange: function(center, radius) {
        this.attackRange.setVisible(true);
        this.attackRange.clear();
        this.attackRange.drawSolidCircle(center, radius, 360, 100, cc.color(230, 230, 180, 50));
        this.attackRange.drawCircle(center, radius, 360, 100, false, LINE_WIDTH, cc.color(230, 230, 200));
    },

    hideAttackRange: function() {
        this.attackRange.setVisible(false);
    },

    convertFromTileMapToCurrent: function(p) {
        var tileMap = MapController.getInstance().getMapLayer()._tileMap;
        return cc.p(tileMap.x+(p.x-tileMap.width/2)/2, tileMap.y+(p.y-tileMap.height/2)/2);
    },

    isNextToStructure: function(x, y) {
        return this.isStructureAt(x-1,y-1) || this.isStructureAt(x-1,y) || this.isStructureAt(x-1,y+1)
            || this.isStructureAt(x,y-1) || this.isStructureAt(x,y) || this.isStructureAt(x,y+1)
            || this.isStructureAt(x+1,y-1) || this.isStructureAt(x+1,y) || this.isStructureAt(x+1,y+1);
    },

    isStructureAt: function(x, y) {
        if (x <= -1 || y <= -1 || x >= 42 || y >= 42) return false;
        var id = this.mapId[x][y];
        if (id != -1 && id != null) {
            if (this.objectByIds[id].canMove)
                return true;
        }
        return false;
    },

    createArrow: function(structure) {
        var size = structure.size;
        var arrowMove = new cc.Sprite(MAP.ARROW_MOVE[size.x-1]);
        arrowMove.attr({
            x: structure.x,
            y: structure.y,
            scale: 0,
            opacity: 0
        });
        this.addChild(arrowMove);

        this._mapping.set(structure, arrowMove);
    },

    move: function(structure) {
        var grass = this._mapping.get(structure);
        grass.attr({
            x: structure.x,
            y: structure.y
        })
    },

    onSelect: function(structure) {
        var arrow = this._mapping.get(structure);
        arrow.runAction(cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION,
            TILE_WIDTH*structure.size.x/arrow.width/2, TILE_HEIGHT*structure.size.y/arrow.height/2));
        arrow.runAction(cc.fadeIn(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION));
    },

    onCancelSelect: function(structure) {
        var arrow = this._mapping.get(structure);
        arrow.runAction(cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION, 0, 0));
        arrow.runAction(cc.fadeOut(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION))
    },

    destroy: function(structure) {
        var arrow = this._mapping.get(structure);
        arrow.removeFromParent(true);
    }
});