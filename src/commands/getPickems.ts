import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';

const getPickemsCommand = {
	data: new SlashCommandBuilder()
		.setName('getPickems')
		.setDescription('Log in the console those who reacted with a 1 or 2 in the last 20 messages')
		.addIntegerOption((option) => (
			option
				.setName('week')
				.setRequired(true)
				.setDescription('Enter in the week of pickems you would like to receive.')
				.setMinValue(1)
				.setMaxValue(12)
		)),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			const weekToFetch = interaction.options.get('week')?.value;
			console.log({ weekToFetch });
			const channel = interaction.channel;
			const messages = await channel?.messages.fetch({ limit: 20 });

			if (messages !== undefined) {
				// Flip the order to go from oldest to newest
				const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
				const startingMessage = sortedMessages.find((message) => message.content.includes(String(weekToFetch)));
				const weekMessages = await channel?.messages.fetch({ after: startingMessage?.id, limit: 8 });
				console.log({ weekMessages });

				for (const [, message] of sortedMessages) {
					const oneReactions = message.reactions.cache.get('1️⃣');
					const twoReactions = message.reactions.cache.get('2️⃣');

					message.content = message.content.replace('1️⃣', '(1)').replace('2️⃣', '(2)');

					const oneReactionUserCollections = await oneReactions?.users.fetch();
					const usersReactingOne = oneReactionUserCollections?.map((user) => user.globalName);

					const twoReactionUserCollections = await twoReactions?.users.fetch();
					const usersReactingTwo = twoReactionUserCollections?.map((user) => user.globalName);

					console.log(message.content);
					console.log('1 reactions:', usersReactingOne);
					console.log('2 reactions:', usersReactingTwo, '\n');
				}
			}

			await interaction.editReply({ content: 'Check console.log kek' });
		}
	}
};

export default getPickemsCommand;
