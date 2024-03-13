import { REST, Routes, type SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import { addCommands } from './helper';

const rest = new REST().setToken(process.env.TOKEN ?? '');
const commands = await addCommands() as SlashCommandBuilder[];

// Deploy commands
void (async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) command(s).`);

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
			{ body: commands }
		);

		console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
