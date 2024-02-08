import { type CommandInteraction, type SlashCommandBuilder } from 'discord.js';

export interface CommandModule {
	default: Command,
};

export interface Command {
	data: SlashCommandBuilder,
	execute: (interaction: CommandInteraction) => Promise<void>,
};
