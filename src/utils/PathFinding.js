DELTA = [
    cc.p(0, 1),
    cc.p(-1, 0),
    cc.p(0, -1),
    cc.p(1, 0),
    cc.p(1, 1),
    cc.p(-1, 1),
    cc.p(-1, -1),
    cc.p(1, -1),
]

LIST_DELTA = [
    [
        cc.p(1, 1),
        cc.p(-1, 1),
        cc.p(-1, -1),
        cc.p(1, -1),
        cc.p(0, 1),
        cc.p(-1, 0),
        cc.p(0, -1),
        cc.p(1, 0),
    ],
    [
        cc.p(0, 1),
        cc.p(-1, 0),
        cc.p(0, -1),
        cc.p(1, 0),
        cc.p(1, 1),
        cc.p(-1, 1),
        cc.p(-1, -1),
        cc.p(1, -1),
    ],
    [
        cc.p(0, -1),
        cc.p(1, 0),
        cc.p(0, 1),
        cc.p(-1, 0),
        cc.p(-1, -1),
        cc.p(1, -1),
        cc.p(1, 1),
        cc.p(-1, 1),
    ],
    [
        cc.p(-1, 0),
        cc.p(0, 1),
        cc.p(1, 0),
        cc.p(0, -1),
        cc.p(-1, 1),
        cc.p(1, 1),
        cc.p(1, -1),
        cc.p(-1, -1),
    ],
    [
        cc.p(1, 0),
        cc.p(0, 1),
        cc.p(-1, 0),
        cc.p(0, -1),
        cc.p(1, -1),
        cc.p(-1, -1),
        cc.p(-1, 1),
        cc.p(1, 1),
    ],
    [
        cc.p(-1, -1),
        cc.p(-1, 1),
        cc.p(0, 1),
        cc.p(1, 0),
        cc.p(-1, 0),
        cc.p(0, -1),
        cc.p(1, -1),
        cc.p(1, 1),
    ]
]


// direction
DIR = [];
DIR[-1] = [];
DIR[0] = [];
DIR[1] = [];
DIR[1][1] = DIRECTION.SE;
DIR[0][1] = DIRECTION.S;
DIR[-1][1] = DIRECTION.SW;
DIR[-1][0] = DIRECTION.W;
DIR[-1][-1] = DIRECTION.NW;
DIR[0][-1] = DIRECTION.N;
DIR[1][-1] = DIRECTION.NE;
DIR[1][0] = DIRECTION.E;


function Node(position, previous) {
    this.position = position;
    this.previous = previous;
}

var Bfs = {
    mapId: null,
    check: function (position) {
        let x = position.x;
        let y = position.y;
        let x2, y2;
        if (x >= 0 && x < this.height && y >= 0 && y < this.width && this.mark[x][y] === 0) {
            if (this.mapId[x][y] === -1) return true;
            x2 = x - 1;
            y2 = y - 1;
            if (x2 >= 0 && y2 >= 0) {
                if (this.mapId[x2][y2] !== this.mapId[x][y])
                    return true;
                else return false;
            } else return true;
        }
        return false;
    },
    generatePath: function (mark, target) {
        let path = [];
        let position = target;
        let previous = mark[target.x][target.y];
        while (previous !== null) {
            let deltaX = position.x - previous.x;
            let deltaY = position.y - previous.y;
            position = previous;
            previous = mark[position.x][position.y];
            path.push(DIR[deltaX][deltaY]);
        }
        return path;
    },
    findPath: function (mapId, startPosition, targetId) {
        // pre
        this.mapId = mapId;
        this.height = mapId.length;
        this.width = mapId[0].length;
        // find path
        this.mark = MapController.getInstance().create2DArray(this.height, this.width, 0);

        let queue = new Queue();
        let startNode = new Node(startPosition, null);

        queue.enqueue(startNode);
        this.mark[startPosition.x][startPosition.y] = null;
        while (!queue.isEmpty()) {
            let node = queue.dequeue();
            if (this.mapId[node.position.x][node.position.y] === targetId) {
                return this.generatePath(this.mark, node.position);
            }
            for (let i = 0; i < DELTA.length; i++) {
                let direction = DELTA[i];
                let newPosition = cc.p(node.position.x + direction.x, node.position.y + direction.y);
                if (this.check(newPosition)) {
                    let newNode = new Node(newPosition, node.position);
                    queue.enqueue(newNode);
                    this.mark[newPosition.x][newPosition.y] = node.position;
                }
            }
        }

    },

    checkP: function (position) {
        let x = Math.floor(position.x / 2);
        let y = Math.floor(position.y / 2);
        let x2, y2;
        if (x >= 0 && x < this.height && y >= 0 && y < this.width && this.mark[position.x][position.y] === 0) {
            if (this.mapId[x][y] === -1) return true;
            return this.mapId[x][y] === 1 && (position.x === 0 || position.y === 0);

        }
        return false;
    },

    findPathWithPosition: function (mapId, startPosition, endPosition) {
        // pre
        this.mapId = mapId;
        this.height = mapId.length;
        this.width = mapId[0].length;
        // find path
        this.mark = MapController.getInstance().create2DArray(this.height * 2, this.width * 2, 0);
        startPosition = cc.p(startPosition.x * 2, startPosition.y * 2);
        let queue = new Queue();
        let startNode = new Node(startPosition, null);

        queue.enqueue(startNode);
        this.mark[startPosition.x][startPosition.y] = null;
        while (!queue.isEmpty()) {
            let node = queue.dequeue();
            if (node.position.x / 2 === endPosition.x && node.position.y / 2 === endPosition.y) {
                return this.generatePath(this.mark, node.position);
            }
            for (let i = 0; i < DELTA.length; i++) {
                let direction = DELTA[i];
                let newPosition = cc.p(node.position.x + direction.x, node.position.y + direction.y);
                if (this.checkP(newPosition)) {
                    let newNode = new Node(newPosition, node.position);
                    queue.enqueue(newNode);
                    this.mark[newPosition.x][newPosition.y] = node.position;
                }
            }
        }
    }

}

