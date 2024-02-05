const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath);

for (const file of commandFiles) {
	const filePath = path.join(foldersPath, file);
	const command = require(filePath);

	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on('ready', () => {
	client.guilds.cache.forEach((guild) => {
		// TODO: change to get specific channel IDs
		guild.channels.cache.forEach((channel) => {
			if (channel.id === '1203887231610134611') {
				// Get all messages in that channel
				channel.messages
				.fetch()
				.then(allMessages => {
					allMessages.forEach(message => {
						const oneReactions = message.reactions.cache.get('1️⃣');
						const twoReactions = message.reactions.cache.get('2️⃣');

						oneReactions?.users
						.fetch()
						.then(allUsers => {
							const users = allUsers.map((user) => user.globalName);
							console.log({users})
						});

						twoReactions?.users
						.fetch()
						.then(allUsers => {
							const users = allUsers.map((user) => user.globalName);
							console.log({users})
						});
					});
				})
				.catch((error) => {
					console.log("ERROR:", error);
				});
			}
		});
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Log in to Discord with your client's token
client.login(token);