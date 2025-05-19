// Chargement des variables d'environnement
require('dotenv').config(); // Charge les variables d'environnement depuis .env

// Vérification du déploiement global (boolean)
const globalDeploy = process.env.GLOBAL_DEPLOY === "true";  
console.log("🌍 Déploiement global ?", globalDeploy ? "✅ Oui" : "❌ Non");

// Import des modules nécessaires
const { Routes, REST } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Récupération des informations nécessaires depuis les variables d'environnement
const token = process.env.BOT_TOKEN;  // Utiliser BOT_TOKEN au lieu de TOKEN
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Vérification des variables d'environnement
console.log("🔍 Vérification des variables d'environnement...");
console.log("BOT_TOKEN:", token ? "✅ Défini" : "❌ Manquant");
console.log("GUILD_ID:", guildId ? "✅ Défini" : "❌ Manquant");
console.log("CLIENT_ID:", clientId ? "✅ Défini" : "❌ Manquant");

// S'assurer que les variables nécessaires sont définies
if (!token || !guildId || !clientId) {
    console.error("❌ Erreur : Assurez-vous que BOT_TOKEN, GUILD_ID et CLIENT_ID sont bien définis dans le fichier .env !");
    process.exit(1);  // Arrêter l'exécution si une variable est manquante
}

// Chargement des commandes depuis le dossier 'commands'
const commands = [];
const commandsPath = path.resolve(__dirname, 'commands');

// Vérification de l'existence du dossier 'commands'
if (!fs.existsSync(commandsPath)) {
    console.error('❌ Dossier "commands" introuvable !');
    process.exit(1);
}

// Chargement des commandes depuis chaque sous-dossier du dossier 'commands'
fs.readdirSync(commandsPath).forEach(folder => {
    const folderPath = path.join(commandsPath, folder);

    if (!fs.statSync(folderPath).isDirectory()) return;  // Vérifier si c'est un dossier

    // Charger chaque fichier de commande
    fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.js'))  // Se concentrer sur les fichiers .js
        .forEach(file => {
            const command = require(path.join(folderPath, file));

            // Vérifier si la commande contient des données valides
            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`✅ Commande chargée : ${command.data.name}`);
            } else {
                console.warn(`⚠️ Le fichier ${file} ne contient pas de structure de commande valide.`);
            }
        });
});

// Initialisation de l'instance REST pour interagir avec l'API Discord
const rest = new REST({ version: '10' }).setToken(token);

// Fonction asynchrone pour déployer les commandes
(async () => {
    try {
        console.log(`🚀 Déploiement de ${commands.length} commandes...`);

        // Définir la route d'API selon le type de déploiement (global ou serveur)
        const route = globalDeploy
            ? Routes.applicationCommands(clientId)  // Déploiement global
            : Routes.applicationGuildCommands(clientId, guildId); // Déploiement sur un serveur spécifique

        // Déploiement des commandes via l'API REST
        await rest.put(route, { body: commands });

        // Message de succès
        console.log(`✅ Commandes déployées avec succès ${globalDeploy ? 'globalement' : `sur le serveur ${guildId}`} !`);
    } catch (error) {
        // Gestion des erreurs lors du déploiement
        console.error('❌ Erreur lors du déploiement des commandes :', error);
    }
})();