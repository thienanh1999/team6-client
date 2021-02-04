var Wall = Structure.extend({
    size: cc.p(1, 1),
    type: STRUCTURE.WALL,
    preWall: null,
    dx: [0, 0, 1, -1],
    dy: [1, -1, 0, 0],
    listNeighbor: null,

    ctor: function (id, level, state, position) {
        this._super(id, level, state, 0, position, this.getIdlePath(level));
        this.createAppearance();
        this.listNeighbor = [];
    },

    getIdlePath: function (level) {
        return ResourceRouter.getIdlePath(this.type, level);
    },

    loadConfig: function(config) {
        this.hitpoints = config["hitpoints"];
    },

    displayPreparingButton: function() {
        this._super();
        this._acceptButton.anchorX = 0;
        this._acceptButton.X = TILE_WIDTH;
        this._cancelButton.anchorX = 1.0;
        this._cancelButton.X = -TILE_WIDTH;
    },

    createAppearance: function(refresh=false) {
        var level = this.level;
        var rightPath = "buildings/wall/wal_1_" + level + "/idle/image0001.png";
        if (refresh)
            this._right.removeFromParent(true);
        this._right = new cc.Sprite(rightPath);
        this._right.attr({
            x: this.width/2,
            y: this.height/2
        });
        this.addChild(this._right);
        this._right.setLocalZOrder(1);
        this._right.setVisible(false);

        var leftPath = "buildings/wall/wal_1_" + level + "/idle/image0002.png";
        if (refresh)
            this._left.removeFromParent(true);
        this._left = new cc.Sprite(leftPath);
        this._left.attr({
            x: this.width/2,
            y: this.height/2
        });
        this.addChild(this._left);
        this._left.setLocalZOrder(1);
        this._left.setVisible(false);

        var doublePath = "buildings/wall/wal_1_" + level + "/idle/image0003.png";
        if (refresh)
            this._double.removeFromParent(true);
        this._double = new cc.Sprite(doublePath);
        this._double.attr({
            x: this.width / 2,
            y: this.height / 2
        });
        this.addChild(this._double);
        this._double.setLocalZOrder(1);
        this._double.setVisible(false);
    },

    updateAppearance: function (modeBattle = false) {
        this._mapController = MapController.getInstance();
        if (modeBattle === true) this._mapController = BattleController.getInstance();
        this._updateAppearance(modeBattle);
        this.updateNeibour(this.position, modeBattle);
    },

    _updateAppearance: function (modeBattle) {
        var adj = this.checkAdjection(modeBattle);

        this._double.setVisible(adj.left && adj.right);
        this._left.setVisible(adj.left && !adj.right);
        this._right.setVisible(!adj.left && adj.right);
    },

    checkAdjection: function (modeBattle = false) {
        var x = this.position.x;
        var y = this.position.y;
        let leftID;
        let rightID;
        let leftObj
        let rightObj
        if (modeBattle === false) {
            this._mapController = MapController.getInstance();
            leftID = this._mapController._map.id[x - 1][y];
            rightID = this._mapController._map.id[x][y - 1];
            leftObj = this._mapController._objectByID[leftID];
            rightObj = this._mapController._objectByID[rightID];
        } else {
            this._mapController = BattleController.getInstance();
            leftID = this._mapController._map.wall[x - 1][y];
            rightID = this._mapController._map.wall[x][y - 1];
            leftObj = this._mapController._objectByID.get(leftID);
            rightObj = this._mapController._objectByID.get(rightID);
        }

        return {
            left: (leftObj != null) && (leftObj.type == STRUCTURE.WALL),
            right: (rightObj != null) && (rightObj.type == STRUCTURE.WALL)
        }
    },

    updateNeibour: function (pos, modeBattle = false) {
        var x = pos.x;
        var y = pos.y;
        var left1Obj;
        var right1Obj;
        if (modeBattle === false) {
            this._mapController = MapController.getInstance();
            left1Obj = this._mapController._objectByID[this._mapController._map.id[x + 1][y]];
            right1Obj = this._mapController._objectByID[this._mapController._map.id[x][y + 1]];
        } else {
            this._mapController = BattleController.getInstance();
            left1Obj = this._mapController._objectByID.get(this._mapController._map.wall[x + 1][y]);
            right1Obj = this._mapController._objectByID.get(this._mapController._map.wall[x][y + 1]);
        }

        if (left1Obj != null && left1Obj.type == STRUCTURE.WALL)
            left1Obj._updateAppearance(modeBattle);
        if (right1Obj != null && right1Obj.type == STRUCTURE.WALL)
            right1Obj._updateAppearance(modeBattle);
    },

    onBuildSuccess: function() {
        this._super();
        this.createAppearance(true);
        this.updateAppearance();
        if (this.level > 1)
            return;
        var nextPos = this.findNextPos();
        if (nextPos != null) {
            var nextWall = this.getMapController().prepareBuild(STRUCTURE.WALL, nextPos);
            nextWall.preWall = this;
        }
    },

    findNextPos: function() {
        var mapController = this.getMapController();
        var mapIds = mapController._map.id;

        // Check if reach max
        var townHallConfig = ConfigAPI.getInstance().getEntityInfo(STRUCTURE.TOWN_HALL, mapController.getLevelTownHall());
        cc.log(townHallConfig["WAL_1"] + " " + mapController.getStructures(STRUCTURE.WALL).length);
        if (mapController.getStructures(STRUCTURE.WALL).length == townHallConfig["WAL_1"]) {
            return null;
        }

        if (this.preWall == null) {
            return this._findNextPos(mapIds);
        } else {
            var x = this.position.x;
            var y = this.position.y;
            var preX = this.preWall.position.x;
            var preY = this.preWall.position.y;
            var nx = x+x-preX;
            var ny = y+y-preY;
            var id = mapIds[nx][ny];
            if (id == -1)
                return cc.p(nx, ny);
            else
                return this._findNextPos(mapIds);
        }
    },

    _findNextPos: function(mapIds) {
        var x = this.position.x;
        var y = this.position.y;
        for (var i = 0; i < 4; i++) {
            var id = mapIds[x+this.dx[i]][y+this.dy[i]];
            if (id == -1) {
                return cc.p(x+this.dx[i], y+this.dy[i])
            }
        }
    },

    getMapController: function (battleMode = false) {
        if (battleMode === true) return BattleController.getInstance();
        return MapController.getInstance();
    },

    getListAction: function() {
        var result = this._super();
        result.push({"ACTION": ACTION_LAYER.SELECT_LINE})
        return result;
    },

    batchSelect: function() {
        cc.log("Select Lines: " + this.id);
        this._baseSprite.stopActionByTag(SPRITE_SCALE_ACTION_TAG);

        // Tint animation
        var tint_action = cc.tintTo(0.5, 200, 200, 200);
        var action_back = cc.tintTo(0.5, 255, 255, 255);
        var tintSeq = cc.sequence(tint_action, action_back);
        this.tintSeq = tintSeq;
        this._baseSprite.runAction(tintSeq.repeatForever());

        // Scale
        var scale = this._baseSprite.getScale();
        var scaleSeq = cc.sequence(
            cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION/2, scale*STRUCTURE_ANIMATION.SELECTING_SCALE),
            cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION/2, scale)
        );
        scaleSeq.setTag(SPRITE_SCALE_ACTION_TAG);
        this._baseSprite.runAction(scaleSeq);

        this.updatePositionStatus(true);
    }
});