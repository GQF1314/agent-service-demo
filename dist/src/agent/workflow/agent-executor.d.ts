import { AgentContext } from "../context/model";
import { AgentName } from "../types/agent";
export declare class AgentExecutor {
    private context;
    private agentName;
    constructor(context: AgentContext);
    executeAgent(agentName: AgentName): Promise<void>;
    private generateAgentResponse;
    private selectModel;
    private buildSystemMessage;
    private selectTools;
}
