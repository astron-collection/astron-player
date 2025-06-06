// utils/statusManager.js
const { ActivityType } = require("discord.js");

const playingTracks = new Map(); // Map<guildId, { title: string }>
let toggle = true;

async function updatePresence(client) {
    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

    const entries = [...playingTracks.entries()];
    const hasMusic = entries.length > 0;

    if (hasMusic) {
        const [_, track] = entries[0];
        const name = toggle
            ? `🎵 ${track.title.substring(0, 100)}`
            : `${guildCount} guilds • ${userCount} users`;

        client.user.setPresence({
            activities: [{ name, type: ActivityType.Listening }],
            status: "online",
        });

        toggle = !toggle;
    } else {
        client.user.setPresence({
            activities: [{
                name: `${guildCount} guilds • ${userCount} users`,
                type: ActivityType.Watching,
            }],
            status: "online",
        });
    }
}

function startPresenceLoop(client) {
    updatePresence(client);
    setInterval(() => updatePresence(client), 10000);
}

function startTrack(guildId, title) {
    playingTracks.set(guildId, { title });
}

function stopTrack(guildId) {
    playingTracks.delete(guildId);
}

module.exports = {
    startPresenceLoop,
    startTrack,
    stopTrack,
};

client.login(process.env.BOT_TOKEN);
