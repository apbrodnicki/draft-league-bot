const fs = require('node:fs');
const path = require('node:path');

const addCommands = (commands) => {
	const foldersPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(foldersPath);

	for (const file of commandFiles) {
		const filePath = path.join(foldersPath, file);
		const command = require(filePath);

		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			Array.isArray(commands) ?
				commands.push(command.data.toJSON()) :
				commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	return commands;
};

module.exports = { addCommands };