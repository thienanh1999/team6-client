var GuiUtils = {
    getIconSize: function(icon) {
        var amountLabel = icon.getChildByName("amount");
        return cc.size(amountLabel.width + icon.width , icon.height)
    }
};