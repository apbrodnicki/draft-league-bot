import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import 'dotenv/config';
import { google, type sheets_v4 } from 'googleapis';

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

			let spreadsheetId: string | undefined;
			const division = interaction.options.get('division')?.value as string;
			const playerNames = (interaction.options.get('player-names')?.value as string).split(',');

			switch (division) {
				case 'midday':
					spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDDAY_ID;
					break;
				case 'midnight':
					spreadsheetId = process.env.GOOGLE_SPREADSHEET_MIDNIGHT_ID;
					break;
			}

			const googleServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;

			spreadsheetId = '1uGlEtLBpvZ1bySF4sTDfJOfUeZeeg3itjvMqPps2uDg';
			if (spreadsheetId === undefined || spreadsheetId.length === 0 || googleServiceAccount === undefined) {
				return await interaction.editReply({ content: 'Authentication has failed.' });
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

			const spreadsheet = await googleSheetsService.spreadsheets.get({
				spreadsheetId,
				fields: 'sheets.properties'
			});

			const sheets = spreadsheet.data.sheets;

			if (sheets === undefined) {
				return await interaction.editReply({ content: 'There is no available data for the spreadsheet.' });
			}

			const rostersSheet = await googleSheetsService.spreadsheets.values.get({
				spreadsheetId,
				range: 'Rosters'
			});

			const rostersSheetValues: string[][] | null | undefined = rostersSheet.data.values;

			if (!Array.isArray(rostersSheetValues)) {
				return await interaction.editReply({ content: 'There is no available data for the to update the roster.' });
			}

			for (const [index, name] of playerNames.entries()) {
				try {
					updateSheetNames(sheets, googleSheetsService, spreadsheetId, index, name);
					updateCoachNames(googleSheetsService, spreadsheetId, rostersSheetValues, index, name);
				} catch (error) {
					let errorMessage: string;
					error instanceof Error ? errorMessage = `An error has occurred: ${error.message}` : errorMessage = 'Unknown error.';

					return await interaction.editReply({ content: errorMessage });
				}
			}

			return await interaction.editReply({ content: 'Player names successfully updated.' });
		}
	}
};

const updateSheetNames = (
	sheets: sheets_v4.Schema$Sheet[],
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	index: number,
	name: string
): void => {
	// Grab each player sheet, starting with P1
	const sheet = sheets.find((element) => element.properties?.title === `P${index + 1}`);

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

const updateCoachNames = (
	googleSheetsService: sheets_v4.Sheets,
	spreadsheetId: string,
	rostersSheetValues: string[][],
	outerIndex: number,
	name: string
): void => {
	for (let index = 0; index < rostersSheetValues.length; index++) {
		// Find the position of each cell, starting with P1
		const row = rostersSheetValues[index];
		const columnIndex = row.indexOf(`P${outerIndex + 1}`);

		if (columnIndex !== -1) {
			void googleSheetsService.spreadsheets.values.update({
				spreadsheetId,
				range: `Rosters!${getColumnLetter(columnIndex)}${index + 1}`,
				valueInputOption: 'RAW',
				requestBody: {
					values: [[name]]
				}
			});
		}
	}
};

const getColumnLetter = (columnIndex: number): string => {
	let columnLetter = '';
	while (columnIndex >= 0) {
		columnLetter = String.fromCharCode(65 + (columnIndex % 26)) + columnLetter;
		columnIndex = Math.floor(columnIndex / 26) - 1;
	}

	return columnLetter;
};

export default updatePlayerNames;
