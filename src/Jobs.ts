import { Client } from "discord.js";
import { valentineSendJob } from "./jobs/valentineSendJob";

export const Jobs: ((client: Client) => void)[] = [valentineSendJob];