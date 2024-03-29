# Draft League Bot
This is a Discord bot used for Pokémon draft leagues.

## Installation
Download the code locally to a location of personal choice.

Make sure you have Node installed.

Run `npm install`.

### .env Configuration
TOKEN=

CLIENT_ID=

GOOGLE_SPREADSHEET_ID=

GOOGLE_SERVICE_ACCOUNT=

## Scripts
`npm run dev` used for local testing and development

`npm run build` used to compile the code

`npm run deploy-commands` used to deploy new commands*

`npm run start` used for production*

*These commands will run `npm run build` first automatically.

## Slash Commands
### get-pickems
Returns the messages and reactions in a channel based on the user's specifications.

### update-player-names
Updates the sheet names and coach names in a Google spreadsheet.

## Julian Clause
1. Open Command Prompt (not as an administrator)
2. Type `cd draft-league-bot`, then hit enter
3. Type `git pull`, then hit enter
4. Type `npm run dev`, then hit enter
5. Run a slash command in Discord
___
*draft-league-bot was created by Alex Brodnciki and Prateek Bansal.*
