import { throwGrenade, fireFromLauncher, isLauncher } from "./throw.js";
import { esc } from "./utils.js";

function makeButton(itemId, title, onClick, extraClass = "") {
    const button = $(`<a class="item-action grenade-throw-button ${extraClass}" data-item-id="${esc(itemId)}" title="${esc(title)}"><i class="fas fa-bomb"></i></a>`);
    button.on("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await onClick();
    });
    return button;
}

const isGrenade = (item) => item?.type === "ammo" && item.system.variety === "grenade";

function addLauncherButtons(app, html) {
    html.find("div.item.weapon-grid").each((i, el) => {
        const weaponDiv = $(el);
        const weapon = app.actor.items.get(weaponDiv.data("item-id"));
        if (!isLauncher(weapon) || weaponDiv.find(".grenade-throw-button").length) return;
        weaponDiv.find(".weapon-name").append(
            makeButton(weapon.id, `Fire ${weapon.name}`, () => fireFromLauncher(app.actor, weapon.id), "mmg-launcher-button")
        );
    });
}

function addGearButtons(app, html) {
    const gearTab = html.find('.tab[data-tab="gear"]');
    gearTab.find('.item[data-item-category="ammo"]').each((i, el) => {
        const row = $(el);
        const item = app.actor.items.get(row.data("item-id"));
        if (!isGrenade(item) || row.find(".grenade-throw-button").length) return;
        const button = makeButton(item.id, `Throw ${item.name}`, () => throwGrenade(app.actor, item.id));
        const actions = row.find(".gear-actions");
        const split = actions.find('[data-action-type="split"]');
        if (split.length) split.after(button);
        else actions.prepend(button);
    });
}

function addMookButtons(app, html) {
    const specialList = html.find(".mook-special-list");
    for (const item of app.actor.items.filter(isGrenade)) {
        if (html.find(`.grenade-throw-button[data-item-id="${item.id}"]`).length) continue;
        const link = specialList.find(`a[data-item-id="${item.id}"]`);
        if (link.length) link.after(makeButton(item.id, `Throw ${item.name}`, () => throwGrenade(app.actor, item.id), "mmg-mook-button"));
    }
}

export function onRenderActorSheet(app, html) {
    if (!app.actor?.isOwner) return;
    if (html.find(".mook-special-list").length) addMookButtons(app, html);
    else if (html.find('.tab[data-tab="gear"]').length) addGearButtons(app, html);
    addLauncherButtons(app, html);
}
