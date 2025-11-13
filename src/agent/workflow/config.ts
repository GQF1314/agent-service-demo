import { specPrompt } from "../prompt/spec";
import { AgentConfigMap } from "../types/agent";
import {
    CHAT_AGENT_PROMPT,
    CALENDAR_AGENT_PROMPT,
    TASK_AGENT_PROMPT,
    MEAL_AGENT_PROMPT,
    SHOPPING_AGENT_PROMPT,
} from "../prompt/prompts";
import {
    CALENDAR_TOOLS,
    TASK_TOOLS,
    MEAL_PLAN_TOOLS,
    RECIPE_TOOLS,
    SHOPPING_TOOLS,
    SYSTEM_TOOLS,
} from "../tools/constants";

export const AGENT_CONFIG_MAP: AgentConfigMap = {
    shopping_list: {
        prompt: SHOPPING_AGENT_PROMPT,
        toolsParams: {
            agentName: 'shopping_list',
        },
        toolsPick: [
            SHOPPING_TOOLS.CREATE_SHOPPING_ITEMS,
            SHOPPING_TOOLS.UPDATE_SHOPPING_ITEMS,
            SHOPPING_TOOLS.DELETE_SHOPPING_ITEMS,
            SHOPPING_TOOLS.SEARCH_SHOPPING_ITEMS,
            SYSTEM_TOOLS.INTELLIGENT_SEARCH,
            SYSTEM_TOOLS.REPLY_TO_USER,
            SYSTEM_TOOLS.READ_URL
        ],
    },
    calendar: {
        prompt: CALENDAR_AGENT_PROMPT,
        toolsParams: {
            agentName: 'calendar',
        },
        toolsPick: [
            CALENDAR_TOOLS.CREATE_EVENTS,
            CALENDAR_TOOLS.UPDATE_EVENTS,
            CALENDAR_TOOLS.SEARCH_EVENTS,
            CALENDAR_TOOLS.DELETE_EVENTS,
            SYSTEM_TOOLS.INTELLIGENT_SEARCH,
            SYSTEM_TOOLS.REPLY_TO_USER,
            SYSTEM_TOOLS.READ_URL
        ],
    },
    task: {
        prompt: TASK_AGENT_PROMPT,
        toolsParams: {
            agentName: 'task',
        },
        toolsPick: [
            TASK_TOOLS.CREATE_TASKS,
            TASK_TOOLS.UPDATE_TASKS,
            TASK_TOOLS.SEARCH_TASKS,
            TASK_TOOLS.DELETE_TASKS,
            SYSTEM_TOOLS.INTELLIGENT_SEARCH,
            SYSTEM_TOOLS.REPLY_TO_USER,
            SYSTEM_TOOLS.READ_URL
        ],
    },
    recipe_and_meal_plan: {
        prompt: MEAL_AGENT_PROMPT,
        toolsParams: {
            agentName: 'recipe_and_meal_plan',
        },
        toolsPick: [
            RECIPE_TOOLS.CREATE_RECIPES,
            RECIPE_TOOLS.UPDATE_RECIPES,
            RECIPE_TOOLS.SEARCH_RECIPES,
            RECIPE_TOOLS.DELETE_RECIPES,
            MEAL_PLAN_TOOLS.CREATE_MEAL_PLANS,
            MEAL_PLAN_TOOLS.UPDATE_MEAL_PLANS,
            MEAL_PLAN_TOOLS.SEARCH_MEAL_PLANS,
            MEAL_PLAN_TOOLS.DELETE_MEAL_PLANS,
            SYSTEM_TOOLS.INTELLIGENT_SEARCH,
            SYSTEM_TOOLS.REPLY_TO_USER,
            SYSTEM_TOOLS.READ_URL

        ],
    },
    super: {
        prompt: specPrompt,
        toolsParams: {
            agentName: 'super',
        },
    },
    self: {
        prompt: 'no prompt',
        toolsParams: {
            agentName: 'self',
        },
        toolsPick: [SYSTEM_TOOLS.REPLY_TO_USER],
    },
    chat: {
        prompt: CHAT_AGENT_PROMPT,
        toolsParams: {
            agentName: 'chat',
        },
        toolsPick: [SYSTEM_TOOLS.INTELLIGENT_SEARCH, SYSTEM_TOOLS.REPLY_TO_USER, SYSTEM_TOOLS.READ_URL],
    }
};
