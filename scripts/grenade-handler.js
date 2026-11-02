import { MODULE_ID, SYSTEM_ID, TEMPLATES } from "./constants.js";
import { registerSettings, migrateSettings, autoDetectJB2A } from "./settings.js";
import { onRenderActorSheet } from "./sheet-buttons.js";
import { onRenderChatMessage } from "./chat.js";
import { registerSocket } from "./socket.js";
import { activateSmoke, clearEffects, activateSpecial } from "./special.js";
import { GrenadeSystem } from "./api.js";

Hooks.once("init", () => {
    if (game.system.id !== SYSTEM_ID) return;
    registerSettings();
    loadTemplates([TEMPLATES.throwCard, TEMPLATES.damageCard, TEMPLATES.resistanceDialog, TEMPLATES.resistanceSummary]);
    Hooks.on("renderActorSheet", onRenderActorSheet);
    Hooks.on("renderChatMessage", onRenderChatMessage);

    window.GrenadeSystem = GrenadeSystem;
    const mod = game.modules.get(MODULE_ID);
    if (mod) mod.api = GrenadeSystem;
});

Hooks.once("ready", async () => {
    if (game.system.id !== SYSTEM_ID) return;
    registerSocket({ activateSmoke, clearEffects, activateSpecial });
    await migrateSettings();
    await autoDetectJB2A();
});
