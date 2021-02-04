/**
 * Created by GSN on 6/2/2015.
 */
TEMP_PANEL = "guilayer/TempPanel.json";

var res = {
    //font
    FONT_BITMAP_NUMBER_1: "fonts/number_1.fnt",
    FONT_BITMAP_DICE_NUMBER: "fonts/diceNumber.fnt",
    //zcsd
    //screen
    ZCSD_SCREEN_MENU: "zcsd/screen_menu.json",
    ZCSD_SCREEN_NETWORK: "zcsd/screen_network.json",
    ZCSD_SCREEN_LOCALIZATION: "zcsd/screen_localize.json",
    ZCSD_SCREEN_DRAGON_BONES: "zcsd/screen_dragon_bones.json",
    ZCSD_SCREEN_DECRYPTION: "zcsd/screen_decryption.json",
    ZCSD_SCREEN_ZALO: "zcsd/screen_zalo.json",
    //popup
    ZCSD_POPUP_MINI_GAME: "zcsd/game/mini_game/PopupMiniGame.json",

    //images
    Slot1_png: "zcsd/slot1.png"

};

var g_resources = [
    "CloseNormal.png",
    "CloseSelected.png",
    "game/animation/character/chipu/skeleton.xml",
    "game/animation/eff_dice_number/skeleton.xml",
    "game/animation/effDiceNumber/skeleton.xml",
    "game/animation/firework_test/skeleton.xml",
    "game/animation/ruongngusac/skeleton.xml",
    "game/animation/Dragon/skeleton.json",
    "game/animation/DragonBoy/skeleton.json",
    "game/animation/lobby_girl/skeleton.xml",
    "config.json",
    "default/button_disable.png",
    "default/button_normal.png",
    "default/button_press.png",

    "favicon.ico",
    "HelloWorld.png",
    "fonts/diceNumber.fnt",
    "fonts/diceNumber.png",
    "fonts/eff_number.fnt",
    "fonts/eff_number.png",
    "fonts/number_1.fnt",
    "fonts/number_1.png",
    "game/animation/character/chipu/texture.plist",
    "game/animation/character/chipu/texture.png",
    "game/animation/eff_dice_number/texture.plist",
    "game/animation/eff_dice_number/texture.png",
    "game/animation/effDiceNumber/texture.plist",
    "game/animation/effDiceNumber/texture.png",
    "game/animation/firework_test/texture.plist",
    "game/animation/firework_test/texture.png",
    "game/animation/ruongngusac/texture.xml",
    "game/animation/ruongngusac/texture.png",
    "game/animation/Dragon/texture.json",
    "game/animation/Dragon/texture.png",
    "game/animation/DragonBoy/texture.json",
    "game/animation/DragonBoy/texture.png",
    "game/animation/lobby_girl/texture.plist",
    "game/animation/lobby_girl/texture.png",
    "ipConfig.json",
    "user.json",
    "localize/config.json",
    "localize/vi.txt",
    "localize/en.txt",
    "shaders/change_color.fsh",
    "zcsd/screen_decryption.json",
    "zcsd/screen_dragon_bones.json",
    "zcsd/screen_localize.json",
    "zcsd/screen_menu.json",
    "zcsd/screen_network.json",
    "zcsd/screen_zalo.json"
];
var MAIN_GUI = {
    TOOL_LAYER: "guilayer/ToolLayer.json",
    RESOURCE_LAYER: "guilayer/ResourceLayer.json",
    STATES_LAYER: "guilayer/StatesLayer.json",
    USER_LAYER: "guilayer/UserLayer.json",
    TRAIN_TROOP_LAYER: "guilayer/TrainTroopLayer.json",
    TRAIN_TROOP_COMPONENT: "guilayer/TrainTroopComponent.json"
};

var SHOP = {
    SHOP_LAYER: "shop/ShopLayer.json",
    LIST_ITEM_SHOP_LAYER: "shop/ListItem.json",
    ITEM_LAYER: "shop/ItemButton.json",

    ICON_PATH: "shop/shop_gui/icon/",
    ICON_G: "shop/shop_gui/g.png",
    ICON_GOLD: "shop/shop_gui/gold.png",
    ICON_ELIXIR: "shop/shop_gui/elixir.png",
    ICON_DARK_ELIXIR: "shop/shop_gui/icon_delixir_bar.png"
};

