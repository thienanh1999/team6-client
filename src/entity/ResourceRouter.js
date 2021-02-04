var ResourceRouter = {
    getIdlePath: function (type, level) {
        switch (type) {
            case STRUCTURE.CLAN_CASTLE:
                return "buildings/clan_castle/clc_1_" + level + "/idle/image0000.png";
            case STRUCTURE.TOWN_HALL:
                return "buildings/town_hall/tow_1_" + level + "/idle/image0000.png";
            case STRUCTURE.AIR_DEFENSE:
                return "buildings/air_defense/def_5_" + level + "/idle/image0000.png";
            case STRUCTURE.ARCHER_TOWER:
                return "buildings/archer_tower/def_2_" + level + "/idle/image0000.png";
            case STRUCTURE.BARRACK:
                return "buildings/barrack/bar_1_" + level + "/idle/image0000.png";
            case STRUCTURE.BUILDER_HUT:
                return "buildings/builder_hut/idle/image0000.png";
            case STRUCTURE.CANON:
                return "buildings/canon/canon_" + level + "/idle/image0000.png";
            case STRUCTURE.DARK_ELIXIR_MINE:
                return "buildings/dark_elixir_mine/res_3_" + level + "/idle/image0000.png";
            case STRUCTURE.DARK_ELIXIR_STORAGE:
                return "buildings/dark_elixir_storage/sto_3_" + level + "/idle/image0000.png";
            case STRUCTURE.ELIXIR_MINE:
                return "buildings/elixir_mine/res_2_" + level + "/idle/image0000.png";
            case STRUCTURE.ELIXIR_STORAGE:
                return "buildings/elixir_storage/sto_2_" + level + "/idle/image0000.png";
            case STRUCTURE.GOLD_MINE:
                return "buildings/gold_mine/res_1_" + level + "/idle/image0000.png";
            case STRUCTURE.GOLD_STORAGE:
                return "buildings/gold_storage/sto_1_" + level + "/idle/image0000.png";
            case STRUCTURE.LABORATORY:
                return "buildings/laboratory/lab_1_" + level + "/idle/image0000.png";
            case STRUCTURE.MORTAR:
                return "buildings/mortar/def_3_" + level + "/idle/image0000.png";
            case STRUCTURE.WALL:
                return "buildings/wall/wal_1_" + level + "/idle/image0000.png";
            case STRUCTURE.ARMY_CAMP:
                return "buildings/army_camp/amc_1_" + level + "/idle/image0000.png";
        }
    },
    getAttackPath: function (type, level) {
        switch (type) {
            case STRUCTURE.CANON:
                return "buildings/canon/canon_" + level + "/attack01";
            case STRUCTURE.ARCHER_TOWER:
                return "buildings/archer_tower/def_2_" + level + "/attack01";
            case STRUCTURE.MORTAR:
                return "buildings/mortar/def_3_" + level + "/attack01";
        }
    },
    getDestroyPath:function (type, level){
        switch (type){
            case STRUCTURE.TOWN_HALL:
                return "map/map_obj_bg/junk_mainhouse.png";
                break;
            case STRUCTURE.WALL:
                return "map/map_obj_bg/junk_wall.png";
                break;
            default:
                return "map/map_obj_bg/junk_contructs_0.png";
                break;
        }
    },
    getUpgradedAttr: function(type) {
        switch (type) {
            case STRUCTURE.CLAN_CASTLE:
                return [STRUCTURE_INFO.TROOP_CAPACITY, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.TOWN_HALL:
                return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.TOWN_GOLD_CAPACITY, STRUCTURE_INFO.TOWN_ELIXIR_CAPACITY];
            case STRUCTURE.AIR_DEFENSE:
                return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.DAMAGE_PER_SHOT];
            case STRUCTURE.ARCHER_TOWER:
                return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.DAMAGE_PER_SHOT];
            case STRUCTURE.BARRACK:
                return [STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.BUILDER_HUT:
                return [STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.CANON:
                return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.DAMAGE_PER_SHOT];
            case STRUCTURE.DARK_ELIXIR_MINE:
                return [STRUCTURE_INFO.DARK_ELIXIR_CAPACITY, STRUCTURE_INFO.DARK_ELIXIR_PRODUCTION, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.DARK_ELIXIR_STORAGE:
                return [STRUCTURE_INFO.DARK_ELIXIR_CAPACITY, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.ELIXIR_MINE:
                return [STRUCTURE_INFO.ELIXIR_CAPACITY, STRUCTURE_INFO.DARK_ELIXIR_PRODUCTION, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.ELIXIR_STORAGE:
                return [STRUCTURE_INFO.ELIXIR_CAPACITY, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.GOLD_MINE:
                return [STRUCTURE_INFO.GOLD_CAPACITY, STRUCTURE_INFO.GOLD_PRODUCTIVITY, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.GOLD_STORAGE:
                return [STRUCTURE_INFO.GOLD_CAPACITY, STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.LABORATORY:
                return [STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.MORTAR:
                return [STRUCTURE_INFO.HITPOINT, STRUCTURE_INFO.DAMAGE_PER_SHOT];
            case STRUCTURE.WALL:
                return [STRUCTURE_INFO.HITPOINT];
            case STRUCTURE.ARMY_CAMP:
                return [STRUCTURE_INFO.TROOP_CAPACITY, STRUCTURE_INFO.HITPOINT];
        }
    }
};