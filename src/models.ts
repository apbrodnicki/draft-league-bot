import { type CommandInteraction, type ReactionManager, type SlashCommandBuilder } from 'discord.js';

export interface CommandModule {
	default: Command,
};

export interface Command {
	data: SlashCommandBuilder,
	execute: (interaction: CommandInteraction) => Promise<void>,
};
export interface Message {
	content: string,
	reactions: ReactionManager,
	createdTimestamp: number,
}
