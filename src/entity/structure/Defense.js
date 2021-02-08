var Defense = Structure.extend({
    range: 0,
    damage: 0,
    typeAttack: 0,

    ctor: function (id, level, state, buildingTime, position, idle) {
        this._super(id, level, state, buildingTime, position, idle);
        this.targetType = TARGET_TYPE.DEFENSE;
        this.timeToFire = 0;//TODO: Setup time to fire
        this.timeBullet = null;
        this._listAnimationStructure = null;
        this.troop = null;
        // var configBase=ConfigAPI.getInstance().getEntityInfo(this.type,this.level);
        this.createBase();
    },
    loadConfig: function (config) {
        this.damagePerSecond = config["damagePerSecond"];
        this.damagePerShot = config["damagePerShot"];
        this.hitpoints = config["hitpoints"];
        this.minRange = config["minRange"];
        this.maxRange = config["maxRange"];
        this.attackSpeed = config["attackSpeed"];
        this.attackType = config["attackType"];
        this.attackArea = config["attackArea"];
        // this.damagePerSecond=this.damagePerShot*this.attackType;
        this.attackRadius = config["attackRadius"];
    },

    onSelect: function() {
        this._super();
        MapController.getInstance().getMapLayer()._arrowLayer.drawAttackRange(cc.p(this.x, this.y), this.maxRange*TILE_HEIGHT/2);
    },

    onCancelSelect: function() {
        this._super();
        MapController.getInstance().getMapLayer()._arrowLayer.hideAttackRange();
    },

    onMoved: function() {
        this._super();
        MapController.getInstance().getMapLayer()._arrowLayer.drawAttackRange(cc.p(this.x, this.y), this.maxRange*TILE_HEIGHT/2);
    },

    getBasePath: function (level) {

    },

    createBase: function () {
        var basePath = this.getBasePath(this.level);
        if (basePath != null) {
            this._defense_base = new cc.Sprite(basePath);
            this._defense_base.attr({
                x: this.width / 2,
                y: this.height / 2
            });
            this.addChild(this._defense_base);
        }
    },
    chooseTarget: function () {
        var troop;

        if (this.troop!=null){
            troop=this.troop;
            var x = troop.position.x, y = troop.position.y;
            if (this.calculateRange(x, y) < this.minRange || this.calculateRange(x, y) > this.maxRange||troop.isDied) {

            }else {
                // cc.log("GameTick:" + BattleController.getInstance().tickGame + "/ Defense Attack:" + this.id + " " + troop.id);
                this.rotate(x, y);
                this.resetTime();
                if (this.attackRadius != 0) this.bullet = [this.damagePerShot, x, y, this.attackSpeed / 2];
                else {
                    // cc.log("ID troop",troop.id);
                    this.bullet = [this.damagePerShot, x, y, this.attackSpeed / 2, troop.id];
                    this.troop = troop;
                }
                return;
            }
        }

        var listTroop = BattleController.getInstance()._listTroop;
        for (troop of listTroop) {
            var x = troop.position.x, y = troop.position.y;
            if (troop.type === TROOP.FLYING_BOOM && this.attackArea === 1) continue;
            if (this.calculateRange(x, y) < this.minRange || this.calculateRange(x, y) > this.maxRange) continue;
            if (troop.isDied) continue;
            // cc.log(BattleController.getInstance()._tick + " " + this.type + " " + this.id + "Defense attack " + x + " " + y);
            this.rotate(x, y);
            this.resetTime();
            if (this.attackRadius != 0) this.bullet = [this.damagePerShot, x, y, this.attackSpeed / 2];
            else {
                this.bullet = [this.damagePerShot, x, y, this.attackSpeed / 2, troop.id];
                this.troop=troop;
            }
            return;
        }
    },
    calculateRange: function (x, y) {

        var leng = Math.sqrt((x - this.position.x - 1.5) * (x - this.position.x - 1.5) + (y - this.position.y - 1.5) * (y - this.position.y - 1.5));
        // cc.log("Khoang cach", leng);
        // cc.log("");
        return leng;
    },
    update: function () {
        if (this.destroyState) return;
        if (this.bullet != null) this.updateBullet();
        this.updateTimeToFire();
        if (this.timeToFire <= 0 || Math.abs(this.timeToFire) <= 0.0001) {
            this.timeToFire = 0;
            this.chooseTarget();
            // cc.log("updateDefense");
            // this.ani(1,1);this.resetTime();
        }

    },
    updateTimeToFire: function () {
        this.timeToFire -= GAME_TICK;
    },
    updateBullet: function () {
        this.bullet[Defense.TIMEBULLET] -= GAME_TICK;
        // listTroop=[[123,4,5]];
        if (this.bullet[Defense.TIMEBULLET] <= 0 || Math.abs(this.bullet[Defense.TIMEBULLET]) <= 0.0005) {
            // cc.log("==>");
            if (this.attackRadius != 0) {
                var troop;
                var listTroop = BattleController.getInstance()._listTroop;
                for (let i = 0; i < listTroop.length; i++) {
                    var troop = listTroop[i];
                    var x = troop.position.x, y = troop.position.y;
                    // cc.log(x + " " + y);
                    if (Calculate.calculateRange(x, y, this.bullet[Defense.X], this.bullet[Defense.Y]) <= this.attackRadius) {
                        // cc.log("Ok")
                        this.TroopDame(troop.id, this.bullet[Defense.DAME]);
                    }
                }
            } else {
                this.TroopDame(this.bullet[Defense.TARGET], this.bullet[Defense.DAME])
            }
            this.bullet = null;
        }
    },
    resetTime: function () {
        this.timeToFire = this.attackSpeed;
    },
    getUpgradedAttr: function () {
        return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.DAMAGE_PER_SHOT]
    },
    ani: function (x,y,time) {

    },
    TroopDame: function (troopId, dame) {
        // cc.log("Troop Dame", troopId);
        // cc.log(BattleController.getInstance()._tick + " Troop " + troopId + " " + dame);
        // BattleController.getInstance().
        var listTroop = BattleController.getInstance()._listTroop;
        var troop;
        for (troop of listTroop) {
            if (troop.id == troopId) {
                // cc.log(troop.position.x + " " + troop.position.y);
                troop.updateHitPoint(dame);
            }
        }
    },
    rotate: function (x,y){
        var v2=cc.p(x-this.position.x-1.5,y-this.position.y-1.5);
        var dirDefense=0;
        var max=0;
        var v1;
        for (var dir of Defense.DIR) {
            v1 = cc.p(dir[1], dir[2]);
            var temp = (v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(v1.x * v1.x + v1.y * v1.y) * Math.sqrt(v2.x * v2.x + v2.y * v2.y));
            if (temp > max) {
                max = temp;
                dirDefense = dir[0];
                dx = dir[1];
                dy = dir[2];
            }
        }
        this._baseSprite.runAction(this._listAnimationStructure[dirDefense]);
        this.ani(x, y, this.attackSpeed / 2, dx, dy);
    }
});
Defense.DAME = 0;
Defense.X = 1;
Defense.Y = 2;
Defense.TIMEBULLET = 3;
Defense.TARGET = 4;
Defense.LEFT=2;
Defense.RIGHT=6;
Defense.UP=4;
Defense.DOWN=0;
Defense.UPLEFT=3;
Defense.UPRIGHT=5;
Defense.DOWNLEFT=1;
Defense.DOWNRIGHT=7;

Defense.VLEFT=[2,-1,1];
Defense.VRIGHT=[6,1,-1];
Defense.VUP=[4,-1,-1];
Defense.VDOWN=[0,1,1];
Defense.VUPLEFT=[3,-1,0];
Defense.VUPRIGHT=[5,0,-1];
Defense.VDOWNLEFT=[1,0,1];
Defense.VDOWNRIGHT=[7,1,0];
Defense.DIR=[[2,-1,1],[6,1,-1],[4,-1,-1],[0,1,1],[3,-1,0],[5,0,-1],[1,0,1],[7,1,0]];