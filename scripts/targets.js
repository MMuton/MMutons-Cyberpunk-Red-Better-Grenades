import { MODULE_ID } from "./constants.js";

export function isGrenadeTemplate(t) {
    return !!t.flags?.[MODULE_ID]?.isGrenadeTemplate;
}

export function templatesForMessage(messageId) {
    if (!canvas.scene || !messageId) return [];
    return canvas.scene.templates.filter((t) => isGrenadeTemplate(t) && t.flags[MODULE_ID].messageId === messageId);
}

export function allGrenadeTemplates() {
    return canvas.scene?.templates.filter(isGrenadeTemplate) ?? [];
}

function templateContains(templateDoc, point) {
    const shape = templateDoc.object?.shape;
    if (shape?.contains) return shape.contains(point.x - templateDoc.x, point.y - templateDoc.y);
    const size = templateDoc.width * canvas.grid.size / canvas.scene.grid.distance;
    return point.x >= templateDoc.x && point.x <= templateDoc.x + size
        && point.y >= templateDoc.y && point.y <= templateDoc.y + size;
}

export function getTokensInTemplates(templates) {
    const found = new Set();
    for (const token of canvas.tokens?.placeables ?? []) {
        if (!token.actor) continue;
        if (templates.some((t) => templateContains(t, token.center))) found.add(token);
    }
    return [...found];
}

export function getTokensInTemplate(template) {
    return getTokensInTemplates([template]);
}

export function resolveTargets(messageId) {
    const templates = templatesForMessage(messageId);
    if (templates.length) return { templates, tokens: getTokensInTemplates(templates), fallback: false };
    const tokens = (canvas.tokens?.controlled ?? []).filter((t) => t.actor);
    return { templates: [], tokens, fallback: true };
}

export async function deleteTemplates(templates) {
    const ids = templates.map((t) => t.id).filter((id) => canvas.scene.templates.has(id));
    if (!ids.length) return;
    try {
        await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
    } catch (err) {
        console.error(`${MODULE_ID} | Failed to delete templates`, err);
        ui.notifications.error("Failed to clear the blast template");
    }
}

export function templateCenter(templateDoc) {
    const size = templateDoc.width * canvas.grid.size / canvas.scene.grid.distance;
    return { x: templateDoc.x + size / 2, y: templateDoc.y + size / 2 };
}
