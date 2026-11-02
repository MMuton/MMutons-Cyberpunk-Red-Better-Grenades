import { MODULE_ID, SYSTEM_ID, GRENADE_TYPES, TYPE_I18N, SKILL_I18N, DV_TABLES } from "./constants.js";

export const esc = (value) => Handlebars.escapeExpression(value ?? "");

export function L(key, fallback) {
    if (key && game.i18n.has(key)) return game.i18n.localize(key);
    return fallback ?? key;
}

export const typeLabel = (type) => L(TYPE_I18N[type], GRENADE_TYPES[type]?.label ?? type);
export const skillLabel = (skill) => L(SKILL_I18N[skill], skill);
export const statLabel = (stat) => L(`CPR.global.stats.${stat}`, String(stat).toUpperCase());
export const dvTableLabel = (key) => L(DV_TABLES[key]?.i18n, DV_TABLES[key]?.label ?? key);

export const log = (...args) => console.log(`${MODULE_ID} |`, ...args);
export const warn = (...args) => console.warn(`${MODULE_ID} |`, ...args);

export function getFlags(message) {
    return message?.flags?.[MODULE_ID] ?? {};
}

export function simpleCard({ title, subtitle = "", body = "", classes = "" }) {
    return `
        <div class="rollcard mmg-card ${classes}">
            <div class="rollcard-top">
                <div class="cpr-block chat-rollTitle-stat">
                    <div class="text-center text-padding-top text-normal text-semi">${esc(title)}</div>
                    ${subtitle ? `<div class="rollcard-subtitle"><div class="rollcard-subtitle-center text-small">${esc(subtitle)}</div></div>` : ""}
                </div>
            </div>
            ${body ? `<div class="rollcard-bottom"><div class="cpr-block">${body}</div></div>` : ""}
        </div>`;
}

export async function postCard(cardData, messageData = {}) {
    return ChatMessage.create({
        speaker: { alias: "Grenade System" },
        ...messageData,
        content: simpleCard(cardData)
    });
}

export function diceImages(faces, isCritical = false) {
    return faces.map((f) => {
        const src = (f === 6 && isCritical)
            ? `systems/${SYSTEM_ID}/icons/dice/red/d6_6_preem.svg`
            : `systems/${SYSTEM_ID}/icons/dice/black/d6_${f}.svg`;
        return `<img class="d6 d6-30" style="margin: 2px;" src="${src}" alt="${f}">`;
    }).join("");
}

export function rollFaces(roll) {
    return roll.dice.flatMap((d) => d.results.filter((r) => r.active !== false).map((r) => r.result));
}

export function isDamageCritical(faces) {
    return faces.filter((f) => f === 6).length >= 2;
}

export function gmIds() {
    return game.users.filter((u) => u.isGM).map((u) => u.id);
}

export function resolveActor(flags) {
    if (flags.actorUuid) {
        const doc = fromUuidSync(flags.actorUuid);
        if (doc) return doc;
    }
    return game.actors.get(flags.actorId) ?? null;
}

export function resolveToken(flags, actor) {
    if (flags.tokenId) {
        const t = canvas.tokens?.get(flags.tokenId);
        if (t) return t;
    }
    if (!actor) return null;
    const controlled = canvas.tokens?.controlled.find((t) => t.actor === actor || t.actor?.id === actor.id);
    if (controlled) return controlled;
    return actor.getActiveTokens?.()[0] ?? null;
}

export function isPlayerOwned(actor) {
    return !!actor?.hasPlayerOwner;
}

const existsCache = new Map();

export async function fileExists(path) {
    if (!path) return false;
    if (existsCache.has(path)) return existsCache.get(path);
    const moduleId = path.match(/^modules\/([^/]+)\//)?.[1];
    if (moduleId && !game.modules.get(moduleId)?.active) {
        existsCache.set(path, false);
        return false;
    }
    let ok = false;
    try {
        const res = await fetch(path, { method: "HEAD" });
        ok = res.ok;
    } catch (e) {
        ok = false;
    }
    existsCache.set(path, ok);
    return ok;
}

export async function firstExistingFile(paths) {
    for (const p of paths) {
        if (await fileExists(p)) return p;
    }
    return null;
}

export function canControlActor(actor) {
    return game.user.isGM || !!actor?.isOwner;
}
