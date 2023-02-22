import { CommandInteraction, Client, ApplicationCommandType, 
    PermissionsBitField, SlashCommandChannelOption, ChannelType, SlashCommandStringOption } from 'discord.js';
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';
import { Command } from "../../Command";

export type Timeframe = {
    minDate: number,
    maxDate: number,
    sendDate: number
}

export const ValentineSetTimeframe: Command = {
    name: "valentine-set-timeframe",
    description: "Sets the timeframe for the valentine cards to be directly sent and when to start sending.",
    type: ApplicationCommandType.ChatInput,
    options: [
        new SlashCommandStringOption()
            .setName('min-date')
            .setDescription('Set the date for when cards are directly sent. (Format: ISO, Default: 14.02. 12:00 UTC)')
            .setRequired(false),
        new SlashCommandStringOption()
            .setName('max-date')
            .setDescription('Set the date for when sending cards stops. (Format: ISO, Default: 14.02. 24:00 UTC)')
            .setRequired(false),
        new SlashCommandStringOption()
            .setName('send-date')
            .setDescription('Set the date for when the scheduled cards will be sent. (Format: ISO, Default: Min Date)')
            .setRequired(false)
    ],
    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        const minDate = Date.parse(interaction.options.get('min-date', false)?.value?.toString().trim() ?? '');
        const maxDate = Date.parse(interaction.options.get('max-date', false)?.value?.toString().trim() ?? '');
        const sendDate = Date.parse(interaction.options.get('send-date', false)?.value?.toString().trim() ?? '');

        if (minDate || maxDate || sendDate) {
            const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + interaction.guild?.id);
            if (!creatorDatabase) {
                await interaction.followUp({ ephemeral: true, content: "Connection to database failed! Please try the command again or ask for support." });
                return;
            }
            if (minDate) creatorDatabase.set('minDate', minDate);
            if (maxDate) creatorDatabase.set('minDate', maxDate);
            if (sendDate) creatorDatabase.set('minDate', sendDate);
            // TODO
            await interaction.followUp({ephemeral: true, content: `Timeframe set!\nCurrent timeframes:\n$min date: ${minDate}`});
        } else {
            await interaction.followUp({ephemeral: true, content: `No valid timeframe was given!`});
        }
    }
};