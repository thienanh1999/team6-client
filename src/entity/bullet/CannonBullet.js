var CannonBullet = cc.Sprite.extend({
    ctor: function (position,idle) {
        this._super();
        this.position = cc.p(position.x,position.y);
        // this.setTexture("battle/cannon_fire/03.png");
        this.attack(500,2000);
    },
    attack: function (x,y) {
        timefire=9;
        this._listFireAnimation=Animation.createAnimation(10,"battle/cannon_fire/",1,timefire,200,200);
        this._fire= cc.Sprite("battle/cannon_fire/03.png");
        this._fire.attr({
            x:100,
            y:50
        })
        this._fire.runAction(this._listFireAnimation[0]);
        // this._fire.runAction(cc.sequence(cc.delayTime(timefire),cc.fadeOut(0.5)));
        this.addChild(this._fire);

        this._bullet=cc.Sprite("battle/cannon_bullet.png");
        this._bullet.attr({
            x:50,
            y:150,
        })
        this.addChild(this._bullet);
        this._hit= cc.Sprite("blank.png");
        this._hitAnimation=Animation.createAnimation(11,"battle/cannon_hit/",1,timefire,80,80);
        this.addChild(this._hit);
        tt=cc.targetedAction(this._hit,this._hitAnimation[0]);
        // this._bullet.runAction(cc.sequence(cc.moveTo(2,x,y),cc.fadeOut(0),tt));
    }
})