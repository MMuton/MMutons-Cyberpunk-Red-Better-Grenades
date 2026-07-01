class GrenadeSystem {
    static MODULE_ID = "mmutons-cyberpunk-red-upgraded-grenades";
    
    static COLOR_SETTINGS = [
        "colorBasic", "colorAcid", "colorArmorPiercing", "colorBiotoxin", "colorEmp", 
        "colorExpansive", "colorFlashbang", "colorIncendiary", "colorPoison", "colorRubber", 
        "colorSleep", "colorSmart", "colorSmoke", "colorTeargas", "colorSpecial"
    ];
    
    static GRENADE_TYPES = {
        "basic": { damage: "6d6", ablation: 1, hasResistance: false, hasDamageButton: true, macro: null },
        "acid": { damage: "0", ablation: 1, hasResistance: false, hasDamageButton: true, macro: null, acidOnly: true },
        "armor piercing": { damage: "6d6", ablation: 2, hasResistance: false, hasDamageButton: true, macro: null },
        "armorpiercing": { damage: "6d6", ablation: 2, hasResistance: false, hasDamageButton: true, macro: null },
        "biotoxin": { damage: "3d6", ablation: 0, hasResistance: true, resistanceDV: 15, resistanceType: "Resist Torture/Drugs", directDamage: true, hasDamageButton: true, macro: null },
        "emp": { damage: "0", ablation: 0, hasResistance: true, resistanceDV: 15, resistanceType: "Cybertech", directDamage: false, hasDamageButton: true, macro: null },
        "expansive": { damage: "6d6", ablation: 1, hasResistance: false, hasDamageButton: true, macro: null },
        "flashbang": { damage: "0", ablation: 0, hasResistance: true, resistanceDV: 15, resistanceType: "Resist Torture/Drugs", directDamage: false, hasDamageButton: true, macro: null },
        "incendiary": { damage: "6d6", ablation: 0, hasResistance: false, hasDamageButton: true, macro: null, condition: "s93iaEZXm1onbJ05" },
        "poison": { damage: "2d6", ablation: 0, hasResistance: true, resistanceDV: 13, resistanceType: "Resist Torture/Drugs", directDamage: true, hasDamageButton: true, macro: null },
        "rubber": { damage: "6d6", ablation: 0, hasResistance: false, hasDamageButton: true, macro: null },
        "sleep": { damage: "0", ablation: 0, hasResistance: true, resistanceDV: 13, resistanceType: "Resist Torture/Drugs", directDamage: false, hasDamageButton: true, macro: null },
        "smart": { damage: "6d6", ablation: 2, hasResistance: false, hasDamageButton: true, macro: null },
        "smoke": { damage: "0", ablation: 0, hasResistance: false, hasDamageButton: false, macro: null },
        "teargas": { damage: "0", ablation: 0, hasResistance: true, resistanceDV: 13, resistanceType: "Resist Torture/Drugs", directDamage: false, hasDamageButton: true, macro: null },
        "special": { damage: "0", ablation: 0, hasResistance: false, hasDamageButton: false, macro: null }
    };
    
    static _settingsCache = new Map();
    
    static COLOR_LABELS = {
        "colorBasic": "Basic", "colorAcid": "Acid", "colorArmorPiercing": "Armor Piercing",
        "colorBiotoxin": "Biotoxin", "colorEmp": "EMP", "colorExpansive": "Expansive",
        "colorFlashbang": "Flashbang", "colorIncendiary": "Incendiary", "colorPoison": "Poison",
        "colorRubber": "Rubber", "colorSleep": "Sleep", "colorSmart": "Smart",
        "colorSmoke": "Smoke", "colorTeargas": "Teargas", "colorSpecial": "Special"
    };

    static JB2A_PATREON_PATHS = {
        explosionAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_Yellow_400x400.webm",
        empAnimation:             "modules/jb2a_patreon/Library/Generic/Lightning/StaticElectricity_03_Regular_Blue_400x400.webm",
        empCenterAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_02_Blue_400x400.webm",
        flashbangAnimation:       "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_BlueYellow_400x400.webm",
        flashbangCenterAnimation: "modules/jb2a_patreon/Library/1st_Level/Thunderwave/Thunderwave_01_Bright_Blue_Center_600x600.webm",
        smokeAnimation:           "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
    };

    static JB2A_FREE_PATHS = {
        explosionAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_01_Orange_400x400.webm",
        empAnimation:             "modules/JB2A_DnD5e/Library/Generic/Lightning/StaticElectricity_03_Regular_Blue_400x400.webm",
        empCenterAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_02_Blue_400x400.webm",
        flashbangAnimation:       "modules/JB2A_DnD5e/Library/Generic/Explosion/Explosion_03_Regular_BlueYellow_400x400.webm",
        flashbangCenterAnimation: "modules/JB2A_DnD5e/Library/1st_Level/Thunderwave/Thunderwave_01_Bright_Blue_Center_600x600.webm",
        smokeAnimation:           "modules/JB2A_DnD5e/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
    };

    static getJB2APaths() {
        if (game.modules.get("jb2a_patreon")?.active) return this.JB2A_PATREON_PATHS;
        if (game.modules.get("JB2A_DnD5e")?.active) return this.JB2A_FREE_PATHS;
        return null;
    }

    static DefaultGrenadeConfigApplication = class extends FormApplication {
        static get defaultOptions() {
            return foundry.utils.mergeObject(super.defaultOptions, {
                title: "Customize Default Grenades",
                id: "default-grenade-config",
                template: `modules/${GrenadeSystem.MODULE_ID}/templates/default-grenade-config.hbs`,
                width: 620,
                height: "auto",
                closeOnSubmit: true,
                resizable: true,
                tabs: [{ navSelector: "nav.tabs", contentSelector: "section.tab-content", initial: "colors" }]
            });
        }

        getData() {
            const colorList = GrenadeSystem.COLOR_SETTINGS.map(key => ({
                key,
                label: GrenadeSystem.COLOR_LABELS[key],
                value: game.settings.get(GrenadeSystem.MODULE_ID, key)
            }));

            return {
                colorList,
                explosionAnimation:      game.settings.get(GrenadeSystem.MODULE_ID, "explosionAnimation"),
                explosionSound:          game.settings.get(GrenadeSystem.MODULE_ID, "explosionSound"),
                explosionVolume:         game.settings.get(GrenadeSystem.MODULE_ID, "explosionVolume"),
                explosionScale:          game.settings.get(GrenadeSystem.MODULE_ID, "explosionScale"),
                empAnimation:            game.settings.get(GrenadeSystem.MODULE_ID, "empAnimation"),
                empCenterAnimation:      game.settings.get(GrenadeSystem.MODULE_ID, "empCenterAnimation"),
                empSound:                game.settings.get(GrenadeSystem.MODULE_ID, "empSound"),
                empVolume:               game.settings.get(GrenadeSystem.MODULE_ID, "empVolume"),
                empScale:                game.settings.get(GrenadeSystem.MODULE_ID, "empScale"),
                empCenterScale:          game.settings.get(GrenadeSystem.MODULE_ID, "empCenterScale"),
                flashbangAnimation:      game.settings.get(GrenadeSystem.MODULE_ID, "flashbangAnimation"),
                flashbangCenterAnimation:game.settings.get(GrenadeSystem.MODULE_ID, "flashbangCenterAnimation"),
                flashbangSound:          game.settings.get(GrenadeSystem.MODULE_ID, "flashbangSound"),
                flashbangVolume:         game.settings.get(GrenadeSystem.MODULE_ID, "flashbangVolume"),
                flashbangScale:          game.settings.get(GrenadeSystem.MODULE_ID, "flashbangScale"),
                flashbangCenterScale:    game.settings.get(GrenadeSystem.MODULE_ID, "flashbangCenterScale"),
                smokeAnimation:          game.settings.get(GrenadeSystem.MODULE_ID, "smokeAnimation"),
                smokeScale:              game.settings.get(GrenadeSystem.MODULE_ID, "smokeScale"),
            };
        }

        async _updateObject(event, formData) {
            const numberKeys = new Set([
                "explosionVolume", "explosionScale", "empVolume", "empScale", "empCenterScale",
                "flashbangVolume", "flashbangScale", "flashbangCenterScale", "smokeScale"
            ]);
            for (const [key, value] of Object.entries(formData)) {
                const coerced = numberKeys.has(key) ? (parseFloat(value) || 0) : value;
                await game.settings.set(GrenadeSystem.MODULE_ID, key, coerced);
            }
            GrenadeSystem._settingsCache.clear();
        }
    };
	
	static SpecialGrenadeCodeApplication = class extends FormApplication {
        static get defaultOptions() {
            return foundry.utils.mergeObject(super.defaultOptions, {
                title: "Special Grenade Configuration",
                id: "special-grenade-config",
                template: `modules/${GrenadeSystem.MODULE_ID}/templates/special-grenade-code.hbs`,
                width: 750,
                height: 700,
                closeOnSubmit: false,
                submitOnChange: false,
                resizable: true,
                classes: ["special-grenade-config"]
            });
        }

        getData() {
            const configs = game.settings.get(GrenadeSystem.MODULE_ID, "specialGrenadeConfigs") || {};
            const grenadeList = Object.entries(configs).map(([name, config]) => ({
                name,
                color: config.color || "#FF69B4",
                deleteTemplate: config.deleteTemplate !== false,
                tileScale: config.tileScale || 1,
                code: config.code || ""
            }));
            
            return {
                grenades: grenadeList,
                builtInGrenades: [
                    { name: "Shuriken Grenade", description: "Rolls 3d6 damage individually for each target" },
                    { name: "EMP", description: "Disables up to 2 random electronics per target" },
                    { name: "Flashbang", description: "Applies blinding/deafening effects" }
                ]
            };
        }

        activateListeners(html) {
            super.activateListeners(html);
            
            html.find('.add-grenade-btn').on('click', () => {
                const container = html.find('.grenade-list');
                const newIndex = container.find('.grenade-entry').length;
                const newEntry = this._createGrenadeEntryHTML(newIndex, {
                    name: "New Grenade",
                    color: "#FF69B4",
                    deleteTemplate: true,
                    tileScale: 1,
                    code: ""
                });
                container.append(newEntry);
                this._bindEntryListeners(html, container.find('.grenade-entry').last());
                this.setPosition({ height: "auto" });
            });
            
            html.find('.grenade-entry').each((i, el) => {
                this._bindEntryListeners(html, $(el));
            });
            
            html.find('.save-config-btn').on('click', async () => {
                await this._saveConfigs(html);
            });
            
            html.find('.save-close-btn').on('click', async () => {
                await this._saveConfigs(html);
                this.close();
            });
        }
        
        _createGrenadeEntryHTML(index, data) {
            return `
                <div class="grenade-entry" data-index="${index}">
                    <div class="grenade-header-row">
                        <input type="text" class="grenade-name" value="${data.name}" placeholder="Grenade Name">
                        <input type="color" class="grenade-color" value="${data.color}" title="Template Color">
                        <label class="delete-template-label">
                            <input type="checkbox" class="delete-template" ${data.deleteTemplate ? 'checked' : ''}>
                            Delete Template
                        </label>
                        <label class="tile-scale-label">
                            Scale: <input type="number" class="tile-scale" value="${data.tileScale}" min="0.1" max="10" step="0.1">
                        </label>
                        <button type="button" class="expand-btn" title="Expand/Collapse Code">
                            <i class="fas fa-code"></i>
                        </button>
                        <button type="button" class="delete-grenade-btn" title="Delete Grenade">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="grenade-code-section" style="display: none;">
                        <textarea class="grenade-code" rows="10" placeholder="// Custom JavaScript code for this grenade...">${data.code}</textarea>
                        <div class="code-help">
                            Variables: <code>grenadeName</code>, <code>actor</code>, <code>token</code>, <code>targets</code>, <code>templates</code>, <code>config</code>, <code>GrenadeSystem</code>
                        </div>
                    </div>
                </div>
            `;
        }
        
        _bindEntryListeners(html, entry) {
            const self = this;
            entry.find('.expand-btn').off('click').on('click', function() {
                const codeSection = entry.find('.grenade-code-section');
                codeSection.slideToggle(200, function() {
                    self.setPosition({ height: "auto" });
                });
            });
            
            entry.find('.delete-grenade-btn').off('click').on('click', () => {
                entry.remove();
                this.setPosition({ height: "auto" });
            });
        }
        
        async _saveConfigs(html) {
            const configs = {};
            
            html.find('.grenade-entry').each((i, el) => {
                const entry = $(el);
                const name = entry.find('.grenade-name').val().trim();
                if (name) {
                    configs[name] = {
                        color: entry.find('.grenade-color').val(),
                        deleteTemplate: entry.find('.delete-template').is(':checked'),
                        tileScale: parseFloat(entry.find('.tile-scale').val()) || 1,
                        code: entry.find('.grenade-code').val()
                    };
                }
            });
            
            await game.settings.set(GrenadeSystem.MODULE_ID, "specialGrenadeConfigs", configs);
            GrenadeSystem._settingsCache.delete("specialGrenadeConfigs");
        }

        async _updateObject(event, formData) {
        }
    };

    static initialize() {
        this.registerSettings();
        this.registerHooks();
    }

    static registerSettings() {
        game.settings.registerMenu(this.MODULE_ID, "defaultGrenadeConfigMenu", {
            name: "Customize Default Grenades",
            hint: "Configure colors, animations, and sounds for all built-in grenade types",
            label: "Customize Default Grenades",
            icon: "fas fa-sliders",
            type: this.DefaultGrenadeConfigApplication,
            restricted: true
        });

        game.settings.registerMenu(this.MODULE_ID, "specialGrenadeCodeMenu", {
            name: "Special Grenade Code Editor",
            hint: "Configure custom JavaScript code for special grenades",
            label: "Edit Special Grenade Code",
            icon: "fas fa-code",
            type: this.SpecialGrenadeCodeApplication,
            restricted: true
        });

        const visibleSettings = [
            ["autoDeleteEmpty", "Auto-Delete Empty Grenades", "Automatically remove grenade items when quantity reaches 0", "world", Boolean, true],
            ["enableSequencerEffects", "Enable Sequencer Effects", "Play visual and audio effects when grenades explode (requires Sequencer module)", "world", Boolean, true],
            ["showDamageRecap", "Show Damage Recap", "Display detailed damage breakdown in chat after applying grenade damage", "world", Boolean, false],
        ];

        visibleSettings.forEach(([key, name, hint, scope, type, defaultValue]) => {
            game.settings.register(this.MODULE_ID, key, { name, hint, scope, config: true, type, default: defaultValue });
        });

        this.registerColorSettings();

        const assetSounds = `modules/${this.MODULE_ID}/assets`;

        const effectSettings = [
            ["explosionAnimation",       String, ""],
            ["explosionSound",           String, `${assetSounds}/explosion-misosound.mp3`],
            ["explosionVolume",          Number, 0.7],
            ["explosionScale",           Number, 1.0],
            ["empAnimation",             String, ""],
            ["empCenterAnimation",       String, ""],
            ["empSound",                 String, `${assetSounds}/emp-SOUND_GARAGE.mp3`],
            ["empVolume",                Number, 0.8],
            ["empScale",                 Number, 0.3],
            ["empCenterScale",           Number, 1.2],
            ["flashbangAnimation",       String, ""],
            ["flashbangCenterAnimation", String, ""],
            ["flashbangSound",           String, `${assetSounds}/flashbang-MadPanCake.mp3`],
            ["flashbangVolume",          Number, 0.8],
            ["flashbangScale",           Number, 0.3],
            ["flashbangCenterScale",     Number, 1.3],
            ["smokeAnimation",           String, ""],
            ["smokeScale",               Number, 1.0],
        ];

        effectSettings.forEach(([key, type, defaultValue]) => {
            game.settings.register(this.MODULE_ID, key, { scope: "world", config: false, type, default: defaultValue });
        });
		
        game.settings.register(this.MODULE_ID, "specialGrenadeConfigs", {
            name: "Special Grenade Configurations",
            hint: "Configuration data for special grenades",
            scope: "world",
            config: false,
            type: Object,
            default: {
                "Rave Grenade": {
                    color: "#6be1ff",
                    deleteTemplate: false,
                    tileScale: 2.5,
                    code: "const animationFile = \"modules/jb2a_patreon/Library/Generic/Marker/MarkerLight_01_Regular_Blue02_400x400.webm\";\n\nfor (const template of templates) {\n    await GrenadeSystem.createScaledTile(template, animationFile, config.tileScale, {\n        grenadeName: grenadeName,\n        alpha: 0.8,\n        loop: true\n    });\n}"
                }
            }
        });
    }

    static registerColorSettings() {
        const colorSettings = [
            ["colorBasic", "Basic Grenade Color", "#FFFF00"],
            ["colorAcid", "Acid Grenade Color", "#80FF00"],
            ["colorArmorPiercing", "Armor Piercing Grenade Color", "#FF3366"],
            ["colorBiotoxin", "Biotoxin Grenade Color", "#00FF00"],
            ["colorEmp", "EMP Grenade Color", "#0080FF"],
            ["colorExpansive", "Expansive Grenade Color", "#FF6600"],
            ["colorFlashbang", "Flashbang Grenade Color", "#FFFFFF"],
            ["colorIncendiary", "Incendiary Grenade Color", "#FF4500"],
            ["colorPoison", "Poison Grenade Color", "#90FF90"],
            ["colorRubber", "Rubber Grenade Color", "#404040"],
            ["colorSleep", "Sleep Grenade Color", "#9932CC"],
            ["colorSmart", "Smart Grenade Color", "#00FFFF"],
            ["colorSmoke", "Smoke Grenade Color", "#FFFFFF"],
            ["colorTeargas", "Teargas Grenade Color", "#FFFF00"],
            ["colorSpecial", "Special Grenade Color", "#FF69B4"]
        ];

        colorSettings.forEach(([key, name, defaultValue]) => {
            game.settings.register(this.MODULE_ID, key, {
                name,
                hint: `Template color for ${name.toLowerCase().replace(' grenade color', '')} grenades`,
                scope: "world",
                config: false,
                type: String,
                default: defaultValue
            });
        });
    }

    static getSetting(key) {
        if (!this._settingsCache.has(key)) {
            this._settingsCache.set(key, game.settings.get(this.MODULE_ID, key));
        }
        return this._settingsCache.get(key);
    }

    static getGrenadeColor(variety) {
        const colorMap = {
            "basic": "colorBasic",
            "acid": "colorAcid",
            "armor piercing": "colorArmorPiercing",
            "armorpiercing": "colorArmorPiercing",
            "biotoxin": "colorBiotoxin",
            "emp": "colorEmp",
            "expansive": "colorExpansive",
            "flashbang": "colorFlashbang",
            "incendiary": "colorIncendiary",
            "poison": "colorPoison",
            "rubber": "colorRubber",
            "sleep": "colorSleep",
            "smart": "colorSmart",
            "smoke": "colorSmoke",
            "teargas": "colorTeargas",
            "special": "colorSpecial"
        };
        
        const settingKey = colorMap[variety] || colorMap["basic"];
        return this.getSetting(settingKey);
    }

    static getGMUserIds() {
        return game.users.filter(u => u.role === CONST.USER_ROLES.GAMEMASTER).map(u => u.id);
    }

    static async findItemByName(name) {
        const worldItem = game.items.getName(name);
        if (worldItem) return worldItem;

        for (const pack of game.packs.filter(p => p.documentName === "Item")) {
            const entry = pack.index.find(e => e.name === name);
            if (entry) return await pack.getDocument(entry._id);
        }
        return null;
    }

    static findStatusEffectId(name) {
        const lower = name.toLowerCase();
        const effect = CONFIG.statusEffects.find(e =>
            (e.name?.toLowerCase() === lower) ||
            (e.label?.toLowerCase() === lower) ||
            (game.i18n.localize(e.name)?.toLowerCase() === lower) ||
            (game.i18n.localize(e.label)?.toLowerCase() === lower)
        );
        if (!effect) {
            console.warn(`${GrenadeSystem.MODULE_ID} | Status effect not found: "${name}"`);
            return null;
        }
        return effect.id;
    }

    static registerHooks() {
        Hooks.on("ready", this.onReady.bind(this));
        Hooks.on("renderActorSheet", this.onRenderActorSheet.bind(this));
        Hooks.on("renderChatMessage", this.onRenderChatMessage.bind(this));
        Hooks.on("updateSetting", (setting) => {
            if (setting.key.startsWith(GrenadeSystem.MODULE_ID + ".")) {
                GrenadeSystem._settingsCache.clear();
            }
        });
    }

    static onReady() {
        if (game.system.id !== "cyberpunk-red-core") return;
        this.autoDetectJB2A();
    }

    static autoDetectJB2A() {
        const paths = this.getJB2APaths();
        if (!paths) return;

        for (const [key, path] of Object.entries(paths)) {
            const current = game.settings.get(this.MODULE_ID, key);
            if (!current || current === "") {
                game.settings.set(this.MODULE_ID, key, path);
            }
        }
    }

    static onRenderActorSheet(app, html, data) {
        if (game.system.id !== "cyberpunk-red-core") return;
        if (html.find('.mook-special-list').length) {
            this.addGrenadeMookButtons(app, html, data);
        } else if (html.find('.tab[data-tab="gear"]').length) {
            this.addGrenadeButtons(app, html, data);
        }
    }

    static addGrenadeButtons(app, html, data) {
        const gearTab = html.find('.tab[data-tab="gear"]');
        if (!gearTab.length) return;

        const grenadeItems = gearTab.find('.item[data-item-category="ammo"]').filter(function() {
            const itemId = $(this).data("item-id");
            const item = app.actor.items.get(itemId);
            return item?.type === "ammo" && item.system.variety === "grenade" && !$(this).find(".grenade-throw-button").length;
        });

        grenadeItems.each(function() {
            const itemElement = $(this);
            const itemId = itemElement.data("item-id");
            const item = app.actor.items.get(itemId);
            
            const throwButton = $(`<a class="item-action grenade-throw-button" data-item-id="${itemId}" title="Throw ${item.name}"><i class="fas fa-bomb"></i></a>`);
            
            throwButton.on("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await GrenadeSystem.throwGrenade(app.actor, itemId);
            });
            
            const gearActions = itemElement.find(".gear-actions");
            const splitButton = gearActions.find('[data-action-type="split"]');
            if (splitButton.length) {
                splitButton.after(throwButton);
            } else {
                gearActions.prepend(throwButton);
            }
        });

        // const launcherItems = gearTab.find('.item').filter(function() {
        //     const itemId = $(this).data("item-id");
        //     const item = app.actor.items.get(itemId);
        //     return item?.type === "weapon" &&
        //         (item.system.weaponType === "grenadeLauncher" || item.system.weaponType === "rocketLauncher") &&
        //         !$(this).find(".grenade-throw-button").length;
        // });

        // launcherItems.each(function() {
        //     const itemElement = $(this);
        //     const itemId = itemElement.data("item-id");
        //     const item = app.actor.items.get(itemId);

        //     const fireButton = $(`<a class="item-action grenade-throw-button" data-item-id="${itemId}" title="Fire ${item.name}"><i class="fas fa-bomb"></i></a>`);

        //     fireButton.on("click", async (event) => {
        //         event.preventDefault();
        //         event.stopPropagation();
        //         await GrenadeSystem.fireGrenadeFromLauncher(app.actor, itemId);
        //     });

        //     const gearActions = itemElement.find(".gear-actions");
        //     const splitButton = gearActions.find('[data-action-type="split"]');
        //     if (splitButton.length) {
        //         splitButton.after(fireButton);
        //     } else {
        //         gearActions.prepend(fireButton);
        //     }
        // });

        html.find('div.item.weapon-grid').each(function() {
            const weaponDiv = $(this);
            const weaponId = weaponDiv.data('item-id');
            const weapon = app.actor.items.get(weaponId);

            if (!weapon) return;
            if (weapon.system.weaponType !== "grenadeLauncher" && weapon.system.weaponType !== "rocketLauncher") return;
            if (weaponDiv.find('.grenade-throw-button').length) return;

            const fireButton = $(`<a class="item-action grenade-throw-button" data-item-id="${weaponId}" title="Fire ${weapon.name}" style="margin-left: 4px;"><i class="fas fa-bomb"></i></a>`);

            fireButton.on("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await GrenadeSystem.fireGrenadeFromLauncher(app.actor, weaponId);
            });

            weaponDiv.find('.weapon-name').append(fireButton);
        });
    }

    static addGrenadeMookButtons(app, html, data) {
        // — Grenade ammo throw buttons in Special Gear —
        const specialList = html.find('.mook-special-list');
        if (specialList.length) {
            const grenadeItems = app.actor.items.filter(i =>
                i.type === "ammo" && i.system.variety === "grenade"
            );

            grenadeItems.forEach(item => {
                if (html.find(`.grenade-throw-button[data-item-id="${item.id}"]`).length) return;

                const itemLink = specialList.find(`a[data-item-id="${item.id}"]`);
                if (!itemLink.length) return;

                const throwButton = $(`<a class="item-action grenade-throw-button" data-item-id="${item.id}" title="Throw ${item.name}" style="margin-left: 2px;"><i class="fas fa-bomb"></i></a>`);

                throwButton.on("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    await GrenadeSystem.throwGrenade(app.actor, item.id);
                });

                itemLink.after(throwButton);
            });
        }

        // — Launcher fire buttons in Weapons section —
        html.find('div.item.weapon-grid').each(function() {
            const weaponDiv = $(this);
            const weaponId = weaponDiv.data('item-id');
            const weapon = app.actor.items.get(weaponId);

            if (!weapon) return;
            if (weapon.system.weaponType !== "grenadeLauncher" && weapon.system.weaponType !== "rocketLauncher") return;
            if (weaponDiv.find('.grenade-throw-button').length) return;

            const fireButton = $(`<a class="item-action grenade-throw-button" data-item-id="${weaponId}" title="Fire ${weapon.name}" style="margin-left: 4px;"><i class="fas fa-bomb"></i></a>`);

            fireButton.on("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await GrenadeSystem.fireGrenadeFromLauncher(app.actor, weaponId);
            });

            weaponDiv.find('.weapon-name').append(fireButton);
        });
    }

    static async throwGrenade(actor, itemId) {
        if (!actor.isOwner) {
            ui.notifications.error("You don't have permission to use this character's items");
            return;
        }
        
        const grenade = actor.items.get(itemId);
        if (!grenade) {
            ui.notifications.error("Grenade not found");
            return;
        }
        
        const quantity = grenade.system.amount || 0;
        if (quantity <= 0) {
            ui.notifications.warn(`No ${grenade.name} remaining`);
            return;
        }
        
        const newQuantity = quantity - 1;
        const autoDelete = this.getSetting("autoDeleteEmpty");
        
        if (newQuantity <= 0 && autoDelete) {
            await actor.deleteEmbeddedDocuments("Item", [grenade.id]);
        } else {
            await grenade.update({ "system.amount": newQuantity });
        }
        
        await this.createGrenadeChatMessage(actor, grenade);
    }

    static async fireGrenadeFromLauncher(actor, weaponId) {
        if (!actor.isOwner) {
            ui.notifications.error("You don't have permission to use this character's items");
            return;
        }

        const weapon = actor.items.get(weaponId);
        if (!weapon) {
            ui.notifications.error("Weapon not found");
            return;
        }

        const magazineValue = weapon.system.magazine?.value || 0;
        if (magazineValue <= 0) {
            ui.notifications.warn(`${weapon.name} is empty!`);
            return;f
        }

        const installedIds = weapon.system.installedItems?.list || [];
        const installedAmmo = installedIds
            .map(id => actor.items.get(id))
            .find(i => i?.type === "ammo" && (i.system.variety === "grenade" || i.system.variety === "rocket"));

        if (!installedAmmo) {
            ui.notifications.warn(`No ammo loaded in ${weapon.name}`);
            return;
        }

        await weapon.update({ "system.magazine.value": magazineValue - 1 });

        const currentAmount = installedAmmo.system.amount || 0;
        if (currentAmount > 0) {
            await installedAmmo.update({ "system.amount": currentAmount - 1 });
        }

        const isRocket = installedAmmo.system.variety === "rocket";
        const options = isRocket ? { damageOverride: weapon.system.damage } : {};
        await this.createGrenadeChatMessage(actor, installedAmmo, options);
    }

    static async createGrenadeChatMessage(actor, grenade, options = {}) {
        const speaker = ChatMessage.getSpeaker({ actor });
        const actorName = speaker.alias || actor.name;
        const grenadeName = grenade.name;
        const rawVariety = grenade.system.type || "basic";
        const variety = rawVariety.toLowerCase();
        
        const baseConfig = this.GRENADE_TYPES[variety] || this.GRENADE_TYPES["basic"];
        const grenadeConfig = options.damageOverride
            ? { ...baseConfig, damage: options.damageOverride }
            : baseConfig;
        const grenadeColor = this.getGrenadeColor(variety);
        const ablationValue = grenade.system.ablationValue || grenadeConfig.ablation;
        
        let actionButtons = `<button class="grenade-action-button template-button" data-action="place-template" data-color="${grenadeColor}"><i class="fas fa-draw-square"></i>Place Template (5x5)</button>`;
        
        if (grenadeConfig.macro) {
            actionButtons += `<button class="grenade-action-button macro-button" data-action="run-macro" data-macro-name="${grenadeConfig.macro}"><i class="fas fa-cog"></i>Run ${grenadeConfig.macro}</button>`;
        } else if (variety === "special") {
            actionButtons += `<button class="grenade-action-button macro-button" data-action="run-macro" data-macro-name=""><i class="fas fa-bolt"></i>Activate Special Effect</button>`;
        } else if (variety === "smoke") {
            actionButtons += `<button class="grenade-action-button smoke-button" data-action="activate-smoke"><i class="fas fa-cloud"></i>Activate Smoke</button>`;
        } else if (grenadeConfig.hasDamageButton) {
            let buttonText;
            if (grenadeConfig.hasResistance && !grenadeConfig.directDamage) {
                buttonText = "Apply Effect (Resistance Check)";
            } else if (grenadeConfig.hasResistance && grenadeConfig.directDamage) {
                buttonText = `Roll Damage (${grenadeConfig.damage})`;
            } else if (grenadeConfig.acidOnly) {
                buttonText = "Apply Ablation";
            } else {
                buttonText = `Roll Damage (${grenadeConfig.damage})`;
            }
            
            actionButtons += `<button class="grenade-action-button damage-button" data-action="roll-damage"><i class="fas fa-droplet red-fg"></i>${buttonText}</button>`;
        }
        
        const content = `
            <div class="rollcard">
                <div class="rollcard-top">
                    <div class="cpr-block chat-rollTitle-stat">
                        <div class="text-center text-padding-top text-normal text-semi">
                            ${actorName} throws a ${grenadeName}!
                        </div>
                        <div class="rollcard-subtitle">
                            <div class="rollcard-subtitle-center text-small">
                                ${variety}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="rollcard-bottom">
                    <div class="cpr-block grenade-card-body">
                        <div class="grenade-card-header-row">
                            <img src="${grenade.img}" alt="${grenadeName}" class="grenade-card-img">
                        </div>
                        <div class="grenade-actions">${actionButtons}</div>
                        <div class="grenade-dv-section">
                            <button type="button" class="grenade-dv-toggle">
                                <i class="fas fa-chevron-down"></i> Show Throwing DV Table
                            </button>
                            <div class="grenade-dv-table" style="display: none;">
                                <table class="grenade-dv-inner-table">
                                    <thead>
                                        <tr>
                                            <th>0-6m</th><th>7-12m</th><th>13-25m</th>
                                            <th>26-50m</th><th>51-100m</th><th>101-200m</th><th>201-400m</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>16</td><td>15</td><td>15</td>
                                            <td>17</td><td>20</td><td>22</td><td>25</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="grenade-stats text-small">
                            <span><strong>Max Range:</strong> 25m</span>
                            <span><strong>Skill:</strong> Athletics</span>
                            <span><strong>Effect:</strong> ${variety}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return ChatMessage.create({
            user: game.user.id,
            speaker,
            content,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flags: {
                [this.MODULE_ID]: {
                    isGrenadeCard: true,
                    actorId: actor.id,
                    itemId: grenade.id,
                    grenadeName,
                    variety,
                    color: grenadeColor,
                    config: grenadeConfig,
                    ablationValue
                }
            }
        });
    }

    static onRenderChatMessage(message, html, data) {
        if (message.getFlag(this.MODULE_ID, "gmOnlyCard") && !game.user.isGM) {
            html.addClass("hide");
            return;
        }

        if (message.getFlag(this.MODULE_ID, "isGMDamageCard")) {
            this.bindDamageApplication(html);
            return;
        }

        if (message.getFlag(this.MODULE_ID, "isGMResistanceCard")) {
            this.bindResistanceApplication(html);
            return;
        }

        if (message.getFlag(this.MODULE_ID, "isDamageRoll")) {
            this.bindToggleVisibility(html);
            return;
        }

        if (!message.getFlag(this.MODULE_ID, "isGrenadeCard")) return;
        
        this.bindGrenadeActions(html, message);
    }

    static bindToggleVisibility(html) {
        html.find('[data-action="toggleVisibility"]').on('click', function(event) {
            event.preventDefault();
            const target = $(this).data('visible-element');
            html.find(`.${target}`).toggleClass('hide');
        });
    }

    static bindDamageApplication(html) {
        const card = html.find('.grenade-damage-application');
        const applyButton = html.find('.grenade-apply-damage-btn');
        
        applyButton.off('click').on('click', async function() {
            const button = $(this);

            if (!game.user.isGM) {
                ui.notifications.error("Only GMs can apply grenade damage");
                return;
            }
            window.grenadeApplicationData = {
                damage: parseInt(card.data('damage')),
                grenadeName: card.data('grenade-name'),
                actorId: card.data('actor-id'),
                ablationValue: parseInt(card.data('ablation-value')),
                variety: card.data('variety')
            };
            
            button.prop('disabled', true).text('Applying...');
            
            try {
                await GrenadeSystem.applyDamageToTemplateArea(
                    window.grenadeApplicationData.damage,
                    window.grenadeApplicationData.grenadeName,
                    window.grenadeApplicationData.actorId,
                    window.grenadeApplicationData.ablationValue,
                    window.grenadeApplicationData.variety
                );
                button.text('✓ Applied');
            } catch (error) {
                button.text('✗ Failed');
            }
            
            delete window.grenadeApplicationData;
        });
    }

    static bindResistanceApplication(html) {
        const card = html.find('.grenade-resistance-application');
        const applyButton = html.find('.grenade-apply-resistance-btn');
        
        applyButton.off('click').on('click', async function() {
            const button = $(this);

            if (!game.user.isGM) {
                ui.notifications.error("Only GMs can apply grenade resistance effects");
                return;
            }
            window.grenadeResistanceData = {
                damage: parseInt(card.data('damage')),
                grenadeName: card.data('grenade-name'),
                actorId: card.data('actor-id'),
                variety: card.data('variety'),
                dv: parseInt(card.data('dv')),
                resistanceType: card.data('resistance-type'),
                dealsDamage: card.data('deals-damage') === 'true' || card.data('deals-damage') === true
            };
            
            button.prop('disabled', true).text('Applying...');
            
            try {
                await GrenadeSystem.applyResistanceWithConfirmation(
                    window.grenadeResistanceData.damage,
                    window.grenadeResistanceData.grenadeName,
                    window.grenadeResistanceData.actorId,
                    window.grenadeResistanceData.variety,
                    window.grenadeResistanceData.dv,
                    window.grenadeResistanceData.resistanceType,
                    window.grenadeResistanceData.dealsDamage
                );
                button.text('✓ Applied');
            } catch (error) {
                button.text('✗ Failed');
            }
            
            delete window.grenadeResistanceData;
        });
    }

    static bindGrenadeActions(html, message) {
        const flags = message.flags[this.MODULE_ID];
        
        html.find("[data-action='place-template']").on("click", async function(event) {
            event.preventDefault();
            const button = $(this);
            if (button.hasClass("disabled")) return;
            
            const color = button.data("color") || "#FF3366";
            await GrenadeSystem.placeGrenadeTemplate(color, flags, message.id);
        });
        
        html.find("[data-action='roll-damage']").on("click", async function(event) {
            event.preventDefault();
            const button = $(this);
            if (button.hasClass("disabled")) return;
            
            const flags = message.flags[GrenadeSystem.MODULE_ID];
            const actor = game.actors.get(flags.actorId);
            
            await GrenadeSystem.rollGrenadeDamage(actor, flags);
        });
        
        html.find("[data-action='run-macro']").on("click", async function(event) {
            event.preventDefault();
            const button = $(this);
            if (button.hasClass("disabled")) return;
            
            const macroName = button.data("macro-name");
            await GrenadeSystem.runMacro(macroName, flags);
            button.addClass("disabled").text("Macro Executed");
        });

        html.find("[data-action='activate-smoke']").on("click", async function(event) {
            event.preventDefault();
            const button = $(this);
            if (button.hasClass("disabled")) return;
            
            try {
                const templates = canvas.scene.templates.filter(t => 
                    t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate && 
                    t.flags?.[GrenadeSystem.MODULE_ID]?.messageId === message.id
                );
                
                if (!templates.length) {
                    return;
                }
                
                await GrenadeSystem.createSmokeTiles(templates);
                
                button.addClass("disabled").text("Smoke Activated");
            } catch (error) {
                console.error("Smoke activation failed:", error);
                ui.notifications.error("Failed to activate smoke effect");
            }
        });

        html.find(".grenade-dv-toggle").on("click", function(event) {
            event.preventDefault();
            const button = $(this);
            const table = button.siblings(".grenade-dv-table");
            const icon = button.find("i");
            
            if (table.is(":visible")) {
                table.slideUp(200);
                icon.removeClass("fa-chevron-up").addClass("fa-chevron-down");
                button.html('<i class="fas fa-chevron-down"></i> Show Throwing DV Table');
            } else {
                table.slideDown(200);
                icon.removeClass("fa-chevron-down").addClass("fa-chevron-up");
                button.html('<i class="fas fa-chevron-up"></i> Hide Throwing DV Table');
            }
        });
    }

    static async runMacro(macroName, grenadeFlags) {
        const templates = canvas.scene.templates.filter(t => 
            t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
        );
        
        const affectedTokens = new Set();
        for (const template of templates) {
            const tokensInTemplate = GrenadeSystem.getTokensInTemplate(template);
            tokensInTemplate.forEach(token => affectedTokens.add(token));
        }
        const targets = Array.from(affectedTokens);
        
        const actor = game.actors.get(grenadeFlags.actorId);
        const token = canvas.tokens.placeables.find(t => t.actor?.id === grenadeFlags.actorId) || null;
        const grenadeName = grenadeFlags.grenadeName;
        
        const configs = game.settings.get(this.MODULE_ID, "specialGrenadeConfigs") || {};
        const config = configs[grenadeName] || null;
        
        const builtInResult = await this.handleBuiltInSpecialGrenade(grenadeName, actor, token, targets, grenadeFlags);
        if (builtInResult) {
            if (!config || config.deleteTemplate !== false) {
                await this.cleanupGrenadeTemplates();
            }
            return;
        }
        
        if (templates.length && this.getSetting("enableSequencerEffects")) {
            await this.playExplosionEffects(templates, grenadeFlags.variety);
        }
        
        if (config?.code?.trim()) {
            try {
                const customFunction = new Function(
                    'grenadeName', 'actor', 'token', 'targets', 'templates', 'config', 'GrenadeSystem',
                    `return (async () => { ${config.code} })();`
                );
                await customFunction(grenadeName, actor, token, targets, templates, config, this);
                
                if (config.deleteTemplate !== false) {
                    await this.cleanupGrenadeTemplates();
                }
                return;
            } catch (error) {
                console.error("Special grenade custom code error:", error);
            }
        }
        
        const macro = game.macros.getName(grenadeName);
        if (macro) {
            try {
                await macro.execute();
            } catch (error) {
                console.error(`Failed to execute macro: ${grenadeName}`);
            }
        } else {
            ui.notifications.warn(`No handler found for special grenade: ${grenadeName}`);
        }
        
        if (!config || config.deleteTemplate !== false) {
            await this.cleanupGrenadeTemplates();
        }
    }

    static async handleBuiltInSpecialGrenade(grenadeName, actor, token, targets, grenadeFlags) {
        const lowerName = grenadeName.toLowerCase();
        
        if (lowerName.includes("shuriken")) {
            await this.processShurikenGrenade(actor, targets, grenadeFlags);
            return true;
        }
        
        if (lowerName.includes("emp") || lowerName === "emp grenade") {
            await this.processEMPGrenade();
            return true;
        }
        
        if (lowerName.includes("flashbang")) {
            await this.processFlashbangGrenade();
            return true;
        }
        
        return false;
    }

    static async processShurikenGrenade(actor, targets, grenadeFlags) {
        if (!targets.length) {
            return;
        }
        
        const grenadeName = grenadeFlags.grenadeName;
        const damageFormula = "3d6";
        const ablationValue = 1;
        
        await ChatMessage.create({
            content: `
                <div class="rollcard">
                    <div class="rollcard-top">
                        <div class="cpr-block chat-rollTitle-stat">
                            <div class="text-center text-padding-top text-normal text-semi">
                                ${grenadeName}
                            </div>
                            <div class="rollcard-subtitle">
                                <div class="rollcard-subtitle-center text-small">
                                    Individual Damage — ${targets.length} target(s)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            speaker: ChatMessage.getSpeaker({ actor })
        });
        
        for (const targetToken of targets) {
            if (!targetToken.actor) continue;
            
            const roll = new Roll(damageFormula);
            await roll.evaluate();
            
            const dice = roll.dice[0]?.results || [];
            const sixes = dice.filter(d => d.result === 6).length;
            const isCritical = sixes >= 2;
            const bonusDamage = isCritical ? 5 : 0;
            const finalDamage = roll.total + bonusDamage;
            
            const diceImages = dice.map(d => {
                const src = (d.result === 6 && isCritical)
                    ? `systems/cyberpunk-red-core/icons/dice/red/d6_6_preem.svg`
                    : `systems/cyberpunk-red-core/icons/dice/black/d6_${d.result}.svg`;
                return `<img class="d6 d6-30" style="margin: 2px;" src="${src}">`;
            }).join('');
            
            const damageContent = `
                <div class="rollcard">
                    <div class="rollcard-top">
                        <div class="cpr-block chat-rollTitle-stat">
                            <div class="text-center text-padding-top text-normal text-semi">
                                ${grenadeName} → ${targetToken.name}
                            </div>
                            <div class="rollcard-subtitle">
                                <div class="rollcard-subtitle-center text-small">
                                    ${isCritical ? 'Critical Damage' : 'Damage'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rollcard-bottom">
                        <div class="cpr-block">
                            <div class="d6-rollcard-data">
                                <div class="d6-dice-div">${diceImages}</div>
                                <div class="d6-number-div">
                                    <span>${roll.total}</span>
                                </div>
                                <div class="d6-data-div">
                                    ${isCritical ? `<div class="text-normal text-semi">Critical Damage: ${bonusDamage}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: damageContent
            });
            
            await this.applyCPRDamage(targetToken.actor, finalDamage, grenadeName, ablationValue, "special", targetToken);
        }

    }

    static async cleanupGrenadeTemplates() {
        try {
            const templatesToDelete = canvas.scene.templates.filter(t => 
                t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
            );
            
            if (templatesToDelete.length) {
                const templateIds = templatesToDelete.map(t => t.id);
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
            }
        } catch (error) {
        }
    }

    static async createScaledTile(template, animationFile, scale = 1, options = {}) {
        const centerX = template.x + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;
        const centerY = template.y + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;

        const baseSize = 400;
        const offset = baseSize / 2;

        const tileData = {
            x: centerX - offset,
            y: centerY - offset,
            width: baseSize,
            height: baseSize,
            texture: {
                src: animationFile
            },
            alpha: options.alpha || 0.8,
            video: {
                loop: options.loop !== false,
                autoplay: true,
                volume: 0
            },
            flags: {
                [this.MODULE_ID]: {
                    isSpecialGrenadeTile: true,
                    grenadeName: options.grenadeName || "Unknown"
                }
            }
        };

        if (game.user.isGM) {
            const created = await canvas.scene.createEmbeddedDocuments("Tile", [tileData]);
            if (created.length && scale !== 1) {
                await created[0].update({
                    "texture.scaleX": scale,
                    "texture.scaleY": scale
                });
            }
            return created[0];
        }
        return null;
    }

    static async placeGrenadeTemplate(color, grenadeData, messageId = null) {
        const configs = game.settings.get(this.MODULE_ID, "specialGrenadeConfigs") || {};
        const customConfig = configs[grenadeData.grenadeName];
        if (customConfig?.color) {
            color = customConfig.color;
        }
        
        const actor = game.actors.get(grenadeData.actorId);
        if (!actor) {
            ui.notifications.error("Actor not found");
            return;
        }

        let token = null;
        const controlledTokens = canvas.tokens.controlled.filter(t => t.actor?.id === actor.id);
        if (controlledTokens.length) {
            token = controlledTokens[0];
        } else {
            const actorTokens = canvas.tokens.placeables.filter(t => t.actor?.id === actor.id);
            if (actorTokens.length) {
                token = actorTokens[0];
                if (actorTokens.length > 1) {
                    ui.notifications.warn(`Multiple tokens found for ${actor.name}, using ${token.document.name}`);
                }
            }
        }
        
        if (!token) {
            ui.notifications.error("Actor token not found on current scene");
            return;
        }

        const gridSize = canvas.grid.size;
        const gridDistance = canvas.scene.grid.distance || 5;
        const centerX = token.x + (token.document.width * gridSize / 2);
        const centerY = token.y + (token.document.height * gridSize / 2);

        const templateData = {
            t: "rect",
            user: game.user.id,
            x: centerX - (2.5 * gridSize),
            y: centerY - (2.5 * gridSize),
            distance: 14.142135623730951,
            width: gridDistance * 5,
            direction: 45,
            borderColor: grenadeData.variety === "flashbang" ? "#FFFFFF" : "#000000",
            fillColor: color || "#FF3366",
            texture: "",
            hidden: false,
            flags: {
                [GrenadeSystem.MODULE_ID]: {
                    isGrenadeTemplate: true,
                    grenadeName: grenadeData.grenadeName,
                    variety: grenadeData.variety,
                    messageId: messageId
                }
            }
        };

        try {
            const [template] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
            return template;
        } catch (error) {
            ui.notifications.error("Failed to place blast template");
        }
    }

    static async createGMDamageRequest(actor, grenadeName, damage, ablationValue, variety) {
        const chatContent = `
            <div class="rollcard grenade-damage-application" 
                 data-actor-id="${actor.id}"
                 data-damage="${damage}" 
                 data-grenade-name="${grenadeName}"
                 data-ablation-value="${ablationValue}"
                 data-variety="${variety}">
                <div class="rollcard-top">
                    <div class="cpr-block chat-rollTitle-stat">
                        <div class="text-center text-padding-top text-normal text-semi">
                            [GM ONLY] ${grenadeName} Damage Application
                        </div>
                        <div class="rollcard-subtitle">
                            <div class="rollcard-subtitle-center text-small">
                                ${variety}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="rollcard-bottom">
                    <div class="cpr-block grenade-gm-card-block">
                        <div class="grenade-gm-card-stats text-small">
                            <span><strong>Damage:</strong> ${damage}</span>
                            <span><strong>Ablation:</strong> +${ablationValue}</span>
                        </div>
                        <button type="button" class="grenade-action-button damage-button grenade-apply-damage-btn">
                            <i class="fas fa-bolt"></i> Apply Damage to Template Area
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        await ChatMessage.create({
            content: chatContent,
            user: game.user.id,
            speaker: { alias: "Grenade System" },
            whisper: this.getGMUserIds(),
            flags: {
                [this.MODULE_ID]: {
                    gmOnlyCard: true,
                    isGMDamageCard: true
                }
            }
        });
    }

    static async createGMResistanceRequest(actor, grenadeName, damage, variety, dv, resistanceType, dealsDamage) {
        const chatContent = `
            <div class="rollcard grenade-resistance-application" 
                 data-actor-id="${actor.id}"
                 data-damage="${damage}" 
                 data-grenade-name="${grenadeName}"
                 data-variety="${variety}"
                 data-dv="${dv}"
                 data-resistance-type="${resistanceType}"
                 data-deals-damage="${dealsDamage}">
                <div class="rollcard-top">
                    <div class="cpr-block chat-rollTitle-stat">
                        <div class="text-center text-padding-top text-normal text-semi">
                            [GM ONLY] ${grenadeName} Resistance Application
                        </div>
                        <div class="rollcard-subtitle">
                            <div class="rollcard-subtitle-center text-small">
                                DV ${dv} ${resistanceType}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="rollcard-bottom">
                    <div class="cpr-block grenade-gm-card-block">
                        <div class="grenade-gm-card-stats text-small">
                            <span><strong>Variety:</strong> ${variety}</span>
                            ${dealsDamage ? `<span><strong>Failure Damage:</strong> ${damage}</span>` : `<span><strong>Failure:</strong> Effect applies</span>`}
                        </div>
                        <button type="button" class="grenade-action-button damage-button grenade-apply-resistance-btn">
                            <i class="fas fa-shield-virus"></i> Apply ${dealsDamage ? 'Damage' : 'Effect'} to Template Area
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        await ChatMessage.create({
            content: chatContent,
            user: game.user.id,
            speaker: { alias: "Grenade System" },
            whisper: this.getGMUserIds(),
            flags: {
                [this.MODULE_ID]: {
                    gmOnlyCard: true,
                    isGMResistanceCard: true
                }
            }
        });
    }

    static async rollGrenadeDamage(actor, grenadeData) {
        const grenadeName = grenadeData.grenadeName;
        const variety = grenadeData.variety.toLowerCase();
        const config = grenadeData.config || this.GRENADE_TYPES[variety] || this.GRENADE_TYPES["basic"];
        
        try {
            if (config.acidOnly) {
                const content = `
                    <div class="rollcard">
                        <div class="rollcard-top">
                            <div class="cpr-block chat-rollTitle-stat">
                                <div class="text-center text-padding-top text-normal text-semi">
                                    ${grenadeName}
                                </div>
                                <div class="rollcard-subtitle">
                                    <div class="rollcard-subtitle-center text-small">Acid Effect</div>
                                </div>
                            </div>
                        </div>
                        <div class="rollcard-bottom">
                            <div class="cpr-block">
                                <div class="text-normal grenade-result-text">
                                    Ablates armor without dealing damage
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                await ChatMessage.create({
                    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
                    content
                });

                await this.createGMDamageRequest(actor, grenadeName, 0, 1, variety);
                return;
            }
            
            if (config.hasResistance) {
                const dv = config.resistanceDV;
                const resistanceType = config.resistanceType;
                const dealsDamage = config.directDamage;
                
                let finalDamage = 0;
                let diceImages = '';
                let damageRoll = null;
                
                if (dealsDamage) {
                    damageRoll = new Roll(config.damage);
                    await damageRoll.evaluate();
                    finalDamage = damageRoll.total;
                    const dice = damageRoll.dice[0]?.results || [];
                    diceImages = dice.map(d =>
                        `<img class="d6 d6-30" style="margin: 2px;" src="systems/cyberpunk-red-core/icons/dice/black/d6_${d.result}.svg">`
                    ).join('');
                }
                
                const subtitleText = variety !== "basic"
                    ? `${grenadeData.variety} — DV ${dv} ${resistanceType}`
                    : `DV ${dv} ${resistanceType}`;
                
                const content = dealsDamage ? `
                    <div class="rollcard">
                        <div class="rollcard-top">
                            <div class="cpr-block chat-rollTitle-stat">
                                <div class="text-center text-padding-top text-normal text-semi">
                                    ${grenadeName}
                                </div>
                                <div class="rollcard-subtitle">
                                    <div class="rollcard-subtitle-center text-small">${subtitleText}</div>
                                </div>
                            </div>
                        </div>
                        <div class="rollcard-bottom">
                            <div class="cpr-block">
                                <div class="d6-rollcard-data">
                                    <div class="d6-dice-div">${diceImages}</div>
                                    <div class="d6-number-div">
                                        <span>${finalDamage}</span>
                                    </div>
                                    <div class="d6-data-div">
                                        <div class="text-normal text-semi">Direct damage on resistance fail</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="rollcard">
                        <div class="rollcard-top">
                            <div class="cpr-block chat-rollTitle-stat">
                                <div class="text-center text-padding-top text-normal text-semi">
                                    ${grenadeName}
                                </div>
                                <div class="rollcard-subtitle">
                                    <div class="rollcard-subtitle-center text-small">${subtitleText}</div>
                                </div>
                            </div>
                        </div>
                        <div class="rollcard-bottom">
                            <div class="cpr-block">
                                <div class="text-normal grenade-result-text">
                                    Resistance Check Required<br>
                                    <span class="text-semi">Failure: Effect applies</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                if (dealsDamage) {
                    await damageRoll.toMessage({
                        speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
                        content
                    });
                } else {
                    await ChatMessage.create({
                        speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
                        content
                    });
                }
                
                await this.createGMResistanceRequest(actor, grenadeName, finalDamage, variety, dv, resistanceType, dealsDamage);
                return;
            }
            
            const diceFormula = config.damage || "6d6";
            const roll = new Roll(diceFormula);
            await roll.evaluate();
            
            const dice = roll.dice[0]?.results || [];
            const sixes = dice.filter(d => d.result === 6).length;
            const isCritical = sixes >= 2;
            const bonusDamage = isCritical ? 5 : 0;
            const finalDamage = roll.total + bonusDamage;
            
            const diceImages = dice.map(d => {
                const src = (d.result === 6 && isCritical)
                    ? `systems/cyberpunk-red-core/icons/dice/red/d6_6_preem.svg`
                    : `systems/cyberpunk-red-core/icons/dice/black/d6_${d.result}.svg`;
                return `<img class="d6 d6-30" style="margin: 2px;" src="${src}">`;
            }).join('');
            
            const subtitleText = variety !== "basic" ? `Damage <em>(${grenadeData.variety})</em>` : "Damage";
            
            const damageContent = `
                <div class="rollcard">
                    <div class="rollcard-top">
                        <div class="cpr-block chat-rollTitle-stat">
                            <div class="text-center text-padding-top text-normal text-semi">
                                ${grenadeName}
                            </div>
                            <div class="rollcard-subtitle">
                                <div class="rollcard-subtitle-center text-small">
                                    ${subtitleText}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rollcard-bottom">
                        <div class="cpr-block">
                            <div class="d6-rollcard-data">
                                <div class="d6-dice-div">
                                    ${diceImages}
                                </div>
                                <div class="d6-number-div">
                                    <a><span class="clickable" data-action="toggleVisibility" data-visible-element="grenade-d6-data-details">${roll.total}</span></a>
                                </div>
                                <div class="d6-data-div">
                                    ${isCritical ? `<div class="text-normal text-semi">Critical Damage: ${bonusDamage}</div>` : ''}
                                    <div class="grenade-d6-data-details hide">
                                        <div class="text-normal text-semi text-nowrap">
                                            GM will apply damage to tokens in blast template${config.ablation > 0 ? `<br>Ablation Damage: +${config.ablation}` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            await roll.toMessage({
                speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
                content: damageContent,
                flags: {
                    [this.MODULE_ID]: {
                        isDamageRoll: true,
                        grenadeName,
                        isCritical,
                        sixes,
                        damage: finalDamage,
                        actorId: grenadeData.actorId,
                        variety,
                        config
                    }
                }
            });

            await this.createGMDamageRequest(actor, grenadeName, finalDamage, config.ablation, variety);
            
        } catch (error) {
            ui.notifications.error("Failed to roll grenade damage");
        }
    }

    static async createSmokeTiles(templates) {
        const smokeAnimation = this.getSetting("smokeAnimation");
        if (!smokeAnimation?.trim()) {
            ui.notifications.warn("No smoke animation file configured");
            return;
        }
        
        const scale = this.getSetting("smokeScale") || 1.0;
        const tileDataArray = [];
        
        for (const template of templates) {
            const alreadyDeployed = canvas.scene.tiles.some(t =>
                t.flags?.[this.MODULE_ID]?.isSmokeTile &&
                t.flags?.[this.MODULE_ID]?.templateId === template.id
            );
            if (alreadyDeployed) continue;

            const centerX = template.x + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;
            const centerY = template.y + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;
            
            const tileData = {
                texture: {
                    src: smokeAnimation,
                    scaleX: scale,
                    scaleY: scale
                },
                x: centerX - (500 / 2),
                y: centerY - (500 / 2),
                width: 500,
                height: 500,
                alpha: 0.6,
                rotation: 0,
                elevation: 5,
                z: 100,
                overhead: false,
                occlusion: {
                    alpha: 1,
                    mode: CONST.TILE_OCCLUSION_MODES.NONE
                },
                video: {
                    loop: true,
                    autoplay: true,
                    volume: 0
                },
                flags: {
                    [this.MODULE_ID]: {
                        isSmokeTile: true,
                        templateId: template.id,
                        grenadeName: template.flags?.[this.MODULE_ID]?.grenadeName
                    }
                }
            };
            
            tileDataArray.push(tileData);
        }
        
        try {
            if (!game.user.isGM) {
                ui.notifications.error("Only GMs can create smoke tiles");
                return;
            }
            
            const createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", tileDataArray);
            ui.notifications.info(`Created ${createdTiles.length} smoke effect tiles`);
            return createdTiles;
        } catch (error) {
            console.error("Failed to create smoke tiles:", error);
            ui.notifications.error(`Failed to create smoke effects: ${error.message}`);
        }
    }

    static async playExplosionEffects(templates, variety) {
        if (!this.getSetting("enableSequencerEffects") || typeof Sequencer === 'undefined') {
            return;
        }
        
        try {
            for (const template of templates) {
                const centerX = template.x + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;
                const centerY = template.y + (template.width * canvas.grid.size / canvas.scene.grid.distance) / 2;
                
                const sequence = new Sequence();
               
                let animationFile, soundFile, volume, scale;
                
                if (variety === "emp") {
                    animationFile = this.getSetting("empCenterAnimation");
                    soundFile = this.getSetting("empSound");
                    volume = this.getSetting("empVolume") || 0.8;
                    scale = this.getSetting("empCenterScale") || 1.2;
                } else if (variety === "flashbang") {
                    animationFile = this.getSetting("flashbangCenterAnimation");
                    soundFile = this.getSetting("flashbangSound");
                    volume = this.getSetting("flashbangVolume") || 0.8;
                    scale = this.getSetting("flashbangCenterScale") || 1.2;
                    const flashSequence = new Sequence();
                    if (animationFile?.trim()) {
                        flashSequence.effect()
                            .file(animationFile)
                            .atLocation({ x: centerX, y: centerY })
                            .scale(scale);
                    }
                    if (soundFile?.trim()) {
                        flashSequence.sound().file(soundFile).volume(volume);
                    }
                    await flashSequence.play();
                    continue;
                } else if (variety === "smoke") {
                    continue;
                } else {
                    animationFile = this.getSetting("explosionAnimation");
                    soundFile = this.getSetting("explosionSound");
                    volume = this.getSetting("explosionVolume") || 0.8;
                    scale = this.getSetting("explosionScale") || 1.0;
                }
                
                if (animationFile?.trim()) {
                    sequence.effect()
                        .file(animationFile)
                        .atLocation({ x: centerX, y: centerY })
                        .scale(scale);
                }
                
                if (soundFile?.trim()) {
                    sequence.sound()
                        .file(soundFile)
                        .volume(volume);
                }
                
                if (sequence.effect || sequence.sound) {
                    await sequence.play();
                }
            }
        } catch (error) {
            console.error("Failed to play explosion effects:", error);
        }
    }

    static async applyResistanceWithConfirmation(damage, grenadeName, actorId, variety, dv, resistanceType, dealsDamage) {
        const templates = canvas.scene.templates.filter(t => 
            t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate && 
            t.flags?.[GrenadeSystem.MODULE_ID]?.grenadeName === grenadeName
        );
        
        if (templates.length && this.getSetting("enableSequencerEffects")) {
            await this.playExplosionEffects(templates, variety);
        }
        
        if (!templates.length) {
            ui.notifications.warn("No blast template found - select tokens manually");
            const targets = canvas.tokens.controlled;
            if (!targets.length) {
                ui.notifications.warn("No targets found or selected");
                return;
            }
            
            for (const token of targets) {
                if (token.actor) {
                    await GrenadeSystem.confirmResistanceForToken(token.actor, damage, grenadeName, dv, resistanceType, dealsDamage, variety, token);
                }
            }
            return;
        }
        
        const affectedTokens = new Set();
        for (const template of templates) {
            const tokensInTemplate = GrenadeSystem.getTokensInTemplate(template);
            tokensInTemplate.forEach(token => affectedTokens.add(token));
        }
        
        if (!affectedTokens.size) {
            ui.notifications.info("No tokens found in blast template area");
            return;
        }
        
        for (const token of affectedTokens) {
            if (token.actor) {
                await GrenadeSystem.confirmResistanceForToken(token.actor, damage, grenadeName, dv, resistanceType, dealsDamage, variety, token);
            }
        }
        
        if (variety !== "smoke") {
            try {
                const templateIds = templates.map(t => t.id);
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
            } catch (error) {
                ui.notifications.error("Failed to clear blast area");
            }
        }
    }

    static async confirmResistanceForToken(actor, damage, grenadeName, dv, resistanceType, dealsDamage, variety, token) {
        if (!actor) return;
        
        let effectText, dialogContent;
        const dialogTitle = `${grenadeName} Resistance Check`;
        
        if (dealsDamage) {
            effectText = `take ${damage} direct damage`;
        } else if (variety === "teargas") {
            effectText = "Be blinded";
        } else if (variety === "sleep") {
            effectText = "Fall asleep";
        } else if (variety === "emp") {
            effectText = " 2 pieces of Cyberware or carried electronics to become inoperable for 1 minute.";
        } else {
            effectText = "Be affected by the effect";
        }
        
        if (variety === "teargas") {
            dialogContent = `
                <div style="margin-bottom: 15px;">
                    <h3>${actor.name}</h3>
                    <p><strong>Teargas Effect:</strong></p>
                    <p>If you have <strong>meat eyes</strong>, pass a DV13 Resist Torture/Drugs check.</p>
                    <p>If your <strong>peepers are chromed-up</strong>, you are immune.</p>
                </div>
                <p>Did <strong>${actor.name}</strong> fail their resistance or have meat eyes?</p>
            `;
        } else {
            dialogContent = `
                <div style="margin-bottom: 15px;">
                    <h3>${actor.name}</h3>
                    <p><strong>Required:</strong> DV ${dv} ${resistanceType}</p>
                    <p><strong>If failed:</strong> ${dealsDamage ? `${damage} direct damage (ignores armor)` : effectText}</p>
                </div>
                <p>Did <strong>${actor.name}</strong> fail their resistance check?</p>
            `;
        }
        
        const failed = await new Promise((resolve) => {
            new Dialog({
                title: dialogTitle,
                content: dialogContent,
                buttons: {
                    failed: {
                        icon: '<i class="fas fa-times"></i>',
                        label: `Failed: ${effectText}`,
                        callback: () => resolve(true)
                    },
                    passed: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Passed: No Effect",
                        callback: () => resolve(false)
                    }
                },
                default: "failed",
                close: () => resolve(false)
            }).render(true);
        });
        
        if (failed) {
            if (dealsDamage && damage > 0) {
                await GrenadeSystem.applyDirectDamage(actor, damage, grenadeName);
            } else {
                if (variety === "teargas") {
                    await GrenadeSystem.applyTeargasEffects(actor);
                } else if (variety === "sleep") {
                    await GrenadeSystem.applySleepEffects(actor);
                } else if (variety === "emp") {
                    await GrenadeSystem.applyEMPEffects(actor, token);
                } else if (variety === "flashbang") {
                    await GrenadeSystem.playFlashbangAnimation(token);
                    await GrenadeSystem.applyFlashbangEffects(actor, token);
                } else {
                    const effectLog = `
                        <div class="rollcard">
                            <div class="rollcard-top">
                                <div class="cpr-block chat-rollTitle-stat">
                                    <div class="text-center text-padding-top text-normal text-semi">
                                        ${actor.name}
                                    </div>
                                    <div class="rollcard-subtitle">
                                        <div class="rollcard-subtitle-center text-small">
                                            Resistance Check Failed
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="rollcard-bottom">
                                <div class="cpr-block">
                                    <div class="text-normal grenade-result-text">
                                        Failed DV ${dv} ${resistanceType} check<br>
                                        <span class="roll-failure text-semi">${grenadeName} effect applies</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    await ChatMessage.create({
                        content: effectLog,
                        speaker: { alias: "Resistance Check" }
                    });
                }
            }
        } else {
            const successLog = `
                <div class="rollcard">
                    <div class="rollcard-top">
                        <div class="cpr-block chat-rollTitle-stat">
                            <div class="text-center text-padding-top text-normal text-semi">
                                ${actor.name}
                            </div>
                            <div class="rollcard-subtitle">
                                <div class="rollcard-subtitle-center text-small">
                                    Resistance Check Passed
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rollcard-bottom">
                        <div class="cpr-block">
                            <div class="text-normal grenade-result-text">
                                Passed DV ${dv} ${resistanceType} check<br>
                                <span class="roll-success text-semi">No effect from ${grenadeName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            await ChatMessage.create({
                content: successLog,
                speaker: { alias: "Resistance Check" }
            });
        }
    }

    static async applyDirectDamage(actor, damage, source) {
        if (!actor) return;
        
        const currentHP = actor.system.derivedStats?.hp?.value || 0;
        const newHP = Math.max(0, currentHP - damage);
        
        try {
            await actor.update({ "system.derivedStats.hp.value": newHP });
            
            const damageLog = `
                <div class="rollcard">
                    <div class="rollcard-top">
                        <div class="cpr-block chat-rollTitle-stat">
                            <div class="text-center text-padding-top text-normal text-semi">
                                ${actor.name}
                            </div>
                            <div class="rollcard-subtitle">
                                <div class="rollcard-subtitle-center text-small">
                                    Direct Damage Application
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rollcard-bottom">
                        <div class="cpr-block grenade-gm-card-block">
                            <div class="grenade-gm-card-stats text-small">
                                <span><strong>Source:</strong> ${source}</span>
                                <span><strong>Damage:</strong> ${damage} <em>(ignores armor)</em></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            await ChatMessage.create({
                content: damageLog,
                speaker: { alias: "Direct Damage Application" }
            });
            
        } catch (error) {
            ui.notifications.error(`Failed to apply direct damage to ${actor.name}: ${error.message}`);
        }
    }

    static async applyDamageToTemplateArea(damage, grenadeName, actorId, ablationValue, variety) {
        const templates = canvas.scene.templates.filter(t => 
            t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate && 
            t.flags?.[GrenadeSystem.MODULE_ID]?.grenadeName === grenadeName
        );
        
        if (templates.length && this.getSetting("enableSequencerEffects")) {
            await this.playExplosionEffects(templates, variety);
        }
        
        if (!templates.length) {
            ui.notifications.warn("No blast template found - select tokens manually");
            const targets = canvas.tokens.controlled;
            if (!targets.length) {
                ui.notifications.warn("No targets found or selected");
                return;
            }
            
            for (const token of targets) {
                if (token.actor) {
                    await GrenadeSystem.applyCPRDamage(token.actor, damage, grenadeName, ablationValue, variety, token);
                }
            }
            return;
        }
        
        const affectedTokens = new Set();
        for (const template of templates) {
            const tokensInTemplate = GrenadeSystem.getTokensInTemplate(template);
            tokensInTemplate.forEach(token => affectedTokens.add(token));
        }
        
        if (!affectedTokens.size) {
            ui.notifications.info("No tokens found in blast template area");
            return;
        }
        
        for (const token of affectedTokens) {
            if (token.actor) {
                await GrenadeSystem.applyCPRDamage(token.actor, damage, grenadeName, ablationValue, variety, token);
            }
        }
        
        if (variety !== "smoke") {
            try {
                const templateIds = templates.map(t => t.id);
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
            } catch (error) {
                ui.notifications.error("Failed to clear blast area");
            }
        }
        
        const damageText = damage > 0 ? `${damage} damage` : "effects";
        ui.notifications.info(`Applied ${damageText} to ${affectedTokens.size} targets in blast area`);
    }

    static getTokensInTemplate(template) {
        const affectedTokens = [];
        const templateBounds = {
            x: template.x,
            y: template.y,
            width: template.width * canvas.grid.size / canvas.scene.grid.distance,
            height: template.width * canvas.grid.size / canvas.scene.grid.distance
        };
        
        for (const token of canvas.tokens.placeables) {
            const tokenCenter = {
                x: token.x + (token.document.width * canvas.grid.size / 2),
                y: token.y + (token.document.height * canvas.grid.size / 2)
            };
            
            if (tokenCenter.x >= templateBounds.x && 
                tokenCenter.x <= templateBounds.x + templateBounds.width &&
                tokenCenter.y >= templateBounds.y && 
                tokenCenter.y <= templateBounds.y + templateBounds.height) {
                affectedTokens.push(token);
            }
        }
        
        return affectedTokens;
    }

    static async applyCPRDamage(actor, damage, source, ablationValue = 1, variety = "basic", token = null) {
        if (!actor) return;
        
        const currentHP = actor.system.derivedStats?.hp?.value || 0;
        const equippedArmor = actor.items.find(item => 
            item.type === "armor" && 
            item.system.equipped === "equipped" &&
            item.system.isBodyLocation === true
        );
        
        let armorSoak = 0;
        let armorName = "None";
        let currentAblation = 0;
        let newAblation = 0;
        let ablationIncrease = ablationValue;
        
        if (variety === "acid") {
            damage = 0;
        } else if (variety === "rubber") {
            ablationIncrease = 0;
        }
        
        if (equippedArmor) {
            armorSoak = equippedArmor.system.bodyLocation?.sp || 0;
            armorName = equippedArmor.name;
            currentAblation = equippedArmor.system.bodyLocation?.ablation || 0;
            newAblation = currentAblation + ablationIncrease;
            
            try {
                if (ablationIncrease > 0) {
                    await equippedArmor.update({ "system.bodyLocation.ablation": newAblation });
                }
            } catch (error) {
                ui.notifications.warn(`Could not update ${armorName} ablation`);
            }
        }
        
        let soakedDamage = 0;
        let newHP = currentHP;
        
        if (damage > 0) {
            soakedDamage = Math.max(0, damage - armorSoak);
            newHP = Math.max(0, currentHP - soakedDamage);
            
            try {
                await actor.update({ "system.derivedStats.hp.value": newHP });
            } catch (error) {
                ui.notifications.error(`Failed to apply damage to ${actor.name}`);
            }
        }
        
        if (variety === "incendiary") {
            try {
                if (token) {
                    await token.actor.toggleStatusEffect("s93iaEZXm1onbJ05");
                } else {
                    const foundToken = canvas.tokens.placeables.find(t => t.actor?.id === actor.id);
                    if (foundToken) {
                        await foundToken.actor.toggleStatusEffect("s93iaEZXm1onbJ05");
                    }
                }
            } catch (error) {
                ui.notifications.warn(`Could not apply incendiary condition to ${actor.name}`);
            }
        }
        
        if (this.getSetting("showDamageRecap")) {
            const finalAblation = currentAblation + ablationIncrease;
            
            let damageLog = `<div style="border: 1px solid #ccc; padding: 8px; margin: 4px 0; border-radius: 4px;">`;
            damageLog += `<strong>${actor.name}</strong> affected by ${source} (${variety})<br>`;
            
            if (damage > 0) {
                damageLog += `<strong>Raw Damage:</strong> ${damage}<br>`;
                damageLog += `<strong>Armor:</strong> ${armorName} (SP: ${armorSoak})<br>`;
                damageLog += `<strong>Damage After Armor:</strong> ${soakedDamage}<br>`;
                damageLog += `<strong>HP:</strong> ${currentHP} → ${newHP}<br>`;
            }
            
            if (equippedArmor && ablationIncrease > 0) {
                damageLog += `<strong>Armor Ablation:</strong> ${currentAblation} → ${finalAblation} (+${ablationIncrease})`;
                if (ablationIncrease > 1) {
                    damageLog += ` <em>(High Ablation)</em>`;
                }
                damageLog += `<br>`;
            } else if (variety === "rubber") {
                damageLog += `<strong>No Ablation:</strong> Rubber grenade<br>`;
            }
            
            if (variety === "incendiary") {
                damageLog += `<strong>Condition Applied:</strong> Incendiary effect<br>`;
            }
            
            if (variety === "acid" && damage === 0) {
                damageLog += `<strong>Acid Effect:</strong> Ablation only (no damage)<br>`;
            }
            
            damageLog += `</div>`;
            
            await ChatMessage.create({
                content: damageLog,
                speaker: { alias: "Damage Application" },
                whisper: GrenadeSystem.getGMUserIds(),
                flags: {
                    [this.MODULE_ID]: {
                        gmOnlyCard: true
                    }
                }
            });
        }
    }

    static async processEMPGrenade() {
        const templates = canvas.scene.templates.filter(t => 
            t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
        );
        
        if (!templates.length) {
            ui.notifications.warn("No blast template found for EMP");
            return;
        }
        
        const affectedTokens = new Set();
        for (const template of templates) {
            const tokensInTemplate = GrenadeSystem.getTokensInTemplate(template);
            tokensInTemplate.forEach(token => affectedTokens.add(token));
        }
        
        if (!affectedTokens.size) {
            await this.cleanupEMPTemplates();
            return;
        }
        
        for (const token of affectedTokens) {
            if (!token.actor) continue;
            
            try {
                const empItems = this.getEMPableItems(token.actor);
                let selectedItems = this.shuffleArray(empItems).slice(0, 2);
                let message;
                
                if (selectedItems.length === 2) {
                    message = `<strong>${token.document.name}</strong><br>EMP disables: <em>${selectedItems[0]}</em> and <em>${selectedItems[1]}</em>`;
                    await this.playEMPAnimation(token);
                } else if (selectedItems.length === 1) {
                    message = `<strong>${token.document.name}</strong><br>EMP disables: <em>${selectedItems[0]}</em>`;
                    await this.playEMPAnimation(token);
                } else {
                    message = `<strong>${token.document.name}</strong><br>No electronic items affected by EMP`;
                }
                
                await ChatMessage.create({ content: message });
                
            } catch (error) {
                ui.notifications.error(`Could not process EMP for ${token.document.name} - check console for details`);
            }
        }
        
        await this.cleanupEMPTemplates();
    }
    
    static getEMPableItems(actor) {
        const EXCLUSION_LIST = ["Option Slots"];
        let empableItems = [];
        
        if (!actor?.items) return empableItems;
        
        for (let item of actor.items) {
            try {
                if (!item?.type) continue;
                
                if (EXCLUSION_LIST.some(exclusion => 
                    item.name.toLowerCase().includes(exclusion.toLowerCase())
                )) continue;
                
                const itemType = item.type;
                const isInstalled = item.system.isInstalled;
                const isCarried = item.system.isCarried;
                const isHardened = item.system.isHardened;
                
                if (isHardened) continue;
                
                let isEMPable = false;
                
                if (itemType === "cyberware" && isInstalled) {
                    isEMPable = true;
                } else if (itemType === "cyberdeck" && isCarried) {
                    isEMPable = true;
                } else if (itemType === "gear" && isCarried) {
                    const gearType = item.system.gearType;
                    if (gearType === "electronic" || gearType === "cyberdeck") {
                        isEMPable = true;
                    }
                }
                
                if (isEMPable) {
                    empableItems.push(item.name);
                }
                
            } catch (error) {
                continue;
            }
        }
        
        return empableItems;
    }
    
    static shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        let shuffled = [...array];
        
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [
                shuffled[randomIndex], shuffled[currentIndex]
            ];
        }
        return shuffled;
    }
    
    static async playEMPAnimation(token) {
        if (!this.getSetting("enableSequencerEffects")) return;
        
        try {
            const animationFile = this.getSetting("empAnimation");
            const scale = this.getSetting("empScale") || 0.3;
            
            if (typeof Sequencer !== 'undefined' && animationFile?.trim()) {
                await new Sequence()
                    .effect()
                    .file(animationFile)
                    .atLocation(token)
                    .scale(scale)
                    .play();
            }
        } catch (error) {
        }
    }
    
    static async cleanupEMPTemplates() {
        try {
            const templatesToDelete = canvas.scene.templates.filter(t => 
                t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
            );
            
            if (templatesToDelete.length) {
                const templateIds = templatesToDelete.map(t => t.id);
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
            }
        } catch (error) {
        }
    }

    static async processFlashbangGrenade() {
        const templates = canvas.scene.templates.filter(t => 
            t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
        );
        
        if (!templates.length) {
            return;
        }
        
        const affectedTokens = new Set();
        for (const template of templates) {
            const tokensInTemplate = GrenadeSystem.getTokensInTemplate(template);
            tokensInTemplate.forEach(token => affectedTokens.add(token));
        }
        
        if (!affectedTokens.size) {
            await this.cleanupFlashbangTemplates();
            return;
        }
        
        for (const token of affectedTokens) {
            if (!token.actor) continue;
            
            try {
                const dialogTitle = `Flashbang Resistance Check`;
                const dialogContent = `
                    <div style="margin-bottom: 15px;">
                        <h3>${token.actor.name}</h3>
                        <p><strong>Required:</strong> DV 15 Resist Torture/Drugs</p>
                        <p><strong>If failed:</strong> Blinded and Deafened effects apply</p>
                    </div>
                    <p>Did <strong>${token.actor.name}</strong> fail their resistance check?</p>
                `;
                
                const failed = await new Promise((resolve) => {
                    new Dialog({
                        title: dialogTitle,
                        content: dialogContent,
                        buttons: {
                            failed: {
                                icon: '<i class="fas fa-times"></i>',
                                label: "Failed: Apply Effects",
                                callback: () => resolve(true)
                            },
                            passed: {
                                icon: '<i class="fas fa-check"></i>',
                                label: "Passed: No Effect",
                                callback: () => resolve(false)
                            }
                        },
                        default: "failed",
                        close: () => resolve(false)
                    }).render(true);
                });
                
                if (failed) {
                    await this.playFlashbangAnimation(token);
                    await this.applyFlashbangEffects(token.actor, token);
                    
                    const effectLog = `
                        <div class="rollcard">
                            <div class="rollcard-top">
                                <div class="cpr-block chat-rollTitle-stat">
                                    <div class="text-center text-padding-top text-normal text-semi">
                                        ${token.actor.name}
                                    </div>
                                    <div class="rollcard-subtitle">
                                        <div class="rollcard-subtitle-center text-small">Resistance Check Failed</div>
                                    </div>
                                </div>
                            </div>
                            <div class="rollcard-bottom">
                                <div class="cpr-block">
                                    <div class="text-normal grenade-result-text">
                                        Failed DV 15 Resist Torture/Drugs check<br>
                                        <span class="roll-failure text-semi">Flashbang effects applied (Blinded and Deafened)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    await ChatMessage.create({
                        content: effectLog,
                        speaker: { alias: "Resistance Check" }
                    });
                    
                } else {
                    const successLog = `
                        <div class="rollcard">
                            <div class="rollcard-top">
                                <div class="cpr-block chat-rollTitle-stat">
                                    <div class="text-center text-padding-top text-normal text-semi">
                                        ${token.actor.name}
                                    </div>
                                    <div class="rollcard-subtitle">
                                        <div class="rollcard-subtitle-center text-small">Resistance Check Passed</div>
                                    </div>
                                </div>
                            </div>
                            <div class="rollcard-bottom">
                                <div class="cpr-block">
                                    <div class="text-normal grenade-result-text">
                                        Passed DV 15 Resist Torture/Drugs check<br>
                                        <span class="roll-success text-semi">No effect from Flashbang</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    await ChatMessage.create({
                        content: successLog,
                        speaker: { alias: "Resistance Check" }
                    });
                }
                
            } catch (error) {
                ui.notifications.error(`Could not process Flashbang for ${token.document.name} - check console for details`);
            }
        }
        
        await this.cleanupFlashbangTemplates();
    }
    
    static async applyFlashbangEffects(actor, token = null) {
        try {
            const hasAntiDazzle = actor.items.some(item => 
                item.type === "cyberware" && 
                item.system.isInstalled && 
                item.name.toLowerCase().includes("anti-dazzle")
            );
            
            const hasLevelDamper = actor.items.some(item => 
                item.type === "cyberware" && 
                item.system.isInstalled && 
                item.name.toLowerCase().includes("level damper")
            );
            
            if (!hasAntiDazzle) {
                const eyeStatusId = GrenadeSystem.findStatusEffectId("Damaged Eye");
                if (eyeStatusId) {
                    const hasEyeEffect = actor.effects.some(e => e.statuses.has(eyeStatusId));
                    if (!hasEyeEffect) await actor.toggleStatusEffect(eyeStatusId);
                }
                const existingEyeItem = actor.items.getName("Damaged Eye");
                if (!existingEyeItem) {
                    const gameEyeItem = await GrenadeSystem.findItemByName("Damaged Eye");
                    if (gameEyeItem) {
                        await actor.createEmbeddedDocuments("Item", [gameEyeItem.toObject()]);
                    } else {
                        ui.notifications.warn(`Item "Damaged Eye" not found in world items or compendiums`);
                    }
                }
            }
            
            if (!hasLevelDamper) {
                const earStatusId = GrenadeSystem.findStatusEffectId("Damaged Ear");
                if (earStatusId) {
                    const hasEarEffect = actor.effects.some(e => e.statuses.has(earStatusId));
                    if (!hasEarEffect) await actor.toggleStatusEffect(earStatusId);
                }
                const existingEarItem = actor.items.getName("Damaged Ear");
                if (!existingEarItem) {
                    const gameEarItem = await GrenadeSystem.findItemByName("Damaged Ear");
                    if (gameEarItem) {
                        await actor.createEmbeddedDocuments("Item", [gameEarItem.toObject()]);
                    } else {
                        ui.notifications.warn(`Item "Damaged Ear" not found in world items or compendiums`);
                    }
                }
            }

        } catch (error) {
            console.error(`Failed to apply Flashbang effects to ${actor.name}:`, error);
        }
    }
    
    static async playFlashbangAnimation(token) {
        if (!this.getSetting("enableSequencerEffects")) return;
        
        try {
            const animationFile = this.getSetting("flashbangAnimation");
            const scale = this.getSetting("flashbangScale") || 1.0;
            
            if (typeof Sequencer !== 'undefined' && animationFile?.trim()) {
                await new Sequence()
                    .effect()
                    .file(animationFile)
                    .atLocation(token)
                    .scale(scale)
                    .play();
            }
        } catch (error) {
        }
    }
    
    static async applyTeargasEffects(actor) {
        try {
            const hasAntiDazzle = actor.items.some(item => 
                item.type === "cyberware" && 
                item.system.isInstalled && 
                item.name.toLowerCase().includes("anti-dazzle")
            );
            
            if (!hasAntiDazzle) {
                const eyeStatusId = GrenadeSystem.findStatusEffectId("Damaged Eye");
                if (eyeStatusId) {
                    const hasEyeEffect = actor.effects.some(e => e.statuses.has(eyeStatusId));
                    if (!hasEyeEffect) await actor.toggleStatusEffect(eyeStatusId);
                }
                const existingEyeItem = actor.items.getName("Damaged Eye");
                if (!existingEyeItem) {
                    const gameEyeItem = await GrenadeSystem.findItemByName("Damaged Eye");
                    if (gameEyeItem) {
                        await actor.createEmbeddedDocuments("Item", [gameEyeItem.toObject()]);
                    } else {
                        ui.notifications.warn(`Item "Damaged Eye" not found in world items or compendiums`);
                    }
                }
            }
            
        } catch (error) {
            console.error(`Failed to apply Teargas effects to ${actor.name}:`, error);
        }
    }
    
    static async applySleepEffects(actor) {
        try {
            const sleepStatusId = GrenadeSystem.findStatusEffectId("Unconscious");
            if (!sleepStatusId) return;

            const hasSleepEffect = actor.effects.some(e => e.statuses.has(sleepStatusId));
            if (!hasSleepEffect) {
                await actor.toggleStatusEffect(sleepStatusId);
            }
        } catch (error) {
            console.error(`Failed to apply Sleep effects to ${actor.name}:`, error);
        }
    }
    
    static async applyEMPEffects(actor, token = null) {
        try {
            const empItems = this.getEMPableItems(actor);
            let selectedItems = this.shuffleArray(empItems).slice(0, 2);
            let message;
            
            if (selectedItems.length === 2) {
                message = `<strong>${actor.name}</strong><br>EMP disables: <em>${selectedItems[0]}</em> and <em>${selectedItems[1]}</em>`;
            } else if (selectedItems.length === 1) {
                message = `<strong>${actor.name}</strong><br>EMP disables: <em>${selectedItems[0]}</em>`;
            } else {
                message = `<strong>${actor.name}</strong><br>No electronic items affected by EMP`;
            }
            
            await ChatMessage.create({ 
                content: message,
                speaker: { alias: "EMP Effect" }
            });
            
            if (selectedItems.length) {
                if (token) {
                    await this.playEMPAnimation(token);
                } else {
                    const foundToken = canvas.tokens.placeables.find(t => t.actor?.id === actor.id);
                    if (foundToken) {
                        await this.playEMPAnimation(foundToken);
                    }
                }
            }
            
        } catch (error) {
            ui.notifications.error(`Failed to apply EMP effects to ${actor.name}: ${error.message}`);
        }
    }

    static async cleanupFlashbangTemplates() {
        try {
            const templatesToDelete = canvas.scene.templates.filter(t => 
                t.flags?.[GrenadeSystem.MODULE_ID]?.isGrenadeTemplate
            );
            
            if (templatesToDelete.length) {
                const templateIds = templatesToDelete.map(t => t.id);
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
            }
        } catch (error) {
        }
    }
}

Hooks.once("init", () => {
    GrenadeSystem.initialize();
});

window.GrenadeSystem = GrenadeSystem;
