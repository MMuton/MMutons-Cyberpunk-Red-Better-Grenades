import { MODULE_ID, GRENADE_TYPES, TEMPLATES, normalizeType, dvTableColumns, maxRange } from "./constants.js";
import { typeLabel, skillLabel, dvTableLabel } from "./utils.js";
import { getSetting, getColors, getSpecialConfigs } from "./settings.js";

const LAUNCHER_TYPES = new Set(["grenadeLauncher", "rocketLauncher"]);
export const isLauncher = (item) => item?.type === "weapon" && LAUNCHER_TYPES.has(item.system.weaponType);

export function resolveGrenadeType(item) {
    const type = normalizeType(item.system?.type);
    if (type !== "special") return type;
    if (/\bemp\b/i.test(item.name)) return "emp";
    if (/\bflash\s*-?bang\b/i.test(item.name)) return "flashbang";
    return "special";
}

export async function throwGrenade(actor, itemId) {
    if (!actor?.isOwner) return ui.notifications.error("You don't have permission to use this character's items");
    const grenade = actor.items.get(itemId);
    if (!grenade) return ui.notifications.error("Grenade not found");

    const quantity = grenade.system.amount || 0;
    if (quantity <= 0) return ui.notifications.warn(`No ${grenade.name} remaining`);

    const cardData = grenade.toObject();
    if (quantity - 1 <= 0 && getSetting("autoDeleteEmpty")) {
        await actor.deleteEmbeddedDocuments("Item", [grenade.id]);
    } else {
        await grenade.update({ "system.amount": quantity - 1 });
    }
    return createThrowCard(actor, cardData);
}

export async function fireFromLauncher(actor, weaponId) {
    if (!actor?.isOwner) return ui.notifications.error("You don't have permission to use this character's items");
    const weapon = actor.items.get(weaponId);
    if (!weapon) return ui.notifications.error("Weapon not found");

    const loaded = weapon.system.magazine?.value || 0;
    if (loaded <= 0) return ui.notifications.warn(`${weapon.name} is empty!`);

    const ammo = (weapon.system.installedItems?.list || [])
        .map((id) => actor.items.get(id))
        .find((i) => i?.type === "ammo" && (i.system.variety === "grenade" || i.system.variety === "rocket"));
    if (!ammo) return ui.notifications.warn(`No ammo loaded in ${weapon.name}`);

    await weapon.update({ "system.magazine.value": loaded - 1 });
    return createThrowCard(actor, ammo.toObject(), weapon);
}

export async function createThrowCard(actor, item, weapon = null) {
    const variety = resolveGrenadeType(item);
    const cfg = GRENADE_TYPES[variety];
    const isRocket = item.system.variety === "rocket";
    const dvTable = weapon ? (weapon.system.weaponType === "rocketLauncher" ? "rocketLauncher" : "grenadeLauncher") : "thrown";
    const skillName = weapon ? (weapon.system.weaponSkill || "Heavy Weapons") : "Athletics";
    const damage = (weapon && isRocket && cfg.mode === "damage") ? (weapon.system.damage || cfg.damage) : cfg.damage;

    const special = getSpecialConfigs()[item.name];
    const color = special?.color || getColors()[variety] || cfg.color;
    const token = actor.token?.object ?? actor.getActiveTokens?.()[0] ?? null;

    const buttons = [{ action: "place-template", icon: "fas fa-crosshairs", label: "Place Template (5x5)", cls: "template-button", title: "Place the blast template, then roll the throw" }];
    switch (cfg.mode) {
        case "damage":
            buttons.push({ action: "roll-damage", icon: "fas fa-droplet red-fg", label: `Roll Damage (${damage})`, cls: "damage-button" });
            break;
        case "ablate":
            buttons.push({ action: "announce-effect", icon: "fas fa-droplet red-fg", label: "Apply Ablation", cls: "damage-button" });
            break;
        case "resist":
            if (damage) buttons.push({ action: "roll-damage", icon: "fas fa-droplet red-fg", label: `Roll Damage (${damage})`, cls: "damage-button" });
            else buttons.push({ action: "announce-effect", icon: "fas fa-droplet red-fg", label: "Apply Effect (Resistance Check)", cls: "damage-button" });
            break;
        case "smoke":
            buttons.push({ action: "activate-smoke", icon: "fas fa-cloud", label: "Activate Smoke", cls: "smoke-button" });
            buttons.push({ action: "clear-effects", icon: "fas fa-wind", label: "Clear Smoke", cls: "template-button mmg-when-active" });
            break;
        case "special":
            buttons.push({ action: "activate-special", icon: "fas fa-bolt", label: "Activate Special Effect", cls: "macro-button" });
            buttons.push({ action: "clear-effects", icon: "fas fa-eraser", label: "Clear Effect", cls: "template-button mmg-when-active", gmOnly: true });
            break;
    }

    const content = await renderTemplate(TEMPLATES.throwCard, {
        actorName: token?.name ?? actor.name,
        verb: weapon ? `fires a ${weapon.name} loaded with` : "throws a",
        grenadeName: item.name,
        typeLabel: typeLabel(variety),
        img: item.img,
        buttons,
        dvLabel: dvTable === "thrown" ? "Thrown" : dvTableLabel(dvTable),
        dvColumns: dvTableColumns(dvTable),
        maxRange: maxRange(dvTable),
        skillName: skillLabel(skillName)
    });

    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor, token: token?.document }),
        content,
        flags: {
            [MODULE_ID]: {
                kind: "throw",
                actorId: actor.id,
                actorUuid: actor.uuid,
                tokenId: token?.id ?? null,
                grenadeName: item.name,
                variety,
                ammoVariety: isRocket ? "rocket" : "grenade",
                damage,
                ablation: Number.isFinite(item.system.ablationValue) ? item.system.ablationValue : undefined,
                color,
                dvTable,
                skillName,
                weaponName: weapon?.name ?? null,
                state: {}
            }
        }
    });
}
