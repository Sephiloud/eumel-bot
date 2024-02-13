import { CommandInteraction, Client, ApplicationCommandType, SlashCommandChannelOption, ChannelType, 
    TextChannel, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { Command } from "../../Command";

const content = "<a:ECv_blackrose:1207085877109457077>  **VALENTINE'S CARDS** <a:ECv_purplerose:1207085976644755466> \n\n"
    + "This month, you can send little Valentine's cards to members of The Eumelcord. All cards will be anonymous and will not be "
    + "revealed until the 14th of February. \n\n"
    + "<:ECv_purpleheart:1207085960215662602> **WHAT IT IS**\n"
    + "This little event is meant to spread positivity and kindness. The cards aren't necessarily romantic. "
    + "Their purpose is to bring a smile to someone's face because I imagine, even if you don't know who sent it, "
    + "it'll make you happy to know someone appreciates you and your friendship. Who wouldn't be happy about "
    + "receiving some kind words? \n\n"
    + "<:ECv_chocoheart:1207085895904399380>  **HOW IT WORKS**\n"
    + "To send a card, you'll use `/valentine-set`. You can either enter a custom message or choose one from our text options.\n"
    + "> The member field is where you will select the member that shall receive the card.\n"
    + "> The card field is a selection of available little cute messages, which you can freely choose.\n"
    + "After you’re done, click the *Finish* button below. This only works if you've selected a member and entered or selected a "
    + "message. The message will then be scheduled and posted by pinging the selected user on the 14th of February. This is anonym, "
    + "of course, so the pinged user will not know who sent them the card.\n\n"
    + "<:ECv_neonrose:1207085941462925393>  **THE COMMANDS**\n"
    + "`/valentine-set` — to send a card; optionally, you can add a custom text (emojis work as well; for a new line just write `\\n` ; "
    + "you can use all normal inline adjustments like `\*` for bold or italic; mentions of member or roles is also possible).\n"
    + "`/valentine-show` — shows your current cards, IDs, and who you send them to.\n"
    + "`/valentine-help` — posts this explanation as secret message\n"
    + "`/valentine-delete [unique-id]` — deletes one of your cards; just put in the right ID.\n\n"
    + "<:ECv_chocoheart2:1207085913243648121>  **BADGE**\n"
    + "If you send 14 cards or more, you'll receive a special badge after the event! You can check your card count and look at "
    + "who you have already sent one by using `/valentine-show`. \n\n"
    + "<:ECv_loveletter:1207085927634042933>  *Cards can be sent until Wednesday, February 14, 2024, 11 PM CET.*";

export const ValentineHelp: Command = {
    name: "valentine-help",
    description: "Get an introduction to the bot.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});

        const embed = new EmbedBuilder()
            .setColor(0xC191EF)
            .setDescription(content);

        await interaction.followUp({ephemeral: true, embeds: [embed]});
    }
};

export const ValentineHelpPublic: Command = {
    name: "valentine-help-public",
    description: "Get an public introduction to the bot.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    options: [new SlashCommandChannelOption()
        .setName('valentines-explanation-channel')
        .addChannelTypes(ChannelType.GuildText)
        .setDescription('Select the channel for the explanation to be posted. (default: execution channel)')
        .setRequired(false)],
    run: async (client: Client, interaction: CommandInteraction) => {
        const channel = interaction.options.get('valentines-explanation-channel', false);

        const embed = new EmbedBuilder()
            .setColor(0xC191EF)
            .setDescription(content);

        if (channel?.channel) {
            await interaction.reply({ephemeral: true, content: `The valentine bot explanation will be sent to <#${channel.channel.id}>`});
            await (channel.channel as TextChannel).send({ embeds: [embed] });
            return;
        }

        await interaction.reply({ephemeral: true, content: `The valentine bot explanation will be sent to <#${interaction.channelId}>`});
        await (interaction.channel as TextChannel).send({ embeds: [embed] });
    }
};
