var Structure = Entity.extend({
    level: 1,
    hitPoint: 100,
    canMove: true,
    validPosition: true,
    hitList: null,
    targetType: null,
    destroyState: false,
    countTroop: 0,
    res: 0,
    ctor: function (id, level, state, buildingTime, position, idle) {
        this.cnt = 0;
        this.gold = 0;
        this.elixir = 0;
        this.darkElixir = 0;
        this.goldCollect = 0;
        this.darkElixirCollect = 0;
        this.elixirCollect = 0;
        this.showHitPoint = 100;
        this.level = level;
        this.hitList = new Map();
        this.state = state;
        this.buildingTime = buildingTime;
        this.createLevelLabel();
        this._super(id, position, idle);
        this.targetType = TARGET_TYPE.STRUCTURE;
        var config = ConfigAPI.getInstance().getEntityInfo(this.type, this.level);
        this.loadConfig(config);
        this.addGround();
        this.addChild(this._levelLabel);
        this.createAnimation();
        this.hitPointMax=config["hitpoints"];
        this.hitPoint = config["hitpoints"];
        this.blood=cc.Sprite("new/battle_gui/enemies_heal_bar.png");
        this.blood.attr({
            x:-50+10,
            y:100/3*this.size.x,
            anchorY:0,
            anchorX:0,
            scaleY:1.23,
            scaleX:1.19,
        });
        this.bgblood=cc.Sprite("new/battle_gui/black_hp_bar.png");
        this.bgblood.attr({
            anchorX:0,
            anchorY:0,
            x:-52+10,
            y:-3+100/3*this.size.x,
        });
        this.addChild(this.bgblood);
        this.addChild(this.blood);
        this.bgblood.setOpacity(0);
        this.blood.setOpacity(0);
    },

    createBuildInfo: function () {
        if (this.type === STRUCTURE.WALL)
            return;

        var fence = new cc.Sprite(MAP.UPGRADING_FENCE);
        fence.attr({
            anchorX: 0.5,
            anchorY: 0,
            x: this.width / 2,
            y: -this.size.y * TILE_HEIGHT / 2,
            scale: 2.0
        });
        fence.setVisible(false);
        this.fence = fence;
        this.addChild(fence);
        this._super();
    },

    loadConfig: function (config) {
    },

    createAnimation: function() {
        this.createIdleAnimation();
        this.createLevelUpAnimation();
    },

    createIdleAnimation: function() {
        var config = EFFECT[this.type] || null;
        if (config == null)
            return;
        var nFrames = config.NFRAMES;
        var path = EFFECT.ROOT + "/" + config.RES + "_" + this.level + "_effect";
        if (this.type === STRUCTURE.ARMY_CAMP)
            if (this.level < 6)
                path = EFFECT.ROOT + "/" + config.RES + "_1_effect";
            else
                return;
        var sprite = new cc.Sprite(path + "/00.png");
        sprite.attr({
            x: this.width/2,
            y: this.height/2
        });
        sprite.setLocalZOrder(3);
        this.addChild(sprite);

        var aniFrames = [];

        var str = "";
        var sframe;
        for (var i = 0; i < nFrames; i++) {
            if (i < 10)
                str = path + "/0" + i + ".png";
            else
                str = path + "/" + i + ".png";
            sframe = new cc.SpriteFrame(str, cc.rect(0, 0, config.W, config.H));
            aniFrames.push(sframe);
        }
        var animation = new cc.Animation(aniFrames, 0.3);
        sprite.runAction(cc.animate(animation).repeatForever());
    },

    createLevelUpAnimation: function() {
        var config = EFFECT.LEVEL_UP;
        var nFrames = config.NFRAMES;
        var path = EFFECT.ROOT + "/" + config.RES;
        var levelUp = new cc.Sprite();
        levelUp.attr({
            x: this.width/2,
            y: this.height/2
        });
        levelUp.setLocalZOrder(4);
        this.addChild(levelUp);

        var aniFrames = [];
        var str = "";
        var sframe;
        for (var i = 0; i < nFrames; i++) {
            if (i < 10)
                str = path + "/0" + i + ".png";
            else
                str = path + "/" + i + ".png";
            sframe = new cc.SpriteFrame(str, cc.rect(0, 0, config.W, config.H));
            aniFrames.push(sframe);
        }
        var animation = new cc.Animation(aniFrames, 0.1);
        this._levelUpSpite = levelUp;
        this._levelUpSpite.retain();
        this._levelUpAnimate = cc.animate(animation);
        this._levelUpAnimate.retain();
        // TODO: Scale
    },

    createLevelLabel: function() {
        this._levelLabel = cc.LabelBMFont("Level " + this.level, FONT.SOJI_16);
        this._levelLabel.attr({
            anchorY: 0,
            x: 0,
            y: this.size.y/2*TILE_HEIGHT
        });
        this._levelLabel.setLocalZOrder(2);
        this._levelLabel.setGlobalZOrder(STRUCTURE_ANIMATION.BUILDING_ANIMATION_ZORDER);
        this._levelLabel.setVisible(false);
    },

    addGround: function() {
        // Add position status
        this.red = new cc.Sprite(MAP.RED[this.size.x-1]);
        this.red.attr({
            x: this.width/2,
            y: this.height/2,
            scale: TILE_WIDTH*this.size.x/this.red.width
        });
        this.addChild(this.red, -1);
        this.red.setVisible(false);

        this.green = new cc.Sprite(MAP.GREEN[this.size.x-1]);
        this.green.attr({
            x: this.width/2,
            y: this.height/2,
            scale: TILE_WIDTH*this.size.x/this.green.width
        });
        this.addChild(this.green, -1);
        this.green.setVisible(false);
    },

    displayPreparingButton: function() {
        ActionLayer.getInstance().hide();

        if (MapController.getInstance()._mapLayer.selectedObject != null) {
            MapController.getInstance()._mapLayer.selectedObject.onCancelSelect();
        }
        MapController.getInstance()._mapLayer.selectedObject = this;
        MapController.getInstance()._mapLayer.objectTemporaryPos = cc.p(
            this.position.x + this.size.x - 1,
            this.position.y + this.size.y - 1);
        this.onSelect();

        var acceptButton = ccs.load(BUTTON.PREPARE_BUILD,'').node.getChildByName("accept").clone();
        acceptButton.attr({
            anchorY: 0,
            x: this.size.x/3*TILE_WIDTH,
            y: this.size.y/3*TILE_HEIGHT
        });
        acceptButton.setPressedActionEnabled(true);
        acceptButton.setLocalZOrder(3);
        this.addChild(acceptButton);

        var cancelButton = ccs.load(BUTTON.PREPARE_BUILD,'').node.getChildByName("cancel").clone();
        cancelButton.attr({
            anchorY: 0,
            x: -this.size.x/3*TILE_WIDTH,
            y: this.size.y/3*TILE_HEIGHT
        });
        cancelButton.setPressedActionEnabled(true);
        cancelButton.setLocalZOrder(3);
        this.addChild(cancelButton);

        var self = this;
        var level = 1;
        if (this.type == STRUCTURE.BUILDER_HUT)
            level = MapController.getInstance().getListStructures(STRUCTURE.BUILDER_HUT).length;
        var config = ConfigAPI.getInstance().getEntityInfo(this.type, level);
        acceptButton.addClickEventListener(function(){
            if (self.validPosition) {
                MapController.getInstance().build(self, config);
            }
        });
        cancelButton.addClickEventListener(function(){
            self.onCancelBuild();
        });

        this._acceptButton = acceptButton;
        this._cancelButton = cancelButton;
    },

    onCancelBuild: function() {
        var id = this.id;
        if (!this.isAvailable()) {
            MapController.getInstance()._mapLayer.setSelectedObject(null);
            MapController.getInstance().removeStructure(this);
            this.onDestroy();
        } else {
            this.state = NumberUtils.clearBit(this.state, 1);
            this._buildingBar.setVisible(false);
            this.onCancelSelect();
            MapController.getInstance()._mapLayer.setSelectedObject(null);
            this.builderHut.recall();
            testnetwork.connector.sendCancelBuild(id, this.builderHut.id);
        }
    },

    startBuild: function(builder) {
        this._super(builder);
        if (!this.isAvailable()) {
            this.removeChild(this._acceptButton, true);
            this.removeChild(this._cancelButton, true);
        }

        // create upgrading fence
        if (this.type !== STRUCTURE.WALL) {
            this.fence.setVisible(true);
        }

        // upgrading label and time
        this.buildingTime = TimeUtils.getTimeStamp();
        this.state = NumberUtils.clearBit(this.state, 0);
        this.state = NumberUtils.setBit(this.state, 1);
        this.displayBuildingTime();

        // reselect
        this.onSelect();
        var self = this;
        ActionLayer.getInstance().hide();
        this.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.callFunc(function () {
                MapController.getInstance().getMapLayer().selectedObject = self;
                ActionLayer.getInstance().display(self);
            })
        ))
    },

    displayBuildingTime: function () {
        this._buildingBar.setVisible(NumberUtils.getBitAt(this.state, 1));
        this.updateTimeLabel(TimeUtils.getTimeStamp());
    },

    updatePositionStatus: function(moving) {
        if (!moving) {
            this.green.setVisible(false);
            this.red.setVisible(false);
        } else {
            if (this.validPosition) {
                this.red.setVisible(false);
                this.green.setVisible(true);
            } else {
                this.green.setVisible(false);
                this.red.setVisible(true);
            }
        }
    },

    setPosition: function (position) {
        this.position = position
    },

    target: function () {
        this.countTroop += 1;
    },

    stopTarget: function () {
        this.countTroop -= 1;
    },

    effect: function () {

    },

    onSelect: function () {
        this._super();
        // Show name
        if (NumberUtils.getBitAt(this.state, 1) || (this.type === STRUCTURE.BARRACK && this.isTraining())) {
            this._spriteName.y = this.size.y / 2 * TILE_HEIGHT + 60;
            this._levelLabel.y = this.size.y / 2 * TILE_HEIGHT + 40;
        } else {
            this._spriteName.y = this.size.y / 2 * TILE_HEIGHT + 20;
            this._levelLabel.y = this.size.y / 2 * TILE_HEIGHT;
        }
        this._spriteName.setVisible(true);
        this._levelLabel.setVisible(true);
    },

    onCancelSelect: function() {
        this._super();
        // Hide name
        this._spriteName.setVisible(false);
        this._levelLabel.setVisible(false);
    },

    getListAction: function() {
        var result = [{"ACTION": ACTION_LAYER.INFO}];
        var isBuilding = NumberUtils.getBitAt(this.state, 1);
        if (this.level < ConfigAPI.getInstance().getMaxLevel(this.type) && !isBuilding){
            var config = ConfigAPI.getInstance().getEntityInfo(this.type, this.level+1);
            var cost = {
                "gold": config["gold"] || 0,
                "elixir": config["elixir"] || 0,
                "darkElixir": config["darkElixir"] || 0
            };
            result.push({
                "ACTION": ACTION_LAYER.UPGRADE,
                "COST": cost
            });
        }
        if (isBuilding) {
            result.push({"ACTION": ACTION_LAYER.CANCEL_BUILD});
            result.push({
                "ACTION": ACTION_LAYER.QUICK_FINISH,
                "COST": {
                    "g": MapController.getInstance().timeTransferG(this.getRemainingTime())
                }
            });
        }
        return result;
    },
    getLevel:function (){
        return this.level;
    },
    onBuildSuccess: function() {
        this._super();

        // Check done build or done upgrade
        if (!this.isAvailable()) {
            this.state = NumberUtils.setBit(this.state, 2);
        } else {
            this.level += 1;
            this.removeChild(this._baseSprite, true);
            this.createBaseSprite(this.getIdlePath(this.level));
        }

        // Update Level label & run level up animation
        this._levelLabel.setString("Level " + this.level);
        this._levelUpSpite.setVisible(true);
        this._levelUpSpite.runAction(cc.sequence(
            this._levelUpAnimate,
            cc.callFunc(function(){
                this._levelUpSpite.setVisible(false);
            }.bind(this))
        ));

        // Load config
        var config = ConfigAPI.getInstance().getEntityInfo(this.type, this.level);
        this.loadConfig(config);

        // hide fence
        if (this.type !== STRUCTURE.WALL) {
            this.fence.setVisible(false);
        }
    },
    updateTimeLabel: function (currentTime) {
        this._super(currentTime);
        if (this.type !== STRUCTURE.WALL) {
            this.fence.setVisible(true);
        }
    },
    onMoved: function() {
        MapController.getInstance().getMapLayer()._grassLayer.move(this);
        MapController.getInstance().getMapLayer()._arrowLayer.move(this);
    },
    destroy: function () {
        this.removeAllChildrenWithCleanup(true);
        var destroy = new cc.Sprite(ResourceRouter.getDestroyPath(this.type,this.level));
        destroy.attr({
            x: this.width / 2,
            y: this.height / 2,
            scale: TILE_WIDTH * this.size.x / destroy.width
        });
        this.setLocalZOrder(0);
        this.addChild(destroy);
        BattleController.getInstance().mapShaking();
    },
    updateMau: function () {
        this.cnt+=1;
        if (this.cnt>this.showHitPoint){
            this.blood.setOpacity(0);
            this.bgblood.setOpacity(0);
        }
        if (this.cnt>this.showHitPoint) this.cnt=this.showHitPoint+1;
    },
    updateHitPoint: function (dame) {
        if (this.destroyState) return;
        this.hitPoint -= dame;
        if (this.hitPoint <= 0) {
            this.destroyState = true;
            BattleController.getInstance().logDestroyStructure(this);
            BattleController.getInstance().noticeStructureIsDestroyed(this.id);
            this.destroy();
        } else this.animationHitPoint(this.hitPoint / this.hitPointMax);
        let gold = dame / this.hitPointMax;
        let elixir = gold;
        let darkElixir = gold;
        if (this.type == STRUCTURE.TOWN_HALL) {
            gold *= this.goldSto;
            elixir *= this.elixirSto;
            darkElixir *= this.darkElixirSto;
        } else if (this.type == STRUCTURE.GOLD_STORAGE) {
            gold *= this.resource;
            elixir = darkElixir = 0;
        } else if (this.type == STRUCTURE.ELIXIR_STORAGE) {
            elixir *= this.resource;
            gold = darkElixir = 0;
        } else if (this.type == STRUCTURE.DARK_ELIXIR_STORAGE) {
            darkElixir *= this.resource;
            gold = elixir = 0;
        } else {

            return;
        }
        // cc.log(gold + " " + elixir + " " + darkElixir);
        if (this.hitPoint <= 0) {
            if (this.type == STRUCTURE.GOLD_STORAGE) {
                gold = this.resource - Math.floor(this.goldCollect);
            }
            if (this.type == STRUCTURE.ELIXIR_STORAGE) {
                elixir = this.resource - Math.floor(this.elixirCollect);
            }
            if (this.type == STRUCTURE.DARK_ELIXIR_STORAGE) {
                darkElixir = this.resource - Math.floor(this.darkElixirCollect);
            }
            if (this.type == STRUCTURE.TOWN_HALL) {
                gold = this.goldSto - Math.floor(this.goldCollect);
                elixir = this.elixirSto - Math.floor(this.elixirCollect);
                darkElixir = this.darkElixirSto - Math.floor(this.darkElixirCollect);
            }
        } else {
        }
        this.goldCollect += gold;
        this.darkElixirCollect += darkElixir;
        this.elixirCollect += elixir;
        this.gold += gold;
        this.elixir += elixir;
        this.darkElixir += darkElixir;
        BattleController.getInstance().updateResource(Math.floor(this.gold), Math.floor(this.elixir), Math.floor(this.darkElixir));
        this.gold -= Math.floor(this.gold);
        this.elixir -= Math.floor(this.elixir);
        this.darkElixir -= Math.floor(this.darkElixir);
        // cc.log("GameTick:", BattleController.getInstance().tickGame + "/Gold:" + gold + " Elixir " + elixir + " DarkElixir " + darkElixir);
    },

    animationHitPoint:function (scale) {
        this.cnt=0;
        this.blood.setScaleX(scale);
        this.blood.setOpacity(255);
        this.bgblood.setOpacity(255);
        this.animationAttack();
    },
    animationAttack:function () {
        this.attackAni = cc.Sprite("blank.png");
        this.attackAni.attr({
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100)
        })
        var tt1 = cc.targetedAction(this.attackAni, Animation.createAnimation(5, "battle/AtkHit_0" + Math.floor(Math.random() * 3) + "/", 1, 1, 80, 80)[0]);

        var tt2 = cc.targetedAction(this.attackAni, cc.fadeOut(0));
        this.attackAni.runAction(cc.sequence(tt1, tt2));
        this.addChild(this.attackAni, 5);
    }
});

