import { type CommandInteraction, SlashCommandBuilder } from 'discord.js';

const getReactionsCommand = {
	data: new SlashCommandBuilder()
		.setName('getreactions')
		.setDescription('Console logs who reacted with 1 or 2 in the last 50 messages'),
	async execute(interaction: CommandInteraction) {
		const channel = interaction.channel;
		const messages = await channel?.messages.fetch({ limit: 20 });

		messages?.forEach(message => {
			const oneReactions = message.reactions.cache.get('1️⃣');
			const twoReactions = message.reactions.cache.get('2️⃣');

			oneReactions?.users
				.fetch()
				.then(allUsers => {
					const users = allUsers.map((user) => user.globalName);
					console.log(' Users who reacted with 1 to :' + message.content + ': ' + Array.from(users).join(', '));
					// interaction.channel.send(`${users} who reacted with 1`);
				})
				.catch((error) => {
					console.log(error);
				});

			twoReactions?.users
				.fetch()
				.then(allUsers => {
					const users = allUsers.map((user) => user.globalName);
					console.log(' Users who reacted with 2 to : ' + message.content + ' : ' + Array.from(users).join(', '));
					// interaction.channel.send(`${users} who reacted with 2`);
				})
				.catch((error) => {
					console.log(error);
				});
		});

		await interaction.reply({ content: 'Check console.log kek', ephemeral: true });
	}
};

export default getReactionsCommand;
