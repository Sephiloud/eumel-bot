export type Greeting = {
  uniqueID: string,
  targetID: string,
  greeting: string
};
export type UnfinishedGreeting = {
  uniqueID: string,
  targetID?: string,
  greeting?: string
};
export type ValentineUserData = {
  tag: string,
  id: string,
  greetings: Greeting[],
  unfinishedGreetings: UnfinishedGreeting[]
};
export type TextChannelWithSend = Extract<import("discord.js").TextBasedChannel, { send: Function }>;