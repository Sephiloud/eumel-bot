import { CommandInteraction, Client, ApplicationCommandType, 
    PermissionsBitField, SlashCommandChannelOption, ChannelType } from 'discord.js';
import Keyv from "keyv";
import { Command } from "../../Command";
import { SlashCommandStringOption } from 'discord.js';
import { ValentineUserData } from './valentineTypes';
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';

export const ValentineDelete: Command = {
    name: "valentine-delete",
    description: "Delete one of your cards with the uniqueId (can be seen with /valentine-show).",
    type: ApplicationCommandType.ChatInput,
    options: [new SlashCommandStringOption()
        .setName('unique-id')
        .setDescription('The unique id of the card to be deleted.')
        .setRequired(true)],
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        const uniqueId = interaction.options.get('unique-id', true).value;

        if (uniqueId?.toString()) {
            const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + interaction.guild?.id);
            if (!creatorDatabase) return;

            const currentValentineData = (await creatorDatabase.get(interaction.user.id)) as ValentineUserData | undefined;
            if (currentValentineData) {
                const greetingIndex = currentValentineData.greetings.findIndex((greeting) => greeting.uniqueID === uniqueId);
                if (greetingIndex >= 0) {
                    currentValentineData.greetings.splice(greetingIndex, 1);
                    creatorDatabase.set(interaction.user.id, currentValentineData);
                    await interaction.followUp({ephemeral: true, 
                        content: `Card with the unique id: ${uniqueId} of the user <@${interaction.user.id}> was deleted.`});
                    return;
                } 
                await interaction.followUp({ephemeral: true, content: `Card with this index was not found for user <@${interaction.user.id}>`});
            }
        } else {
            await interaction.followUp({ephemeral: true, content: `No valid unique id was given!`});
        }
    }
};