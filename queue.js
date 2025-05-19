const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

class MusicQueue {
    constructor() {
        this.queue = new Map(); // Stocke la musique par serveur
    }

    getQueue(guildId) {
        if (!this.queue.has(guildId)) {
            this.queue.set(guildId, { songs: [], player: createAudioPlayer() });
        }
        return this.queue.get(guildId);
    }

    async playNext(connection, guildId) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length === 0) {
            connection.destroy(); // Déconnecte si plus de musique
            return;
        }

        const song = queue.songs.shift();
        const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
        const resource = createAudioResource(stream);

        queue.player.play(resource);
        connection.subscribe(queue.player);

        queue.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext(connection, guildId);
        });
    }
}

module.exports = new MusicQueue();