var CONFIG_PATH = {
    INIT_GAME: "config/InitGame.json",
    ARMY_CAMP: "config/ArmyCamp.json",
    BARRACK: "config/Barrack.json",
    BUILDER_HUT: "config/BuilderHut.json",
    CLAN_CASTLE: "config/ClanCastle.json",
    DEFENCE: "config/Defence.json",
    DEFENCE_BASE: "config/DefenceBase.json",
    LABORATORY: "config/Laboratory.json",
    OBSTACLE: "config/Obstacle.json",
    RESOURCE: "config/Resource.json",
    STORAGE: "config/Storage.json",
    TOWN_HALL: "config/TownHall.json",
    TROOP: "config/Troop.json",
    TROOP_BASE: "config/TroopBase.json",
    WALL: "config/Wall.json"
};

var MAP = {
    BUILDING_BG: [
        "map/map_obj_bg/bg_0/1.png",
        "map/map_obj_bg/bg_0/2.png",
        "map/map_obj_bg/bg_0/3.png",
        "map/map_obj_bg/bg_0/4.png",
        "map/map_obj_bg/bg_0/5.png"
    ],
    ARROW_MOVE: [
        "map/map_obj_bg/bg/arrowmove1.png",
        "map/map_obj_bg/bg/arrowmove2.png",
        "map/map_obj_bg/bg/arrowmove3.png",
        "map/map_obj_bg/bg/arrowmove4.png",
        "map/map_obj_bg/bg/arrowmove5.png"
    ],
    GREEN: [
        "map/map_obj_bg/bg/green_1.png",
        "map/map_obj_bg/bg/green_2.png",
        "map/map_obj_bg/bg/green_3.png",
        "map/map_obj_bg/bg/green_4.png",
        "map/map_obj_bg/bg/green_5.png"
    ],
    RED: [
        "map/map_obj_bg/bg/red_1.png",
        "map/map_obj_bg/bg/red_2.png",
        "map/map_obj_bg/bg/red_3.png",
        "map/map_obj_bg/bg/red_4.png",
        "map/map_obj_bg/bg/red_5.png"
    ],
    OBSTACLE_BG: [
        "map/map_obj_bg/grass_0_2_obs.png",
        "map/map_obj_bg/grass_0_3_obs.png"
    ]
};

var ACTIONS = {
    ACTION_LAYER: "guilayer/ActionLayer.json"
};
var TROOP_ICON_PATH = {
    NORMAL_ICON: "guis/train_troop_gui/icon/",
    SMALL_ICON: "guis/train_troop_gui/small_icon/",
    STOP_TRAIN_BG: "guis/icons/status_building.png",
    BATTLE_ICON: "guis/icons/"
};

var COLLECT = {
    COLLECT_LAYER: "guilayer/CollectRes.json",
    COLLECT_GOLD: "collectGold",
    FULL_GOLD: "fullGold",
    COLLECT_ELIXIR: "collectElixir",
    FULL_ELIXIR: "fullElixir",
    COLLECT_DARK_ELIXIR: "collectDarkElixir",
    FULL_DARK_ELIXIR: "fullDarkElixir"
};

var BUTTON = {
    PREPARE_BUILD: "guilayer/PrepareBuildButton.json"
};

var BUILD = {
    BUILDING_BAR: "guilayer/BuildingBar.json",
    BUILDING_TIME_BG: "guis/upgrade_building_gui/building_time_bg.png",
    BUILDING_TIME_BAR: "guis/upgrade_building_gui/building_time_bar.png"
};

var POPUP = {
    BUILD_POPUP: "guilayer/Popup.json",
    UPGRADE_POPUP: "guilayer/UpgradePopup.json",
    INFO_TROOP: "guilayer/PopupInfoTroop.json"
};

var FONT = {
    SOJI_20: "fonts/soji_20.fnt",
    SOJI_16: "fonts/soji_16.fnt"
};

