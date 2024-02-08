import 'dotenv/config';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { addCommands } from './helper';
import { type Command } from './models';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});

client.commands = await addCommands(new Collection()) as Collection<string, any>;

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready, logged in as ${readyClient.user.username}!`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command: Command = interaction.client.commands.get(interaction.commandName);

	if (command.data.name !== interaction.commandName) {
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

void client.login(process.env.TOKEN ?? '');
