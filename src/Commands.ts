import { Command } from "./Command";
import { ValentineSetChannel } from "./commands/Valentine/valentineSetChannel";
import { ValentineSet } from "./commands/Valentine/valentineSet";
import { ValentineShow } from "./commands/Valentine/valentineShow";
import { ValentineDelete } from './commands/Valentine/valentineDelete';
import { ValentineHelp, ValentineHelpPublic } from "./commands/Valentine/valentineHelp";
import { ValentineCountCards } from "./commands/Valentine/valentineCountCards";

export const Commands: Command[] = [ValentineSet, ValentineSetChannel, ValentineShow, 
    ValentineDelete, ValentineHelp, ValentineHelpPublic, ValentineCountCards];