var Calculate = {
    calculateRange: function (x1, y1, x2, y2) {

        var leng = Math.sqrt((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2));
        return leng;
    },
}