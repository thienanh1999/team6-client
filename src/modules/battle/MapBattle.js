var DELAY_TIME = 800;
var TOUCH_MODE = {
    DROP_TROOP: 0,
    MOVE_MAP: 1,
    NONE: 2,
    DROP_ONE: 3,
}

var MapBattle = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.touchable = true;
        this._currentScale = 1;
        this._mapController = BattleController.getInstance();
        this._drawBackGround();
        this.addTouchListener();
        this.retain();
        this.numTouch = 0;
    },

    reset: function () {
        if (this._grassLayer !== undefined) this._mapLayer.removeChild(this._grassLayer);
        if (this._objectLayer !== undefined) this._mapLayer.removeChild(this._objectLayer);
        this.touchPosition = null;
        this.timeStartTouch = 0;
        this.mode = TOUCH_MODE.NONE;
    },

    render: function () {
        this.reset();
        // 1. grass
        this._grassLayer = new GrassLayer(this._mapLayer.size);
        this._mapLayer.addChild(this._grassLayer);

        // 2. object layer
        this._objectLayer = new cc.Layer(this._mapLayer.size);
        this._mapLayer.addChild(this._objectLayer);

        // 3. render structure
        var items = this._mapController.getAllStructure();
        for (i in items) {
            var item = items[i];
            this.putStructureToMap(item);
        }

        // 4. render wall
        var walls = this._mapController.getAllWall();
        for (var i in walls) {
            walls[i].updateAppearance(true);
        }
    },
    createArrow: function (position, x, y, time = 0.5) {
        let posEnd = this.convertTilePositionToPixelPosition(cc.p(x, y));
        let posStart = this.convertTilePositionToPixelPosition(position);
        var vector = cc.p(posEnd.x - posStart.x, posEnd.y - posStart.y);
        var rad;
        if (vector.x == 0) {
            if (y>0) rad = Math.PI / 2;
            else rad = Math.PI / 2 + 180;
        } else rad = Math.atan(vector.y / vector.x);
        var arrow = cc.Sprite(BATTLE_RESOURCE.ARCHER_ARROW);
        arrow.attr({
            x: posStart.x,
            y: posStart.y,
            scale: TILE_MAP_SCALE
        });
        // arrow.runAction(cc.ScaleBy(0, 3));
        arrow.setRotation(90 - (rad / Math.PI * 180));
        if (vector.x < 0) {
            arrow.setFlippedX(true);
            arrow.setFlippedY(true);
            // arrow.setRotation(360-(90-(rad / Math.PI * 180)));
        }
        // arrow.setRotation(90+rad / Math.PI * 180);

        arrow.setLocalZOrder(10000);
        this._mapLayer.addChild(arrow);
        // arrow.runAction(cc.RotateBy(90+rad / Math.PI * 180));
        arrow.runAction(cc.sequence(
            cc.moveTo(0.5, posEnd.x, posEnd.y),
            cc.fadeOut(0.2)
        ));
    },
    createCanonBullet: function (position, x, y, time = 0.4) {
        // cc.log("Canon");
        position = cc.p(position.x + 1.5, position.y + 1.5);
        // cc.log("thong so" + x + " " + y + " " + position.x + " " + position.y);
        listFireAnimation = Animation.createAnimation(10, "battle/cannon_fire/", 1, 2, 100, 100);
        let posEnd = this.convertTilePositionToPixelPosition(cc.p(x, y));
        let posStart = this.convertTilePositionToPixelPosition(position);
        // cc.log("Vi tri cu" + posStart.x + " " + posStart.y);
        // cc.log("Vi tri moi:" + posEnd.x + " " + posEnd.y);
        fire = cc.Sprite("battle/cannon_fire/09.png");
        fire.runAction(listFireAnimation[0]);
        fire.attr({
            x: posStart.x,
            y: posStart.y,
            scale: TILE_MAP_SCALE
        });
        fire.setLocalZOrder(10000);
        this._mapLayer.addChild(fire);
        bullet = cc.Sprite("battle/cannon_bullet.png");
        this._mapLayer.addChild(bullet);
        bullet.attr({
            x: posStart.x,
            y: posStart.y,
            anchorX: 0,
            anchorY: 0,
            scale: TILE_MAP_SCALE
        });//fix
        // bullet.runAction(cc.moveTo(5,posEnd.x,posEnd.y));
        bullet.setLocalZOrder(10000);
        hit = cc.Sprite("blank.png");
        hitAnimation = Animation.createAnimation(11, "battle/cannon_hit/", 1, 2, 80, 80);
        // hit.runAction(hitAnimation[0]);
        hit.attr({
            x: 0,
            y: 0,
        });
        bullet.addChild(hit);
        tt = cc.targetedAction(hit, hitAnimation[0]);
        tt2 = cc.targetedAction(hit, cc.fadeOut(0));
        tt3 = cc.targetedAction(fire, cc.fadeOut(0));
        bullet.runAction(cc.sequence(
            cc.moveBy(time, posEnd.x - posStart.x, posEnd.y - posStart.y),
            cc.fadeOut(0),
            tt, tt2, tt3
        ));
    },
    createMortarBullet: function (x_start, y_start, x, y, time = 2.5) {
        bullet = cc.Sprite("battle/mortal_bullet_normal/00.png");
        let posEnd = this.convertTilePositionToPixelPosition(cc.p(x, y));
        let posStart = this.convertTilePositionToPixelPosition(cc.p(x_start, y_start));
        let high = 100;
        let pointUp = cc.p((posEnd.x + posStart.x) / 2, (posEnd.y + posStart.y) / 2 + high);
        bullet.attr({
            anchorX: 0,
            anchorY: 0,
            x: posStart.x,//set vi tri xuat phat cua vien dan
            y: posStart.y,
            scale: TILE_MAP_SCALE
        })
        this._mapLayer.addChild(bullet);//fix
        bullet.setLocalZOrder(100000);
        hit = cc.Sprite("blank.png");
        hitAnimation = Animation.createAnimation(12, "battle/mortalbullet_explosion/", 1, 2, 200, 210);
        hit.attr({
            x: 0,
            y: 51,
        })
        bullet.addChild(hit);
        tt = cc.targetedAction(hit, hitAnimation[0]);
        tt2 = cc.targetedAction(hit, cc.fadeOut(0));
        bulletAnimation = Animation.createAnimation(10, "battle/mortal_bullet_normal/", 1, 2, 30, 48);
        bullet.runAction(bulletAnimation[0].repeatForever());
        bullet.runAction(cc.sequence(cc.bezierTo(time, [posStart, pointUp, posEnd]),
            cc.fadeOut(0),
            tt, tt2));
    },
    _drawBackGround: function () {
        this._mapLayer = ccs.load("guilayer/MapLayer.json", "").node;
        this._mapLayer.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: this._currentScale
        });
        this._tileMap = new TileMap();
        this._tileMap.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: this._mapLayer.width / 2,
            y: this._mapLayer.height / 2,
            scale: TILE_MAP_SCALE
        });
        this._mapLayer.addChild(this._tileMap, -1);
        this.addChild(this._mapLayer);
    },

    setSelectedObject: function (object) {
        this.selectedObject = object;
    },

    putTroopToMap: function (troop) {
        let pixelPosition = this.convertTilePositionToPixelPosition(troop.position);
        troop.attr({
            x: pixelPosition.x,
            y: pixelPosition.y,
            scale: TILE_MAP_SCALE
        });
        this._objectLayer.addChild(troop);
        let dropAnimation = new DropUI();
        dropAnimation.attr({
            x: pixelPosition.x,
            y: pixelPosition.y,
            scale: TILE_MAP_SCALE
        })
        this._objectLayer.addChild(dropAnimation);
        dropAnimation.runAnimation();
    },

    putStructureToMap: function (structure) {
        var position = cc.p(structure.position.x, structure.position.y);
        position.x += structure.size.x / 2;
        position.y += structure.size.y / 2;
        var posInTileMap = this._tileMap.convertTilePositionToNodeSpace(position);
        var pos = cc.p(posInTileMap.x * TILE_MAP_SCALE - this._tileMap.width / 2 * TILE_MAP_SCALE + this._tileMap.x,
            posInTileMap.y * TILE_MAP_SCALE - this._tileMap.height / 2 * TILE_MAP_SCALE + this._tileMap.y);
        structure.attr({
            x: pos.x,
            y: pos.y,
            scale: TILE_MAP_SCALE
        });
        this._grassLayer.createGrass(structure);
        this._objectLayer.addChild(structure);
        this.resetObjectZOrder(structure);
    },

    resetObjectZOrder: function (object) {
        let centerObject = cc.p(object.position.x + object.size.x / 2, object.position.y + object.size.y / 2);
        object.zIndex = centerObject.x * centerObject.x + centerObject.y * centerObject.y;
    },

    addTouchListener: function () {
        var self = this;
        var ctrPressed = false;
        var movingTouch = false;
        var movingObject = false;
        var previousPos = null;
        var centerPinch = null;

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function (touches, event) {
                if (self.touchable) {
                    // Single Touch
                    this.numTouch += 1;
                    if (touches.length === 1) {
                        let touch = touches[0];
                        this.touchPosition = self._tileMap.convertTouchToTilePosition(touch.getLocation(), false);
                        this.timeStartTouch = (new Date()).getTime();
                    }
                    // Multiple Touch
                    if (touches.length === 2) {
                        this.mode = TOUCH_MODE.MOVE_MAP;
                        var touchOne = touches[0].getLocation();
                        var touchTwo = touches[1].getLocation();
                        centerPinch = cc.p((touchOne.getLocationInView().x + touchTwo.getLocationInView().x) / 2, (touchOne.getLocationInView().y + touchTwo.getLocationInView().y) / 2);
                    }
                }
                return true;
            }.bind(this),
            onTouchesMoved: function (touches, event) {
                if (self.touchable) {
                    // Single Touch
                    if (touches.length === 1) {
                        var touch = touches[0];
                        this.touchPosition = this._tileMap.convertTouchToTilePosition(touch.getLocation(), false);
                        if (this.mode === TOUCH_MODE.NONE) {
                            let time = (new Date()).getTime() - this.timeStartTouch;
                            let delta = touch.getDelta();
                            delta = delta.x * delta.x + delta.y * delta.y;
                            if (time < DELAY_TIME && delta > 10) {
                                this.mode = TOUCH_MODE.MOVE_MAP;
                            }
                        }
                        if (this.mode === TOUCH_MODE.MOVE_MAP) {
                            // Move Map
                            movingTouch = true;
                            var previousLocation = touch.getPreviousLocation();
                            var distX = touch.getLocation().x - previousLocation.x;
                            var distY = touch.getLocation().y - previousLocation.y;
                            self.moveMap(distX, distY)
                        }
                    }

                    // Multiple Touch
                    if (touches.length === 2) {
                        var touchOne = touches[0];
                        var touchTwo = touches[1];

                        if (centerPinch == null) {
                            centerPinch = cc.p((touchOne.getLocationInView().x + touchTwo.getLocationInView().x) / 2, (touchOne.getLocationInView().y + touchTwo.getLocationInView().y) / 2);
                        }

                        var touchLocationOne = touchOne.getLocationInView();
                        var touchLocationTwo = touchTwo.getLocationInView();

                        var previousLocationOne = touchOne.getPreviousLocationInView();
                        var previousLocationTwo = touchTwo.getPreviousLocationInView();

                        var currentDistance = Math.sqrt(Math.pow(touchLocationOne.x - touchLocationTwo.x, 2.0) +
                            Math.pow(touchLocationOne.y - touchLocationTwo.y, 2.0));
                        var previousDistance = Math.sqrt(Math.pow(previousLocationOne.x - previousLocationTwo.x, 2.0) +
                            Math.pow(previousLocationOne.y - previousLocationTwo.y, 2.0));
                        var distanceDelta = currentDistance - previousDistance;
                        var newDistanceDelta = distanceDelta / previousDistance * self.scale;
                        self.zoom(newDistanceDelta, centerPinch);
                    }

                    if (touches.length >= 2) {
                        this.mode = TOUCH_MODE.MOVE_MAP;
                    }
                }
            }.bind(this),
            onTouchesEnded: function (touches, event) {
                if (self.touchable) {
                    // Single Touch
                    this.numTouch -= 1;
                    if (touches.length === 1) {
                        if (this.mode === TOUCH_MODE.NONE) {
                            this.mode = TOUCH_MODE.DROP_ONE;
                            this.touchPosition = this._tileMap.convertTouchToTilePosition(touches[0].getLocation(), false);
                            this.oldPosition = this.touchPosition;
                        } else {
                            if (this.numTouch <= 0) {
                                this.touchPosition = null;
                                this.timeStartTouch = null;
                                this.mode = TOUCH_MODE.NONE;
                            }
                        }
                    }
                    centerPinch = null;
                }
            }.bind(this)
        }, this);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (key, event) {
                if (key == 17) {
                    ctrPressed = true;
                }
            },
            onKeyReleased: function (key, event) {
                if (key == 17) {
                    ctrPressed = false;
                }
            }
        }, this);

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseScroll: function (event) {
                if (ctrPressed) {
                    self.zoom(-event.getScrollY() * ZOOM_STEP, event.getLocation());
                } else {
                    self.moveMap(0, MOUSE_MOVE_STEP * event.getScrollY());
                }
            }.bind(this)
        }, this);
    },

    updateTouchState: function () {
        if (this.touchPosition !== null && this.mode === TOUCH_MODE.NONE) {
            let time = (new Date()).getTime() - this.timeStartTouch;
            if (time > DELAY_TIME) {
                this.mode = TOUCH_MODE.DROP_TROOP;
                cc.log("mode drop troop")
            }
        }
    },

    getDropPosition: function () {
        this.mode = TOUCH_MODE.NONE;
        this.touchPosition = null;
        this.timeStartTouch = null;
        return this.oldPosition;
    },

    zoom: function (zoomScale, center) {
        this._currentScale = this._mapLayer.scale;
        var positionInMap = this.getPositionInMapFromPoint(center);

        var oldScale = this._currentScale;
        if (zoomScale < 0) {
            this._currentScale = Math.max(MINIMUM_ZOOM_SCALE, this._currentScale + zoomScale);
        } else {
            this._currentScale = Math.min(MAXIMUM_ZOOM_SCALE, this._currentScale + zoomScale);
        }
        if (oldScale == this._currentScale) {
            return;
        }

        var x = center.x + (this._mapLayer.width / 2 - positionInMap.x) * this._currentScale;
        var y = center.y + (this._mapLayer.height / 2 - positionInMap.y) * this._currentScale;
        var point = this.getEdgeXY(x, y);
        this._mapLayer.attr({
            x: point.x,
            y: point.y,
            scale: this._currentScale
        })
    },

    moveMap: function (distX, distY) {
        var x = this._mapLayer.x + distX;
        var y = this._mapLayer.y + distY;
        var point = this.getEdgeXY(x, y);
        this._mapLayer.x = point.x;
        this._mapLayer.y = point.y;
    },

    getEdgeXY: function (x, y) {
        var maxX = this._mapLayer.width * this._currentScale;
        var minX = -this._mapLayer.width * this._currentScale + cc.winSize.width;
        var maxY = this._mapLayer.height * this._currentScale;
        var minY = -this._mapLayer.height * this._currentScale + cc.winSize.height;
        if (x < minX)
            x = minX;
        if (x > maxX)
            x = maxX;
        if (y < minY)
            y = minY;
        if (y > maxY)
            y = maxY;
        return cc.p(x, y);
    },

    getPositionInMapFromPoint: function (point) {
        var position = cc.p((this._mapLayer.width / 2 * this._currentScale - this._mapLayer.x + point.x) / this._currentScale,
            (this._mapLayer.height / 2 * this._currentScale - this._mapLayer.y + point.y) / this._currentScale);
        return position;
    },

    checkTouchObject: function (object, location) {
        var tilePos = this._tileMap.convertTouchToTilePosition(location);
        var objectPos = object.position;
        return ((objectPos.x <= tilePos.x) && (tilePos.x <= objectPos.x + object.size.x - 1)
            && (objectPos.y <= tilePos.y) && (tilePos.y <= objectPos.y + object.size.y - 1))
    },

    convertTilePositionToPixelPosition: function (tilePosition) {
        let posInTileMap = this._tileMap.convertTilePositionToNodeSpace(tilePosition);
        let position = cc.p(posInTileMap.x * TILE_MAP_SCALE - this._tileMap.width / 2 * TILE_MAP_SCALE + this._tileMap.x,
            posInTileMap.y * TILE_MAP_SCALE - this._tileMap.height / 2 * TILE_MAP_SCALE + this._tileMap.y);
        return position;
    }
});

var DropUI = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.animation = dropAnimation;
    },
    runAnimation: function () {
        this.runAction(cc.sequence(
            cc.Animate(this.animation),
            cc.callFunc((function () {
                this.removeFromParent(true);
            }).bind(this))
        ));
    }
})

var dropAnimation = (function () {
    let rootPath = BATTLE_RESOURCE.DROP_TROOP_ANIMATION;
    let animation = Animation.createSingleAnimation(rootPath, 8, 80, 70);
    animation.retain();
    return animation;
})();