/**
 * Tool name constants definition
 * All tool names are centrally managed here for easy maintenance and refactoring
 */
export declare const CALENDAR_TOOLS: {
    readonly SEARCH_EVENTS: "calendar_searchEvents";
    readonly UPDATE_EVENTS: "calendar_updateEvents";
    readonly DELETE_EVENTS: "calendar_deleteEvents";
    readonly CREATE_EVENTS: "calendar_createEvents";
};
export declare const TASK_TOOLS: {
    readonly SEARCH_TASKS: "task_searchTasks";
    readonly UPDATE_TASKS: "task_updateTasks";
    readonly DELETE_TASKS: "task_deleteTasks";
    readonly CREATE_TASKS: "task_createTasks";
};
export declare const MEAL_PLAN_TOOLS: {
    readonly SEARCH_MEAL_PLANS: "mealPlan_searchMealPlans";
    readonly UPDATE_MEAL_PLANS: "mealPlan_updateMealPlans";
    readonly CREATE_MEAL_PLANS: "mealPlan_createMealPlans";
    readonly DELETE_MEAL_PLANS: "mealPlan_deleteMealPlans";
};
export declare const RECIPE_TOOLS: {
    readonly SEARCH_RECIPES: "recipe_searchRecipes";
    readonly UPDATE_RECIPES: "recipe_updateRecipes";
    readonly CREATE_RECIPES: "recipe_createRecipes";
    readonly DELETE_RECIPES: "recipe_deleteRecipes";
};
export declare const SHOPPING_TOOLS: {
    readonly CREATE_SHOPPING_ITEMS: "shopList_createShoppingItems";
    readonly UPDATE_SHOPPING_ITEMS: "shopList_updateShoppingItems";
    readonly SEARCH_SHOPPING_ITEMS: "shopList_searchShoppingItems";
    readonly DELETE_SHOPPING_ITEMS: "shopList_deleteShoppingItems";
};
export declare const ENTITIES_TOOLS: {
    readonly SEARCH_ENTITIES: "combined_searchEntities";
    readonly DELETE_ENTITIES: "combined_deleteEntities";
};
export declare const SYSTEM_TOOLS: {
    readonly INTELLIGENT_SEARCH: "system_intelligentSearch";
    readonly REPLY_TO_USER: "system_replyToUser";
    readonly READ_URL: "system_readUrl";
};
export type ToolName = typeof CALENDAR_TOOLS[keyof typeof CALENDAR_TOOLS] | typeof TASK_TOOLS[keyof typeof TASK_TOOLS] | typeof MEAL_PLAN_TOOLS[keyof typeof MEAL_PLAN_TOOLS] | typeof RECIPE_TOOLS[keyof typeof RECIPE_TOOLS] | typeof SHOPPING_TOOLS[keyof typeof SHOPPING_TOOLS] | typeof ENTITIES_TOOLS[keyof typeof ENTITIES_TOOLS] | typeof SYSTEM_TOOLS[keyof typeof SYSTEM_TOOLS];
export declare const ALL_TOOL_NAMES: ToolName[];
