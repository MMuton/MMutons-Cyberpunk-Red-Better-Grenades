import { MODULE_ID } from "./constants.js";
import { getEffects, getSetting } from "./settings.js";
import { templateCenter } from "./targets.js";
import { warn, esc } from "./utils.js";

const sequencerReady = () => getSetting("enableSequencerEffects") && typeof Sequence !== "undefined";

export async function playDetonation(templates, profile = "explosion") {
    if (!sequencerReady() || profile === "none" || !templates.length) return;
    const fx = getEffects();
    const p = {
        explosion: { file: fx.explosionAnimation, sound: fx.explosionSound, volume: fx.explosionVolume, scale: fx.explosionScale },
        emp: { file: fx.empCenterAnimation, sound: fx.empSound, volume: fx.empVolume, scale: fx.empCenterScale },
        flashbang: { file: fx.flashbangCenterAnimation, sound: fx.flashbangSound, volume: fx.flashbangVolume, scale: fx.flashbangCenterScale }
    }[profile] ?? null;
    if (!p) return;

    try {
        for (const template of templates) {
            const seq = new Sequence();
            let hasContent = false;
            if (p.file?.trim()) {
                seq.effect().file(p.file).atLocation(templateCenter(template)).scale(p.scale || 1);
                hasContent = true;
            }
            if (p.sound?.trim()) {
                seq.sound().file(p.sound).volume(p.volume ?? 0.8);
                hasContent = true;
            }
            if (hasContent) await seq.play();
        }
    } catch (err) {
        console.error(`${MODULE_ID} | Failed to play detonation effects`, err);
    }
}

export async function playTokenEffect(token, kind) {
    if (!sequencerReady() || !token) return;
    const fx = getEffects();
    const file = kind === "emp" ? fx.empAnimation : fx.flashbangAnimation;
    const scale = kind === "emp" ? fx.empScale : fx.flashbangScale;
    if (!file?.trim()) return;
    try {
        await new Sequence().effect().file(file).atLocation(token).scale(scale || 0.3).play();
    } catch (err) {
        console.error(`${MODULE_ID} | Failed to play ${kind} token effect`, err);
    }
}

export async function createScaledTile(template, animationFile, scale = 1, options = {}) {
    if (!game.user.isGM) return null;
    const center = templateCenter(template);
    const base = 400;
    const [tile] = await canvas.scene.createEmbeddedDocuments("Tile", [{
        x: center.x - base / 2,
        y: center.y - base / 2,
        width: base,
        height: base,
        texture: { src: animationFile, scaleX: scale, scaleY: scale },
        alpha: options.alpha ?? 0.8,
        video: { loop: options.loop !== false, autoplay: true, volume: 0 },
        flags: {
            [MODULE_ID]: {
                isSpecialGrenadeTile: true,
                grenadeName: options.grenadeName || "Unknown",
                messageId: template.flags?.[MODULE_ID]?.messageId ?? null
            }
        }
    }]);
    return tile ?? null;
}

export async function createSmokeTiles(templates) {
    const fx = getEffects();
    if (!fx.smokeAnimation?.trim()) {
        ui.notifications.warn("No smoke animation file configured (Module Settings → Customize Default Grenades → Smoke).");
        return [];
    }
    const size = 500;
    const data = [];
    for (const template of templates) {
        const already = canvas.scene.tiles.some((t) => t.flags?.[MODULE_ID]?.isSmokeTile && t.flags[MODULE_ID].templateId === template.id);
        if (already) continue;
        const c = templateCenter(template);
        data.push({
            x: c.x - size / 2,
            y: c.y - size / 2,
            width: size,
            height: size,
            texture: { src: fx.smokeAnimation, scaleX: fx.smokeScale || 1, scaleY: fx.smokeScale || 1 },
            alpha: 0.6,
            elevation: 5,
            occlusion: { alpha: 1, mode: CONST.TILE_OCCLUSION_MODES.NONE },
            video: { loop: true, autoplay: true, volume: 0 },
            flags: {
                [MODULE_ID]: {
                    isSmokeTile: true,
                    templateId: template.id,
                    messageId: template.flags?.[MODULE_ID]?.messageId ?? null,
                    grenadeName: template.flags?.[MODULE_ID]?.grenadeName
                }
            }
        });
    }
    if (!data.length) return [];
    return canvas.scene.createEmbeddedDocuments("Tile", data);
}

