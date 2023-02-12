import { Client } from "discord.js";
import { Jobs } from "../Jobs";
// import { Commands } from "../Commands";
// import Keyv from "keyv";
import fs from 'fs';

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        
        // Sets commands without deployment, refreshes with start of the bot, but is not restricted for one guild
        // await client.application.commands.set(Commands);
        // const database = new Keyv("sqlite://./database/valentine.sqlite"
        //     , { namespace: 'valentineCreator806687746029518898' });
        // database.delete('423150373696569344');
        
        for (const job of Jobs) {
            job(client);
        }

        console.log(`${client.user.username} is online`);
    });
};