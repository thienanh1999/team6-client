var Goblin = Troop.extend({
    ctor:function (id, level, position){
        this.type = TROOP.GOBLIN;
        this.name = "Goblin";
        this.sizeH = 55;
        this._super(id, level, position);
        this._targetType = TARGET_TYPE.STRUCTURE;
    },
})