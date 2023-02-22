import { CommandInteraction, Client, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType, CollectedInteraction, SlashCommandStringOption, UserSelectMenuInteraction, StringSelectMenuInteraction, User, ActionRow, GuildMember, SlashCommandUserOption, TextChannel, TextBasedChannel } from "discord.js";
import { Command } from "../../Command";
import { ValentineUserData, Greeting, UnfinishedGreeting } from "./valentineTypes";
import { DatabaseName, getKeyvDatabase } from "../../database/databaseFunctions";
import { ValentineMessages } from "./valentineMessages.json";
import collectorWithErrorHandling from "../../wrapper/collectorWithErrorHandling";
import { Timeframe } from "./valentineSetTimeframe";

export const ValentineSet: Command = {
    name: "valentine-set",
    description: "Create a valentine card for a person you like!",
    type: ApplicationCommandType.ChatInput,
    options: [
        new SlashCommandStringOption()
            .setName('custome-message')
            .setDescription('Write your own message instead of selecting one of the predefined.')
            .setRequired(false),
        new SlashCommandUserOption()
            .setName('target-user')
            .setDescription('Set the target user inline. (recommended for mobile devices)')
            .setRequired(false)
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const uniqueId = Date.now().toString();
        const customMessage = interaction.options.get('custome-message')?.value;
        const targetUser = interaction.options.get('target-user')?.user;

        const userSelection = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            new UserSelectMenuBuilder().setCustomId('valentineUser' + ' ' + uniqueId)
                .setPlaceholder('Select target user!')
        );

        const components: ActionRowBuilder<any>[] = [userSelection];

        ValentineMessages.forEach((messageArray, arrayKey) => {
            const selectMenuOptions = messageArray.map((message, key) => {
                return {
                    label: message,
                    value: message
                }
            });
            components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`valentineSentence ${uniqueId} ${arrayKey}`)
                    .setPlaceholder(arrayKey > 0 ? 'More message options!' : 'Select a message!')
                    .addOptions(selectMenuOptions)
            ));
        });
        
        const {embeds, content, button: finishButton} = await handleSelection(uniqueId, 'valentineBoth', 
            (interaction.member as GuildMember), [targetUser?.id, customMessage?.toString()]);
        if (finishButton) components.push(finishButton);

		const message = await interaction.reply({ content: content ? content : `Select one user and one message to create a valentine card for the 14.02.2023!`, 
            embeds: embeds, ephemeral: true, components});
        const filter = (interaction: CollectedInteraction) => interaction.isStringSelectMenu() || interaction.isUserSelectMenu();
        const selectCollector = message.createMessageComponentCollector({ filter, time: 120000 });
        const buttonCollector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
        
        selectCollector.on('collect', collectorWithErrorHandling(async collected => {
            if (!collected.isStringSelectMenu() && !collected.isUserSelectMenu()) return;
            const idArray = collected.customId.split(' ');
            const customId = idArray[0];
            const uniqueID = idArray[1];

            if ((customId === 'valentineUser' || customId === 'valentineSentence') && collected.member) {
                await collected.deferUpdate();
                const replyElements = await handleSelection(uniqueID, customId, (collected.member as GuildMember), collected.values[0]);
            
                const componentsCopy = collected.message.components.slice();
                componentsCopy.splice(componentsCopy.findIndex(component => 
                    component.components[0].type === ComponentType.Button), 1);
                const newComponents = replyElements.button ? [...componentsCopy, replyElements.button] : [];

                collected.editReply({...replyElements, components: newComponents});
            }
        }, `Error executing Select Menu Handler of ${interaction.commandName}:`));

        buttonCollector.on('collect', collectorWithErrorHandling(async collected => {
            const idArray = collected.customId.split(' ');
            const customId = idArray[0];
            const uniqueID = idArray[1];

            // Finish button section
            if (customId === 'valentinePrimary') {
                await collected.deferUpdate();

                let description = "Couldn't save the valentines card. Please retry the whole command!";

                const guildDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + collected.guild?.id);
                const currentValentineData = (await guildDatabase?.get(collected.user.id)) as ValentineUserData | undefined;

                if (currentValentineData && guildDatabase) {
                    const unfinishedGreetingIndex = currentValentineData.unfinishedGreetings.findIndex(
                        greeting => greeting.uniqueID === uniqueID);
                    let unfinishedGreeting = unfinishedGreetingIndex >= 0 ? 
                        currentValentineData.unfinishedGreetings[unfinishedGreetingIndex] : undefined;
                        
                    if (unfinishedGreeting && unfinishedGreeting.targetID && unfinishedGreeting.greeting) {
                        currentValentineData.greetings.push(unfinishedGreeting as Greeting);
                        currentValentineData.unfinishedGreetings = [];
                        guildDatabase.set(collected.user.id, currentValentineData);
                        description = "Finished! Card was added and edit won't work anymore!"

                        let creatorIds = (await guildDatabase.get('creatorIds')) as string[] | undefined ?? [];
                        if (!creatorIds.indexOf) {creatorIds = []}
                        if (creatorIds.indexOf(collected.user.id) === -1) {
                            creatorIds.push(collected.user.id)
                            guildDatabase.set('creatorIds', creatorIds);
                        }

                        const database = await getKeyvDatabase(DatabaseName.Valentine)
                        if (database) {
                            let valentineGuilds = (await database.get('valentineGuilds')) as string[] | undefined;
                            if (!valentineGuilds && collected.guild) { 
                                valentineGuilds = [collected.guild.id]; 
                            } else if (valentineGuilds && collected.guild && valentineGuilds.indexOf(collected.guild.id) < 0) { 
                                valentineGuilds.push(collected.guild.id); 
                            }
                            database.set('valentineGuilds', valentineGuilds)
                        } else { 
                            description = 'Card was saved, but the server id couldn\'t be added. Please add another Card or ask for support.'; 
                        }

                        if (collected.guildId && await isValentineInTimeframe(collected.guildId)) {
                            const channelId = (await guildDatabase?.get('channel')) as string | undefined ?? '0';
                            const channel: TextBasedChannel | null = (client.channels.cache.get(channelId) as TextBasedChannel | undefined) 
                                ?? interaction.channel;

                            if (channel) {
                                const greeting = unfinishedGreeting as Greeting;
                                const embed = new EmbedBuilder()
                                    .setTitle("<:ECv_loveletter:1072685269414846554> **YOU'VE GOT MAIL!**")
                                    .setColor(0xFFC0CB)
                                    .setThumbnail("https://cdn.discordapp.com/emojis/1072685307855646801.webp")
                                    .setDescription(`${greeting.greeting.replaceAll('\\n', '\n')}`);
                                channel.send({content: `<@${greeting.targetID}> has received a Valentine!`, embeds: [embed]});
                            }
                        }
                    }
                }
                
                const embed = new EmbedBuilder()
                    .setColor(0xC191EF)
                    .setTitle('Finish Informations:')
                    .setDescription(description);
                
                await collected.editReply({ content: '', embeds: [embed], components: []});
            }
        }, `Error executing Button Handler of ${interaction.commandName}:`));
    }
};

