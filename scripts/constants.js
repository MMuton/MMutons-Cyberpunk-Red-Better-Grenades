export const MODULE_ID = "mmutons-cyberpunk-red-upgraded-grenades";
export const SYSTEM_ID = "cyberpunk-red-core";
export const TEMPLATE_PATH = `modules/${MODULE_ID}/templates`;

export const TEMPLATES = {
    throwCard: `${TEMPLATE_PATH}/grenade-chat-card.hbs`,
    damageCard: `${TEMPLATE_PATH}/damage-card.hbs`,
    gmCard: `${TEMPLATE_PATH}/gm-card.hbs`,
    resistanceDialog: `${TEMPLATE_PATH}/resistance-dialog.hbs`,
    resistanceSummary: `${TEMPLATE_PATH}/resistance-summary.hbs`,
    defaultConfig: `${TEMPLATE_PATH}/default-grenade-config.hbs`,
    specialConfig: `${TEMPLATE_PATH}/special-grenade-code.hbs`
};

export const GRENADE_TYPES = {
    basic:         { label: "Basic",          color: "#FFFF00", mode: "damage", damage: "6d6", ablation: 1, effects: "explosion" },
    acid:          { label: "Acid",           color: "#80FF00", mode: "ablate", damage: null,  ablation: 1, effects: "explosion" },
    armorpiercing: { label: "Armor Piercing", color: "#FF3366", mode: "damage", damage: "6d6", ablation: 2, effects: "explosion" },
    biotoxin:      { label: "Biotoxin",       color: "#00FF00", mode: "resist", damage: "3d6", resist: { dv: 15, skill: "Resist Torture/Drugs" }, onFail: "damage",      effects: "explosion" },
    emp:           { label: "EMP",            color: "#0080FF", mode: "resist", damage: null,  resist: { dv: 15, skill: "Cybertech" },            onFail: "emp",         effects: "emp" },
    expansive:     { label: "Expansive",      color: "#FF6600", mode: "damage", damage: "6d6", ablation: 1, effects: "explosion" },
    flashbang:     { label: "Flashbang",      color: "#FFFFFF", mode: "resist", damage: null,  resist: { dv: 15, skill: "Resist Torture/Drugs" }, onFail: "flashbang",   effects: "flashbang", borderColor: "#FFFFFF" },
    incendiary:    { label: "Incendiary",     color: "#FF4500", mode: "damage", damage: "6d6", ablation: 1, effects: "explosion", setsOnFire: true },
    poison:        { label: "Poison",         color: "#90FF90", mode: "resist", damage: "2d6", resist: { dv: 13, skill: "Resist Torture/Drugs" }, onFail: "damage",      effects: "explosion" },
    rubber:        { label: "Rubber",         color: "#404040", mode: "damage", damage: "6d6", ablation: 0, effects: "explosion", nonLethal: true },
    sleep:         { label: "Sleep",          color: "#9932CC", mode: "resist", damage: null,  resist: { dv: 13, skill: "Resist Torture/Drugs" }, onFail: "unconscious", effects: "explosion" },
    smart:         { label: "Smart",          color: "#00FFFF", mode: "damage", damage: "6d6", ablation: 2, effects: "explosion" },
    smoke:         { label: "Smoke",          color: "#FFFFFF", mode: "smoke",  damage: null,  effects: "none" },
    teargas:       { label: "Teargas",        color: "#FFFF00", mode: "resist", damage: null,  resist: { dv: 13, skill: "Resist Torture/Drugs" }, onFail: "teargas",     effects: "explosion" },
    special:       { label: "Special",        color: "#FF69B4", mode: "special", damage: null, effects: "explosion" }
};

export const TYPE_I18N = {
    basic: "CPR.global.ammo.type.basic",
    acid: "CPR.global.ammo.type.acid",
    armorpiercing: "CPR.global.ammo.type.armorPiercing",
    biotoxin: "CPR.global.ammo.type.biotoxin",
    emp: "CPR.global.ammo.type.emp",
    expansive: "CPR.global.ammo.type.expansive",
    flashbang: "CPR.global.ammo.type.flashBang",
    incendiary: "CPR.global.ammo.type.incendiary",
    poison: "CPR.global.ammo.type.poison",
    rubber: "CPR.global.ammo.type.rubber",
    sleep: "CPR.global.ammo.type.sleep",
    smart: "CPR.global.ammo.type.smart",
    smoke: "CPR.global.ammo.type.smoke",
    teargas: "CPR.global.ammo.type.tearGas",
    special: "CPR.global.ammo.type.special"
};

export const SKILL_I18N = {
    "Resist Torture/Drugs": "CPR.global.itemType.skill.resistTortureOrDrugs",
    "Cybertech": "CPR.global.itemType.skill.cybertech",
    "Athletics": "CPR.global.itemType.skill.athletics",
    "Heavy Weapons": "CPR.global.itemType.skill.heavyWeapons"
};

export const FAIL_TEXT = {
    damage: "Takes direct damage (ignores armor)",
    unconscious: "Falls asleep (Unconscious)",
    teargas: "Eyes damaged (unless cybereyes)",
    flashbang: "Blinded and deafened",
    emp: "2 random cyberware/electronics inoperable for 1 minute"
};

