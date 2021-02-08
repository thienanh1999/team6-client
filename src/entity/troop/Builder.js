var Builder = cc.Sprite.extend({
    builderHutID: null,
    hide: false,

    ctor: function (id, position, builderHutID) {
        this._super();
        this.id = id;
        this.position = cc.p(position.x, position.y);
        this.level = 0;
        this.type = TROOP.BUILDER;
        this.name = "Builder";
        this.builderHutID = builderHutID;
        this.initAnimation();
        this._initMoveAction();
        this.path = [];
        this._updateZIndex();
        // find path
        this.open = null;
        this.close = null;
        this.state = TROOP_STATE.DONE;
    },
    goTo: function (targetId, del=false) {
        this._oldDir = null;
        this.attackRange = 0.4;
        this.target = MapController.getInstance()._objectByID[targetId];
        this._path = this._findPathToTarget(true, 10000, false);
        if (this._path == null || this._path.length === 0) return;
        if (this.state === TROOP_STATE.ATTACKING || this.state === TROOP_STATE.DONE){
            this.state = TROOP_STATE.RUNNING;
            this.stopAllActions();
            this._move();
        }

        this.hide = del;
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

    _findPathToTarget: function (ignoreWall = false, ceil = 10000, battleMode = true) {
        let targetPoint = cc.p(this.target.position.x*2+ Math.random()*this.target.size.x*2,this.target.position.y*2+ Math.random()*this.target.size.y*2)
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

    _move: function (onTop = false) {
        if (this._path.length === 0) {
            this.stopAllActions();
            this.attackDir = this._calAttackDirection();
            this.runAction(this._listAttackAnimation[this.attackDir]);
            this.state = TROOP_STATE.ATTACKING;

            if (this.hide) {
                this.state = TROOP_STATE.DONE;
                this.setVisible(false);
            }
        } else {
            let direction = this._path[this._path.length - 1];
            if (this._oldDir !== direction) {
                this.stopAllActions();
                this.runAction(this._listRunAnimation[direction]);
            }
            this._path.pop();
            this.runAction(cc.sequence(
                this._listMoveAction[direction],
                cc.callFunc((function () {
                    this._move();
                }).bind(this))
                )
            );
            this.position.x += DELTA_POSITION.get(direction).x/2;
            this.position.y += DELTA_POSITION.get(direction).y/2;
            this._updateZIndex(onTop);
            this._oldDir = direction;
        }

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
        let listAttackAnimate = this._createAnimate(numFrames, path + "attack01/");
        let animation;
        for (let i = 0; i < 5; i++) {
            animation = cc.sequence(
                cc.flipX(false),
                cc.Animate(listAttackAnimate[i])
            ).repeatForever();
            animation.retain();
            this._listAttackAnimation[i] = animation;
        }
        for (let i = 5; i < 8; i++) {
            animation = cc.sequence(
                cc.flipX(true),
                cc.Animate(listAttackAnimate[i])
            ).repeatForever();
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
        let timeMove = 1 / 16 * 10/2;
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

    _updateZIndex: function (onTop = false) {
        if (onTop) {
            this.zIndex = this.position.x * this.position.x + this.position.y * this.position.y -50;
        } else {
            this.zIndex = this.position.x * this.position.x + this.position.y * this.position.y - 50;
        }
    },

    isRunning: function () {
        return (this.state === TROOP_STATE.RUNNING);
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
})