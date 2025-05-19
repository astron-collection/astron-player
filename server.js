const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
    ],
});

// Chargement des commandes
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(folder => {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.js'))
        .forEach(file => {
            const command = require(path.join(folderPath, file));
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Commande chargée : ${command.data.name}`);
            } else {
                console.warn(`⚠️ Commande mal formée dans : ${file}`);
            }
        });
});

// Événement "ready"
client.once("ready", () => {
    console.log(`✅ Le bot est connecté en tant que ${client.user.tag}`);
    client.user.setPresence({
        activities: [
            {
                name: "Sky Genesis Enterprise",
                type: ActivityType.Streaming,
                url: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
            }
        ],
        status: "online",
    });
});

// Gestion des interactions (commandes slash)
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Erreur dans la commande "${interaction.commandName}":`, error);
        await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
    }
});

// Connexion
client.login(process.env.BOT_TOKEN);