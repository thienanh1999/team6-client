var Queue = cc.Class.extend({
    _data: null,
    _length: null,
    ctor: function () {
        this._data = [];
    },
    enqueue: function (item) {
        this._data.push(item);
    },
    dequeue: function () {
        let item = null;
        if (this._data.length !== 0) {
            item = this._data[0];
            this._data.shift();
        }
        return item;
    },

    isEmpty: function () {
        return this._data.length === 0;
    }
})

var Arrays = {
    create2DArray: function (high, width, defaultValue = -1) {
        let array = [];
        for (let i = 0; i < high; i++) {
            array.push([]);
            for (let j = 0; j < width; j++) {
                array[i].push(defaultValue);
            }
        }
        return array;
    },
    fillArray: function (array, position, size, value) {
        for (var i = 0; i < size.x; i++)
            for (var j = 0; j < size.y; j++) {
                array[position.x + i][position.y + j] = value;
            }
    },
    clean2DArray: function (array, value) {
        for (let i = 0; i < array.length; i++)
            for (let j = 0; j < array[i].length; j++) {
                array[i][j] = value;
            }
    }
}

var PriorityQueue = cc.Class.extend({
    _data: null,
    ctor: function () {
        this._data = [];
    },

    push: function (item, f = 0) {
        this._data.push([item, f]);
    },
    pop: function () {
        let cost = 1000000;
        let index = -1;
        let node = null;
        for (let i = 0; i < this._data.length; i++) {
            if (this._data[i][1] < cost) {
                node = this._data[i][0];
                index = i;
                cost = this._data[i][1];
            }
        }
        this._data.splice(index, 1);


        return node;
    },
    isEmpty: function () {
        return this._data.length === 0;
    },
    update: function (item, f) {
        for (let i = 0; i < this._data.length; i++) {
            let node = this._data[i][0];
            if (node.position.x === item.position.x && node.position.y === item.position.y) {
                this._data[i][1] = f;
                this._data[i][0].cost = item.cost;
                this._data[i][0].prevPosition = item.prevPosition;
                return;
            }
        }
    }
})


