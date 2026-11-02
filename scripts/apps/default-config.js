import { GRENADE_TYPES, NUMBER_EFFECT_KEYS, TEMPLATES } from "../constants.js";
import { getColors, getEffects, setSetting } from "../settings.js";
import { typeLabel } from "../utils.js";

export class DefaultGrenadeConfigApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Customize Default Grenades",
            id: "default-grenade-config",
            classes: ["mmg-app", "default-grenade-config"],
            template: TEMPLATES.defaultConfig,
            width: 560,
            height: "auto",
            closeOnSubmit: true,
            resizable: true,
            tabs: [{ navSelector: "nav.mmg-config-tabs", contentSelector: "section.mmg-config-content", initial: "colors" }]
        });
    }

    getData() {
        const colors = getColors();
        return {
            colorList: Object.keys(GRENADE_TYPES).map((key) => ({ key, label: typeLabel(key), value: colors[key] })),
            effects: getEffects()
        };
    }

    async _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        const effects = getEffects();
        for (const [key, value] of Object.entries(data.effects ?? {})) {
            effects[key] = NUMBER_EFFECT_KEYS.has(key) ? (parseFloat(value) || 0) : (value ?? "");
        }
        await setSetting("templateColors", { ...getColors(), ...(data.colors ?? {}) });
        await setSetting("effects", effects);
    }
}
