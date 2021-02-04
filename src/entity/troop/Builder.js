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
    },
    goTo: function (targetId, del=false) {
        this._oldDir = null;
        this._path = Bfs.findPath(MapController.getInstance().getMapId(), this.position, targetId);
        if (this._path == null || this._path.length === 0) return;
        this.state = TROOP_STATE.RUNNING;
        this.stopAllActions();
        this._move();

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

    _move: function (onTop = false) {
        if (this._path.length === 0) {
            this.stopAllActions();
            this.runAction(this._listIdleAnimation[this._oldDir]);
            this.state = TROOP_STATE.IDLE;

            if (this.hide) {
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
            this.position.x += DELTA_POSITION.get(direction).x;
            this.position.y += DELTA_POSITION.get(direction).y;
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

        // move action
        this._listMoveAction = [];

    },

    _createAnimation: function (numFrames, path) {
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
            listAnimation.push(new cc.Animation(idleFrames[i], 1 / numFrames));
        }
        listAnimation.push(listAnimation[3].clone());
        listAnimation.push(listAnimation[2].clone());
        listAnimation.push(listAnimation[1].clone());
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

    _initMoveAction: function () {
        this._listMoveAction = [];
        let timeMove = 1 / 16 * 10;
        // SE
        this._listMoveAction.push(cc.MoveBy(timeMove, 0, -28.5));
        // S
        this._listMoveAction.push(cc.MoveBy(timeMove, -19, -14.25));
        // SW
        this._listMoveAction.push(cc.MoveBy(timeMove, -38, 0));
        // W
        this._listMoveAction.push(cc.MoveBy(timeMove, -19, 14.25));
        // NW
        this._listMoveAction.push(cc.MoveBy(timeMove, 0, 28.5));
        // N
        this._listMoveAction.push(cc.MoveBy(timeMove, 19, 14.25));
        // NE
        this._listMoveAction.push(cc.MoveBy(timeMove, 38, 0));
        // E
        this._listMoveAction.push(cc.MoveBy(timeMove, 19, -14.25));

        // retain
        for (let i = 0; i < 8; i++) {
            this._listMoveAction[i].retain();
        }
    },

    _updateZIndex: function (onTop = false) {
        if (onTop) {
            this.zIndex = this.position.x + this.position.y + 10;
        } else {
            this.zIndex = this.position.x + this.position.y + 2;
        }
    },

    isRunning: function () {
        return (this.state === TROOP_STATE.RUNNING);
    },
    testAction: function (i) {
        this.runAction(this._listRunAnimation[DIRECTION.SE]);
    }
})