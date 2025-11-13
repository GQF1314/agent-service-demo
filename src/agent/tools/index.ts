// Calendar Service Tools
import * as calendarTools from './calendar';

// Shopping Service Tools
import * as shoppingTools from './shopping';

// Meal Plan Service Tools
import * as mealPlanTools from './mealPlan';

// Recipe Service Tools
import * as recipeTools from './recipe';

// Task Service Tools
import * as taskTools from './task';

// Common Service Tools
import * as systemTools from './system';
import * as combinedTools from './combined';
import { IAgentContext } from '../types/agent';

// Tool name constants
import {
  CALENDAR_TOOLS,
  TASK_TOOLS,
  MEAL_PLAN_TOOLS,
  RECIPE_TOOLS,
  SHOPPING_TOOLS,
  ENTITIES_TOOLS,
  SYSTEM_TOOLS,
  ToolName,
} from './constants';


export const getTools = (context: IAgentContext) => {
    return {
        // Calendar tools
        [CALENDAR_TOOLS.CREATE_EVENTS]: calendarTools.createEventTool({ ...context, toolName: CALENDAR_TOOLS.CREATE_EVENTS }),
        [CALENDAR_TOOLS.UPDATE_EVENTS]: calendarTools.updateEventTool({ ...context, toolName: CALENDAR_TOOLS.UPDATE_EVENTS }),
        [CALENDAR_TOOLS.SEARCH_EVENTS]: calendarTools.searchEventsTool({ ...context, toolName: CALENDAR_TOOLS.SEARCH_EVENTS }),
        [CALENDAR_TOOLS.DELETE_EVENTS]: calendarTools.deleteEventTool({ ...context, toolName: CALENDAR_TOOLS.DELETE_EVENTS }),

        // Task tools
        [TASK_TOOLS.CREATE_TASKS]: taskTools.createTaskTool({ ...context, toolName: TASK_TOOLS.CREATE_TASKS }),
        [TASK_TOOLS.UPDATE_TASKS]: taskTools.updateTaskTool({ ...context, toolName: TASK_TOOLS.UPDATE_TASKS }),
        [TASK_TOOLS.SEARCH_TASKS]: taskTools.searchTaskTool({ ...context, toolName: TASK_TOOLS.SEARCH_TASKS }),
        [TASK_TOOLS.DELETE_TASKS]: taskTools.deleteTaskTool({ ...context, toolName: TASK_TOOLS.DELETE_TASKS }),

        // MealPlan tools
        [MEAL_PLAN_TOOLS.CREATE_MEAL_PLANS]: mealPlanTools.createMealPlanTool({ ...context, toolName: MEAL_PLAN_TOOLS.CREATE_MEAL_PLANS }),
        [MEAL_PLAN_TOOLS.UPDATE_MEAL_PLANS]: mealPlanTools.updateMealPlanTool({ ...context, toolName: MEAL_PLAN_TOOLS.UPDATE_MEAL_PLANS }),
        [MEAL_PLAN_TOOLS.SEARCH_MEAL_PLANS]: mealPlanTools.searchMealPlanTool({ ...context, toolName: MEAL_PLAN_TOOLS.SEARCH_MEAL_PLANS }),
        [MEAL_PLAN_TOOLS.DELETE_MEAL_PLANS]: mealPlanTools.deleteMealPlanTool({ ...context, toolName: MEAL_PLAN_TOOLS.DELETE_MEAL_PLANS }),

        // Recipe tools
        [RECIPE_TOOLS.CREATE_RECIPES]: recipeTools.createRecipeTool({ ...context, toolName: RECIPE_TOOLS.CREATE_RECIPES }),
        [RECIPE_TOOLS.UPDATE_RECIPES]: recipeTools.updateRecipeTool({ ...context, toolName: RECIPE_TOOLS.UPDATE_RECIPES }),
        [RECIPE_TOOLS.SEARCH_RECIPES]: recipeTools.searchRecipeTool({ ...context, toolName: RECIPE_TOOLS.SEARCH_RECIPES }),
        [RECIPE_TOOLS.DELETE_RECIPES]: recipeTools.deleteRecipeTool({ ...context, toolName: RECIPE_TOOLS.DELETE_RECIPES }),

        // Shopping tools
        [SHOPPING_TOOLS.CREATE_SHOPPING_ITEMS]: shoppingTools.createShoppingItemTool({ ...context, toolName: SHOPPING_TOOLS.CREATE_SHOPPING_ITEMS }),
        [SHOPPING_TOOLS.UPDATE_SHOPPING_ITEMS]: shoppingTools.updateShoppingItemTool({ ...context, toolName: SHOPPING_TOOLS.UPDATE_SHOPPING_ITEMS }),
        [SHOPPING_TOOLS.SEARCH_SHOPPING_ITEMS]: shoppingTools.searchShoppingItemTool({ ...context, toolName: SHOPPING_TOOLS.SEARCH_SHOPPING_ITEMS }),
        [SHOPPING_TOOLS.DELETE_SHOPPING_ITEMS]: shoppingTools.deleteShoppingItemTool({ ...context, toolName: SHOPPING_TOOLS.DELETE_SHOPPING_ITEMS }  ),

        // Entity tools
        [ENTITIES_TOOLS.SEARCH_ENTITIES]: combinedTools.searchEntityTool({ ...context, toolName: ENTITIES_TOOLS.SEARCH_ENTITIES }),
        [ENTITIES_TOOLS.DELETE_ENTITIES]: combinedTools.deleteEntityTool({ ...context, toolName: ENTITIES_TOOLS.DELETE_ENTITIES }),

        // System tools
        [SYSTEM_TOOLS.REPLY_TO_USER]: systemTools.replyToUserTool({ ...context, toolName: SYSTEM_TOOLS.REPLY_TO_USER }),
        [SYSTEM_TOOLS.INTELLIGENT_SEARCH]: systemTools.webSearchTool({ ...context, toolName: SYSTEM_TOOLS.INTELLIGENT_SEARCH }),
        [SYSTEM_TOOLS.READ_URL]:systemTools.readUrlTool({...context,toolName:SYSTEM_TOOLS.READ_URL})
        // system_writeMemoryTool: systemTools.writeMemoryTool({ ...context, toolName: 'system_writeMemoryTool' }),
        // common_writtingTool: writtingTool({ ...context, toolName: 'writing_writtingTool' }),
    } as const;

}
/**
 * Private tools for each small agent, not called by complex agents
 */
export const privateTools: ToolName[] = [
  CALENDAR_TOOLS.SEARCH_EVENTS,
  CALENDAR_TOOLS.DELETE_EVENTS,
  MEAL_PLAN_TOOLS.SEARCH_MEAL_PLANS,
  MEAL_PLAN_TOOLS.DELETE_MEAL_PLANS,
  RECIPE_TOOLS.SEARCH_RECIPES,
  RECIPE_TOOLS.DELETE_RECIPES,
  TASK_TOOLS.SEARCH_TASKS,
  TASK_TOOLS.DELETE_TASKS,
  SHOPPING_TOOLS.SEARCH_SHOPPING_ITEMS,
  SHOPPING_TOOLS.DELETE_SHOPPING_ITEMS,
];