async function handleSelection(uniqueID: string, customId: "valentineSentence" | "valentineUser" | "valentineBoth", member: GuildMember, 
    value?: string | (string | undefined)[]) : Promise<{content?: string, embeds?: EmbedBuilder[], button?: ActionRowBuilder<ButtonBuilder>}> {
        const creatorData = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + member.guild?.id);
        if (!creatorData) {
            return { content: "Connection to database failed! Please try the command again or ask for support." };
        }

        let disableButton = true;

        let unfinishedGreeting: UnfinishedGreeting | null = null;
        if ((value && !(value instanceof Array)) || (value instanceof Array && (value[0] || value[1]))) {
            let currentValentineData = (await creatorData.get(member.id)) as ValentineUserData | undefined;
            if (!currentValentineData) {
                currentValentineData = {tag: member.user.tag, id: member.id, 
                    greetings: [], unfinishedGreetings: []}
            }

            const unfinishedGreetingIndex = currentValentineData.unfinishedGreetings.findIndex(
                greeting => greeting.uniqueID === uniqueID);
            unfinishedGreeting = unfinishedGreetingIndex >= 0 ? 
                currentValentineData.unfinishedGreetings[unfinishedGreetingIndex]
                : null;
            if (!unfinishedGreeting) { unfinishedGreeting = {uniqueID} }

            if (customId === 'valentineSentence' && !(value instanceof Array)) { unfinishedGreeting.greeting = value.replaceAll('\\n', '\n') } 
            else if (customId === 'valentineUser' && !(value instanceof Array)) { unfinishedGreeting.targetID = value }
            else if (customId === 'valentineBoth' && (value instanceof Array)) {
                if (value[0]) { unfinishedGreeting.targetID = value[0] }
                if (value[1]) { unfinishedGreeting.greeting = value[1] }
            }

            if (unfinishedGreetingIndex >= 0) {
                currentValentineData.unfinishedGreetings[unfinishedGreetingIndex] = unfinishedGreeting;
            } else { currentValentineData.unfinishedGreetings.push(unfinishedGreeting) }
            creatorData.set(member.id, currentValentineData);
            if (unfinishedGreeting.targetID && unfinishedGreeting.greeting) { disableButton = false }
        }

        const finishButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('valentinePrimary' + ' ' + uniqueID)
                .setLabel('Finish!')
                .setDisabled(disableButton)
                .setStyle(ButtonStyle.Primary),
        );

        const embed = new EmbedBuilder()
            .setColor(0xC191EF)
            .setTitle('Selections:')
            .setURL('https://discord.js.org/')
            .addFields([
                {name: 'Selected User:', value: (unfinishedGreeting?.targetID ? `<@${unfinishedGreeting.targetID}>` : 'None') },
                {name: 'Selected Message:', value: (unfinishedGreeting?.greeting ? `${unfinishedGreeting.greeting}` : 'None') }
            ]);

        return { embeds: [embed], button: finishButton };
}

async function isValentineInTimeframe(guildId: string) {
    const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + guildId);
    const timeframe = creatorDatabase?.get("timeFrame") as Timeframe | undefined;
    if (timeframe && timeframe.minDate <= Date.now() && Date.now() <= timeframe.maxDate) {
        return true;
    }
    return false;
}