var GrassLayer = cc.Layer.extend({
    _mapping: new Map(),

    ctor: function(size) {
        this._super(size);
    },

    createGrass: function(structure) {
        var size = structure.size;
        var grass;
        if (structure.canMove) {
            grass = new cc.Sprite(MAP.BUILDING_BG[size.x-1]);
            grass.attr({
                x: structure.x,
                y: structure.y
            });
        } else {
            grass = new cc.Sprite(MAP.OBSTACLE_BG[size.x-2]);
            grass.attr({
                x: structure.x,
                y: structure.y
            });
        }

        this.addChild(grass);
        this._mapping.set(structure, grass);
    },

    move: function(structure) {
        var grass = this._mapping.get(structure);
        grass.attr({
            x: structure.x,
            y: structure.y
        })
    },

    destroy: function(structure) {
        var grass = this._mapping.get(structure);
        grass.removeFromParent(true);
    }
});
