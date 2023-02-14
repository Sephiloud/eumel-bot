import { CommandInteraction, Client, Interaction, Events } from "discord.js";
import { Commands } from "../Commands";

export default (client: Client): void => {
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      	try {
            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
                await handleSlashCommand(client, interaction);
            }
        } catch (error) {
            console.error('Fatal execution Error!');
            console.error(error);	
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
        return;
    }

    try {
        await slashCommand.run(client, interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: 'There was an error while executing this command!' });
            return;
        }
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
};
