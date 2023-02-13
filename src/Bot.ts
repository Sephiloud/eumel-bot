import { Client, GatewayIntentBits, ClientOptions } from "discord.js";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
const token = process.env.TOKEN;

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

if (token) {
	client.login(token);
} else {
	console.log("No valid token was provided.")
}