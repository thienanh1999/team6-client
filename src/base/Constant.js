/**
 * Created by Fresher_Dev on 12/4/2020.
 */
// GAME
UPDATE_GAME = 1.0;
MAP_SIZE = cc.p(42, 42);
// BATTLE
GAME_TICK = 0.025;
BATCH_REQUEST_DURATION = 5;
BATTLE_SPEED = 1;
TIME_TO_DROP_TROOP = 0.1;
TIME_TO_HIDE_HP = 0.5;
RANGE_NEIGHBOR = 3;
// Build version0]+\=
BUILD_VERSION = "2.43";
// MAP2
MAXIMUM_ZOOM_SCALE = 4.0;
MINIMUM_ZOOM_SCALE = 0.75;
ZOOM_STEP = 0.4;
MOUSE_MOVE_STEP = 10;
CTR_KEY = 17;
TILE_MAP_SCALE = 0.5;
TILE_WIDTH = 76;
TILE_HEIGHT = 57;
PINCH_ZOOM_MULTIPLIER = 0.03;
LINE_WIDTH = 0.5;   

var POPUP_CONSTANT = {
    POPUP_GLOBAL_Z_ORDER: 3
};

// ACTION LAYER
var ACTION_LAYER = {
    HEIGHT: 150,
    INFO: 0,
    UPGRADE: 1,
    TRAIN: 2,
    RESEARCH: 3,
    HARVEST_GOLD: 4,
    HARVEST_ELIXIR: 5,
    HARVEST_DARK_ELIXIR: 6,
    REMOVE: 7,
    CANCEL_BUILD: 8,
    QUICK_FINISH: 9,
    SELECT_LINE: 10
};

// STRUCTURE ANIMATION
var STRUCTURE_ANIMATION = {
    BUILDING_ANIMATION_ZORDER: 2,
    ARROW_DISPLAY_DURATION: 0.125,
    SELECTING_SCALE: 1.05
};

// STRUCTURE
var STRUCTURE = {
    TOWN_HALL:"TOW_1",
    ARMY_CAMP:"AMC_1",
    BARRACK:"BAR_1",
    BUILDER_HUT:"BDH_1",
    CLAN_CASTLE:"CLC_1",
    LABORATORY:"LAB_1",
    GOLD_MINE:"RES_1",
    ELIXIR_MINE:"RES_2",
    DARK_ELIXIR_MINE:"RES_3",
    GOLD_STORAGE:"STO_1",
    ELIXIR_STORAGE:"STO_2",
    DARK_ELIXIR_STORAGE:"STO_3",
    WALL:"WAL_1",
    // DEFENSE
    ARCHER_TOWER:"DEF_2",
    CANON:"DEF_1",
    MORTAR:"DEF_3",
    AIR_DEFENSE:"DEF_5",

    // OBSTACLE
    OBSTACLE:"OBS"
};

var STRUCTURES = ["TOW_1", "AMC_1", "BAR_1", "BDH_1", "CLC_1", "LAB_1", "RES_1", "RES_2", "RES_3", "STO_1", "STO_2", "STO_3", "WAL_1", "DEF_2", "DEF_1", "DEF_3", "DEF_5"];

var OBSTACLE = new Map([
    ["OBS_1", "OBS_1"],
    ["OBS_2", "OBS_1"],
    ["OBS_3", "OBS_1"],
    ["OBS_4", "OBS_1"],
    ["OBS_5", "OBS_1"],
    ["OBS_6", "OBS_1"]
]);

var ENTITY_NAME = new Map([
    [STRUCTURE.TOWN_HALL,"Town Hall"],
    [STRUCTURE.ARMY_CAMP,"Army Camp"],
    [STRUCTURE.BARRACK,"Barrack"],
    [STRUCTURE.BUILDER_HUT,"Builder Hut"],
    [STRUCTURE.CLAN_CASTLE,"Clan Castle"],
    [STRUCTURE.LABORATORY,"Laboratory"],
    [STRUCTURE.GOLD_MINE,"Gold Mine"],
    [STRUCTURE.ELIXIR_MINE,"Elixir mine"],
    [STRUCTURE.DARK_ELIXIR_MINE,"Dark Elixir mine"],
    [STRUCTURE.GOLD_STORAGE,"Gold Storage"],
    [STRUCTURE.ELIXIR_STORAGE,"Elixir Storage"],
    [STRUCTURE.DARK_ELIXIR_STORAGE,"Dark Elixir Storage"],
    [STRUCTURE.WALL,"Wall"],
    // defense
    [STRUCTURE.ARCHER_TOWER,"Archer Tower"],
    [STRUCTURE.CANON,"Canon"],
    [STRUCTURE.MORTAR,"Mortar"],
    [STRUCTURE.AIR_DEFENSE,"Air Defense"]
    //obstacle
    ]);


