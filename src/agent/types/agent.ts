import { ToolName } from "../tools/constants";
import { ModelMessage } from "ai";
import { PinoLogger } from "hono-pino";
import { LocalService } from "../../services/actual/localService";
import { CalendarService } from "../../services/actual/calendar";
import { TaskService } from "../../services/actual/task";
import { IChatInfo, IFamilyInfo, IUserBrief } from "../../types/presentation-input";
import { CombinedService } from "../../services/actual/combined";
import { RecipeService } from "../../services/actual/recipe";
import { MealPlanService } from "../../services/actual/mealPlan";
import { ShoppingItemService } from "../../services/actual/shoppingItem";
export interface ICommonContext {
    traceId: string;
    familyId: string;
    chatInfo: IChatInfo;
    familyInfo: IFamilyInfo;
    userBrief: IUserBrief;
    userId: string;
    summary: string;
    messages:ModelMessage[];
    timeZone: string;
    logger: PinoLogger;
    services: {
        calendarService: CalendarService,
        taskService: TaskService,
        localService: LocalService,
        combinedService: CombinedService,
        recipeService: RecipeService,
        mealPlanService: MealPlanService,
        shoppingService: ShoppingItemService,
        // conversationService:ConversationService
    }
}
export interface IAgentContext extends ICommonContext {
    agentName: AgentName;

}

export type AgentName = 'calendar' | 'task' | 'super' | 'recipe_and_meal_plan' | 'self' | 'chat' | 'shopping_list';
export const agentNames: AgentName[] = ['calendar', 'task', 'super', 'recipe_and_meal_plan', 'self', 'chat', 'shopping_list'];
export enum AgentNameEnum {
    calendar = 'calendar',
    task = 'task',
    super = 'super',
    recipe_and_meal_plan = 'recipe_and_meal_plan',
    //self = 'self',
    chat = 'chat',
    shopping_list = 'shopping_list',
}
export interface AgentConfig {
    prompt: string;
    toolsParams: {
        agentName: AgentName;
    };
    toolsPick?: ToolName[];
}

export type AgentConfigMap = Record<AgentName, AgentConfig>;

export interface RouterResult {
    route: AgentName;
    output?: string;
}