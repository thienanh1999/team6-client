var TileMap = cc.TMXTiledMap.extend({

    ctor: function() {
        this._super("map/42x42map.tmx");

        this._layer = this.getLayer("bg2");

        this._drawNode = new cc.DrawNode();
        this._drawNode.setLineWidth(3);
        this._drawNode.setDrawColor(cc.color.WHITE);
        this.addChild(this._drawNode);
    },

    convertTouchToTilePosition: function (location, rounding = true) {
        var screen = this.convertToNodeSpace(location);

        var TILE_WIDTH_HALF = this._getTileWidth() / 2;
        var TILE_HEIGHT_HALF = this._getTileHeight() / 2;
        var ROOT_X = this.width / 2;
        var ROOT_Y = this.height;

        var d1 = (screen.x - ROOT_X) / TILE_WIDTH_HALF;
        var d2 = (ROOT_Y - screen.y) / TILE_HEIGHT_HALF;

        var x = (d1 + d2) / 2;
        var y = d2 - x;
        if (rounding)
            return cc.p(Math.floor(x), Math.floor(y));
        else return cc.p(NumberUtils.round(x), NumberUtils.round(y));

    },

    convertTilePositionToNodeSpace: function(tilePos) {
        var TILE_WIDTH_HALF = this._getTileWidth()/2;
        var TILE_HEIGHT_HALF = this._getTileHeight()/2;
        var ROOT_X = this.width/2;
        var ROOT_Y = this.height;

        var x = ROOT_X + TILE_WIDTH_HALF * (tilePos.x - tilePos.y);
        var y = ROOT_Y - TILE_HEIGHT_HALF * (tilePos.x + tilePos.y);
        return cc.p(x, y);
    }
});
