import { CommandInteraction, Client, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';
import { Command } from "../../Command";
import { ValentineUserData } from './valentineTypes';

export const ValentineShow: Command = {
    name: "valentine-show",
    description: "Shows all the cards you have created.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        
        const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + interaction.guild?.id);
        if (!creatorDatabase) {
            await interaction.followUp({ ephemeral: true, content: "Connection to database failed! Please try the command again or ask support." });
            return;
        }
        const currentValentineData = (await creatorDatabase.get(interaction.user.id)) as ValentineUserData | undefined;

        if (currentValentineData && currentValentineData.greetings && currentValentineData.greetings.length > 0) {
            let description = '';
            for (const greeting of currentValentineData.greetings) {
                description += `<@${greeting.targetID}> uniqueID: ${greeting.uniqueID}\n> ${greeting.greeting.replaceAll('\n', '\n> ')}\n\n`;
            }

            const embed = new EmbedBuilder()
                .setColor(0xC191EF)
                .setTitle(`You have created ${currentValentineData.greetings.length} cards!\n\n`)
                .setDescription(description);

            await interaction.followUp({ephemeral: true, embeds: [embed]});
            return;
        }
        await interaction.followUp({ephemeral: true, content: 'No Data found!'});
    }
};