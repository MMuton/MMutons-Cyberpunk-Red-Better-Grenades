import { MODULE_ID, GRENADE_TYPES, TEMPLATES, SKILL_STATS, FAIL_TEXT } from "./constants.js";
import { resolveTargets, deleteTemplates } from "./targets.js";
import { playDetonation, applyFailEffect, hasCybereyes, hasAntiDazzle, hasLevelDamper, getEMPableItems } from "./effects.js";
import { getFlags, isPlayerOwned, statLabel, skillLabel } from "./utils.js";
import { setCardState } from "./state.js";

export function checkBase(actor, skillName) {
    const skill = actor.items.find((i) => i.type === "skill" && i.name === skillName);
    const statKey = skill?.system?.stat || SKILL_STATS[skillName] || "will";
    const stat = Number(actor.system?.stats?.[statKey]?.value ?? 0);
    const level = Number(skill?.system?.level ?? 0);
    return { statKey, stat, level, base: stat + level };
}

export async function rollCPRd10() {
    const first = (await new Roll("1d10").evaluate()).total;
    let crit = 0;
    if (first === 10 || first === 1) crit = (await new Roll("1d10").evaluate()).total;
    const value = first === 10 ? first + crit : first === 1 ? first - crit : first;
    const label = first === 10 ? `10+${crit}` : first === 1 ? `1−${crit}` : `${first}`;
    return { value, label, first };
}

export class ResistanceApp extends Application {
    constructor(data, resolve) {
        super();
        this.data = data;
        this._resolve = resolve;
        this.rolls = {};
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: TEMPLATES.resistanceDialog,
            classes: ["mmg-app", "mmg-resistance-app"],
            width: 560,
            height: "auto",
            resizable: true
        });
    }

    get id() {
        return `mmg-resistance-${this.data.messageId}`;
    }

    get title() {
        return `${this.data.grenadeName}: Resistance Checks`;
    }

    static prompt(data) {
        return new Promise((resolve) => new ResistanceApp(data, resolve).render(true));
    }

    getData() {
        return this.data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", ".mmg-sheet-link", (ev) => {
            ev.preventDefault();
            const token = canvas.tokens.get(ev.currentTarget.dataset.tokenId);
            token?.actor?.sheet?.render(true);
        });

        html.on("change", ".mmg-decision", (ev) => {
            const box = ev.currentTarget;
            if (!box.checked) return;
            const row = box.closest(".mmg-target-row");
            row.querySelectorAll(".mmg-decision").forEach((other) => { if (other !== box) other.checked = false; });
            row.classList.remove("mmg-undecided");
        });

        html.on("click", ".mmg-roll-one", async (ev) => {
            ev.preventDefault();
            await this._rollRow(ev.currentTarget.closest(".mmg-target-row"));
        });

        html.find(".mmg-roll-all").on("click", async (ev) => {
            ev.preventDefault();
            for (const row of html[0].querySelectorAll(".mmg-target-row[data-token-id]")) {
                if (!this._decisionFor(row)) await this._rollRow(row);
            }
        });

        html.find(".mmg-mark-all").on("click", (ev) => {
            ev.preventDefault();
            const which = ev.currentTarget.dataset.mark;
            html[0].querySelectorAll(".mmg-target-row[data-token-id]").forEach((row) => this._setDecision(row, which));
        });

        html.find(".mmg-apply").on("click", (ev) => {
            ev.preventDefault();
            this._submit(html);
        });
        html.find(".mmg-cancel").on("click", (ev) => {
            ev.preventDefault();
            this.close();
        });
    }

    _decisionFor(row) {
        return row.querySelector(".mmg-decision:checked")?.value ?? null;
    }

    _setDecision(row, which) {
        row.querySelectorAll(".mmg-decision").forEach((b) => { b.checked = b.value === which; });
        row.classList.remove("mmg-undecided");
    }

    async _rollRow(row) {
        const target = this.data.targets.find((t) => t.tokenId === row.dataset.tokenId);
        if (!target) return;
        const d10 = await rollCPRd10();
        const total = target.base + d10.value;
        const passed = total > this.data.dv;
        this.rolls[target.tokenId] = { total, detail: `${target.base} + ${d10.label}` };
        const out = row.querySelector(".mmg-roll-result");
        out.textContent = `${total}`;
        out.title = `${target.baseLabel} + d10 (${d10.label}) = ${total} vs DV ${this.data.dv}`;
        out.classList.toggle("roll-success", passed);
        out.classList.toggle("roll-failure", !passed);
        this._setDecision(row, passed ? "pass" : "fail");
    }

    async _submit(html) {
        const decisions = {};
        let undecided = 0;
        html[0].querySelectorAll(".mmg-target-row[data-token-id]").forEach((row) => {
            const d = this._decisionFor(row);
            decisions[row.dataset.tokenId] = d;
            if (!d) { undecided++; row.classList.add("mmg-undecided"); }
        });
        if (undecided) {
            const ok = await Dialog.confirm({
                title: "Unmarked targets",
                content: `<p>${undecided} target(s) have neither Pass nor Fail ticked. They will be skipped. Continue?</p>`
            });
            if (!ok) return;
        }
        const resolve = this._resolve;
        this._resolve = null;
        resolve?.({ decisions, rolls: this.rolls });
        await super.close();
    }

    async close(options) {
        if (this._resolve) {
            const resolve = this._resolve;
            this._resolve = null;
            resolve(null);
        }
        return super.close(options);
    }
}

