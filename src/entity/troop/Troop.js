var N_DIREC = 5;
var DIRECTION = {
    S: 1,
    SW: 2,
    W: 3,
    NW: 4,
    N: 5,
    NE: 6,
    E: 7,
    SE: 0
};

var TROOP_NAME = new Map([
    [TROOP.WARRIOR, "Warrior"],
    [TROOP.ARCHER, "Archer"],
    [TROOP.GIANT, "Giant"],
    [TROOP.GOBLIN,"Goblin"],
    [TROOP.FLYING_BOOM, "Flying boom"]
]);

var TROOP_IMAGE = new Map([
    [TROOP.WARRIOR, "guis/upgrade_troop/icon/ARM_1_3.png"],
    [TROOP.ARCHER, "guis/upgrade_troop/icon/ARM_2_4.png"],
    [TROOP.GOBLIN, "guis/upgrade_troop/icon/ARM_3_4.png"],
    [TROOP.GIANT, "guis/upgrade_troop/icon/ARM_4_4.png"],
    [TROOP.FLYING_BOOM, "guis/upgrade_troop/icon/ARM_6_3.png"]
]);

var DELTA_POSITION = new Map([
    [DIRECTION.SE, cc.p(1, 1)],
    [DIRECTION.S, cc.p(0, 1)],
    [DIRECTION.SW, cc.p(-1, 1)],
    [DIRECTION.W, cc.p(-1, 0)],
    [DIRECTION.NW, cc.p(-1, -1)],
    [DIRECTION.N, cc.p(0, -1)],
    [DIRECTION.NE, cc.p(1, -1)],
    [DIRECTION.E, cc.p(1, 0)],
])

var DELTA_XY = [
    // SE
    cc.p(0, -14.25),
    // S
    cc.p(-9.5, -7.125),
    // SW
    cc.p(-19, 0),
    // W
    cc.p(-9.5, 7.125),
    // NW
    cc.p(0, 14.25),
    // N
    cc.p(9.5, 7.125),
    // NE
    cc.p(19, 0),
    // SE
    cc.p(9.5, -7.125),
];

var TROOP_STATE = {
    IDLE: 0,
    RUNNING: 1,
    ATTACKING: 2,
    DONE: 3,
};

var TARGET_TYPE = {
    WALL: 0,
    STRUCTURE: 1,
    DEFENSE: 2
}

