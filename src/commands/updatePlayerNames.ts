import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import 'dotenv/config';
import { type sheets_v4 } from 'googleapis';
import { getGoogleSheetsService } from 'src/helper';

const updatePlayerNames = {
	data: new SlashCommandBuilder()
		.setName('update-player-names')
		.setDescription('Update the names of the players for the start of a new season.')
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
				.setName('player-names')
				.setDescription('Enter in a comma separated list of player names.')
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			try {
				const division = interaction.options.get('division')?.value as string;
				const playerNames = (interaction.options.get('player-names')?.value as string).split(',');

				let spreadsheetId: string | undefined;
				switch (division) {
					case 'midday':
						spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDDAY_ID;
						break;
					case 'midnight':
						spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDNIGHT_ID;
						break;
				}

				spreadsheetId = '1uGlEtLBpvZ1bySF4sTDfJOfUeZeeg3itjvMqPps2uDg';
				if (spreadsheetId === undefined || spreadsheetId.length === 0) {
					throw new Error('Spreadsheet authentication has failed.');
				}

				const googleSheetsService = getGoogleSheetsService();

				const spreadsheet = await googleSheetsService.spreadsheets.get({
					spreadsheetId,
					fields: 'sheets.properties'
				});

				const sheets = spreadsheet.data.sheets;

				if (sheets === undefined) {
					throw new Error('There is no available data for the spreadsheet.');
				}

				// Start on Column C for updateCoachName()
				let startColumnIndex = 2;
				for (const [index, name] of playerNames.entries()) {
					updateSheetName(googleSheetsService, spreadsheetId, index, name, sheets);
					updateCoachName(googleSheetsService, spreadsheetId, index, name, startColumnIndex);

					// After the 8th iteration we need to reset back to Column C
					(index + 1) % 8 === 0 ? startColumnIndex = 2 : startColumnIndex += 4;
				}

				return await interaction.editReply({ content: 'Player names successfully updated.' });
			} catch (error) {
				let errorMessage: string;
				error instanceof Error ? errorMessage = `Error: ${error.message}` : errorMessage = 'Unknown error.';

				return await interaction.editReply({ content: errorMessage });
			}
		}
	}
};

const updateSheetName = (
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	outerIndex: number,
	name: string,
	sheets: sheets_v4.Schema$Sheet[]
): void => {
	// Grab each player sheet, starting with P1
	const sheet = sheets.find((element) => element.properties?.title === `P${outerIndex + 1}`);

	void googleSheetsService.spreadsheets.batchUpdate({
		spreadsheetId,
		requestBody: {
			requests: [{
				updateSheetProperties: {
					fields: 'title',
					properties: {
						title: name,
						sheetId: sheet?.properties?.sheetId
					}
				}
			}]
		}
	});
};

const updateCoachName = (
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	outerIndex: number,
	name: string,
	startColumnIndex: number
): void => {
	// Coach names 1-8 are on row 2, 9-16 are on row 22
	let row: string = '';
	if (outerIndex < 8) {
		row = '2';
	} else if (outerIndex >= 8 && outerIndex < 16) {
		row = '22';
	}

	// Coach names are 4 columns wide, i.e. C2:F2
	const range = `Rosters!${getColumnLetter(startColumnIndex)}${row}:${getColumnLetter(startColumnIndex + 3)}${row}`;

	void googleSheetsService.spreadsheets.values.update({
		spreadsheetId,
		range,
		valueInputOption: 'RAW',
		requestBody: {
			values: [[name]]
		}
	});
};

// Converts a column index into a column letter, i.e. 0 -> A, 25 -> Z, 26 -> AA
const getColumnLetter = (columnIndex: number): string => {
	let columnLetter = '';
	while (columnIndex >= 0) {
		columnLetter = String.fromCharCode(65 + (columnIndex % 26)) + columnLetter;
		columnIndex = Math.floor(columnIndex / 26) - 1;
	}

	return columnLetter;
};

export default updatePlayerNames;