export async function deleteModuleTiles(messageId) {
    const ids = canvas.scene.tiles
        .filter((t) => (t.flags?.[MODULE_ID]?.isSmokeTile || t.flags?.[MODULE_ID]?.isSpecialGrenadeTile) && t.flags[MODULE_ID].messageId === messageId)
        .map((t) => t.id);
    if (ids.length) await canvas.scene.deleteEmbeddedDocuments("Tile", ids);
    return ids.length;
}

export function findStatusEffectId(name) {
    const lower = name.toLowerCase();
    const match = (v) => typeof v === "string" && (v.toLowerCase() === lower || game.i18n.localize(v).toLowerCase() === lower);
    const effect = CONFIG.statusEffects.find((e) => e.id === name || match(e.name) || match(e.label));
    return effect?.id ?? null;
}

export async function setStatus(actor, candidates) {
    for (const candidate of candidates) {
        const id = CONFIG.statusEffects.some((e) => e.id === candidate) ? candidate : findStatusEffectId(candidate);
        if (!id) continue;
        if (actor.statuses?.has(id)) return id;
        await actor.toggleStatusEffect(id, { active: true });
        return id;
    }
    warn(`None of these status effects exist: ${candidates.join(", ")}`);
    return null;
}

export async function findItemByName(name) {
    const worldItem = game.items.getName(name);
    if (worldItem) return worldItem;
    for (const pack of game.packs.filter((p) => p.documentName === "Item")) {
        const entry = pack.index.find((e) => e.name === name);
        if (entry) return pack.getDocument(entry._id);
    }
    return null;
}

export async function applyInjury(actor, injuryName) {
    const statusId = findStatusEffectId(injuryName);
    if (statusId && !actor.statuses?.has(statusId)) await actor.toggleStatusEffect(statusId, { active: true });
    if (!actor.items.getName(injuryName)) {
        const item = await findItemByName(injuryName);
        if (item) await actor.createEmbeddedDocuments("Item", [item.toObject()]);
        else ui.notifications.warn(`Item "${injuryName}" not found in world items or compendiums`);
    }
}

const hasInstalledCyberware = (actor, pattern) => actor.items.some(
    (i) => i.type === "cyberware" && i.system.isInstalled && pattern.test(i.name)
);

export const hasAntiDazzle = (actor) => hasInstalledCyberware(actor, /anti-?dazzle/i);
export const hasLevelDamper = (actor) => hasInstalledCyberware(actor, /level damper/i);
export const hasCybereyes = (actor) => hasInstalledCyberware(actor, /cybereye/i);

export function getEMPableItems(actor) {
    const api = game.cpr?.api?.actor?.getEMPableItems;
    if (typeof api === "function") return api(actor);
    return actor.items.filter((i) => i.system?.isElectronic && !i.system?.providesHardening
        && (i.system.equipped === "carried" || i.system.equipped === "equipped" || i.system.isInstalled)).map((i) => i.name);
}

function pickRandom(list, n) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

export async function applyFailEffect(actor, token, onFail, { damage = 0 } = {}) {
    switch (onFail) {
        case "damage": {
            if (damage <= 0) return "No damage";
            const before = actor.system.derivedStats?.hp?.value ?? 0;
            const after = Math.max(0, before - damage);
            await actor.update({ "system.derivedStats.hp.value": after });
            return `${damage} direct damage (HP ${before} → ${after})`;
        }
        case "unconscious":
            await setStatus(actor, ["Unconscious", "unconscious", "sleep"]);
            return "Unconscious";
        case "teargas":
            if (hasAntiDazzle(actor)) return "Anti-Dazzle protects their eyes";
            await applyInjury(actor, "Damaged Eye");
            return "Damaged Eye";
        case "flashbang": {
            await playTokenEffect(token, "flashbang");
            const parts = [];
            if (hasAntiDazzle(actor)) parts.push("eyes protected (Anti-Dazzle)");
            else { await applyInjury(actor, "Damaged Eye"); parts.push("Damaged Eye"); }
            if (hasLevelDamper(actor)) parts.push("ears protected (Level Damper)");
            else { await applyInjury(actor, "Damaged Ear"); parts.push("Damaged Ear"); }
            return parts.join(", ");
        }
        case "emp": {
            const picked = pickRandom(getEMPableItems(actor), 2);
            if (!picked.length) return "No electronics affected";
            await playTokenEffect(token, "emp");
            return `Disabled: ${picked.map((n) => `<em>${esc(n)}</em>`).join(" and ")}`;
        }
        default:
            return "Effect applies";
    }
}
