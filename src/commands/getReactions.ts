import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';

const getReactionsCommand = {
	data: new SlashCommandBuilder()
		.setName('getreactions')
		.setDescription('Log in the console those who reacted with a 1 or 2 in the last 20 messages'),
	async execute(interaction: CommandInteraction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true });

			const channel = interaction.channel;
			const messages = await channel?.messages.fetch({ limit: 50 });

			if (messages !== undefined) {
				// Flip the order to go from oldest to newest
				const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

				for (const [, message] of sortedMessages) {
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
					console.log('1 reactions:', alphabetizedOneUsers);
					console.log('2 reactions:', alphabetizedTwoUsers, '\n');
				}
			}

			await interaction.editReply({ content: 'Check console.log kek' });
		}
	}
};

export default getReactionsCommand;
