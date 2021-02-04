var Warrior = Troop.extend({
    ctor:function (id, level, position){
        this.type = TROOP.WARRIOR;
        this.name = "Warrior";
        this.sizeH = 55;
        this._super(id, level, position);
        this._targetType = TARGET_TYPE.STRUCTURE;
    },
})