var Troop = cc.Sprite.extend({
    // base
    id: null,
    type: null,
    name: null,
    level: null,
    houseSpace: null,

    // logic battle attribute
    hitPoint: null,
    maxHitPoint: null,
    moveSpeed: null,
    attackSpeed: null,
    damePerAttack: null,
    position: null,
    state: null,
    _targetType: null,
    _beAttacked: 0,
    isDied: false,

    // animation attribute
    _listIdleAnimation: null,
    _listRunAnimation: null,
    _listMoveAction: null,
    _path: null,
    _oldDir: null,
    _oldAction: null,
    _attackDir: null,
    _waitingTime: 0,
    ctor: function (id, level, position) {
        this._super();
        this.id = id;
        this.level = level;
        this.position = cc.p(position.x, position.y);
        this.state = TROOP_STATE.IDLE;
        this.initAttribute();
        this.initAnimation();
        this._initMoveAction();
        this._initHPView();
        this._updateZIndex(true);
        this._path = [];
        this.open = null;
        this.close = null;
        this.listWallIsDestroy = [];
        this._defaultWaitingTime = (this.id * this.id) % 20;
        this._waitingTime = this._defaultWaitingTime;
    },

    update: function () {
        if (this.isDied) return;
        // update HP GUI
        this._updateGUI();
        // update logic
        if (this.state === TROOP_STATE.IDLE) {
            this._waitingTime -= 1;
            if (this._waitingTime > 0) return;
            if (this._targetType === TARGET_TYPE.DEFENSE && BattleController.getInstance().numberOfDefense === 0) {
                this._targetType = TARGET_TYPE.STRUCTURE;
            }
            this.majorTarget = BattleController.getInstance().getTarget(this.position, this._targetType);
            if (this.majorTarget === null) {
                this.state = TROOP_STATE.DONE;
                return;
            }
            this.target = this.majorTarget;
            this._path = this._getPathAndTarget();
            if (this.target.type === STRUCTURE.WALL) {
                this._handleWallTarget();
            }
            this.target.target();
            // TODO : LOG event troop target structure
            // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " target:", String(this.target.id), " type:", this.target.type, " hp:", String(this.target.hitPoint));
            this.state = TROOP_STATE.RUNNING;
            this._oldDir = null;
            this.frameToUpdate = 0;
            this._attacked = false;
        } else if (this.state === TROOP_STATE.RUNNING) {
            this._updateMove();
        } else if (this.state === TROOP_STATE.ATTACKING) {
            this._updateAttack();
        }
    },

    _updateMove: function () {
        this.frameToUpdate -= 1;
        if (this.frameToUpdate <= 0) {
            // synchronize ui vs logic
            if (this._oldDir !== null) {
                this.position = this.finalPosition;
                let newPosition = BattleController.getInstance().convertTilePositionToPixelPosition(this.position);
                this.x = newPosition.x;
                this.y = newPosition.y;
            }

            // check target is destroyed ?
            if (this.target.destroyState === true || this.majorTarget.destroyState === true) {
                this._resetIdleState();
                // LOG DEBUG
                // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " target is destroyed, find new target");
                return;
            }

            // check if wall is destroy
            if (this.listWallIsDestroy.length !== 0) {
                for (let i = 0; i < this.listWallIsDestroy.length; i++) {
                    let distance = NumberUtils.getEulerDistance(this.listWallIsDestroy[i].position, this.position);
                    if (distance < 5) {
                        this.target.stopTarget();
                        this.listWallIsDestroy = [];
                        // LOG DEBUG
                        // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " wall is destroyed, find new path");
                        this._resetIdleState();
                        return;
                    }
                }
                this.listWallIsDestroy = [];
            }

            // continue move
            // if move done -> attack
            if (this._path.length === 0) {
                this.stopAllActions();
                if (this._oldDir !== null) this.runAction(this._listIdleAnimation[this._oldDir]);
                this._oldDir = null;
                this.state = TROOP_STATE.ATTACKING;
                this.frameToUpdate = 0;
                return;
            } else {
                let direction = this._path[this._path.length - 1];
                if (this._oldDir !== direction) {
                    this.stopAllActions();
                    this.runAction(this._listRunAnimation[direction]);
                }
                this._path.pop();
                this.deltaX = Math.round(DELTA_POSITION.get(direction).x / this.frametoUpdateMove / 2.0 * 10000) / 10000;
                this.deltaY = Math.round(DELTA_POSITION.get(direction).y / this.frametoUpdateMove / 2.0 * 10000) / 10000;
                this.deltaXPixel = DELTA_XY[direction].x / this.frametoUpdateMove;
                this.deltaYPixel = DELTA_XY[direction].y / this.frametoUpdateMove;
                this.finalPosition = cc.p();
                this.finalPosition.x = this.position.x + DELTA_POSITION.get(direction).x / 2;
                this.finalPosition.y = this.position.y + DELTA_POSITION.get(direction).y / 2;
                this._updateZIndex();
                this._oldDir = direction;
            }
            this.frameToUpdate = this.frametoUpdateMove;
        }

        // update move
        this.position.x += this.deltaX;
        this.position.y += this.deltaY;
        this.x += this.deltaXPixel;
        this.y += this.deltaYPixel;
    },

    _updateAttack: function () {

        // if target is destroyed, find other target
        if (this.target.destroyState === true || this.majorTarget.destroyState === true) {
            this._resetIdleState();
            this._attackDir = null;
            // LOG DEBUG
            // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " target is destroyed, find new target");
            return;
        }

        // check wall is destroyed
        if (this.target.type === STRUCTURE.WALL && this.listWallIsDestroy.length !== 0) {
            for (let i = 0; i < this.listWallIsDestroy.length; i++) {
                let distance = NumberUtils.getEulerDistance(this.listWallIsDestroy[i].position, this.position);
                if (distance < 5) {
                    // this.target.stopTarget();
                    this.listWallIsDestroy = [];
                    this._resetIdleState();
                    this._attackDir = null;
                    // LOG DEBUG
                    // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " wall is destroyed, find new path");
                    return;
                }
            }
            this.listWallIsDestroy = [];
        }

        this.frameToUpdate -= 1;
        if (this.frameToUpdate <= 0) {
            // update animation attack
            this._runAnimationAttack();

            this._attacked = true;
            this.frameToAttack = this.frameToPrepairAttack;

            this.frameToUpdate = this.frameToUpdateAttack;
        }

        // attack
        this.frameToAttack -= 1;
        if (this._attacked === true && this.frameToAttack <= 0) {
            this.target.updateHitPoint(this.damePerAttack);
            // LOG  DEBUG
            // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " attacked target:",String(this.target.type)," hp: ",String(this.target.hitPoint));
            this._attacked = false;
        }
    },

    _updateGUI: function () {
        this._beAttacked -= 1;
        if (this._beAttacked <= 0) {
            this._hpBarBG.runAction(cc.fadeOut(0.5));
            this._hpBar.runAction(cc.fadeOut(0.5));
        }
    },

    _getPathAndTarget: function () {
        let pathIgnoreWall = this._findPathToTarget(true);
        if (pathIgnoreWall !== null) {
            let direction;
            let position = cc.p(this.position.x * 2, this.position.y * 2);
            let mapId = BattleController.getInstance().getMapId();
            let index = -1;
            let wallTarget = null;
            for (let i = pathIgnoreWall.length - 1; i >= 0; i--) {
                direction = DELTA_POSITION.get(pathIgnoreWall[i]);
                position.x += direction.x;
                position.y += direction.y;
                // cc.log("check wall ",String(position.x),String(position.y));
                if (!this._checkAvailablePosition(position, mapId)) {
                    let wallPosition = cc.p(Math.floor(position.x / 2), Math.floor(position.y / 2));
                    wallTarget = BattleController.getInstance().getWallByPosition(wallPosition);
                    index = i;
                    break;
                }
            }

            if (wallTarget === null) {
                return pathIgnoreWall;
            } else {
                let path = this._findPathToTarget(false, pathIgnoreWall.length + 10);
                let pathLength;
                if (path === null) pathLength = 100000;
                else pathLength = path.length;
                if (pathLength > pathIgnoreWall.length + 10) {
                    this.target = wallTarget;
                    path = [];
                    for (let i = index + 1; i < pathIgnoreWall.length; i++) {
                        path.push(pathIgnoreWall[i]);
                    }
                    return path;
                } else {
                    return path;
                }
            }
        }
    },

    _getRandomTargetPoint: function (target) {
        let targetPosition = cc.p(target.position.x * 2, target.position.y * 2);
        let targetSize = cc.p(target.size.x * 2, target.size.y * 2);
        let x = (this.id * this.id) % targetSize.x;
        let y = (this.id * 7) % targetSize.y;
        return cc.p(targetPosition.x + x, targetPosition.y + y);
    },

    _findPathToTarget: function (ignoreWall = false, ceil = 10000, battleMode = true) {
        let targetPoint = this._getRandomTargetPoint(this.target);
        // init mapId, mapWall
        let controller;
        if (battleMode) controller = BattleController.getInstance();
        else controller = MapController.getInstance();
        if (ignoreWall === false) {
            this.mapId = controller.getMapId();
        } else {
            this.mapId = controller.getMapIdIgnoreWall();
        }
        this.mapHeight = this.mapId.length * 2;
        this.mapWidth = this.mapId[0].length * 2;

        // A-star : open, close
        if (this.open === null) this.open = Arrays.create2DArray(this.mapHeight, this.mapWidth, -1);
        else Arrays.clean2DArray(this.open, -1);
        if (this.close === null) this.close = Arrays.create2DArray(this.mapHeight, this.mapWidth, null);
        else Arrays.clean2DArray(this.close, null);

        let queue = new PriorityQueue();
        queue.push({
            position: cc.p(this.position.x * 2, this.position.y * 2),
            cost: 0,
            prevPosition: undefined
        });
        this.open[this.position.x * 2][this.position.y * 2] = 0;

        let ii = 0;
        while (!queue.isEmpty()) {
            ii += 1;
            let node = queue.pop();
            // cc.log("visit node ", node.position.x, ",",node.position.y);
            this.close[node.position.x][node.position.y] = node.prevPosition;
            this.open[node.position.x][node.position.y] = -1;
            if (this._checkTarget(node.position)) {
                return this._generatePath(node.position);
            }
            for (let i = 0; i < DELTA.length; i++) {
                let direction = DELTA[i];
                let newPosition = cc.p(node.position.x + direction.x, node.position.y + direction.y);
                let cost = node.cost + 1;
                if (cost < ceil && this._checkAvailablePosition(newPosition, this.mapId)) {
                    let deltaX = targetPoint.x - newPosition.x;
                    let deltaY = targetPoint.y - newPosition.y;
                    let f = Math.round((cost + deltaX * deltaX + deltaY * deltaY) * 100.0) / 100.0;
                    if (this.close[newPosition.x][newPosition.y] !== null) {
                        continue;
                    }
                    let newNode = {
                        position: newPosition,
                        cost: cost,
                        prevPosition: node.position
                    }
                    if (this.open[newPosition.x][newPosition.y] === -1) {
                        queue.push(newNode, f);
                        this.open[newPosition.x][newPosition.y] = cost;
                    } else {
                        if (this.open[newPosition.x][newPosition.y] > cost) {
                            queue.update(newNode, f);
                            this.open[newPosition.x][newPosition.y] = cost;
                        }
                    }
                }
            }
        }
        return null;
    },

    _checkTarget: function (position) {
        position = cc.p(position.x / 2, position.y / 2);
        let rect = {
            min: this.target.position,
            max: cc.p(this.target.position.x + this.target.size.x, this.target.position.y + this.target.size.y)
        }
        let distance = NumberUtils.getDistance(position, rect);
        // cc.log("check target ", String(this.target.position.x), String(this.target.position.y)," position: ", String(position.x),String(position.y),String(distance));
        return distance < this.attackRange;
    },

    _checkAvailablePosition: function (position, mapId) {

        let x = position.x;
        let y = position.y;
        if (x >= 0 && x < this.mapHeight && y >= 0 && y < this.mapWidth) {
            let posX = Math.floor(position.x / 2);
            let posY = Math.floor(position.y / 2);
            // empty tile
            if (mapId[posX][posY] === -1) return true;
            // center tile contain structure
            if (x % 2 === 1 && y % 2 === 1) return false;
            let x2 = posX - 1;
            let y2 = posY - 1;
            if (x2 >= 0 && y2 >= 0) {
                if (x % 2 === 0 && y % 2 === 1 && mapId[posX][posY] === mapId[posX - 1][posY]) return false;
                if (x % 2 === 1 && y % 2 === 0 && mapId[posX][posY] === mapId[posX][posY - 1]) return false;
                if (mapId[x2][y2] !== mapId[posX][posY]) return true;
            } else {
                return true;
            }
        }
        return false;
    },

    _handleWallTarget: function () {
        let listNeighbor = this.target.listNeighbor;
        let maxCount = this.target.countTroop;
        let newTarget = null;
        for (let i = 0; i < listNeighbor.length; i++) {
            if (listNeighbor[i].destroyState === false && listNeighbor[i].countTroop > maxCount) {
                maxCount = listNeighbor[i].countTroop;
                newTarget = listNeighbor[i];
            }
        }
        if (newTarget !== null) {
            this.target = newTarget;
            this._path = this._findPathToTarget();
            // LOG DEBUG
            // cc.log(String(BattleController.getInstance()._tick), " TROOP id:", String(this.id), " type:", String(this.type), " change wall target vs id:", String(this.target.id));
        }
    },

    notifyWallIsDestroy: function (listWall) {
        for (let i = 0; i < listWall.length; i++) {
            this.listWallIsDestroy.push(listWall[i]);
        }
    },

    _generatePath: function (targetPosition) {
        let path = [];
        let position = cc.p(targetPosition.x, targetPosition.y);
        let previous = this.close[position.x][position.y];
        while (previous !== undefined) {
            let deltaX = position.x - previous.x;
            let deltaY = position.y - previous.y;
            position = previous;
            previous = this.close[position.x][position.y];
            path.push(DIR[deltaX][deltaY]);
        }
        return path;
    },

    goTo: function (targetId) {
        this.attackRange = 0.4;
        this.target = MapController.getInstance()._objectByID[targetId];
        this._path = this._findPathToTarget(true, 10000, false);
        if (this._path.length === 0) return;
        this._oldDir = null;
        if (this.state === TROOP_STATE.IDLE) {
            this.state = TROOP_STATE.RUNNING;
            this.stopAllActions();
            this._move();
        }
    },

    goToPosition: function (rootPosition, targetPosition, mapId) {
        this._oldDir = null;
        let tdP = cc.p(this.position.x - rootPosition.x, this.position.y - rootPosition.y);
        if (tdP.x < 0 || tdP.y < 0 || tdP.x > 5 || tdP.y > 6) {
            cc.log("tdP error");
            return;
        }
        this._path = Bfs.findPathWithPosition(mapId, tdP, targetPosition);
        if (this._path.length === 0) return;
        this.stopAllActions();
        this.state = TROOP_STATE.RUNNING;
        this._move(true);
    },

    _move: function (onTop = false) {
        if (this._path.length === 0) {
            this.stopAllActions();
            this.runAction(this._listIdleAnimation[this._oldDir]);
            this.state = TROOP_STATE.IDLE;
        } else {
            let direction = this._path[this._path.length - 1];
            if (this._oldDir !== direction) {
                this.stopAllActions();
                this.runAction(this._listRunAnimation[direction]);
            }
            this._path.pop();
            this.runAction(cc.sequence(
                this._listMoveAction[direction],
                // this._listMoveAction[direction],
                cc.callFunc((function () {
                    this._move(onTop);
                }).bind(this))
                )
            );
            this.position.x += DELTA_POSITION.get(direction).x / 2;
            this.position.y += DELTA_POSITION.get(direction).y / 2;
            this._updateZIndex(onTop);
            this._oldDir = direction;
        }
    },

    initAttribute: function () {
        // config
        let troopConfig = ConfigAPI.getInstance().getTroopInfo(this.type, this.level);
        this.hitPoint = troopConfig["hitpoints"];
        this.maxHitPoint = this.hitPoint;
        this.attackRange = troopConfig["attackRange"];
        this.houseSpace = troopConfig["housingSpace"];
        this.damePerAttack = troopConfig["damagePerAttack"];
        this.moveSpeed = troopConfig["moveSpeed"];
        this.attackSpeed = troopConfig["attackSpeed"] / BATTLE_SPEED;
        this.delayAttackTime = DELAY_ATTACK_TIME.get(this.type) / BATTLE_SPEED;

        // this.damePerAttack = 0.5;
        // c
        this.timeMoveAction = (10 / this.moveSpeed) / BATTLE_SPEED / 2;
        this.frametoUpdateMove = Math.round(this.timeMoveAction / GAME_TICK);
        this.frameToUpdateAttack = Math.round(this.attackSpeed / GAME_TICK);
        this.frameToPrepairAttack = Math.round(this.delayAttackTime / GAME_TICK);
    },

    initAnimation: function () {
        let nameFolder = this.type + "_" + this.level + "/";
        let path = TROOP_ANIMATION.ROOT_PATH + nameFolder + nameFolder;
        this.frameSize = TROOP_ANIMATION.FRAME_SIZE.get(this.type);

        // idle animation:
        let numFrames = TROOP_ANIMATION.TOTAL_FRAME.IDE.get(this.type) / N_DIREC;
        this._listIdleAnimation = this._createAnimation(numFrames, path + "idle/");

        // run animation
        numFrames = TROOP_ANIMATION.TOTAL_FRAME.RUN.get(this.type) / N_DIREC;
        this._listRunAnimation = this._createAnimation(numFrames, path + "run/");

        // attack animation
        numFrames = TROOP_ANIMATION.TOTAL_FRAME.ATTACK.get(this.type) / N_DIREC;
        this._listAttackAnimation = [];
        let numAttackFrame = numFrames;
        let timeRunAttackAnimate = 1 / numAttackFrame / BATTLE_SPEED;
        let listAttackAnimate = this._createAnimate(numFrames, path + "attack01/");
        numFrames = TROOP_ANIMATION.TOTAL_FRAME.IDE.get(this.type) / N_DIREC;
        let timeRunIdleAnimate = 1 / numFrames / BATTLE_SPEED;
        let numTimeRepeatIdleAnimate = Math.floor((this.attackSpeed - timeRunAttackAnimate) / timeRunIdleAnimate);
        let listIdleAnimate = this._createAnimate(numFrames, path + "idle/");
        let animation;
        for (let i = 0; i < 5; i++) {
            animation = cc.sequence(
                cc.flipX(false),
                cc.Animate(listAttackAnimate[i]),
                cc.Animate(listIdleAnimate[i]).repeat(numTimeRepeatIdleAnimate)
            );
            animation.retain();
            this._listAttackAnimation[i] = animation;
        }
        for (let i = 5; i < 8; i++) {
            animation = cc.sequence(
                cc.flipX(true),
                cc.Animate(listAttackAnimate[i]),
                cc.Animate(listIdleAnimate[i]).repeat(numTimeRepeatIdleAnimate)
            );
            animation.retain();
            this._listAttackAnimation[i] = animation;
        }


    },

    _createAnimation: function (numFrames, path) {
        let listAnimation = this._createAnimate(numFrames, path);
        for (let i = 0; i < 5; i++) {
            let animation = cc.sequence(
                cc.flipX(false),
                cc.Animate(listAnimation[i])
            ).repeatForever();
            animation.retain();
            listAnimation[i] = animation;
        }
        for (let i = 5; i < 8; i++) {
            let animation = cc.sequence(
                cc.flipX(true),
                cc.Animate(listAnimation[i])
            ).repeatForever()
            animation.retain();
            listAnimation[i] = animation;
        }
        return listAnimation;
    },

    _createAnimate: function (numFrames, path) {
        let idleFrames = [];
        let fullPath;
        var index = 0;
        let listAnimation = [];
        for (let i = 0; i < N_DIREC; i++) {
            idleFrames[i] = [];
            for (let j = 0; j < numFrames; j++) {
                if (index < 10) {
                    fullPath = path + "image000" + index + ".png";
                } else {
                    fullPath = path + "image00" + index + ".png";
                }
                let frame = new cc.SpriteFrame(fullPath, cc.rect(0, 0, this.frameSize.x, this.frameSize.y));
                idleFrames[i].push(frame)
                index += 1;
            }
            listAnimation.push(new cc.Animation(idleFrames[i], 1 / numFrames / BATTLE_SPEED));
        }
        listAnimation.push(listAnimation[3].clone());
        listAnimation.push(listAnimation[2].clone());
        listAnimation.push(listAnimation[1].clone());
        return listAnimation;
    },

    _initMoveAction: function () {
        this._listMoveAction = [];
        let timeMove = this.timeMoveAction;
        // SE
        this._listMoveAction.push(cc.MoveBy(timeMove, 0, -28.5 / 2));
        // S
        this._listMoveAction.push(cc.MoveBy(timeMove, -19 / 2, -14.25 / 2));
        // SW
        this._listMoveAction.push(cc.MoveBy(timeMove, -38 / 2, 0));
        // W
        this._listMoveAction.push(cc.MoveBy(timeMove, -19 / 2, 14.25 / 2));
        // NW
        this._listMoveAction.push(cc.MoveBy(timeMove, 0, 28.5 / 2));
        // N
        this._listMoveAction.push(cc.MoveBy(timeMove, 19 / 2, 14.25 / 2));
        // NE
        this._listMoveAction.push(cc.MoveBy(timeMove, 38 / 2, 0));
        // E
        this._listMoveAction.push(cc.MoveBy(timeMove, 19 / 2, -14.25 / 2));

        // retain
        for (let i = 0; i < 8; i++) {
            this._listMoveAction[i].retain();
        }
    },

    _initHPView: function () {
        this._hpBarBG = new cc.Sprite(BATTLE_RESOURCE.HEAL_BAR_BG);
        this._hpBarBG.attr({
            x: TROOP_ANIMATION.FRAME_SIZE.get(this.type).x / 2 + 2,
            y: TROOP_ANIMATION.FRAME_SIZE.get(this.type).y / 2 + this.sizeH,
        })
        this.addChild(this._hpBarBG);
        this._hpBar = new cc.Sprite(BATTLE_RESOURCE.HEAL_BAR);
        this._hpBar.attr({
            x: 1,
            anchorX: 0,
            y: 1,
            anchorY: 0
        })
        this._hpBarBG.addChild(this._hpBar);
        this._hpBarBG.setOpacity(0);
        this._hpBar.setOpacity(0);
    },

    _updateZIndex: function (onTop = false) {
        if (onTop) {
            this.zIndex = this.position.x * this.position.x + this.position.y * this.position.y + 100;
        } else {
            this.zIndex = this.position.x * this.position.x + this.position.y * this.position.y;
        }
    },

    _calAttackDirection: function () {
        let centerTarget = cc.p();
        centerTarget.x = this.target.position.x + this.target.size.x / 2;
        centerTarget.y = this.target.position.y + this.target.size.y / 2;
        let distance = NumberUtils.getEulerDistance2(this.position, centerTarget);
        let dx = Math.round((centerTarget.x - this.position.x) / distance);
        let dy = Math.round((centerTarget.y - this.position.y) / distance);
        return DIR[dx][dy];

    },

    isRunning: function () {
        return (this.state === TROOP_STATE.RUNNING);
    },

    _die: function () {
        BattleController.getInstance().logDestroyTroop(this);
        this._hpBar.setVisible(false);
        this._hpBarBG.setVisible(false);
        this.stopAllActions();
        this.setTexture(BATTLE_RESOURCE.RIP);
        let ghost = cc.Sprite(BATTLE_RESOURCE.GHOST);
        ghost.attr({
            x: 20,
            y: 20
        })
        this.addChild(ghost);
        ghost.runAction(cc.moveBy(1.2, 0, 100));
        ghost.runAction(cc.fadeOut(1.2));
    },

    updateHitPoint: function (dame) {
        if (this.isDied) return;
        this.hitPoint -= dame;
        this._beAttacked = TIME_TO_HIDE_HP / GAME_TICK;
        if (this.hitPoint <= 0) {
            this.isDied = true;
            this._die();
            BattleController.getInstance().noticeTroopIsDied();
            this.state = TROOP_STATE.DONE;
        } else {
            if (this._hpBar.getNumberOfRunningActions() > 0) this._hpBar.stopAllActions();
            if (this._hpBarBG.getNumberOfRunningActions() > 0) this._hpBarBG.stopAllActions();
            this._hpBarBG.setOpacity(255);
            this._hpBar.setOpacity(255);
            this._hpBar.scaleX = this.hitPoint / this.maxHitPoint;
        }
    },

    _runAnimationAttack: function () {
        // calculator attack direction
        if (this._attackDir === null) {
            this._attackDir = this._calAttackDirection();
        }
        this.stopAllActions();
        this.runAction(this._listAttackAnimation[this._attackDir]);
    },

    _resetIdleState: function () {
        this.state = TROOP_STATE.IDLE;
        this._waitingTime = this._defaultWaitingTime;
    },

    runIdleAnimation: function (direction) {
        this.runAction(this._listIdleAnimation[direction]);
    }
})

var TroopFactory = {
    increaseId: -1,
    createTroop: function (type, level, position) {
        this.increaseId += 1;
        switch (type) {
            case TROOP.WARRIOR:
                return new Warrior(this.increaseId, level, position);
            case TROOP.ARCHER:
                return new Archer(this.increaseId, level, position);
            case TROOP.GIANT:
                return new Giant(this.increaseId, level, position);
            case TROOP.FLYING_BOOM:
                return new FlyingBoom(this.increaseId, level, position);
            case TROOP.GOBLIN:
                return new Goblin(this.increaseId,level,position);
        }
    },
    resetId: function () {
        this.increaseId = -1;
    }
}
Troop.ID=0;
Troop.TYPE=1;
Troop.POSITION=2;
