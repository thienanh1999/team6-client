var NumberUtils = {
    getBitAt: function(number, position) {
        return (number & (1 << position)) === 0 ? 0 : 1;
    },
    setBit: function(number, bitPosition) {
        return number | (1 << bitPosition);
    },
    clearBit: function (number, bitPosition) {
        const mask = ~(1 << bitPosition);
        return number & mask;
    },

    updateBit: function (number, bitPosition, bitValue) {
        const bitValueNormalized = bitValue ? 1 : 0;
        const clearMask = ~(1 << bitPosition);
        return (number & clearMask) | (bitValueNormalized << bitPosition);
    },

    round: function (x) {
        let fl = x - Math.floor(x);
        if (fl <= 0.25) x = Math.floor(x);
        else if (fl >= 0.75) x = Math.ceil(x);
        else x = Math.floor(x) + 0.5;
        return x;
    },

    getDistance: function (position, rect) {

        let x = position.x;
        let y = position.y;
        // cc.log("x ",x);
        // cc.log("y ",y);
        // cc.log("x min : ",rect.min.x);
        // cc.log("y min : ",rect.min.y);
        // cc.log("x max : ",rect.max.x);
        // cc.log("y max : ",rect.max.y);

        if (rect.min.x <= x && x <= rect.max.x) {
            if (rect.min.y <= y && y <= rect.max.y) {
                return 0;
            } else {
                if (y > rect.max.y) return y - rect.max.y;
                else return rect.min.y - y;
            }
        } else {
            if (rect.min.y <= y && y <= rect.max.y) {
                if (x > rect.max.x) return x - rect.max.x;
                else return rect.min.x - x;
            } else {
                let dxmin = rect.min.x - position.x;
                let dxmax = position.x - rect.max.x;
                let dymin = rect.min.y - position.y;
                let dymax = position.y - rect.max.y;
                let dx = Math.max(dxmin, dxmax);
                let dy = Math.max(dymin, dymax);
                return Math.round(Math.sqrt(dx * dx + dy * dy) * 1000.0) / 1000.0;
            }
        }

    },

    getEulerDistance: function (p1, p2) {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        return Math.round(dx * dx + dy * dy);
    },

    getEulerDistance2: function (p1, p2) {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let a = Math.round(Math.sqrt(dx * dx + dy * dy) * 10000.0) / 10000.0;
        return Math.round(Math.sqrt(dx * dx + dy * dy) * 10000.0) / 10000.0;
    }
};