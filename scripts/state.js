import { MODULE_ID } from "./constants.js";

export async function setCardState(message, patch) {
    if (!message) return;
    if (!(game.user.isGM || message.isAuthor)) return;
    const state = { ...(message.flags?.[MODULE_ID]?.state ?? {}), ...patch };
    await message.setFlag(MODULE_ID, "state", state);
}