function targetNote(actor, onFail, variety) {
    if (variety === "teargas" && hasCybereyes(actor)) return { note: "Cybereyes: immune", preset: "pass" };
    if (variety === "teargas" && hasAntiDazzle(actor)) return { note: "Has Anti-Dazzle", preset: null };
    if (onFail === "flashbang") {
        const notes = [];
        if (hasAntiDazzle(actor)) notes.push("Anti-Dazzle");
        if (hasLevelDamper(actor)) notes.push("Level Damper");
        return { note: notes.length ? `Has ${notes.join(" + ")}` : "", preset: null };
    }
    if (onFail === "emp") {
        const n = getEMPableItems(actor).length;
        return { note: n ? `${n} EMP-able item(s)` : "No EMP-able electronics", preset: null };
    }
    return { note: "", preset: null };
}

export async function resolveResistance(message) {
    if (!game.user.isGM) return ui.notifications.error("Only GMs can resolve resistance checks");
    const f = getFlags(message);
    const sourceId = f.sourceMessageId ?? message.id;
    const sourceFlags = getFlags(game.messages.get(sourceId));
    const variety = f.variety ?? sourceFlags.variety;
    const grenadeName = f.grenadeName ?? sourceFlags.grenadeName;
    const cfg = GRENADE_TYPES[variety];
    if (!cfg?.resist) return;

    const { templates, tokens, fallback } = resolveTargets(sourceId);
    if (fallback) ui.notifications.warn("No blast template found, using your selected tokens.");
    if (!tokens.length) return ui.notifications.warn("No tokens in the blast area (or selected).");

    const damage = f.damage ?? 0;
    const targets = tokens.map((token) => {
        const actor = token.actor;
        const b = checkBase(actor, cfg.resist.skill);
        const { note, preset } = targetNote(actor, cfg.onFail, variety);
        const isPC = isPlayerOwned(actor);
        return {
            tokenId: token.id,
            name: token.name,
            img: token.document.texture?.src || actor.img,
            isPC,
            typeLabel: isPC ? "PC" : "NPC",
            base: b.base,
            baseLabel: `${statLabel(b.statKey)} ${b.stat} + ${skillLabel(cfg.resist.skill)} ${b.level}`,
            note,
            preset
        };
    });

    const result = await ResistanceApp.prompt({
        messageId: message.id,
        grenadeName,
        dv: cfg.resist.dv,
        skill: skillLabel(cfg.resist.skill),
        failText: cfg.onFail === "damage" ? `${damage} direct damage (ignores armor)` : FAIL_TEXT[cfg.onFail],
        targets
    });
    if (!result) return;

    await playDetonation(templates, cfg.effects);

    const rows = [];
    for (const t of targets) {
        const token = canvas.tokens.get(t.tokenId);
        const decision = result.decisions[t.tokenId];
        const roll = result.rolls[t.tokenId];
        let effect = "";
        if (decision === "fail" && token?.actor) {
            effect = await applyFailEffect(token.actor, token, cfg.onFail, { damage });
        } else if (decision === "pass") {
            effect = "No effect";
        } else {
            effect = "Skipped";
        }
        rows.push({ ...t, decision, roll: roll?.total ?? "", rollDetail: roll?.detail ?? "", effect });
    }

    const content = await renderTemplate(TEMPLATES.resistanceSummary, {
        grenadeName,
        subtitle: `DV ${cfg.resist.dv} ${skillLabel(cfg.resist.skill)}`,
        rows
    });
    await ChatMessage.create({ speaker: { alias: skillLabel(cfg.resist.skill) }, content, flags: { [MODULE_ID]: { kind: "summary" } } });

    await deleteTemplates(templates);
    await setCardState(message, { applied: true, detonated: true });
}