export const SKILL_STATS = {
    "Resist Torture/Drugs": "will",
    "Cybertech": "tech",
    "Athletics": "dex",
    "Heavy Weapons": "ref"
};

export const DV_TABLES = {
    thrown:          { label: "Thrown Weapon",    rows: [[6, 16], [12, 15], [25, 15]] },
    grenadeLauncher: { label: "Grenade Launcher", i18n: "CPR.global.weaponType.grenadeLauncher", rows: [[6, 16], [12, 15], [25, 15], [50, 17], [100, 20], [200, 22], [400, 25]] },
    rocketLauncher:  { label: "Rocket Launcher", i18n: "CPR.global.weaponType.rocketLauncher", rows: [[6, 17], [12, 16], [25, 15], [50, 15], [100, 20], [200, 20], [400, 25], [800, 30]] }
};

export const DEFAULT_EFFECTS = {
    explosionAnimation: "",
    explosionSound: `modules/${MODULE_ID}/assets/explosion-misosound.mp3`,
    explosionVolume: 0.7,
    explosionScale: 1.0,
    empAnimation: "",
    empCenterAnimation: "",
    empSound: `modules/${MODULE_ID}/assets/emp-SOUND_GARAGE.mp3`,
    empVolume: 0.8,
    empScale: 0.3,
    empCenterScale: 1.2,
    flashbangAnimation: "",
    flashbangCenterAnimation: "",
    flashbangSound: `modules/${MODULE_ID}/assets/flashbang-MadPanCake.mp3`,
    flashbangVolume: 0.8,
    flashbangScale: 0.3,
    flashbangCenterScale: 1.3,
    smokeAnimation: "",
    smokeScale: 1.0
};

export const NUMBER_EFFECT_KEYS = new Set(
    Object.entries(DEFAULT_EFFECTS).filter(([, v]) => typeof v === "number").map(([k]) => k)
);

export const JB2A_PATHS = {
    jb2a_patreon: {
        explosionAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_Yellow_400x400.webm",
        empAnimation:             "modules/jb2a_patreon/Library/Generic/Lightning/StaticElectricity_03_Regular_Blue_400x400.webm",
        empCenterAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_02_Blue_400x400.webm",
        flashbangAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_BlueYellow_400x400.webm",
        flashbangCenterAnimation: "modules/jb2a_patreon/Library/1st_Level/Thunderwave/Thunderwave_01_Bright_Blue_Center_600x600.webm",
        smokeAnimation:           "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm"
    },
    JB2A_DnD5e: {
        explosionAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_01_Orange_400x400.webm",
        empAnimation:             "modules/JB2A_DnD5e/Library/Generic/Lightning/StaticElectricity_03_Regular_Blue_400x400.webm",
        empCenterAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_02_Blue_400x400.webm",
        flashbangAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_03_Regular_BlueYellow_400x400.webm",
        flashbangCenterAnimation: "modules/JB2A_DnD5e/Library/1st_Level/Thunderwave/Thunderwave_01_Bright_Blue_Center_600x600.webm",
        smokeAnimation:           "modules/JB2A_DnD5e/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm"
    }
};

export const LEGACY_RAVE_CODE = "const animationFile = \"modules/jb2a_patreon/Library/Generic/Marker/MarkerLight_01_Regular_Blue02_400x400.webm\";\n\nfor (const template of templates) {\n    await GrenadeSystem.createScaledTile(template, animationFile, config.tileScale, {\n        grenadeName: grenadeName,\n        alpha: 0.8,\n        loop: true\n    });\n}";

export const RAVE_CODE = `const animationFile = await GrenadeSystem.firstExistingFile([
    "modules/jb2a_patreon/Library/Generic/Marker/MarkerLight_01_Regular_Blue02_400x400.webm",
    "modules/JB2A_DnD5e/Library/Generic/Marker/MarkerLight_01_Regular_Blue_400x400.webm"
]);
if (!animationFile) return ui.notifications.warn("Rave Grenade: no JB2A marker animation found.");

for (const template of templates) {
    await GrenadeSystem.createScaledTile(template, animationFile, config.tileScale, {
        grenadeName,
        alpha: 0.8,
        loop: true
    });
}`;

export const DEFAULT_SPECIAL_CONFIGS = {
    "Rave Grenade": { color: "#6be1ff", deleteTemplate: false, tileScale: 2.5, code: RAVE_CODE }
};

export function normalizeType(type) {
    const key = String(type ?? "basic").toLowerCase().replace(/[\s_-]+/g, "");
    return GRENADE_TYPES[key] ? key : "basic";
}

export function lookupDV(tableKey, distance) {
    const table = DV_TABLES[tableKey] ?? DV_TABLES.thrown;
    const d = Math.round(distance);
    const row = table.rows.find(([max]) => d <= max);
    return row ? row[1] : null;
}

export function maxRange(tableKey) {
    const rows = (DV_TABLES[tableKey] ?? DV_TABLES.thrown).rows;
    return rows[rows.length - 1][0];
}

export function dvTableColumns(tableKey) {
    const rows = (DV_TABLES[tableKey] ?? DV_TABLES.thrown).rows;
    let prev = -1;
    return rows.map(([max, dv]) => {
        const col = { range: `${prev + 1}-${max}m`, dv };
        prev = max;
        return col;
    });
}
