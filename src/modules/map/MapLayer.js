var MapLayer = cc.Layer.extend({
    ctor:function() {
        this._super();

        this.touchable = true;
        this._currentScale = 1;
        this._mapController = MapController.getInstance();
        this.render();
        this.addTouchListener();

        // scheduler
        this.schedule(this.updateGame, UPDATE_GAME);
    },

    continueUpdate: function () {
        this.schedule(this.updateGame, UPDATE_GAME);
    },

    updateGame: function () {
        var timeManager = MapController.getInstance().getTimeManager();
        timeManager.update(timeManager.getTime() + UPDATE_GAME);
        var currentTimeStamp = TimeUtils.getTimeStamp();

        if (Math.floor(currentTimeStamp) % 30 == 0) {
            timeManager.getServerTime();
        }

        this._mapController.updateBuildingStructure(currentTimeStamp);
        this._mapController.updateMiner();
    },

    render: function() {
        // 1. background
        this._mapLayer = ccs.load("guilayer/MapLayer.json", "").node;
        this._mapLayer.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            scale: this._currentScale
        });
        // 2. tile map
        this._tileMap = new TileMap();
        this._tileMap.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: this._mapLayer.width/2,
            y: this._mapLayer.height/2,
            scale: TILE_MAP_SCALE
        });
        this._mapLayer.addChild(this._tileMap, -1);
        this.addChild(this._mapLayer);

        // 3. grass
        this._grassLayer = new GrassLayer(this._mapLayer.size);
        this._mapLayer.addChild(this._grassLayer);
        this._arrowLayer = new ArrowLayer(this._mapLayer.size);

        // 4. structure & troop
        this._objectLayer = new cc.Layer(this._mapLayer.size);
        this._mapLayer.addChild(this._objectLayer);
        var items = this._mapController.getAllStructure();
        for (i in items) {
            var item = items[i];
            this.putStructureToMap(item);
        }
        var walls = this._mapController.getListStructures(STRUCTURE.WALL);
        for (var i in walls) {
            walls[i].updateAppearance();
        }

        // 5. arrow & draw line
        this._mapLayer.addChild(this._arrowLayer);

        // 6. action layer
        this._actionLayer = ActionLayer.getInstance();
        this._actionLayer.attr({
            anchorX: 0,
            x: 0,
            y: -ACTION_LAYER.HEIGHT
        });
        this.addChild(this._actionLayer);
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
    },

    putTroopToPosition: function (troop,position){
        troop.position.x = position.x;
        troop.position.y = position.y;
        let pixelPosition = this.convertTilePositionToPixelPosition(position);
        troop.attr({
            x: pixelPosition.x,
            y: pixelPosition.y,
            scale: TILE_MAP_SCALE
        });
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
        if (structure.canMove)
            this._arrowLayer.createArrow(structure);
        this._objectLayer.addChild(structure);
        this.resetObjectZOrder(structure);
    },

    // the bottom left point of structure should be at tilePos
    moveStructure: function(structure, tilePos) {
        var checkValid = !this._mapController.checkCollide(cc.p(tilePos.x-structure.size.x+1, tilePos.y-structure.size.y+1), structure.size, structure.id);
        if (checkValid) {
            this._mapController.updateMap(structure, cc.p(tilePos.x-structure.size.x+1, tilePos.y-structure.size.y+1), false);
            structure.position = cc.p(tilePos.x-structure.size.x+1, tilePos.y-structure.size.y+1);
        }
        if (checkValid != structure.validPosition) {
            structure.validPosition = checkValid;
        }
        structure.updatePositionStatus(true);
        tilePos.x -= structure.size.x/2 - 1;
        tilePos.y -= structure.size.y/2 - 1;
        var posInTileMap = this._tileMap.convertTilePositionToNodeSpace(tilePos);
        var pos = cc.p(posInTileMap.x*TILE_MAP_SCALE - this._tileMap.width/2*TILE_MAP_SCALE + this._tileMap.x,
            posInTileMap.y*TILE_MAP_SCALE - this._tileMap.height/2*TILE_MAP_SCALE + this._tileMap.y);
        structure.attr({
            x: pos.x,
            y: pos.y
        });
        structure.onMoved();
    },

    resetObjectZOrder: function(object) {
        // TODO: .....
        let x = object.position.x;
        let y = object.position.y;
        // var zOrder = object.position.x + object.position.y + object.size.x / 2 + object.size.y / 2;
        //object.setLocalZOrder(zOrder);
        let zOrder = x * x + y * y;
        // cc.log("x ",object.position.x," y ",object.position.y," w ",object.size.x," h ",object.size.y, " z ",zOrder);
        object.zIndex = zOrder;
    },

    addTouchListener: function() {
        var self = this;
        var ctrPressed = false;
        var movingTouch = false;
        var movingObject = false;
        var previousPos = null;
        var centerPinch = null;

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function(touches, event) {
                if (self.touchable) {
                    // Single Touch
                    if (touches.length == 1) {
                        var touch = touches[0];
                        var tilePos = self._tileMap.convertTouchToTilePosition(touch.getLocation());
                        if (self.selectedObject != null && self.objectTemporaryPos.x - self.selectedObject.size.x + 1 <= tilePos.x && tilePos.x <= self.objectTemporaryPos.x
                            && self.objectTemporaryPos.y - self.selectedObject.size.y + 1 <= tilePos.y && tilePos.y <= self.objectTemporaryPos.y) {
                            // Start moving object
                            movingObject = true;
                            self.selectedObject.setLocalZOrder(100);
                            previousPos = self.selectedObject.position;
                            previousPos = cc.p(previousPos.x+self.selectedObject.size.x-1, previousPos.y+self.selectedObject.size.y-1);
                        }
                    }

                    // Multiple Touch
                    if (touches.length == 2) {
                        var touchOne = touches[0].getLocation();
                        var touchTwo = touches[1].getLocation();

                        centerPinch = cc.p((touchOne.getLocationInView().x+touchTwo.getLocationInView().x)/2, (touchOne.getLocationInView().y+touchTwo.getLocationInView().y)/2);
                    }
                }
                return true;
            }.bind(this),
            onTouchesMoved: function(touches, event) {
                if (self.touchable) {
                    // Single Touch
                    if (touches.length == 1) {
                        var touch = touches[0];
                        if (movingObject && self.selectedObject.canMove) {
                            // Move Object
                            var tilePos = self._tileMap.convertTouchToTilePosition(touch.getLocation());
                            self.selectedObject.setLocalZOrder(1000);
                            self.objectTemporaryPos = cc.p(tilePos.x, tilePos.y);
                            self.moveStructure(self.selectedObject, tilePos);
                        } else {
                            // Move Map
                            movingTouch = true;
                            var previousLocation = touch.getPreviousLocation();
                            var distX = touch.getLocation().x - previousLocation.x;
                            var distY = touch.getLocation().y - previousLocation.y;
                            self.moveMap(distX, distY);
                        }
                    }

                    // Multiple Touch
                    if (touches.length == 2) {
                        var touchOne = touches[0];
                        var touchTwo = touches[1];

                        if (centerPinch == null) {
                            centerPinch = cc.p((touchOne.getLocationInView().x+touchTwo.getLocationInView().x)/2, (touchOne.getLocationInView().y+touchTwo.getLocationInView().y)/2);
                        }

                        var touchLocationOne = touchOne.getLocationInView();
                        var touchLocationTwo = touchTwo.getLocationInView();

                        var previousLocationOne = touchOne.getPreviousLocationInView();
                        var previousLocationTwo = touchTwo.getPreviousLocationInView();

                        var currentDistance = Math.sqrt(Math.pow(touchLocationOne.x-touchLocationTwo.x, 2.0) +
                            Math.pow(touchLocationOne.y-touchLocationTwo.y, 2.0));
                        var previousDistance = Math.sqrt(Math.pow(previousLocationOne.x-previousLocationTwo.x, 2.0) +
                            Math.pow(previousLocationOne.y-previousLocationTwo.y, 2.0));
                        var distanceDelta = currentDistance - previousDistance;
                        var newDistanceDelta = distanceDelta/previousDistance * self.scale;
                        self.zoom(newDistanceDelta, centerPinch);
                    }
                }
            }.bind(this),
            onTouchesEnded: function(touches, event) {
                if (self.touchable) {
                    if (PopupLayer.getInstance().swallow1Touch) {
                        PopupLayer.getInstance().swallow1Touch = false;
                        return;
                    }

                    // Single Touch
                    if (touches.length == 1 && centerPinch == null) {
                        var touch = touches[0];

                        if (self.selectedObject != null) {
                            // Skip if preparing build
                            if (NumberUtils.getBitAt(self.selectedObject.state, 0)) {
                                return;
                            }
                            if (movingObject && self.selectedObject.validPosition && self.selectedObject.canMove) {
                                self.selectedObject.updatePositionStatus(false);
                                self.resetObjectZOrder(self.selectedObject);
                                // draw lines
                                var mapController = MapController.getInstance();
                                self._arrowLayer.drawLines(mapController._map.id, mapController._objectByID);
                                self.resetObjectZOrder(self.selectedObject);
                                var objectState = self.selectedObject.state;
                                if (NumberUtils.getBitAt(objectState, 0) === 0) {
                                    testnetwork.connector.sendMove(self.selectedObject.id, self.selectedObject.position.x, self.selectedObject.position.y);
                                }
                                var builderHut = self.selectedObject.builderHut;
                                if (builderHut != null)
                                    builderHut.builder.goTo(self.selectedObject.id);
                                if (self.selectedObject.type == STRUCTURE.WALL) {
                                    self.selectedObject.updateAppearance();
                                    self.selectedObject.updateNeibour(previousPos);
                                }
                            }
                        }

                        var tilePos = self._tileMap.convertTouchToTilePosition(touch.getLocation());

                        movingObject = false;
                        if (touch.getLocation() != touch.getPreviousLocation() && !movingTouch) {
                            if (self.selectedObject != null && self.objectTemporaryPos.x - self.selectedObject.size.x + 1 <= tilePos.x && tilePos.x <= self.objectTemporaryPos.x
                                && self.objectTemporaryPos.y - self.selectedObject.size.y + 1 <= tilePos.y && tilePos.y <= self.objectTemporaryPos.y) {
                                cc.log("Touch object at temporary position");
                            } else {
                                var object = self._mapController.getObjectByTilePos(tilePos);
                                if (object == null) {
                                    ActionLayer.getInstance().hide();
                                }
                                if (self.selectedObject != null && object != self.selectedObject) {
                                    if (!self.selectedObject.validPosition && self.selectedObject.canMove) {
                                        self.moveStructure(self.selectedObject, previousPos);
                                        self.selectedObject.updatePositionStatus(false);
                                    }
                                    self.selectedObject.onCancelSelect();
                                }
                                self.selectedObject = object;
                                if (self.selectedObject != null) {
                                    self.objectTemporaryPos = cc.p(object.position.x + object.size.x - 1, object.position.y + object.size.y - 1);
                                    self.selectedObject.onSelect();
                                    ActionLayer.getInstance().display(self.selectedObject);
                                    self.resetObjectZOrder(self.selectedObject);
                                }
                            }
                        }
                        movingTouch = false;
                    }
                    centerPinch = null;
                }
            }.bind(this)
        }, this);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:function(key, event) {
                if (key == 17) {
                    ctrPressed = true;
                }
            },
            onKeyReleased:function(key, event) {
                if (key == 17) {
                    ctrPressed = false;
                }
            }
        }, this);

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseScroll: function(event) {
                if (ctrPressed) {
                    self.zoom(-event.getScrollY() * ZOOM_STEP, event.getLocation());
                } else {
                    self.moveMap(0, MOUSE_MOVE_STEP * event.getScrollY());
                }
            }.bind(this)
        }, this);
    },

    zoom: function(zoomScale, center) {
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

        var x = center.x + (this._mapLayer.width/2 - positionInMap.x) * this._currentScale;
        var y = center.y + (this._mapLayer.height/2 - positionInMap.y) * this._currentScale;
        var point = this.getEdgeXY(x, y);
        this._mapLayer.attr({
            x: point.x,
            y: point.y,
            scale: this._currentScale
        })
    },

    moveMap: function(distX, distY) {
        var x = this._mapLayer.x + distX;
        var y = this._mapLayer.y + distY;
        var point = this.getEdgeXY(x, y);
        this._mapLayer.x = point.x;
        this._mapLayer.y = point.y;
    },

    getEdgeXY: function(x, y) {
        var maxX = this._mapLayer.width*this._currentScale;
        var minX = -this._mapLayer.width*this._currentScale + cc.winSize.width;
        var maxY = this._mapLayer.height*this._currentScale;
        var minY = -this._mapLayer.height*this._currentScale + cc.winSize.height;
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

    getPositionInMapFromPoint: function(point) {
        var position = cc.p((this._mapLayer.width/2*this._currentScale-this._mapLayer.x+point.x)/this._currentScale,
            (this._mapLayer.height/2*this._currentScale-this._mapLayer.y+point.y)/this._currentScale);
        return position;
    },

    checkTouchObject: function (object, location) {
        var tilePos = this._tileMap.convertTouchToTilePosition(location);
        var objectPos = object.position;
        return ((objectPos.x <= tilePos.x) && (tilePos.x <= objectPos.x + object.size.x - 1)
            && (objectPos.y <= tilePos.y) && (tilePos.y <= objectPos.y + object.size.y - 1))
    },
    disableTouch: function() {
        this.touchable = false;
    },
    enableTouch: function() {
        this.touchable = true;
    },
    convertTilePositionToPixelPosition:function (tilePosition){
        let posInTileMap = this._tileMap.convertTilePositionToNodeSpace(tilePosition);
        let position = cc.p(posInTileMap.x*TILE_MAP_SCALE - this._tileMap.width/2*TILE_MAP_SCALE + this._tileMap.x,
            posInTileMap.y*TILE_MAP_SCALE - this._tileMap.height/2*TILE_MAP_SCALE + this._tileMap.y);
        return position;
    }
});