import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import 'dotenv/config';
import { type sheets_v4 } from 'googleapis';
import { getColumnLetter, getGoogleSheetsService } from 'src/helper';

const updatePlayerNames = {
	data: new SlashCommandBuilder()
		.setName('add-additional-player-info')
		.setDescription('Add additional player info, such as Showdown names and time zones.')
		.addStringOption((option) =>
			option
				.setName('division')
				.setDescription('Choose the division you would like to update.')
				.setRequired(true)
				.addChoices(
					{ name: 'Midday', value: 'midday' },
					{ name: 'Midnight', value: 'midnight' },
				)
		)
		.addStringOption((option) =>
			option
				.setName('showdown-names')
				.setDescription('Enter in a comma separated list of showdown names.')
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName('time-zones')
				.setDescription('Enter in a comma separated list of time zones.')
				.setRequired(false)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			try {
				const division = interaction.options.get('division')?.value as string;
				const showdownNamesString = interaction.options.get('showdown-names')?.value as string;
				const timezonesString = interaction.options.get('time-zones')?.value as string;

				let spreadsheetId: string | undefined;
				switch (division) {
					case 'midday':
						spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDDAY_ID;
						break;
					case 'midnight':
						spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDNIGHT_ID;
						break;
				}

				if (spreadsheetId === undefined || spreadsheetId.length === 0) {
					throw new Error('Spreadsheet authentication has failed.');
				}

				let showdownNames: string[] = [];
				if (showdownNamesString !== undefined) {
					showdownNames = showdownNamesString.split(',');
				}

				let timezones: string[] = [];
				if (timezonesString !== undefined) {
					timezones = timezonesString.split(',');
				}

				const googleSheetsService = getGoogleSheetsService();

				for (const [index, name] of showdownNames.entries()) {
					updateShowdownName(googleSheetsService, spreadsheetId, index, name);
				}

				// Start on Column C
				let startColumnIndex = 2;
				for (const [index, timezone] of timezones.entries()) {
					updateTimezone(googleSheetsService, spreadsheetId, index, timezone, startColumnIndex);

					// After the 8th iteration we need to reset back to Column C
					(index + 1) % 8 === 0 ? startColumnIndex = 2 : startColumnIndex += 4;
				}

				return await interaction.editReply({ content: 'Player info successfully updated.' });
			} catch (error) {
				let errorMessage: string;
				error instanceof Error ? errorMessage = `Error: ${error.message}` : errorMessage = 'Unknown error.';

				return await interaction.editReply({ content: errorMessage });
			}
		}
	}
};

const updateShowdownName = (
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	outerIndex: number,
	name: string
): void => {
	void googleSheetsService.spreadsheets.values.update({
		spreadsheetId,
		range: `Standings Code!J${42 + outerIndex}`,
		valueInputOption: 'RAW',
		requestBody: {
			values: [[name]]
		}
	});
};

const updateTimezone = (
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	outerIndex: number,
	timezone: string,
	startColumnIndex: number
): void => {
	// Timezones 1-8 are on row 4, 9-16 are on row 24
	let row: string = '';
	if (outerIndex < 8) {
		row = '4';
	} else if (outerIndex >= 8 && outerIndex < 16) {
		row = '24';
	}

	// Timezones are 4 columns wide, i.e. C4:F4
	const range = `Rosters!${getColumnLetter(startColumnIndex)}${row}:${getColumnLetter(startColumnIndex + 3)}${row}`;

	void googleSheetsService.spreadsheets.values.update({
		spreadsheetId,
		range,
		valueInputOption: 'RAW',
		requestBody: {
			values: [[timezone]]
		}
	});
};

export default updatePlayerNames;
