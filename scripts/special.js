import { MODULE_ID } from "./constants.js";
import { getSpecialConfigs } from "./settings.js";
import { resolveTargets, deleteTemplates, templatesForMessage } from "./targets.js";
import { playDetonation, createSmokeTiles, deleteModuleTiles } from "./effects.js";
import { applySystemDamage } from "./damage.js";
import { getFlags, resolveActor, resolveToken, diceImages, rollFaces, isDamageCritical, simpleCard, L } from "./utils.js";
import { setCardState } from "./state.js";
import { GrenadeSystem } from "./api.js";

export async function activateSmoke(messageId) {
    const message = game.messages.get(messageId);
    const templates = templatesForMessage(messageId);
    if (!templates.length) return ui.notifications.warn("Place the blast template first.");
    const tiles = await createSmokeTiles(templates);
    if (tiles.length) await setCardState(message, { smokeActive: true });
}

export async function clearEffects(messageId) {
    const message = game.messages.get(messageId);
    await deleteModuleTiles(messageId);
    await deleteTemplates(templatesForMessage(messageId));
    await setCardState(message, { smokeActive: false, smokeCleared: true });
}

async function shurikenGrenade(actor, tokens, grenadeName) {
    for (const token of tokens) {
        const roll = await new Roll("3d6").evaluate();
        const faces = rollFaces(roll);
        const isCritical = isDamageCritical(faces);
        const bonusDamage = isCritical ? 5 : 0;
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: simpleCard({
                title: `${grenadeName} → ${token.name}`,
                subtitle: isCritical ? L("CPR.rolls.criticalDamage", "Critical Damage") : L("CPR.global.generic.damage", "Damage"),
                body: `<div class="d6-rollcard-data"><div class="d6-dice-div">${diceImages(faces, isCritical)}</div>
                       <div class="d6-number-div"><span>${roll.total}</span></div>
                       <div class="d6-data-div">${isCritical ? `<div class="text-normal text-semi">${L("CPR.rolls.criticalDamage", "Critical Damage")}: ${bonusDamage}</div>` : ""}</div></div>`
            })
        });
        await applySystemDamage(token.actor, { damage: roll.total, bonusDamage, ablation: 1, ammoVariety: "grenade" });
    }
}

export async function activateSpecial(messageId) {
    if (!game.user.isGM) return;
    const message = game.messages.get(messageId);
    const f = getFlags(message);
    const grenadeName = f.grenadeName;
    const config = getSpecialConfigs()[grenadeName] ?? null;
    const actor = resolveActor(f);
    const token = resolveToken(f, actor);
    const { templates, tokens: targets } = resolveTargets(messageId);
    const removeTemplate = !config || config.deleteTemplate !== false;

    try {
        if (/shuriken/i.test(grenadeName)) {
            await playDetonation(templates, "explosion");
            await shurikenGrenade(actor, targets, grenadeName);
        } else if (config?.code?.trim()) {
            await playDetonation(templates, "explosion");
            const fn = new Function(
                "grenadeName", "actor", "token", "targets", "templates", "config", "GrenadeSystem",
                `return (async () => { ${config.code} })();`
            );
            await fn(grenadeName, actor, token, targets, templates, config, GrenadeSystem);
        } else {
            const macro = game.macros.getName(grenadeName);
            if (!macro) {
                ui.notifications.warn(`No handler found for special grenade: ${grenadeName}. Add one in Module Settings → Edit Special Grenade Code.`);
                return;
            }
            await playDetonation(templates, "explosion");
            await macro.execute({ grenadeName, actor, token, targets, templates });
        }
    } catch (err) {
        console.error(`${MODULE_ID} | Special grenade "${grenadeName}" failed`, err);
        ui.notifications.error(`Special grenade "${grenadeName}" failed. See the console (F12).`);
        return;
    }

    if (removeTemplate) await deleteTemplates(templates);
    await setCardState(message, { detonated: true });
}
