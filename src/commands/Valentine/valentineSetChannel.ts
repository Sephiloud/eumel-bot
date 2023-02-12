import { CommandInteraction, Client, ApplicationCommandType, 
    PermissionsBitField, SlashCommandChannelOption, ChannelType } from 'discord.js';
import Keyv from "keyv";
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';
import { Command } from "../../Command";

export const ValentineSetChannel: Command = {
    name: "valentine-set-channel",
    description: "Sets the channel for the valentine cards to be sent!",
    type: ApplicationCommandType.ChatInput,
    options: [new SlashCommandChannelOption()
        .setName('valentines-channel')
        .addChannelTypes(ChannelType.GuildText)
        .setDescription('Select the channel for the valentine messages.')
        .setRequired(true)],
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        const channel = interaction.options.get('valentines-channel', true);

        const channelId = channel.channel?.id;
        if (channelId) {
            const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + interaction.guild?.id);
            if (!creatorDatabase) {
                await interaction.followUp({ ephemeral: true, content: "Connection to database failed! Please try the command again or ask support." });
                return;
            }
            creatorDatabase.set('channel', channelId);
            await interaction.followUp({ephemeral: true, content: `The channel for valentine messages was changed to <#${channelId}>`});
        } else {
            await interaction.followUp({ephemeral: true, content: `No valid channel was given!`});
        }
    }
};