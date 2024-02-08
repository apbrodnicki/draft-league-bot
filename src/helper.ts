import { type SlashCommandBuilder, type Collection } from 'discord.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { type CommandModule } from './models';
import { fileURLToPath } from 'url';

export const addCommands = async (commands?: Collection<any, any>): Promise<Collection<string, any> | SlashCommandBuilder[]> => {
	const fileName = fileURLToPath(import.meta.url);
	const dirName = dirname(fileName);
	const foldersPath = path.join(dirName, 'commands');
	const commandFiles = fs.readdirSync(foldersPath);

	const commandsArray: SlashCommandBuilder[] = [];

	for (const file of commandFiles) {
		const filePath = path.join(foldersPath, file);
		const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;

		const { default: command }: CommandModule = await import(fileUrl);

		if ('data' in command && 'execute' in command) {
			commands !== undefined
				? commands.set(command.data.name, command)
				: commandsArray.push(command.data);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	return commands ?? commandsArray;
};
