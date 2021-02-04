var Obstacle = Entity.extend({
   timeLeft: 0,
   config: null,
   type: STRUCTURE.OBSTACLE,

   ctor: function(id, state, buildingTime, type, position) {
      // TODO: this one is hot fix
      if (buildingTime != 0) {
         state = NumberUtils.setBit(state, 1);
      }

      this.type = type;
      this.state = state;
      this.buildingTime = buildingTime;
      this.getConfig();
      this.size = cc.p(this.config.width, this.config.height);
      this._super(id, position, this.getIdlePath());
   },

   getEntityName: function() {
      return "Obstacle";
   },

   getIdlePath: function() {
      return "obstacle/" + this.type.toLowerCase() + "/idle/image0000.png";
   },

   getConfig: function() {
      var config = ConfigAPI.getInstance();
      this.config = config.getEntityInfo(STRUCTURE.OBSTACLE, 1)[this.type]["1"];
   },

   onSelect: function() {
      this._super();
      // Show name
      if (NumberUtils.getBitAt(this.state, 1)) {
          this._spriteName.y = this.size.y/2*TILE_HEIGHT + 60;
      } else {
          this._spriteName.y = this.size.y/2*TILE_HEIGHT;
      }
      this._spriteName.setVisible(true);
   },

   onCancelSelect: function() {
      this._super();
      // Hide name
      this._spriteName.setVisible(false);
   },

   getListAction: function() {
      if (NumberUtils.getBitAt(this.state, 1))
         return [{"ACTION":ACTION_LAYER.QUICK_FINISH}];
      else
         return [{
            "ACTION":ACTION_LAYER.REMOVE,
            "COST": {
               "gold": this.config["gold"] || 0,
               "elixir": this.config["elixir"] || 0
            }
         }]
   },

   remove: function() {
      MapController.getInstance().build(this, this.config);
   },

   displayBuildingTime: function() {
      this._buildingBar.setVisible(NumberUtils.getBitAt(this.state, 1));
      this.updateTimeLabel(TimeUtils.getTimeStamp());
   },

   startBuild: function(builder) {
      this._super(builder);
      this.buildingTime = TimeUtils.getTimeStamp();
      this.state = NumberUtils.setBit(this.state, 1);
      this.displayBuildingTime();
      this.onCancelSelect();
   },

   onBuildSuccess: function() {
      this._super();

      // Reward
      var elixir = this.config["rewardElixir"] || 0;
      var darkElixir = this.config["rewardDarkElixir"] || 0;
      elixir = 100;
      var rewardLabel = cc.LabelBMFont(Math.max(elixir, darkElixir), FONT.SOJI_16);
      rewardLabel.attr({
         x: this.width/2,
         y: this.size.y * TILE_HEIGHT/2,
         color: cc.color(204, 52, 235)
      });
      this.addChild(rewardLabel);
      rewardLabel.setLocalZOrder(COLLECT_CONSTANT.LOCAL_Z_ORDER);
      rewardLabel.runAction(cc.moveTo(0.5, cc.p(this.width/2, this.size.y * TILE_HEIGHT/2 + 50)));
      this._baseSprite.runAction(cc.fadeOut(1.1));
      if(this._grass!== undefined)this._grass.runAction(cc.fadeOut(1.1));
      rewardLabel.runAction(cc.sequence(
          cc.delayTime(0.6),
          cc.FadeOut(0.5),
          cc.fadeIn(0),
          cc.callFunc(function(){
             rewardLabel.setVisible(false);
             MapController.getInstance().removeStructure(this);
             MapController.getInstance().getMapLayer()._grassLayer.destroy(this);
          }.bind(this))
      ));
   }
});