// SHOP
var SHOP_PER_SCREEN = 0.8 ;
var DEFAULT_SHOP_SIZE = cc.size(800,480);
var CATEGORY ={
    TREASURES:0,
    RESOURCES:1,
    DECORATIONS:2,
    ARMY:3,
    DEFENSE:4,
    SHIELD:5
};
var LIST_ITEM = new Map([
    [CATEGORY.TREASURES,[]],
    [CATEGORY.RESOURCES, [
        STRUCTURE.BUILDER_HUT,
        STRUCTURE.GOLD_MINE,
        STRUCTURE.ELIXIR_MINE,
        STRUCTURE.GOLD_STORAGE,
        STRUCTURE.ELIXIR_STORAGE,
        STRUCTURE.DARK_ELIXIR_MINE,
        STRUCTURE.DARK_ELIXIR_STORAGE,
    ]],
    [CATEGORY.DECORATIONS,[]],
    [CATEGORY.ARMY,[
        STRUCTURE.ARMY_CAMP,
        STRUCTURE.BARRACK,
        STRUCTURE.LABORATORY
    ]],
    [CATEGORY.DEFENSE,[
        STRUCTURE.WALL,
        STRUCTURE.ARCHER_TOWER,
        STRUCTURE.CANON,
        STRUCTURE.MORTAR
    ]],
    [CATEGORY.SHIELD, []]
]);

var TROOP = {
    WARRIOR: "ARM_1",
    ARCHER: "ARM_2",
    GIANT: "ARM_4",
    GOBLIN: "ARM_3",
    FLYING_BOOM: "ARM_6",
    BUILDER: "builder",
};

DELAY_ATTACK_TIME = new Map([
    [TROOP.WARRIOR, 0.8],
    [TROOP.ARCHER, 0.6],
    [TROOP.GIANT, 0.8],
    [TROOP.FLYING_BOOM, 1],
    [TROOP.GOBLIN, 0.6]
])

var COLLECT_CONSTANT = {
    LOCAL_Z_ORDER: 4
};

var MAX_LEVEL = new Map([
    [STRUCTURE.TOWN_HALL, 10],
    [STRUCTURE.ARMY_CAMP, 8],
    [STRUCTURE.BARRACK, 6],
    [STRUCTURE.BUILDER_HUT, 1],
    [STRUCTURE.CLAN_CASTLE,6],
    [STRUCTURE.LABORATORY,9],
    [STRUCTURE.GOLD_MINE,11],
    [STRUCTURE.ELIXIR_MINE,11],
    [STRUCTURE.DARK_ELIXIR_MINE,6],
    [STRUCTURE.GOLD_STORAGE,11],
    [STRUCTURE.ELIXIR_STORAGE,11],
    [STRUCTURE.DARK_ELIXIR_STORAGE,6],
    [STRUCTURE.WALL,7],
    // defense
    [STRUCTURE.ARCHER_TOWER,9],
    [STRUCTURE.CANON,10],
    [STRUCTURE.MORTAR,8],
    [STRUCTURE.AIR_DEFENSE,8]
    //obstacle
]);

var TROOP_ANIMATION ={
    ROOT_PATH : "troops/",
    IDLE : "idle/",
    RUN : "run/",
    DEAD : "dead/",
    ATTACK : "attack01/",
    TOTAL_FRAME:{
        IDE : new Map([
            [TROOP.WARRIOR , 30],
            [TROOP.ARCHER , 30],
            [TROOP.GIANT , 30],
            [TROOP.FLYING_BOOM, 30],
            [TROOP.GOBLIN, 30],
            [TROOP.BUILDER, 30]
        ]),
        RUN :new Map([
            [TROOP.WARRIOR , 70],
            [TROOP.ARCHER , 80],
            [TROOP.GIANT , 80],
            [TROOP.FLYING_BOOM, 80],
            [TROOP.GOBLIN, 60],
            [TROOP.BUILDER, 40]
        ]),
        ATTACK:new Map([
            [TROOP.WARRIOR , 65],
            [TROOP.ARCHER , 80],
            [TROOP.GIANT , 65],
            [TROOP.FLYING_BOOM, 60],
            [TROOP.GOBLIN, 65],
            [TROOP.BUILDER, 40]
        ])
    },
    FRAME_SIZE : new Map([
        [TROOP.WARRIOR, cc.p(192,192)],
        [TROOP.ARCHER, cc.p(136,136)],
        [TROOP.GIANT, cc.p(340,340)],
        [TROOP.FLYING_BOOM, cc.p(200,322)],
        [TROOP.GOBLIN, cc.p(146,146)],
        [TROOP.BUILDER, cc.p(100, 110)]
    ])
};

var G_TRANSFER = {
    GOLD: 100,
    ELIXIR: 100,
    DARK_ELIXIR: 100,
    TIME: 100
};
