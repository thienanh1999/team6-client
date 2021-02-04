
var _User = cc.Class.extend({
    _id: null,
    _name: null,
    _g: null,
    _gold: null,
    _elixir: null,
    _darkElixir: null,
    _exp: null,
    _level: null,
    _builderNumber: null,
    _troops: null,
    _trophy: null,
    ctor: function () {
        // TODO
        // test
        this._g = 100000;
        this._elixir = 5000000;
        this._gold = 1200000;
        this._darkElixir = 500;

        this._troops = new Map();
        this._troops.set(TROOP.WARRIOR, 1);
        this._troops.set(TROOP.ARCHER, 1);
        this._troops.set(TROOP.GIANT, 1);
        this._troops.set(TROOP.FLYING_BOOM, 1);
    },

    getElixir:function(){
        return this._elixir;
    },
    setElixir: function(elixir) {
        this._elixir = elixir;
    },
    getGold:function(){
        return this._gold;
    },
    setGold:function(gold) {
        this._gold = gold;
    },
    getDarkElixir:function(){
        return this._darkElixir;
    },
    setDarkElixir: function(darkElixir) {
        this._darkElixir = darkElixir;
    },
    getG:function(){
        return this._g;
    },
    setG: function(g) {
        this._g = g;
    },
    getExp:function(){
        return 100;
    },
    getLevel: function () {
        return 10;
    },

    getTroopsLevel: function () {

        return this._troops;

    },

    setId: function (id) {
        this._id = id;
    },
    getId: function () {
        return this._id;
    },
    update: function (packet) {
        this._elixir = packet.elixir;
        this._gold = packet.gold;
        this._g = packet.g;
        this.trophy = packet.trophy;
    },

    setUserResource: function (gold, elixir, darkElixir, g) {
        // TODO: Update with UI
        this._gold = gold;
        this._elixir = elixir;
        this._darkElixir = darkElixir;
        this._g = g;
    },
    checkEnoughGold: function(gold) {
        return this._gold >= gold;
    },
    checkEnoughElixir: function(elixir) {
        return this._elixir >= elixir;
    },
    checkEnoughDarkElixir: function(darkElixir) {
        return this._darkElixir >= darkElixir;
    },
    checkEnoughG: function(g) {
        return this._g > g;
    }
});

var User = (function(){
    var user = null;
    return {
        getInstance:function(){
            if (user === null){
                user = new _User();
            }
            return user;
        }
    }
})()

