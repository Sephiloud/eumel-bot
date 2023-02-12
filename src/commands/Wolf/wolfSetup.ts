import { CommandInteraction, Client, ApplicationCommandType, 
  PermissionsBitField, SlashCommandChannelOption, ChannelType, 
  ButtonBuilder, UserSelectMenuBuilder, ChannelSelectMenuBuilder, ButtonStyle } from 'discord.js';
import { Command } from "../../Command";
import { SlashCommandStringOption, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { DatabaseName, getKeyvDatabase } from '../../database/databaseFunctions';

export const WolfSetup: Command = {
    name: "wolf-setup",
    description: "Setups a new game of werewolf!",
    type: ApplicationCommandType.ChatInput,
    options: [new SlashCommandChannelOption()
            .setName('game-channel')
            .addChannelTypes(ChannelType.GuildText)
            .setDescription('Select the channel for the game session.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('')
    ],
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply({ephemeral: true});

        const uniqueId = Date.now().toString();

        const selectMemberOptions = ['a', 'b', 'c'].map((value, key) => {
            return {
                label: value,
                description: 'blupp',
                value: value
            }
        });

        const description = "Select the channel for global game message, all users to play the game with and the roles for this Game.\n"
            + "Caution: If you select more roles than players the creation will fail! "
            + "It will also fail if you don't select at least one clear evil and good role and not enough space to fill them up!\n"
            + "If you select less roles than player, the roles will be filled based on your options:\n"
            + "Default: The Game selects basic villager and wolfs to get closer to 0 balance. (And At least one good and evil role.)\n"
            + "Random-All: Uses pre selected roles, at least one good and evil role and fills up the rest with random roles considering the balance tolerance.\n"
            + "Selection-Random: The Game will select random roles from you pre selection if you have more roles than player. Otherwise it equals default mode."
            + "Balance Tolerance: Set a minimum and maximum for the game to balance the game."
                + "Consider the game priorizes at least one good and evil role in the game and in default mode it tries to get close "
                + "to the center of the tolerance range. In other modes it randomizes the roles and accepts any selection "
                + "with at least one good and evil role and a balance in the tolerance range!"
            + "Role Multiplication: In default and selection random mode roles can selected multiple times if you want. But in Random-All you can say which roles are allowed multiple times (1-3 times)."
            + "Voice Features: Activates voice channel rules. Werewolfs can communicate open and are muted for other people. "
                + "Villager can get voice activities like talking with one other person for a short period of time."
            + "Same Role Communication: Allows people with the same role to communicate or lovers made by armor."
            + "Chat Hints: Villager and some small roles can get every night a small hint or talk/write with someone if voice or chat features are activated."
            + "Show Deaths: Someone or no one died"
            + "Show Death count: 0, 1, 2, .. people died this night."
            + "Hunter kills in the open: Hunters selection after death is public otherwise it is a secret and just counts to the death count of the night."
            + "Show roles after death (Both, morning, evening, none): Every morning the roles of the night death are revealed and in the evening the roles of the selected"
            + "Someone has to die: Selection has to end with an death. Have two or more persons the same votes all of them will die. If no one is selected a random person dies"
            + "Open or Secret Selection: Self explanatory"
            + "Select no one: Selection phase only ends if every players makes a choice, but None is a valid option if this option is activated."
            + "Wolfs have to kill: Wolfs have to try to kill someone every night."
            + "Wolfs can kill each other: self explanatory"
            + "Wolf unclear decision handling: Random means one of the selected will be killed randomly (only those with most votes are possible), Chief means one of the wolfs will be chief wolf and choose the one to be killed"
            + "Wolf selection Always random: Vote count is not important, one of the selected victims is chosen randomly"
            + "Chat Features: Create private threads for people to write for a short period of time and wolfs and all villagers have own thread. Own thread if same role communication is activated."
            + "Communication Rules: Set for yourself some rules like it is forbidden to talk about their own rule in the public but allowed in pricate talks/chats with chat/voice features.";

        const channelSelection = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder().setCustomId('valentineUser' + ' ' + uniqueId)
                .setPlaceholder('Select channel for global game messages!')
        );

        const userSelection = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            new UserSelectMenuBuilder().setCustomId('valentineUser' + ' ' + uniqueId)
                .setPlaceholder('Select all users for this game session!')
        );

        const roleSelection = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('valentineSentence' + ' ' + uniqueId)
                .setPlaceholder('Select the roles for this game.')
                .addOptions(selectMemberOptions)
        );

        const finishButton = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('valentinePrimary' + ' ' + uniqueId)
					.setLabel('Finish!')
                    .setDisabled(true)
					.setStyle(ButtonStyle.Primary),
			);

        const wolfDatabase = getKeyvDatabase(DatabaseName.Wolf);
    }
};