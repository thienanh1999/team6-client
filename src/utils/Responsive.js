var GRAVITY = {
    LEFT : 0,
    RIGHT : 1,
    CENTER : 2,
}
var Responsive = {
    viewPosition : null,
    scale : cc.p(),
    center:function (layer,ratio){
        this._initViewPosition();
        let  viewSize =cc.director.getVisibleSize();
        layer.anchorX = 0.5;
        layer.anchorY = 0.5;
        let layerSize = layer.getContentSize();
        // scale
        let scale;
        if (layerSize.width/viewSize.width > layerSize.height/viewSize.height){
            scale = (ratio*viewSize.width)/layerSize.width;
        }
        else{
            scale = (ratio*viewSize.height)/layerSize.height;
        }
        layer.scaleX = scale;
        layer.scaleY = scale;

        // center position
        let center = cc.p();
        center.x = (viewSize.width)/2 + this.viewPosition.x;
        center.y = (viewSize.height )/2+ this.viewPosition.y;
        layer.x = center.x;
        layer.y = center.y;
    },

    bottom:function(layer){
        this._initViewPosition();
        layer.anchorX = 0.5;
        layer.anchorY = 0;
        // scale
        let  viewSize =cc.director.getVisibleSize();
        var scale = cc.director.getVisibleSize().width/layer.getContentSize().width;
        layer.scaleX = scale;
        layer.scaleY = scale;
        layer.x = this.viewPosition.x + viewSize.width/2;
        layer.y = this.viewPosition.y;
    },

    top:function(layer,gravity){
        this._initViewPosition();
        let viewPort = cc.director.getOpenGLView().getViewPortRect();
        let  viewSize =cc.director.getVisibleSize();

        //
        // scale
        layer.scaleX = 1/this.scale.x;
        layer.scaleY = 1/this.scale.x;

        layer.anchorX = 0;
        layer.anchorY = 0;
        let layerSize = layer.getContentSize();
        layerSize.width /= this.scale.x;
        layerSize.height /= this.scale.x;
        layer.y = viewSize.height + this.viewPosition.y - layerSize.height;

        if (gravity === GRAVITY.LEFT) {
            layer.x = this.viewPosition.x;
        }
        else if (gravity === GRAVITY.RIGHT){
            layer.x = viewSize.width + this.viewPosition.x - layerSize.width;
        }
        else{
            layer.anchorX = 0.5;
            layer.x = viewSize.width/2 + this.viewPosition.x;
        }
    },
    _initViewPosition:function(){
        if (this.viewPosition === null){
            this.viewPosition = cc.p();
            let viewPort = cc.director.getOpenGLView().getViewPortRect();
            this.viewPosition.x = -viewPort.x/cc.view.getScaleX();
            this.viewPosition.y = -viewPort.y/cc.view.getScaleY();
            let viewSize = cc.director.getVisibleSize();
            this.scale.x = DESIGN_RESOLUTION_WIDTH/viewSize.width*1.2;
            this.scale.y = DESIGN_RESOLUTION_HEIGHT/viewSize.height*1.2;
        }
    }
}