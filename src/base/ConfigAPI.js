var _ConfigAPI = cc.Class.extend({
    _filePath: null,
    _townHallConfig: null,
    ctor: function () {
        // TODO
        this._armyCampConfig = cc.loader.getRes(CONFIG_PATH.ARMY_CAMP);
        this._barrackConfig = cc.loader.getRes(CONFIG_PATH.BARRACK);
        this._builderHutConfig = cc.loader.getRes(CONFIG_PATH.BUILDER_HUT);
        this._clanCastleConfig = cc.loader.getRes(CONFIG_PATH.CLAN_CASTLE);
        this._defenseConfig = cc.loader.getRes(CONFIG_PATH.DEFENCE);
        this._defenseBaseConfig = cc.loader.getRes(CONFIG_PATH.DEFENCE_BASE);
        this._initGameConfig = cc.loader.getRes(CONFIG_PATH.INIT_GAME);
        this._laboratoryConfig = cc.loader.getRes(CONFIG_PATH.LABORATORY);
        this._obstacleConfig = cc.loader.getRes(CONFIG_PATH.OBSTACLE);
        this._resourceConfig = cc.loader.getRes(CONFIG_PATH.RESOURCE);
        this._storageConfig = cc.loader.getRes(CONFIG_PATH.STORAGE);
        this._townHallConfig = cc.loader.getRes(CONFIG_PATH.TOWN_HALL);
        this._troopConfig = cc.loader.getRes(CONFIG_PATH.TROOP);
        this._troopBaseConfig = cc.loader.getRes(CONFIG_PATH.TROOP_BASE);
        this._wallConfig = cc.loader.getRes(CONFIG_PATH.WALL);
    },

    getAllStructureAvailable: function (townHallLevel) {
        /*
            Hàm trả về tất cả các công trình kèm số lượng có thể xây dựa trên level nhà chính
            Biến trả về là 1 Map dạng {STRUCTURE,QUANTITY}
         */

        var townHallData = this._townHallConfig[STRUCTURE.TOWN_HALL][townHallLevel];
        var structuresAvailable = new Map();
        var structureTypes = Object.keys(STRUCTURE);
        structureTypes.forEach(function (typeKey) {
            var structureType = STRUCTURE[typeKey]
            var quantity = townHallData[structureType];
            structuresAvailable.set(structureType, quantity);
        });
        structuresAvailable.delete(STRUCTURE.TOWN_HALL);
        structuresAvailable.set(STRUCTURE.BUILDER_HUT, 5);
        return structuresAvailable;
    },

    getEntityInfo:function(entityType, level){
        var config = null;
        switch(entityType){
            case STRUCTURE.ARMY_CAMP:
                config = this._armyCampConfig;
                break;
            case STRUCTURE.BARRACK:
                config = this._barrackConfig;
                break;
            case STRUCTURE.BUILDER_HUT:
                config = this._builderHutConfig;
                break;
            case STRUCTURE.CLAN_CASTLE:
                config = this._clanCastleConfig;
                break;
            case STRUCTURE.LABORATORY:
                config = this._laboratoryConfig;
                break;
            case STRUCTURE.GOLD_MINE:
            case STRUCTURE.ELIXIR_MINE:
            case STRUCTURE.DARK_ELIXIR_MINE:
                config = this._resourceConfig;
                break;
            case STRUCTURE.GOLD_STORAGE:
            case STRUCTURE.ELIXIR_STORAGE:
            case STRUCTURE.DARK_ELIXIR_STORAGE:
                config = this._storageConfig;
                break;
            case STRUCTURE.TOWN_HALL:
                config = this._townHallConfig;
                break;
            case STRUCTURE.WALL:
                config = this._wallConfig;
                break;
            case STRUCTURE.OBSTACLE:
                return this._obstacleConfig;
            default:
            {
                // return defense config
                var defenseBaseInfo = this._defenseBaseConfig[entityType];
                var defenseInfo = this._defenseConfig[entityType][level];
                for (var attribute in defenseBaseInfo) {
                    defenseInfo[attribute] = defenseBaseInfo[attribute];
                }
                return defenseInfo;
            }
        }
        return config[entityType][level];
    },

    getTroopInfo:function(troopType,level=1){
        var troopBaseInfo = this._troopBaseConfig[troopType];
        var troopInfo = this._troopConfig[troopType][level];
        for (var attribute in troopBaseInfo){
            troopInfo[attribute] = troopBaseInfo[attribute];
        }
        return troopInfo;
    },

    getMaxLevel: function(entityType) {
        return MAX_LEVEL.get(entityType);
    }
});

var ConfigAPI = (function () {
    var configAPI = null;
    return {
        getInstance: function () {
            if (configAPI == null) {
                configAPI = new _ConfigAPI();
            }
            return configAPI;
        }
    }
})();