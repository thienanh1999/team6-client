var BuilderHut = Structure.extend({
    size: cc.p(2, 2),
    type: STRUCTURE.BUILDER_HUT,
    building: null,
    builder: null,

    ctor: function(id, state, position) {
        this._super(id, 1, state, 0, position, this.getIdlePath());
    },

    update: function (){
        if (this.builder!==null && this.builder.state === TROOP_STATE.ATTACKING){
            let random = Math.random();
            if (random>0.8){
                this.builder.goToPosition(this.building.position,this._getRandomPositionToBuild(),this._matrix);
            }
        }
    },

    sendBuilder:function(structure) {
        if (this.builder == null) {
            this.builder = new Builder(this.id, this.position, this.id);
            MapController.getInstance().getMapLayer().putTroopToMap(this.builder);
        }

        if (this.builder.state === TROOP_STATE.DONE) {
            MapController.getInstance().getMapLayer().putTroopToPosition(this.builder,this.position);
        }
        this._initBuildMatrix(structure);
        this.building = structure;
        this.builder.setVisible(true);
        this.builder.goTo(this.building.id);
        structure.builderHut = this;
    },

    recall: function() {
        this.building = null;
        this.builder.goTo(this.id, true);
    },

    _initBuildMatrix: function (structure){
        let size = structure.size;
        let position = structure.position;
        this._matrix = [];
        for (let i=0;i<=size.x;i++){
            this._matrix.push([]);
            for (let j=0;j<=size.y;j++){
                if (i===size.x || j===size.y){
                    this._matrix[i].push(-1);
                }
                else{
                    this._matrix[i].push(1);
                }
            }
        }
    },

    _getRandomPositionToBuild: function (){
        let rd = Math.round(Math.random()*100)%2;
        let rdp = Math.trunc(Math.random()*this.building.size.x);
        let x,y;
        if (rd===0){
            rd = Math.random();
            if (rd<0.5) x= 0;
            else x = this.building.size.x;
            y= rdp;
        }
        else{
            rd = Math.random();
            if (rd<0.5) y=0;
            else y = this.building.size.y;
            x= rdp;
        }
        return cc.p(x,y);
    },

    getIdlePath: function() {
        return ResourceRouter.getIdlePath(this.type, level);
    },
    getListAction: function() {
        return [{"ACTION":ACTION_LAYER.INFO}];
    },

    isFree: function() {
        return (this.building == null);
    }
});