import { Client, GatewayIntentBits, ClientOptions } from "discord.js";
import { token } from './config.json';
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

console.log("Bot is starting...");

const client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

ready(client);
interactionCreate(client);

client.login(token);