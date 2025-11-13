import { AgentContext } from "../context/model";
import { AgentName } from "../types/agent";
export declare const generalRules: (context: AgentContext) => string;
export declare const toolUseRules: () => string;
export declare const calendarRules: (context: AgentContext) => string;
export declare const taskRules: (context: AgentContext) => string;
export declare const recipeAndMealPlanRules: () => string;
export declare const shoppingRules: () => string;
export declare const composeRules: (context: AgentContext, agentName: AgentName) => string;
