import { MODULE_ID, GRENADE_TYPES, lookupDV, maxRange, SKILL_STATS } from "./constants.js";
import { getSetting } from "./settings.js";
import { templatesForMessage, deleteTemplates } from "./targets.js";
import { getFlags, resolveActor, resolveToken, postCard, L, skillLabel } from "./utils.js";
import { rollCPRd10 } from "./resistance.js";

const BLAST_SQUARES = 5;

function measure(from, to) {
    if (!from) return null;
    try {
        return canvas.grid.measurePath([from, to]).distance;
    } catch (e) {
        const px = Math.hypot(to.x - from.x, to.y - from.y);
        return px / canvas.grid.size * canvas.scene.grid.distance;
    }
}

async function pickBlastLocation(templateData, { origin, dvTable }) {
    const side = BLAST_SQUARES * canvas.grid.size;
    const half = side / 2;
    const limit = maxRange(dvTable);

    const doc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene });
    const preview = new CONFIG.MeasuredTemplate.objectClass(doc);
    await preview.draw();

    const style = CONFIG.canvasTextStyle.clone();
    style.fontSize = 22;
    const label = new PIXI.Text("", style);
    label.anchor.set(0.5, 1);

    const initialLayer = canvas.activeLayer;
    canvas.templates.activate();
    canvas.templates.preview.addChild(preview);
    canvas.templates.preview.addChild(label);

    let current = { x: doc.x, y: doc.y, distance: null, dv: null };

    const update = (point) => {
        const c = canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
        const distance = measure(origin, c);
        const dv = distance === null ? null : lookupDV(dvTable, distance);
        current = { x: c.x - half, y: c.y - half, distance, dv };
        doc.updateSource({ x: current.x, y: current.y });
        preview.refresh();
        label.position.set(c.x, c.y - half - 6);
        if (distance === null) label.text = "No thrower token";
        else label.text = dv === null ? `${Math.round(distance)} m, OUT OF RANGE (${limit} m)` : `${Math.round(distance)} m, DV ${dv}`;
        label.style.fill = dv === null && distance !== null ? 0xff4444 : 0xffffff;
    };

    update({ x: doc.x + half, y: doc.y + half });

    return new Promise((resolve) => {
        let lastMove = 0;
        const finish = (result, event) => {
            try { if (event) canvas.templates._onDragLeftCancel?.(event); } catch (e) { }
            canvas.stage.off("pointermove", onMove);
            canvas.stage.off("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
            canvas.templates.preview.removeChild(preview);
            canvas.templates.preview.removeChild(label);
            preview.destroy({ children: true });
            label.destroy();
            initialLayer?.activate();
            resolve(result);
        };
        const onMove = (event) => {
            event.stopPropagation();
            const now = Date.now();
            if (now - lastMove < 20) return;
            lastMove = now;
            update(event.getLocalPosition(canvas.templates));
        };
        const onDown = (event) => {
            if (event.button === 2) {
                event.stopPropagation();
                return finish(null, event);
            }
            if (event.button !== 0) return;
            event.stopPropagation();
            update(event.getLocalPosition(canvas.templates));
            if (current.distance !== null && current.dv === null && !game.user.isGM) {
                return ui.notifications.warn(`Out of range. The maximum is ${limit} m.`);
            }
            finish(current, event);
        };
        const onKey = (event) => {
            if (event.key === "Escape") { event.preventDefault(); finish(null); }
        };
        canvas.stage.on("pointermove", onMove);
        canvas.stage.on("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        ui.notifications.info("Click to place the blast. Right-click or Esc to cancel.");
    });
}

let cprChatModule;
async function getCPRChat() {
    if (cprChatModule !== undefined) return cprChatModule;
    try {
        cprChatModule = (await import("../../../systems/cyberpunk-red-core/modules/chat/cpr-chat.js")).default ?? null;
    } catch (e) {
        cprChatModule = null;
    }
    return cprChatModule;
}

async function rollThrowCheck(actor, flags, tokenId, distance, dv, event) {
    const skill = actor.items.find((i) => i.type === "skill" && i.name === flags.skillName);
    const CPRChat = await getCPRChat();
    let total;

    if (skill && CPRChat && typeof skill.createRoll === "function") {
        try {
            const cprRoll = skill.createRoll("skill", actor);
            const keepRolling = await cprRoll.handleRollDialog(event ?? { type: "click" }, actor, skill);
            if (!keepRolling) return;
            await cprRoll.roll();
            if (Number.isInteger(cprRoll.luck) && cprRoll.luck > 0 && actor.isOwner) {
                const luck = actor.system.stats.luck.value;
                await actor.update({ "system.stats.luck.value": Math.max(0, luck - cprRoll.luck) });
            }
            cprRoll.entityData = { actor: actor.id, token: tokenId };
            await CPRChat.RenderRollCard(cprRoll);
            total = cprRoll.resultTotal;
        } catch (err) {
            console.warn(`${MODULE_ID} | System skill roll failed, using a plain roll instead`, err);
        }
    }

    if (total === undefined) {
        const statKey = skill?.system?.stat || SKILL_STATS[flags.skillName] || "dex";
        const base = Number(actor.system?.stats?.[statKey]?.value ?? 0) + Number(skill?.system?.level ?? 0);
        const d10 = await rollCPRd10();
        total = base + d10.value;
        await postCard({ title: skillLabel(flags.skillName), subtitle: L("CPR.global.generic.skill", "Skill"), body: `<div class="text-normal grenade-result-text">${base} + d10 (${d10.label}) = <span class="text-semi">${total}</span></div>` },
            { speaker: ChatMessage.getSpeaker({ actor }) });
    }

    const hit = total > dv;
    await postCard({
        title: flags.grenadeName,
        subtitle: `${skillLabel(flags.skillName)} ${total} vs DV ${dv} (${Math.round(distance)}m)`,
        body: hit
            ? `<div class="text-normal grenade-result-text"><span class="roll-success text-semi">On target!</span></div>`
            : `<div class="text-normal grenade-result-text"><span class="roll-failure text-semi">Missed!</span><br>The GM decides where it lands. Move the template before it goes off.</div>`
    }, { speaker: ChatMessage.getSpeaker({ actor }) });
}

export async function placeTemplateForMessage(message, event) {
    if (!canvas.scene) return ui.notifications.warn("Open a scene first.");
    const f = getFlags(message);
    const actor = resolveActor(f);
    if (!actor) return ui.notifications.error("Actor not found");
    const thrower = resolveToken(f, actor);
    if (!thrower) ui.notifications.warn(`No token for ${actor.name} on this scene, so range and the throw check are skipped.`);

    const cfg = GRENADE_TYPES[f.variety] ?? GRENADE_TYPES.basic;
    const units = canvas.scene.grid.distance || 2;
    const sideUnits = BLAST_SQUARES * units;
    const start = thrower ? thrower.center : canvas.stage.pivot;

    const templateData = {
        t: "rect",
        x: start.x - (BLAST_SQUARES / 2) * canvas.grid.size,
        y: start.y - (BLAST_SQUARES / 2) * canvas.grid.size,
        distance: Math.hypot(sideUnits, sideUnits),
        direction: 45,
        width: sideUnits,
        borderColor: cfg.borderColor ?? "#000000",
        fillColor: f.color || cfg.color,
        flags: {
            [MODULE_ID]: { isGrenadeTemplate: true, messageId: message.id, grenadeName: f.grenadeName, variety: f.variety }
        }
    };

    const picked = await pickBlastLocation(templateData, { origin: thrower?.center ?? null, dvTable: f.dvTable });
    if (!picked) return;

    await deleteTemplates(templatesForMessage(message.id));
    templateData.x = picked.x;
    templateData.y = picked.y;
    try {
        await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
    } catch (err) {
        console.error(`${MODULE_ID} | Failed to place template`, err);
        return ui.notifications.error("Failed to place blast template");
    }

    if (getSetting("rollThrowCheck") && thrower && picked.dv !== null) {
        await rollThrowCheck(actor, f, thrower.id, picked.distance, picked.dv, event);
    } else if (getSetting("rollThrowCheck") && thrower && picked.dv === null) {
        ui.notifications.warn(`${f.grenadeName} was placed out of range, so no throw check was rolled.`);
    }
}
