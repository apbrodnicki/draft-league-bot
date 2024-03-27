# Draft League Bot

This is a Discord bot used for Pokémon draft leagues.

## Installation

Download the code locally to a location of personal choice.

Create a .env file in the root directory and add in a `TOKEN` and `CLIENT_ID`.

Make sure you have Node installed.

Run `npm install`.

### Scripts

`npm run dev` used for local testing and development

`npm run build` used to compile the code

`npm run deploy-commands` used to deploy new commands*

`npm run start` used for production*

*These commands will run `npm run build` first automatically.

## Slash Commands

### get-pickems

Returns the messages and reactions in a channel based on the user's specifications.

### update-player-names

Updates the sheet titles and coach names in a Google spreadsheet.

## Julian Clause

1. Open Command Prompt (not as an administrator)
2. Type `cd Pickems`, then hit enter
3. Type `npm run dev`
4. Run a slash command in Discord
___

*draft-league-bot was created by Prateek Bansal and Alex Brodnicki.*
