import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import 'dotenv/config';
import { google } from 'googleapis';

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

			if (spreadsheetId === undefined || googleServiceAccount === undefined) {
				return await interaction.editReply({ content: 'Authentication has failed.' });
			}

			const auth = new google.auth.GoogleAuth({
				credentials: JSON.parse(googleServiceAccount),
				scopes: [
					'https://www.googleapis.com/auth/drive',
					'https://www.googleapis.com/auth/spreadsheets',
				]
			});

			const googleSheets = google.sheets({
				version: 'v4',
				auth
			});

			const sheets = await googleSheets.spreadsheets.get({
				spreadsheetId,
				fields: 'sheets.properties'
			});

			if (sheets.data.sheets === undefined) {
				return await interaction.editReply({ content: 'There is no available data for the spreadsheet.' });
			}

			for (const [index, name] of playerNames.entries()) {
				// Grab each player sheet, starting with P1
				const sheet = sheets.data.sheets.find((element) => element.properties?.title === `P${index + 1}`);

				try {
					void googleSheets.spreadsheets.batchUpdate({
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

export default updatePlayerNames;
