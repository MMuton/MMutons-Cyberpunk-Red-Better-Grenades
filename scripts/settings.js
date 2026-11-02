import {
    MODULE_ID, GRENADE_TYPES, DEFAULT_EFFECTS, DEFAULT_SPECIAL_CONFIGS, JB2A_PATHS,
    LEGACY_RAVE_CODE, RAVE_CODE, NUMBER_EFFECT_KEYS
} from "./constants.js";
import { DefaultGrenadeConfigApplication } from "./apps/default-config.js";
import { SpecialGrenadeCodeApplication } from "./apps/special-code.js";
import { log } from "./utils.js";

const SETTINGS_VERSION = 2;

export const getSetting = (key) => game.settings.get(MODULE_ID, key);
export const setSetting = (key, value) => game.settings.set(MODULE_ID, key, value);

export function defaultColors() {
    return Object.fromEntries(Object.entries(GRENADE_TYPES).map(([k, v]) => [k, v.color]));
}

export function getColors() {
    return { ...defaultColors(), ...(getSetting("templateColors") ?? {}) };
}

export function getEffects() {
    return { ...DEFAULT_EFFECTS, ...(getSetting("effects") ?? {}) };
}

export function getSpecialConfigs() {
    return getSetting("specialGrenadeConfigs") ?? {};
}

export function registerSettings() {
    game.settings.registerMenu(MODULE_ID, "defaultGrenadeConfigMenu", {
        name: "Customize Default Grenades",
        hint: "Configure colors, animations, and sounds for all built-in grenade types",
        label: "Customize Default Grenades",
        icon: "fas fa-sliders",
        type: DefaultGrenadeConfigApplication,
        restricted: true
    });

    game.settings.registerMenu(MODULE_ID, "specialGrenadeCodeMenu", {
        name: "Special Grenade Code Editor",
        hint: "Configure custom JavaScript code for special grenades",
        label: "Edit Special Grenade Code",
        icon: "fas fa-code",
        type: SpecialGrenadeCodeApplication,
        restricted: true
    });

    const visible = [
        ["autoDeleteEmpty", "Auto-Delete Empty Grenades", "Automatically remove grenade items when quantity reaches 0", true],
        ["enableSequencerEffects", "Enable Sequencer Effects", "Play visual and audio effects when grenades explode (requires Sequencer module)", true],
        ["rollThrowCheck", "Roll Throw Check", "After the blast template is placed, roll the thrower's Athletics (or the launcher's skill) against the range DV and post HIT or MISS.", true]
    ];
    for (const [key, name, hint, def] of visible) {
        game.settings.register(MODULE_ID, key, { name, hint, scope: "world", config: true, type: Boolean, default: def });
    }

    game.settings.register(MODULE_ID, "templateColors", {
        scope: "world", config: false, type: Object, default: defaultColors()
    });
    game.settings.register(MODULE_ID, "effects", {
        scope: "world", config: false, type: Object, default: { ...DEFAULT_EFFECTS }
    });
    game.settings.register(MODULE_ID, "specialGrenadeConfigs", {
        name: "Special Grenade Configurations",
        scope: "world", config: false, type: Object, default: foundry.utils.deepClone(DEFAULT_SPECIAL_CONFIGS)
    });
    game.settings.register(MODULE_ID, "settingsVersion", {
        scope: "world", config: false, type: Number, default: 1
    });
}

const LEGACY_COLOR_KEYS = {
    colorBasic: "basic", colorAcid: "acid", colorArmorPiercing: "armorpiercing", colorBiotoxin: "biotoxin",
    colorEmp: "emp", colorExpansive: "expansive", colorFlashbang: "flashbang", colorIncendiary: "incendiary",
    colorPoison: "poison", colorRubber: "rubber", colorSleep: "sleep", colorSmart: "smart",
    colorSmoke: "smoke", colorTeargas: "teargas", colorSpecial: "special"
};

function readLegacySetting(key) {
    const storage = game.settings.storage.get("world");
    const fullKey = `${MODULE_ID}.${key}`;
    const doc = storage?.getSetting?.(fullKey) ?? storage?.find?.((s) => s.key === fullKey);
    if (!doc) return undefined;
    try {
        return JSON.parse(doc.value);
    } catch (e) {
        return doc.value;
    }
}

export async function migrateSettings() {
    if (!game.user.isGM) return;
    if (getSetting("settingsVersion") >= SETTINGS_VERSION) return;

    const colors = getColors();
    let foundColors = false;
    for (const [legacyKey, type] of Object.entries(LEGACY_COLOR_KEYS)) {
        const v = readLegacySetting(legacyKey);
        if (typeof v === "string" && v) { colors[type] = v; foundColors = true; }
    }

    const effects = getEffects();
    let foundEffects = false;
    for (const key of Object.keys(DEFAULT_EFFECTS)) {
        const v = readLegacySetting(key);
        if (v === undefined || v === null) continue;
        effects[key] = NUMBER_EFFECT_KEYS.has(key) ? (Number(v) || 0) : v;
        foundEffects = true;
    }

    if (foundColors) await setSetting("templateColors", colors);
    if (foundEffects) await setSetting("effects", effects);

    const specials = foundry.utils.deepClone(getSpecialConfigs());
    if (specials["Rave Grenade"]?.code?.trim() === LEGACY_RAVE_CODE.trim()) {
        specials["Rave Grenade"].code = RAVE_CODE;
        await setSetting("specialGrenadeConfigs", specials);
    }

    await setSetting("settingsVersion", SETTINGS_VERSION);
    if (foundColors || foundEffects) log("Migrated settings from 1.1.");
}

export async function autoDetectJB2A() {
    if (!game.user.isGM) return;
    const source = game.modules.get("jb2a_patreon")?.active ? "jb2a_patreon"
        : game.modules.get("JB2A_DnD5e")?.active ? "JB2A_DnD5e" : null;
    if (!source) return;

    const effects = getEffects();
    let changed = false;
    for (const [key, path] of Object.entries(JB2A_PATHS[source])) {
        if (!effects[key]) { effects[key] = path; changed = true; }
    }
    if (changed) await setSetting("effects", effects);
}

export function getJB2APaths() {
    if (game.modules.get("jb2a_patreon")?.active) return JB2A_PATHS.jb2a_patreon;
    if (game.modules.get("JB2A_DnD5e")?.active) return JB2A_PATHS.JB2A_DnD5e;
    return null;
}
