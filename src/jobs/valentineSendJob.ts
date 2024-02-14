import { Client, EmbedBuilder, TextChannel } from "discord.js";
import {CronJob, CronTime} from 'cron';
import { Greeting, TextChannelWithSend, ValentineUserData } from "../commands/Valentine/valentineTypes";
import { DatabaseName, getKeyvDatabase } from "../database/databaseFunctions";

export function valentineSendJob(client: Client) {
    const valentineJobTime = new CronTime('0 0 23 14 1 *', undefined, 1);
    const valentineJob = new CronJob(valentineJobTime.sendAt(), async () => {
        const database = await getKeyvDatabase(DatabaseName.Valentine);
        const valentineGuilds = (await database?.get('valentineGuilds')) as string[] | undefined;
        if (!valentineGuilds) return;

        for (const valentineGuildId of valentineGuilds) {
            const creatorDatabase = await getKeyvDatabase(DatabaseName.Valentine, 'valentineCreator' + valentineGuildId);
            const creatorIds = (await creatorDatabase?.get('creatorIds')) as string[] | undefined;
            const channelId = (await creatorDatabase?.get('channel')) as string | undefined;
            const greetings: Greeting[] = [];
            if (!creatorIds || !channelId || !creatorDatabase) return;

            for (const creatorId of creatorIds) {
                const creatorData = (await creatorDatabase.get(creatorId)) as ValentineUserData | undefined;
                if (creatorData?.greetings) greetings.push(...creatorData.greetings);
            }
            
            if (greetings.length > 0) {
                const channel = client.channels.cache.get(channelId) as TextChannelWithSend | undefined;
                if (!channel) return;
                for (const greeting of greetings) {
                        const embed = new EmbedBuilder()
                            .setTitle("<:ECv_loveletter:1072685269414846554> **YOU'VE GOT MAIL!**")
                            .setColor(0xFFC0CB)
                            .setThumbnail("https://cdn.discordapp.com/emojis/1072685307855646801.webp")
                            .setDescription(`${greeting.greeting.replaceAll('\\n', '\n')}`);
                        channel.send({content: `<@${greeting.targetID}> has received a Valentine!`, embeds: [embed]});
                }
            }
        }

        valentineJob.stop();
    }, null, true, );
}