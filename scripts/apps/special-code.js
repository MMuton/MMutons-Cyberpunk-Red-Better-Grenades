import { TEMPLATES } from "../constants.js";
import { getSpecialConfigs, setSetting } from "../settings.js";

const BLANK = { name: "New Grenade", color: "#FF69B4", deleteTemplate: true, tileScale: 1, code: "" };

export class SpecialGrenadeCodeApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Special Grenade Configuration",
            id: "special-grenade-config",
            template: TEMPLATES.specialConfig,
            width: 640,
            height: "auto",
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true,
            classes: ["mmg-app", "special-grenade-config"]
        });
    }

    getData() {
        const grenades = Object.entries(getSpecialConfigs()).map(([name, c]) => ({
            name,
            color: c.color || BLANK.color,
            deleteTemplate: c.deleteTemplate !== false,
            tileScale: c.tileScale || 1,
            code: c.code || ""
        }));
        return {
            grenades,
            blank: BLANK,
            builtInGrenades: [
                { name: "Shuriken Grenade", description: "Rolls 3d6 damage separately for each target (any special grenade with \"Shuriken\" in its name)." },
                { name: "EMP and Flashbang", description: "Special grenades named EMP or Flashbang use the standard EMP / Flashbang rules, including the resistance check." }
            ]
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        const list = html.find(".grenade-list");

        html.find(".add-grenade-btn").on("click", () => {
            const tpl = html.find("template.grenade-entry-template")[0];
            const entry = $(tpl.content.firstElementChild.cloneNode(true));
            list.append(entry);
            this._bindEntry(entry);
            entry.find(".grenade-name").trigger("focus").trigger("select");
            this.setPosition({ height: "auto" });
        });

        list.find(".grenade-entry").each((i, el) => this._bindEntry($(el)));

        html.find(".save-config-btn").on("click", () => this._saveConfigs(html));
        html.find(".save-close-btn").on("click", async () => {
            await this._saveConfigs(html);
            this.close();
        });
    }

    _bindEntry(entry) {
        entry.find(".expand-btn").on("click", () => {
            entry.find(".grenade-code-section").slideToggle(200, () => this.setPosition({ height: "auto" }));
        });
        entry.find(".delete-grenade-btn").on("click", () => {
            entry.remove();
            this.setPosition({ height: "auto" });
        });
    }

    async _saveConfigs(html) {
        const configs = {};
        html.find(".grenade-list .grenade-entry").each((i, el) => {
            const entry = $(el);
            const name = String(entry.find(".grenade-name").val() ?? "").trim();
            if (!name) return;
            configs[name] = {
                color: entry.find(".grenade-color").val(),
                deleteTemplate: entry.find(".delete-template").is(":checked"),
                tileScale: parseFloat(entry.find(".tile-scale").val()) || 1,
                code: entry.find(".grenade-code").val()
            };
        });
        await setSetting("specialGrenadeConfigs", configs);
        ui.notifications.info("Special grenade configuration saved.");
    }

    async _updateObject() {}
}
