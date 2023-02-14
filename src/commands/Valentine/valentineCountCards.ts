import { CommandInteraction, Client, ApplicationCommandType, PermissionsBitField, EmbedBuilder, SlashCommandUserOption } from 'discord.js';
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';
import { Command } from "../../Command";
import { ValentineUserData } from './valentineTypes';

export const ValentineCountCards: Command = {
    name: "valentine-count-cards",
    description: "Get an public introduction to the bot.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
    options: [new SlashCommandUserOption()
        .setName('valetine-user')
        .setDescription('Select the user to show the created cards count. (default: show for all user of this server)')
        .setRequired(false)],
    run: async (client: Client, interaction: CommandInteraction) => {
        interaction.deferReply({ ephemeral: true });
        const user = interaction.options.get('valentines-user', false);
        let content = 'No Data found!';

        const valetinesDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + interaction.guild?.id);
        if (!valetinesDatabase) {
            await interaction.followUp({ephemeral: true, content: 'Database connection failed!'});
            return;
        }

        const creatorIds = user?.user ? [user.user.id] : (await valetinesDatabase.get("creatorIds")) as string[] | undefined;
        if (creatorIds) {
            for (let creatorId of creatorIds) {
                const valentineData = (await valetinesDatabase.get(creatorId)) as ValentineUserData | undefined;
                const cardCount = valentineData?.greetings?.length ?? 0;
                content += `<@${creatorId}> created ${cardCount} valentine cards!\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Valetine card count:')
            .setColor(0xC191EF)
            .setDescription(content);

        await interaction.followUp({ ephemeral: true, embeds: [embed] });
    }
};