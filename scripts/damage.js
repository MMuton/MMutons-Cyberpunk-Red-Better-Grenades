import { MODULE_ID, GRENADE_TYPES, TEMPLATES } from "./constants.js";
import { resolveTargets, deleteTemplates } from "./targets.js";
import { playDetonation, setStatus } from "./effects.js";
import { getFlags, resolveActor, diceImages, rollFaces, isDamageCritical, esc, postCard, gmIds, L, typeLabel, skillLabel } from "./utils.js";
import { setCardState } from "./state.js";

const INCENDIARY_STATUS = ["s93iaEZXm1onbJ05", "On Fire", "Burning", "burning"];

export async function applySystemDamage(actor, { damage = 0, bonusDamage = 0, ablation = 1, ammoVariety = "grenade", lethal = true, location = "body" } = {}) {
    if (!actor) return;
    if (typeof actor._applyDamage === "function") {
        return actor._applyDamage(damage, bonusDamage, location, ablation, ammoVariety, 0, 0, lethal, {
            damageReductionRole: true,
            damageReductionAE: true,
            useShield: true,
            brainDamageReduction: false
        });
    }
    const armor = actor.items.find((i) => i.type === "armor" && i.system.equipped === "equipped" && i.system.isBodyLocation);
    const sp = armor ? Math.max(0, (armor.system.bodyLocation?.sp ?? 0) - (armor.system.bodyLocation?.ablation ?? 0)) : 0;
    const through = damage > sp ? damage - sp : 0;
    const hp = actor.system.derivedStats?.hp?.value ?? 0;
    let newHp = hp - through - bonusDamage;
    if (!lethal) newHp = Math.max(newHp, Math.min(hp, 1));
    await actor.update({ "system.derivedStats.hp.value": Math.max(0, newHp) });
    if (armor && through > 0 && ablation > 0) {
        const max = armor.system.bodyLocation?.sp ?? 0;
        await armor.update({ "system.bodyLocation.ablation": Math.min(max, (armor.system.bodyLocation?.ablation ?? 0) + ablation) });
    }
}

export function grenadeAblation(flags) {
    if (flags.variety === "rubber") return 0;
    const fromItem = Number(flags.ablation);
    if (Number.isFinite(fromItem)) return fromItem;
    return GRENADE_TYPES[flags.variety]?.ablation ?? 1;
}

async function postGMCard(sourceFlags, sourceMessageId, { action, titleSuffix, subtitle, stats, buttonLabel, icon, damage = 0, bonusDamage = 0, ablation = 0 }) {
    const content = await renderTemplate(TEMPLATES.gmCard, { grenadeName: sourceFlags.grenadeName, titleSuffix, subtitle, stats, buttonLabel, icon });
    return ChatMessage.create({
        speaker: { alias: "Grenade System" },
        whisper: gmIds(),
        content,
        flags: {
            [MODULE_ID]: {
                kind: "gm",
                action,
                gmOnlyCard: true,
                sourceMessageId,
                grenadeName: sourceFlags.grenadeName,
                variety: sourceFlags.variety,
                ammoVariety: sourceFlags.ammoVariety,
                damage,
                bonusDamage,
                ablation,
                state: {}
            }
        }
    });
}

export async function rollDamage(throwMessage) {
    const f = getFlags(throwMessage);
    const cfg = GRENADE_TYPES[f.variety] ?? GRENADE_TYPES.basic;
    if (!f.damage) return;

    const roll = await new Roll(f.damage).evaluate();
    const faces = rollFaces(roll);
    const isCritical = cfg.mode === "damage" && isDamageCritical(faces);
    const bonusDamage = isCritical ? 5 : 0;
    const ablation = grenadeAblation(f);
    const actor = resolveActor(f);
    const isResist = cfg.mode === "resist";

    const content = await renderTemplate(TEMPLATES.damageCard, {
        grenadeName: f.grenadeName,
        subtitle: isResist ? `${typeLabel(f.variety)}, DV ${cfg.resist.dv} ${skillLabel(cfg.resist.skill)}` : L("CPR.global.generic.damage", "Damage"),
        subtitleEm: !isResist && f.variety !== "basic" ? typeLabel(f.variety) : "",
        dice: diceImages(faces, isCritical),
        total: roll.total,
        isCritical,
        bonusDamage,
        isResist,
        ablation,
        nonLethal: !!cfg.nonLethal
    });

    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        flags: { [MODULE_ID]: { kind: "damage", sourceMessageId: throwMessage.id, grenadeName: f.grenadeName, variety: f.variety } }
    });

    if (isResist) {
        return postGMCard(f, throwMessage.id, {
            action: "resist",
            titleSuffix: "Resistance Application",
            subtitle: `DV ${cfg.resist.dv} ${skillLabel(cfg.resist.skill)}`,
            stats: [{ label: L("CPR.global.generic.type", "Type"), value: typeLabel(f.variety) }, { label: `${L("CPR.rolls.failed", "Failure")} ${L("CPR.global.generic.damage", "Damage")}`, value: roll.total }],
            buttonLabel: "Apply Damage to Template Area",
            icon: "fas fa-shield-virus",
            damage: roll.total
        });
    }
    return postGMCard(f, throwMessage.id, {
        action: "damage",
        titleSuffix: "Damage Application",
        subtitle: typeLabel(f.variety),
        stats: [{ label: L("CPR.global.generic.damage", "Damage"), value: roll.total + bonusDamage }, { label: L("CPR.global.generic.ablation", "Ablation"), value: `+${ablation}` }],
        buttonLabel: "Apply Damage to Template Area",
        icon: "fas fa-bolt",
        damage: roll.total,
        bonusDamage,
        ablation
    });
}

