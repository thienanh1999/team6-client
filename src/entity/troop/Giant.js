var Giant = Troop.extend({
    ctor:function (id, level, position){
        this.type = TROOP.GIANT;
        this.name = "Giant";
        this.sizeH = 75;
        this._super(id, level, position);
        this._targetType = TARGET_TYPE.DEFENSE;
    },


})