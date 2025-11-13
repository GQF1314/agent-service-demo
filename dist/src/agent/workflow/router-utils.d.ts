import { AgentContext } from "../context/model";
import { RouterResult } from "../types/agent";
export declare function createMiniRouter(context: AgentContext): Promise<RouterResult>;
export declare function validateRouterResult(result: RouterResult): {
    isValid: boolean;
    error?: string;
};
