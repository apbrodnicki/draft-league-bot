import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';

const getReactionsCommand = {
	data: new SlashCommandBuilder()
		.setName('getreactions')
		.setDescription('Log in the console those who reacted with a 1 or 2 in the last 20 messages'),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			const channel = interaction.channel;
			const messages = await channel?.messages.fetch({ limit: 20 });

			if (messages !== undefined) {
				const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

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

export default getReactionsCommand;