var EFFECT = {
    ROOT: "effects",
    RES_1: {
        NFRAMES: 10,
        RES: "res_1",
        W: 242,
        H: 242
    },
    RES_2: {
        NFRAMES: 10,
        RES: "res_2",
        W: 270,
        H: 270
    },
    //BAR_1: {
    //    NFRAMES: 6,
    //    RES: "bar_1",
    //    W: 490,
    //    H: 490
    //},
    AMC_1: {
        NFRAMES: 5,
        RES: "amc_1",
        W: 70,
        H: 70
    },
    LEVEL_UP: {
        NFRAMES: 12,
        RES: "levelup",
        W: 250,
        H: 300
    },
    LOADING: {
        NFRAMES: 15,
        RES: "loading",
        W: 240,
        H: 240
    },
    COIN_DROP: {
        NFRAMES: 5,
        RES: "coindrop_2",
        W: 40,
        H: 40
    },
    HARVEST_ELIXIR: [
        "effects/effect_harvest/elixir_01.png",
        "effects/effect_harvest/elixir_01.png",
        "effects/effect_harvest/elixir_02.png",
        "effects/effect_harvest/elixir_02.png",
        "effects/effect_harvest/elixir_03.png"
    ],
    HARVEST_DARK_ELIXIR: [
        "effects/effect_harvest/darkelixir_01.png",
        "effects/effect_harvest/darkelixir_01.png",
        "effects/effect_harvest/darhelixir_02.png",
        "effects/effect_harvest/darhelixir_02.png",
        "effects/effect_harvest/darkelixir_03.png"
    ]
};

// STRUCTURE INFO
var STRUCTURE_INFO = {
    HITPOINT: {
        RES: "guis/upgrade_building_gui/small/Hitpoints_Icon.png",
        KEY: "hitpoints",
        NAME: "Hitpoints"
    },
    GOLD_PRODUCTIVITY: {
        RES: "guis/upgrade_building_gui/small/Gold_ProductionRate_Icon.png",
        KEY: "productivity",
        NAME: "Productivity"
    },
    ELIXIR_PRODUCTION: {
        RES: "guis/upgrade_building_gui/small/Elixir_ProductionRate_Icon.png",
        KEY: "productivity",
        NAME: "Productivity"
    },
    DARK_ELIXIR_PRODUCTION: {
        RES: "guis/upgrade_building_gui/small/DarkElixir_ProductionRate_Icon.png",
        KEY: "productivity",
        NAME: "Productivity"
    },
    GOLD_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/Gold_Capacity_Icon.png",
        KEY: "capacity",
        NAME: "Capacity"
    },
    ELIXIR_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/Elixir_Capacity_Icon.png",
        KEY: "capacity",
        NAME: "Capacity"
    },
    DARK_ELIXIR_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/DarkElixir_Capacity_Icon.png",
        KEY: "capacity",
        NAME: "Capacity"
    },
    TOWN_GOLD_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/Gold_Capacity_Icon.png",
        KEY: "capacityGold",
        NAME: "Capacity"
    },
    TOWN_ELIXIR_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/Elixir_Capacity_Icon.png",
        KEY: "capacityElixir",
        NAME: "Capacity"
    },
    TOWN_DARK_ELIXIR_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/DarkElixir_Capacity_Icon.png",
        KEY: "capacityDarkElixir",
        NAME: "Capacity"
    },
    DAMAGE_PER_SHOT: {
        RES: "guis/upgrade_building_gui/small/Damage_Icon.png",
        KEY: "damagePerShot",
        NAME: "Damage"
    },
    TROOP_CAPACITY: {
        RES: "guis/upgrade_building_gui/small/TroopCapacity_Icon.png",
        KEY: "capacity",
        NAME: "Capacity"
    }
};

var BATTLE_RESOURCE = {
    SELECT_TROOP_LAYER: "guilayer/SelectTroopLayer.json",
    TIME: "guilayer/Time.json",

    // resource troop battle
    HEAL_BAR: "new/battle_gui/ally_heal_bar.png",
    HEAL_BAR_BG: "new/battle_gui/bg_heal_bar.png",
    GHOST: "battle/ghost.png",
    RIP: "battle/rip_elixir.png",
    DROP_TROOP_ANIMATION: "battle/drop_troops/",
    ARCHER_ARROW: "battle/arrow_small_burning.png",
    EXPLOSION: "battle/explosion_1/",
}
