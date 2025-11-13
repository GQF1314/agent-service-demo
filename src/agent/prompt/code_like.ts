//@ts-nocheck
enum RecurrenceType {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
  }

export type CommandType=
'createEvents' | 'createTasks'  | 'createShoppingItems' | 'createRecipes' | 'createMealPlans'|
'updateEvents' | 'updateTasks' | 'updateShoppingItems' | 'updateRecipes' | 'updateMealPlans'|
'deleteEvents' | 'deleteTasks' | 'deleteShoppingItems' | 'deleteRecipes' | 'deleteMealPlans'|
'getEvents' | 'getTasks' | 'getShoppingItems' | 'getRecipes' | 'getMealPlans'|
'searchEvents' | 'searchTasks' | 'searchShoppingItems' | 'searchRecipes' | 'searchMealPlans'|
'intelligentWebSearch'| 'writtingArticle'


    //event
interface IEvent{
    title:string;
    startTime:string;
    endTime:string;
    description:string;
    location:string;
    isAllDay:boolean;
    isRecurring:boolean;
    recurrenceType:RecurrenceType;
    recurrenceEnd:string;
    color:string;
    attendeeIds:string[];
}
interface ITask{
    title:string;
    description:string;
    status:TaskStatus;
    priority:TaskPriority;
    dueDate:string;
    completedAt:string;
    taskListId:string;
    taskList:ITaskList;
    creatorId:string;
    creator:IUser;
    assigneeId:string;
    assignee:IUser;
    familyId:string;
}
interface IShoppingItem{

}
// 假设DifficultyLevel枚举已定义如下
enum DifficultyLevel {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    EXPERT = "EXPERT"
  }
  
  interface Ingredient {
    /** Ingredient name */
    name: string;
    /** Quantity */
    quantity: string;
    /** Unit */
    unit: string;
    /** Notes */
    notes?: string | null;
  }
  
  interface Instruction {
    /** Step number */
    stepNumber: number;
    /** Instruction text */
    instructionText: string;
    /** Timer duration */
    timerDuration?: string | null;
  }
  
  interface IRecipe {
    /** Recipe title */
    title: string;
    /** Recipe description */
    description?: string | null;
    /** Ingredients list, each ingredient contains name, quantity, unit, and optional notes */
    ingredients: Ingredient[];
    /** Instructions, each step contains step number, instruction text, and optional timer duration */
    instructions: Instruction[];
    /** Preparation time in minutes */
    prepTimeMinutes?: number | null;
    /** Cooking time in minutes */
    cookTimeMinutes?: number | null;
    /** Servings */
    servings?: number | null;
    /** Servings unit */
    servingsUnit?: string | null;
    /** Cuisine */
    cuisine?: string | null;
    /** Difficulty level, optional values: EASY, MEDIUM, HARD, EXPERT */
    difficultyLevel?: DifficultyLevel | null;
    /** Image URL */
    imageUrl?: string | null;
  }
interface IMealPlan{

}

interface ICreateEventsParams{
    events:IEvent[];
}
interface ICreateTasksParams{
    tasks:ITask[];
}
interface ICreateShoppingItemsParams{
    shoppingItems:IShoppingItem[];
}
interface ICreateRecipesParams{ 
    recipes:IRecipe[];
}
interface ICreateMealPlansParams{
    mealPlans:IMealPlan[];
}
interface IUpdateEventsParams{
    events:IEvent[];
}
interface IUpdateTasksParams{
    tasks:ITask[];
}
interface IUpdateShoppingItemsParams{
    shoppingItems:IShoppingItem[];
}
interface IUpdateRecipesParams{
    recipes:IRecipe[];  
}
interface IUpdateMealPlansParams{
    mealPlans:IMealPlan[];
}
interface IDeleteEventsParams{
    eventIds:string[];
}
interface IDeleteTasksParams{
    taskIds:string[];
}
interface IDeleteShoppingItemsParams{
    shoppingItemIds:string[];
}
interface IDeleteRecipesParams{
    recipeIds:string[];
}
interface IDeleteMealPlansParams{
    mealPlanIds:string[];
}
interface IGetEventsParams{
    eventIds:string[];
}
interface IGetTasksParams{
    taskIds:string[];
}
interface IGetShoppingItemsParams{
    shoppingItemIds:string[];
}   
interface IGetRecipesParams{
    recipeIds:string[];
}
interface IGetMealPlansParams{
    mealPlanIds:string[];
}
interface ISearchEventsParams{
    keyword:string;
    rangeStart:string;
    rangeEnd:string;
}   
interface ISearchTasksParams{
    keyword:string;
    rangeStart:string;
    rangeEnd:string;
}   
interface ISearchShoppingItemsParams{
    keyword:string;
}   
interface ISearchRecipesParams{
    keyword:string;

}   
interface ISearchMealPlansParams{
    keyword:string;
    date:string;
}   
interface IIntelligentWebSearchParams{
    keyword:string;
}   
interface IWrittingArticleParams{
    topic:string;
    brief:string;
}   

export type CommandParamsMapping={
    createEvents:ICreateEventsParams;
    createTasks:ICreateTasksParams;
    createShoppingItems:ICreateShoppingItemsParams;
    createRecipes:ICreateRecipesParams;
    createMealPlans:ICreateMealPlansParams;
    updateEvents:IUpdateEventsParams;
    updateTasks:IUpdateTasksParams;
    updateShoppingItems:IUpdateShoppingItemsParams;
    updateRecipes:IUpdateRecipesParams; 
    updateMealPlans:IUpdateMealPlansParams;
    deleteEvents:IDeleteEventsParams;
    deleteTasks:IDeleteTasksParams;
    deleteShoppingItems:IDeleteShoppingItemsParams;
    deleteRecipes:IDeleteRecipesParams;
    deleteMealPlans:IDeleteMealPlansParams;
    getEvents:IGetEventsParams;
    getTasks:IGetTasksParams;
    getShoppingItems:IGetShoppingItemsParams;
    getRecipes:IGetRecipesParams;
    getMealPlans:IGetMealPlansParams;
    searchEvents:ISearchEventsParams;
    searchTasks:ISearchTasksParams;
    searchShoppingItems:ISearchShoppingItemsParams;
    searchRecipes:ISearchRecipesParams;
    searchMealPlans:ISearchMealPlansParams;
    intelligentWebSearch:IIntelligentWebSearchParams;
}