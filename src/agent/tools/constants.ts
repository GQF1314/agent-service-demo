/**
 * Tool name constants definition
 * All tool names are centrally managed here for easy maintenance and refactoring
 */

// Calendar tool names
export const CALENDAR_TOOLS = {
  SEARCH_EVENTS: 'calendar_searchEvents',
  UPDATE_EVENTS: 'calendar_updateEvents', 
  DELETE_EVENTS: 'calendar_deleteEvents',
  CREATE_EVENTS: 'calendar_createEvents',
} as const;

// Task tool names
export const TASK_TOOLS = {
  SEARCH_TASKS: 'task_searchTasks',
  UPDATE_TASKS: 'task_updateTasks',
  DELETE_TASKS: 'task_deleteTasks',
  CREATE_TASKS: 'task_createTasks',
} as const;

// MealPlan tool names
export const MEAL_PLAN_TOOLS = {
  SEARCH_MEAL_PLANS: 'mealPlan_searchMealPlans',
  UPDATE_MEAL_PLANS: 'mealPlan_updateMealPlans',
  CREATE_MEAL_PLANS: 'mealPlan_createMealPlans',
  DELETE_MEAL_PLANS: 'mealPlan_deleteMealPlans',
} as const;

// Recipe tool names
export const RECIPE_TOOLS = {
  SEARCH_RECIPES: 'recipe_searchRecipes',
  UPDATE_RECIPES: 'recipe_updateRecipes',
  CREATE_RECIPES: 'recipe_createRecipes',
  DELETE_RECIPES: 'recipe_deleteRecipes',
} as const;

// Shopping tool names
export const SHOPPING_TOOLS = {
  CREATE_SHOPPING_ITEMS: 'shopList_createShoppingItems',
  UPDATE_SHOPPING_ITEMS: 'shopList_updateShoppingItems',
  SEARCH_SHOPPING_ITEMS: 'shopList_searchShoppingItems',
  DELETE_SHOPPING_ITEMS: 'shopList_deleteShoppingItems',
} as const;

// Entities tool names
export const ENTITIES_TOOLS = {
  SEARCH_ENTITIES: 'combined_searchEntities',
  DELETE_ENTITIES: 'combined_deleteEntities',
} as const;

// System tool names
export const SYSTEM_TOOLS = {
  // CODE_INTERPRETER: 'system_codeInterpreter',
  INTELLIGENT_SEARCH: 'system_intelligentSearch',
  REPLY_TO_USER: 'system_replyToUser',
  READ_URL: 'system_readUrl',
} as const;

// Union type of all tool names
export type ToolName = 
  | typeof CALENDAR_TOOLS[keyof typeof CALENDAR_TOOLS]
  | typeof TASK_TOOLS[keyof typeof TASK_TOOLS]
  | typeof MEAL_PLAN_TOOLS[keyof typeof MEAL_PLAN_TOOLS]
  | typeof RECIPE_TOOLS[keyof typeof RECIPE_TOOLS]
  | typeof SHOPPING_TOOLS[keyof typeof SHOPPING_TOOLS]
  | typeof ENTITIES_TOOLS[keyof typeof ENTITIES_TOOLS]
  | typeof SYSTEM_TOOLS[keyof typeof SYSTEM_TOOLS];

// Array of all tool names
export const ALL_TOOL_NAMES: ToolName[] = [
  ...Object.values(CALENDAR_TOOLS),
  ...Object.values(TASK_TOOLS),
  ...Object.values(MEAL_PLAN_TOOLS),
  ...Object.values(RECIPE_TOOLS),
  ...Object.values(SHOPPING_TOOLS),
  ...Object.values(ENTITIES_TOOLS),
  ...Object.values(SYSTEM_TOOLS),
];
