var Effect ={
    zoom:function (sprite) {
        sprite.setVisible(true);
        var actionZoom = cc.scaleBy(0.5, 1.5);
        sprite.runAction(cc.sequence(actionZoom, cc.delayTime(0.25), actionZoom.reverse()));

    }
}