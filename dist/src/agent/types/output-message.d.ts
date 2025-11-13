import { TextStreamPart } from "ai";
import { AgentName } from "./agent";
export type IOutputMessage = {
    timestamp: number;
    agentName: AgentName;
} & TextStreamPart<any>;
