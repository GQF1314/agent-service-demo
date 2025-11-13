import { AgentContext } from "../context/model";
import { AgentExecutor } from "./agent-executor";
import { createMiniRouter } from "./router-utils";
import { ErrorCode, errorStringify } from "../../constants";
import { AgentName } from "../types/agent";

export async function handlOff(context: AgentContext, agentName: AgentName) {
    const executor = new AgentExecutor(context);
    return await executor.executeAgent(agentName);
}
export async function sayEntry(context: AgentContext){
    try {        
        const routerResult = await createMiniRouter(context);
        const {route,output} = routerResult;
        context.logger.info(`routerResult: %o`, { route, output });
        if (route === 'self') {
            context.replyManual({ content: output!, agentName: 'self' });
            // context.reportError({ agentName: 'self', error: { code: ErrorCode.ROUTE_ERROR, message: JSON.stringify({route,output}) } });
            return output!;
        }
        // const handOff={
        //     type:'turn.handoff',
        //     id:uuidv4(),
        //     timestamp:Date.now(),
        //     agentName:route,
        // }
        // context.report(handOff);
        await handlOff(context, route);
    } catch (error) {
        return context.reportError({ agentName: 'self', error: { code: ErrorCode.UNKNOWN_ROUTE_ERROR, message: errorStringify(error) } });
    }
}

