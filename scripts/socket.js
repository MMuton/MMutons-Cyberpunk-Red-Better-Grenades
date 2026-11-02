import { MODULE_ID } from "./constants.js";

const SOCKET = `module.${MODULE_ID}`;
const handlers = {};

export function registerSocket(actions) {
    Object.assign(handlers, actions);
    game.socket.on(SOCKET, async ({ action, args, gmId }) => {
        if (game.user.id !== gmId) return;
        try {
            await handlers[action]?.(...(args ?? []));
        } catch (err) {
            console.error(`${MODULE_ID} | Socket action "${action}" failed`, err);
        }
    });
}

export async function runAsGM(action, ...args) {
    if (game.user.isGM) return handlers[action]?.(...args);
    const gm = game.users.activeGM;
    if (!gm) return ui.notifications.warn("A GM needs to be logged in for this.");
    game.socket.emit(SOCKET, { action, args, gmId: gm.id });
}
