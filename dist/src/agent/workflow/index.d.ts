import { AgentContext } from "../context/model";
import { AgentName } from "../types/agent";
export declare function handlOff(context: AgentContext, agentName: AgentName): Promise<void>;
export declare function sayEntry(context: AgentContext): Promise<string | void>;
