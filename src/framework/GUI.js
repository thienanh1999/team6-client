var fr = fr||{}

fr.view = function(Screen, transitionTime)
{
    var layer = new Screen();

    layer.setName("screen");
    var scene = new cc.Scene();
    scene.addChild(layer);
    if(!transitionTime)
    {
        transitionTime = 1,0;
    }
    cc.director.runScene(new cc.TransitionFade(transitionTime, scene));
    return layer;
};
fr.setView = function(layer)
{
    layer.setName("screen");
    var scene = new cc.Scene();
    scene.addChild(layer);
    cc.director.runScene(new cc.TransitionFade(1.0, scene));
};
fr.getCurrentScreen = function()
{
    return cc.director.getRunningScene().getChildByName("screen");
};

