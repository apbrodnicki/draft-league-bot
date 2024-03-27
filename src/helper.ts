import { type Collection, type SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import { google, type sheets_v4 } from 'googleapis';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { type CommandModule } from './models';

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

export const getGoogleSheetsService = (): sheets_v4.Sheets => {
	const googleServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;

	if (googleServiceAccount === undefined || googleServiceAccount.length === 0) {
		throw new Error('Google Service Account authentication has failed.');
	}

	const auth = new google.auth.GoogleAuth({
		credentials: JSON.parse(googleServiceAccount),
		scopes: [
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/spreadsheets',
		]
	});

	const googleSheetsService = google.sheets({
		version: 'v4',
		auth
	});

	return googleSheetsService;
};
