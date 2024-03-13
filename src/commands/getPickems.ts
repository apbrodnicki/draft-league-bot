import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import type { Message } from '../models'; // fix the ../

const getPickemsCommand = {
	data: new SlashCommandBuilder()
		.setName('getpickems')
		.setDescription('Log in the console those who reacted with a 1 or 2 for the specified week.')
		.addIntegerOption((option) => (
			option
				.setName('week')
				.setRequired(true)
				.setDescription('Enter in the week of pickems you would like to start with.')
				.setMinValue(1)
				.setMaxValue(11) // 8 regular season weeks, 3 playoff weeks
		))
		.addIntegerOption((option) => (
			option
				.setName('amount')
				.setRequired(false)
				.setDescription('Enter in the amount of messages you would like to receive.')
				.setMinValue(1)
		)),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			const channel = interaction.channel;
			const weekToFetch = interaction.options.get('week')?.value as number;
			const amountToFetch = interaction.options.get('amount')?.value as number | undefined;
			const channelMessages = await channel?.messages.fetch({ limit: 100 });

			if (channelMessages === undefined) {
				return await interaction.editReply({ content: 'Unable to grab messages.' });
			}

			// Convert from Collection to Message for easier handling
			const messages: Message[] = channelMessages.map((message) => ({
				content: message.content,
				reactions: message.reactions,
				createdTimestamp: message.createdTimestamp
			}));

			const startingMessage = messages.find((message) => message.content.includes('Week ' + String(weekToFetch)));

			if (startingMessage === undefined) {
				return await interaction.editReply({ content: 'The week you have requested is not available.' });
			}

			// Flip the order to go from oldest to newest
			const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

			const startingIndex = sortedMessages.indexOf(startingMessage);

			let outputMessages: Message[];

			if (amountToFetch === undefined) {
				let amountOfMessages: number = 0;

				if (weekToFetch <= 8) {
					amountOfMessages = 8;
				} else if (weekToFetch === 9) {
					amountOfMessages = 4;
				} else if (weekToFetch === 10) {
					amountOfMessages = 2;
				} else if (weekToFetch === 11) {
					amountOfMessages = 1;
				}

				outputMessages = sortedMessages.slice(startingIndex, startingIndex + amountOfMessages);
			} else {
				outputMessages = sortedMessages.slice(startingIndex, startingIndex + amountToFetch);
			}

			for (const message of outputMessages) {
				const oneReactions = message.reactions.cache.get('1️⃣');
				const twoReactions = message.reactions.cache.get('2️⃣');

				message.content = message.content.replace('1️⃣', '(1)').replace('2️⃣', '(2)');

				// Get the users per reaction, grab the name, convert the typing
				const oneUsersCollection = await oneReactions?.users.fetch();
				const oneUsersNames = oneUsersCollection?.map((user) => user.globalName);
				const oneUsersStringArray = (oneUsersNames ?? []) as string[];

				const twoUsersCollection = await twoReactions?.users.fetch();
				const twoUsersNames = twoUsersCollection?.map((user) => user.globalName);
				const twoUsersStringArray = (twoUsersNames ?? []) as string[];

				const alphabetizedOneUsers = oneUsersStringArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
				const alphabetizedTwoUsers = twoUsersStringArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

				console.log(message.content);

				console.log('\t' + '1 reactions:');
				if (alphabetizedOneUsers.length > 0) {
					alphabetizedOneUsers.forEach((user) => { console.log('\t\t' + user); });
				} else {
					console.log('\t\t' + 'No reactions.');
				}

				console.log('\t' + '2 reactions:');
				if (alphabetizedTwoUsers.length > 0) {
					alphabetizedTwoUsers.forEach((user) => { console.log('\t\t' + user); });
				} else {
					console.log('\t\t' + 'No reactions.');
				}

				console.log('\n');
			}

			return await interaction.editReply({ content: 'Check console.log kek' });
		}
	}
};

export default getPickemsCommand;
