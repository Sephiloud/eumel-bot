import { REST, Routes, SlashCommandBuilder, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Commands } from './Commands';
const token = process.env.TOKEN ?? '';
const clientId = process.env.CLIENT_ID ?? '';
const guilds = process.env.GUILDS?.split(' ') ?? [];

const commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
for (const command of Commands) {
  const slashCommand = new SlashCommandBuilder();
  let addOptions = false;
  for (const key of Object.keys(command)) {
    switch (key) {
      case 'defaultMemberPermissions':
        command.defaultMemberPermissions ? slashCommand.setDefaultMemberPermissions(command.defaultMemberPermissions.toString()) : null;
        break;
      case 'description':
        command.description ? slashCommand.setDescription(command.description) : null;
        break;
      case 'descriptionLocalizations':
        command.descriptionLocalizations ? slashCommand.setDescriptionLocalizations(command.descriptionLocalizations) : null;
        break;
      case 'dmPermission':
        command.dmPermission ? slashCommand.setDMPermission(command.dmPermission) : null;
        break;
      case 'name':
        command.name ? slashCommand.setName(command.name) : null;
        break;
      case 'nameLocalizations':
        command.nameLocalizations ? slashCommand.setNameLocalizations(command.nameLocalizations) : null;
        break;
      case 'options':
        addOptions = true;
        break;
    }
  }

  let jsonCommand = slashCommand.toJSON();
  if (addOptions) {
    jsonCommand = {...slashCommand.toJSON(), options: command.options} as RESTPostAPIChatInputApplicationCommandsJSONBody;
  }
  commandsJSON.push(jsonCommand);
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commandsJSON.length} application (/) commands.`);

    for (let guildId of guilds) {
			// The put method is used to fully refresh all commands in the guild with the current set
			const data: any = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commandsJSON }
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		}
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();