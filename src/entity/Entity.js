var SPRITE_SCALE_ACTION_TAG = 1;

var Entity = cc.Sprite.extend({
    id: null,
    position: null,
    size: cc.p(1, 1),
    canMove: false,
    state: 0,
    // BITMAP: 0 = preparing, 1 = building, 2 = available
    buildingTime: 0,
    name: "objectName",
    type: "objectType",
    builder: null,
    builderHut: null,

    ctor: function(id, position, idle) {
        this._super();
        this.position = cc.p(position.x, position.y);
        this.id = id;
        this.name = this.getEntityName();

        this.createBaseSprite(idle);
        this.createBuildInfo();
        this.createSpriteName();
    },

    createBuildInfo: function() {
        this._buildingBar = ccs.load(BUILD.BUILDING_BAR,'').node.getChildByName("buildingBar").clone();
        this._buildingBar.attr({
            anchorY: 0,
            y: this.size.y/2*TILE_HEIGHT
        });
        this.addChild(this._buildingBar);
        this._buildingBar.setLocalZOrder(2);

        var isBuilding = NumberUtils.getBitAt(this.state, 1);
        if (isBuilding == 0)
            this._buildingBar.setVisible(false);
        if (isBuilding) {
            this.updateTimeLabel(TimeUtils.getTimeStamp());
        }
    },

    updateTimeLabel: function(currentTimeStamp) {
        // Update label
        var buildingTime = 0;
        if (this.canMove) {
            if (this.isAvailable()) {
                buildingTime = ConfigAPI.getInstance().getEntityInfo(this.type, this.level+1)["buildTime"] || 0;
            } else {
                buildingTime = ConfigAPI.getInstance().getEntityInfo(this.type, this.level)["buildTime"] || 0;
            }
        } else {
            buildingTime = this.config["buildTime"];
        }
        if (buildingTime == 0) {
            this.onBuildSuccess();
            return;
        }
        var buildedTime = currentTimeStamp - this.buildingTime;
        var diff = buildingTime - buildedTime;
        this._buildingBar.getChildByName("timeLabel").setString(StringUtil.convertTimeToString(Math.ceil(diff)));

        // Update process Bar
        this._buildingBar.getChildByName("current").setPercent(Math.min(1, buildedTime/buildingTime));

        if (diff <= 0) {
            this.onBuildSuccess();
        }

        return diff;
    },
    updateMau:function () {

    },
    getRemainingTime: function() {
        var currentTimeStamp = TimeUtils.getTimeStamp();
        var buildingTime = 0;
        if (this.canMove) {
            if (this.isAvailable()) {
                buildingTime = ConfigAPI.getInstance().getEntityInfo(this.type, this.level+1)["buildTime"] || 0;
            } else {
                buildingTime = ConfigAPI.getInstance().getEntityInfo(this.type, this.level)["buildTime"] || 0;
            }
        } else {
            buildingTime = this.config["buildTime"];
        }
        if (buildingTime == 0) {
            this.onBuildSuccess();
            return;
        }
        var buildedTime = currentTimeStamp - this.buildingTime;
        var diff = buildingTime - buildedTime;

        return diff;
    },

    onBuildSuccess: function() {
        this.state = NumberUtils.clearBit(this.state, 1);
        // TODO: Update Name and Level Label Position
        this._buildingBar.setVisible(false);

        // Release builder
        var builders = MapController.getInstance()._map.structure.get(STRUCTURE.BUILDER_HUT);
        for (var i in builders) {
            var builder = builders[i];
            if (builder.building == this) {
                builder.building = null;
                MapController.getInstance()._stateLayer.updateBuilder();
                cc.log("Release Builder ID " + builder.id);
                break;
            }
        }

        // Send Builder Back to Hut
        if (this.builderHut != null) {
            this.builderHut.recall();
        }
    },

    onDestroy: function() {
        MapController.getInstance().getMapLayer()._grassLayer.destroy(this);
        if (this.canMove) {
            MapController.getInstance().getMapLayer()._arrowLayer.destroy(this);
        }
        this.removeAllComponents();
        this.removeFromParent(true);
    },

    getEntityName: function() {
        return ENTITY_NAME.get(this.type);
    },

    createBaseSprite: function(idle) {
        this._baseSprite = new cc.Sprite(idle);
        this._baseSprite.attr({
            x: this.width/2,
            y: this.height/2
        });
        this.addChild(this._baseSprite);
        this._baseSprite.setLocalZOrder(1);
    },

    createSpriteName: function() {
        this._spriteName = cc.LabelBMFont(this.name, FONT.SOJI_20);
        this._spriteName.attr({
            anchorY: 0,
            x: 0,
            y: this.size.y/2*TILE_HEIGHT
        });
        this.addChild(this._spriteName);
        this._spriteName.setLocalZOrder(2);
        this._spriteName.setGlobalZOrder(STRUCTURE_ANIMATION.BUILDING_ANIMATION_ZORDER);
        this._spriteName.setVisible(false);
        this._spriteName.color = cc.color.YELLOW;
    },

    // This arrow must be in the map layer for highest ZOrder
    onSelect: function() {
        cc.log("Selected Object: " + this.id);
        this._baseSprite.stopActionByTag(SPRITE_SCALE_ACTION_TAG);

        // Tint animation
        var tint_action = cc.tintTo(0.5, 200, 200, 200);
        var action_back = cc.tintTo(0.5, 255, 255, 255);
        var tintSeq = cc.sequence(tint_action, action_back);
        this.tintSeq = tintSeq;
        this._baseSprite.runAction(tintSeq.repeatForever());

        // Arrow
        if (this.canMove) {
            MapController.getInstance().getMapLayer()._arrowLayer.onSelect(this);
        }

        // Scale
        var scale = this._baseSprite.getScale();
        var scaleSeq = cc.sequence(
            cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION/2, scale*STRUCTURE_ANIMATION.SELECTING_SCALE),
            cc.scaleTo(STRUCTURE_ANIMATION.ARROW_DISPLAY_DURATION/2, scale)
        );
        scaleSeq.setTag(SPRITE_SCALE_ACTION_TAG);
        this._baseSprite.runAction(scaleSeq);
    },
    attack:function(x,y){

    },
    updatePositionStatus: function(moving) {},

    onCancelSelect: function() {
        // Remove position status
        this.updatePositionStatus(false);

        // Remove Tint animation
        this._baseSprite.stopActionByTag(SPRITE_SCALE_ACTION_TAG);
        if (cc.sys.isObjectValid(this.tintSeq))
            this.tintSeq.stop();
        this._baseSprite.runAction(cc.tintTo(0, 255, 255, 255));
        this._baseSprite.runAction(cc.scaleTo(0, 1, 1));

        // Arrow
        if (this.canMove) {
            MapController.getInstance().getMapLayer()._arrowLayer.onCancelSelect(this);
        }
    },

    startBuild: function () {
    },

    getListAction: function () {
    }, // list of actions ID
    getUpgradedAttr: function () {
    }, // List of attributes

    isAvailable: function () {
        return NumberUtils.getBitAt(this.state, 2);
    },

    isBuilding: function () {
        return NumberUtils.getBitAt(this.state, 1);
    }
});
var EntityFactory = {
    createEntity: function (type, attributes) {
        let newEntity;
        switch (type) {
            case STRUCTURE.TOWN_HALL:
                newEntity = new TownHall(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.CLAN_CASTLE:
                newEntity = new ClanCastle(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.LABORATORY:
                newEntity = new Laboratory(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.BUILDER_HUT:
                newEntity = new BuilderHut(attributes.id, attributes.state, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.GOLD_MINE:
                newEntity = new GoldMine(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.ELIXIR_MINE:
                newEntity = new ElixirMine(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.DARK_ELIXIR_MINE:
                newEntity = new DarkElixirMine(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.GOLD_STORAGE:
                newEntity = new GoldStorage(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.ELIXIR_STORAGE:
                newEntity = new ElixirStorage(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.DARK_ELIXIR_STORAGE:
                newEntity = new DarkElixirStorage(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.BARRACK:
                newEntity = new Barrack(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.ARMY_CAMP:
                newEntity = new ArmyCamp(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.WALL:
                newEntity = new Wall(attributes.id, attributes.level, attributes.state, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.CANON:
                newEntity = new Canon(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.ARCHER_TOWER:
                newEntity = new ArcherTower(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.MORTAR:
                newEntity = new Mortar(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.AIR_DEFENSE:
                newEntity = new AirDefense(attributes.id, attributes.level, attributes.state, attributes.time, cc.p(attributes.x, attributes.y));

                break;
            case STRUCTURE.OBSTACLE:
                newEntity = new Obstacle(attributes.id, attributes.state, attributes.time, attributes.type, cc.p(attributes.x, attributes.y));
                break;
        }
        return newEntity;
    }
}