export async function announceEffect(throwMessage) {
    const f = getFlags(throwMessage);
    const cfg = GRENADE_TYPES[f.variety] ?? GRENADE_TYPES.basic;
    const actor = resolveActor(f);
    const speaker = ChatMessage.getSpeaker({ actor });

    if (cfg.mode === "ablate") {
        const ablation = grenadeAblation(f);
        await postCard({ title: f.grenadeName, subtitle: typeLabel(f.variety), body: `<div class="text-normal grenade-result-text">Ablates armor without dealing damage</div>` }, { speaker });
        return postGMCard(f, throwMessage.id, {
            action: "acid",
            titleSuffix: "Damage Application",
            subtitle: typeLabel(f.variety),
            stats: [{ label: L("CPR.global.generic.damage", "Damage"), value: 0 }, { label: L("CPR.global.generic.ablation", "Ablation"), value: `+${ablation}` }],
            buttonLabel: "Apply Ablation to Template Area",
            icon: "fas fa-bolt",
            ablation
        });
    }

    await postCard({
        title: f.grenadeName,
        subtitle: `${typeLabel(f.variety)}, DV ${cfg.resist.dv} ${skillLabel(cfg.resist.skill)}`,
        body: `<div class="text-normal grenade-result-text">Resistance Check Required<br><span class="text-semi">${L("CPR.rolls.failed", "Failure")}: Effect applies</span></div>`
    }, { speaker });
    return postGMCard(f, throwMessage.id, {
        action: "resist",
        titleSuffix: "Resistance Application",
        subtitle: `DV ${cfg.resist.dv} ${skillLabel(cfg.resist.skill)}`,
        stats: [{ label: L("CPR.global.generic.type", "Type"), value: typeLabel(f.variety) }, { label: L("CPR.rolls.failed", "Failure"), value: "Effect applies" }],
        buttonLabel: "Apply Effect to Template Area",
        icon: "fas fa-shield-virus"
    });
}

export async function applyDamageFromMessage(damageMessage) {
    if (!game.user.isGM) return ui.notifications.error("Only GMs can apply grenade damage");
    const f = getFlags(damageMessage);
    const cfg = GRENADE_TYPES[f.variety] ?? GRENADE_TYPES.basic;
    const { templates, tokens, fallback } = resolveTargets(f.sourceMessageId);

    if (fallback) ui.notifications.warn("No blast template found, using your selected tokens.");
    if (!tokens.length) return ui.notifications.warn("No tokens in the blast area (or selected).");

    await playDetonation(templates, cfg.effects);

    for (const token of tokens) {
        await applySystemDamage(token.actor, {
            damage: f.damage,
            bonusDamage: f.bonusDamage ?? 0,
            ablation: f.ablation ?? 1,
            ammoVariety: f.ammoVariety || "grenade",
            lethal: !cfg.nonLethal
        });
        if (cfg.setsOnFire) await setStatus(token.actor, INCENDIARY_STATUS);
    }

    await deleteTemplates(templates);
    await setCardState(damageMessage, { applied: true });
    ui.notifications.info(`${f.grenadeName}: applied ${f.damage + (f.bonusDamage ?? 0)} damage to ${tokens.length} target(s).`);
}

export async function applyAcid(gmMessage) {
    if (!game.user.isGM) return;
    const f = getFlags(gmMessage);
    const { templates, tokens, fallback } = resolveTargets(f.sourceMessageId);
    if (fallback) ui.notifications.warn("No blast template found, using your selected tokens.");
    if (!tokens.length) return ui.notifications.warn("No tokens in the blast area (or selected).");

    await playDetonation(templates, "explosion");
    const ablation = f.ablation ?? 1;
    const lines = [];
    for (const token of tokens) {
        const actor = token.actor;
        const armors = actor.getEquippedArmors?.("body") ?? [];
        if (!armors.length) { lines.push(`<span class="text-semi">${esc(token.name)}</span>: no body armor`); continue; }
        if (typeof actor._ablateArmor === "function") await actor._ablateArmor("body", ablation);
        lines.push(`<span class="text-semi">${esc(token.name)}</span>: armor ablated <span class="roll-failure text-semi">+${ablation}</span>`);
    }
    await deleteTemplates(templates);
    await setCardState(gmMessage, { applied: true });
    await postCard({ title: f.grenadeName, subtitle: typeLabel(f.variety), body: `<div class="text-normal grenade-result-text">${lines.join("<br>")}</div>` });
}
