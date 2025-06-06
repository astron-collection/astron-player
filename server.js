const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const statusManager = require("./utils/statusManager"); // 👈 Ajout

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

// Commandes
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

// Ready
client.once("ready", () => {
    console.log(`✅ Le bot est connecté en tant que ${client.user.tag}`);
    statusManager.startPresenceLoop(client); // 👈 Remplace le setPresence direct
});

client.login(process.env.BOT_TOKEN); 
