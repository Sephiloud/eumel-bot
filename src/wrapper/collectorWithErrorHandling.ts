import { MappedInteractionTypes, MessageComponentType } from "discord.js"

export default function collectorWithErrorHandling<T extends MessageComponentType>
    (collectorHandler: (collected: MappedInteractionTypes[T]) => Promise<void>, errorMessage?: string) {
    return async (collected: MappedInteractionTypes[T]) => {
            try {
                await collectorHandler(collected);
            } catch (error) {
                console.error(errorMessage ?? 'Error executing Collector Handler:');
                console.error(error);
                if (collected.replied || collected.deferred) {
                    await collected.editReply({ content: 'There was an error while executing this command!' });
                    return;
                }
                await collected.update({ content: 'There was an error while executing this command!' });
            }
}}