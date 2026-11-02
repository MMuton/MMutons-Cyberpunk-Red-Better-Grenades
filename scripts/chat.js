import { GRENADE_TYPES } from "./constants.js";
import { getFlags } from "./utils.js";
import { placeTemplateForMessage } from "./placement.js";
import { rollDamage, announceEffect, applyDamageFromMessage, applyAcid } from "./damage.js";
import { resolveResistance } from "./resistance.js";
import { runAsGM } from "./socket.js";

const GM_ACTIONS = new Set(["gm-apply"]);

function setButton(html, action, { disabled, label } = {}) {
    const btn = html.find(`[data-mmg-action="${action}"]`);
    if (!btn.length) return;
    if (disabled !== undefined) btn.prop("disabled", disabled).toggleClass("disabled", disabled);
    if (label) btn.find(".mmg-label").text(label);
}

function applyState(html, flags) {
    const state = flags.state ?? {};
    const cfg = GRENADE_TYPES[flags.variety];

    if (flags.kind === "gm" && state.applied) {
        setButton(html, "gm-apply", { disabled: true, label: "✓ Applied" });
    }
    if (flags.kind === "throw") {
        if (state.detonated) setButton(html, "activate-special", { disabled: true, label: "✓ Effect Activated" });
        if (cfg?.mode === "smoke" && state.smokeActive) setButton(html, "activate-smoke", { disabled: true, label: "✓ Smoke Active" });
        const showClear = (cfg?.mode === "smoke" && state.smokeActive) || (cfg?.mode === "special" && state.detonated && !state.smokeCleared);
        html.find(".mmg-when-active").toggleClass("mmg-hide", !showClear);
    }
}

function handleLegacyCard(message, html, flags) {
    if (flags.gmOnlyCard && !game.user.isGM) html.addClass("mmg-hide");
    html.find("button[data-action], .grenade-apply-damage-btn, .grenade-apply-resistance-btn")
        .prop("disabled", true)
        .addClass("disabled")
        .attr("title", "Created by an older version of Better Grenades. Throw again to use the new card.");
}

export function onRenderChatMessage(message, html) {
    const flags = getFlags(message);
    if (!flags.kind) {
        if (flags.isGrenadeCard || flags.isGMDamageCard || flags.isGMResistanceCard || flags.gmOnlyCard) handleLegacyCard(message, html, flags);
        return;
    }

    if (flags.gmOnlyCard && !game.user.isGM) {
        html.addClass("mmg-hide");
        return;
    }
    if (!game.user.isGM) html.find(".mmg-gm-only").remove();

    applyState(html, flags);

    html.on("click", ".grenade-dv-toggle", (ev) => {
        ev.preventDefault();
        const btn = $(ev.currentTarget);
        const table = btn.siblings(".grenade-dv-table");
        const opening = table.hasClass("mmg-hide");
        table.toggleClass("mmg-hide", !opening);
        btn.find("i").toggleClass("fa-chevron-down", !opening).toggleClass("fa-chevron-up", opening);
    });

    html.on("click", "[data-mmg-toggle]", (ev) => {
        ev.preventDefault();
        html.find(`.${ev.currentTarget.dataset.mmgToggle}`).toggleClass("hide");
    });

    html.on("click", "[data-mmg-action]", (ev) => onAction(ev, message));
}

async function onAction(event, message) {
    event.preventDefault();
    const button = event.currentTarget;
    if (button.disabled || button.classList.contains("mmg-busy")) return;
    const action = button.dataset.mmgAction;
    if (GM_ACTIONS.has(action) && !game.user.isGM) return ui.notifications.error("Only the GM can do that.");

    const flags = getFlags(message);

    button.classList.add("mmg-busy");
    try {
        switch (action) {
            case "place-template":
                return await placeTemplateForMessage(message, event);
            case "roll-damage":
                return await rollDamage(message);
            case "announce-effect":
                return await announceEffect(message);
            case "gm-apply":
                if (flags.action === "acid") return await applyAcid(message);
                if (flags.action === "resist") return await resolveResistance(message);
                return await applyDamageFromMessage(message);
            case "activate-smoke":
                return await runAsGM("activateSmoke", message.id);
            case "clear-effects":
                return await runAsGM("clearEffects", message.id);
            case "activate-special":
                return await runAsGM("activateSpecial", message.id);
        }
    } catch (err) {
        console.error(`Better Grenades | "${action}" failed`, err);
        ui.notifications.error(`Grenade action failed: ${err.message}`);
    } finally {
        button.classList.remove("mmg-busy");
    }
}
