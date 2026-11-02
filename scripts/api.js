import { MODULE_ID, GRENADE_TYPES } from "./constants.js";
import { getJB2APaths, getColors } from "./settings.js";
import { getTokensInTemplate, getTokensInTemplates, allGrenadeTemplates, deleteTemplates, templatesForMessage } from "./targets.js";
import {
    createScaledTile, createSmokeTiles, playDetonation, playTokenEffect, findItemByName, findStatusEffectId,
    setStatus, applyInjury, getEMPableItems
} from "./effects.js";
import { applySystemDamage } from "./damage.js";
import { throwGrenade, fireFromLauncher } from "./throw.js";
import { fileExists, firstExistingFile } from "./utils.js";

export const GrenadeSystem = {
    MODULE_ID,
    GRENADE_TYPES,

    throwGrenade,
    fireGrenadeFromLauncher: fireFromLauncher,

    getTokensInTemplate,
    getTokensInTemplates,
    templatesForMessage,
    cleanupGrenadeTemplates: () => deleteTemplates(allGrenadeTemplates()),

    applySystemDamage,
    applyCPRDamage: (actor, damage, source, ablationValue = 1, variety = "basic") =>
        applySystemDamage(actor, { damage, ablation: variety === "rubber" ? 0 : ablationValue, lethal: variety !== "rubber" }),
    applyDirectDamage: async (actor, damage) => {
        const hp = actor.system.derivedStats?.hp?.value ?? 0;
        await actor.update({ "system.derivedStats.hp.value": Math.max(0, hp - damage) });
    },

    createScaledTile,
    createSmokeTiles,
    playExplosionEffects: (templates, variety = "basic") => playDetonation(templates, GRENADE_TYPES[variety]?.effects ?? "explosion"),
    playTokenEffect,
    setStatus,
    applyInjury,
    findStatusEffectId,
    findItemByName,
    getEMPableItems,

    getJB2APaths,
    getGrenadeColor: (variety) => getColors()[variety] ?? getColors().basic,
    fileExists,
    firstExistingFile
};
