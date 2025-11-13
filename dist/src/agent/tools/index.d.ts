import { IAgentContext } from '../types/agent';
import { ToolName } from './constants';
export declare const getTools: (context: IAgentContext) => {
    readonly calendar_createEvents: import("ai").Tool<{
        events: {
            title: string;
            start: string;
            end: string;
            all_day?: boolean | undefined;
            use_default_reminders?: boolean | undefined;
            rrule?: string[] | undefined;
            attendees?: string[] | undefined;
            reminderRule?: {
                method: import("../../services/interface/entities/event").ReminderMethod;
                minutes_offset: number;
            }[] | undefined;
            location?: string | undefined;
            description?: string | undefined;
        }[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/event").IEvent | undefined)[];
            message: string | undefined;
        };
    }>;
    readonly calendar_updateEvents: import("ai").Tool<{
        updates: {
            id: string;
            title?: string | undefined;
            all_day?: boolean | undefined;
            use_default_reminders?: boolean | undefined;
            rrule?: string[] | undefined;
            attendees?: string[] | undefined;
            reminderRule?: {
                method: import("../../services/interface/entities/event").ReminderMethod;
                minutes_offset: number;
            }[] | undefined;
            location?: string | undefined;
            start?: string | undefined;
            end?: string | undefined;
            description?: string | undefined;
        }[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/event").IEvent | undefined)[];
            message: string | undefined;
        };
    }>;
    readonly calendar_searchEvents: import("ai").Tool<{
        query?: string | null | undefined;
        rangeStart?: string | null | undefined;
        rangeEnd?: string | null | undefined;
        attendeeIds?: string[] | null | undefined;
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/event").IEventEntity[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/event").IEvent | undefined)[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        ids?: undefined;
        entities?: undefined;
        modelVisibleData?: undefined;
    }>;
    readonly calendar_deleteEvents: import("ai").Tool<{
        eventIds: string[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/event").IEvent | undefined)[];
            message: string | undefined;
        };
    }>;
    readonly task_createTasks: import("ai").Tool<{
        tasks: {
            title: string;
            list_id?: string | undefined;
            description?: string | undefined;
            location?: string | undefined;
            end?: string | undefined;
            all_day?: boolean | undefined;
            rrule?: string[] | undefined;
            assignees?: string[] | undefined;
            reminderRule?: {
                method: import("../../services/interface/entities/task").ReminderMethod;
                minutes_offset: number;
            }[] | undefined;
        }[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/task").ITask | undefined)[];
            message: string | undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        ids?: undefined;
        entities?: undefined;
        modelVisibleData?: undefined;
    }>;
    readonly task_updateTasks: import("ai").Tool<{
        updates: {
            id: string;
            list_id?: string | undefined;
            title?: string | undefined;
            description?: string | undefined;
            location?: string | undefined;
            end?: string | undefined;
            all_day?: boolean | undefined;
            rrule?: string[] | undefined;
            assignees?: string[] | undefined;
            reminderRule?: {
                method: import("../../services/interface/entities/task").ReminderMethod;
                minutes_offset: number;
            }[] | undefined;
            is_completed?: boolean | undefined;
        }[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/task").ITask | undefined)[];
            message: string | undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        ids?: undefined;
        entities?: undefined;
        modelVisibleData?: undefined;
    }>;
    readonly task_searchTasks: import("ai").Tool<{
        query?: string | null | undefined;
        rangeStart?: string | null | undefined;
        rangeEnd?: string | null | undefined;
        assigneeIds?: string[] | null | undefined;
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/task").ITaskEntity[];
        modelVisibleData: {
            data: (import("../../services/interface/entities/task").ITask | undefined)[];
        };
    }>;
    readonly task_deleteTasks: import("ai").Tool<{
        taskIds: string[];
    }, {
        success: boolean;
        ids: (string | undefined)[];
        entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
        modelVisibleData: {
            data: (string | undefined)[];
            message: string | undefined;
        };
        entityType: string;
        count: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        ids?: undefined;
        entities?: undefined;
        modelVisibleData?: undefined;
        entityType?: undefined;
        count?: undefined;
    }>;
    readonly mealPlan_createMealPlans: import("ai").Tool<{
        mealPlans: {
            date: string;
            meal_type: import("../../services/interface/entities/mealPlan").MealType;
            recipes: {
                recipe_id: string;
                mealplan_servings: number;
            }[];
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/mealPlan").IMealPlanEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/mealPlan").IMealPlan[];
            message: string | undefined;
        };
    }>;
    readonly mealPlan_updateMealPlans: import("ai").Tool<{
        mealPlans: {
            meal_type: import("../../services/interface/entities/mealPlan").MealType;
            recipes: {
                recipe_id: string;
                mealplan_servings: number;
            }[];
            id?: string | null | undefined;
            date?: string | null | undefined;
            calories?: number | null | undefined;
            nutrition_info?: string | null | undefined;
            note?: string | null | undefined;
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/mealPlan").IMealPlanEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/mealPlan").IMealPlan[];
            message: string | undefined;
        };
    }>;
    readonly mealPlan_searchMealPlans: import("ai").Tool<{
        query?: string | null | undefined;
        start?: string | null | undefined;
        end?: string | null | undefined;
        ids?: string[] | null | undefined;
        meal_type?: import("../../services/interface/entities/mealPlan").MealType | null | undefined;
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/mealPlan").IMealPlanEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/mealPlan").IMealPlan[];
        };
    }>;
    readonly mealPlan_deleteMealPlans: import("ai").Tool<{
        mealPlans: {
            id: string;
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/mealPlan").IMealPlanEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/mealPlan").IMealPlan[];
            message: string | undefined;
        };
    }>;
    readonly recipe_createRecipes: import("ai").Tool<{
        items: {
            name: string;
            instructions: {
                step: number;
                content: string;
            }[];
            cooking_time?: number | null | undefined;
            servings?: number | null | undefined;
            ingredients_query?: string[] | null | undefined;
            note?: string | null | undefined;
            nutrition_info?: string | null | undefined;
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
            message: string | undefined;
        };
    }>;
    readonly recipe_updateRecipes: import("ai").Tool<{
        items: {
            id: string;
            name?: string | null | undefined;
            cooking_time?: number | null | undefined;
            servings?: number | null | undefined;
            instructions?: {
                step: number;
                content: string;
            }[] | undefined;
            note?: string | null | undefined;
            nutrition_info?: string | null | undefined;
            ingredients_query?: string[] | null | undefined;
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
            message: string | undefined;
        };
    }>;
    readonly recipe_searchRecipes: import("ai").Tool<{
        query?: string | null | undefined;
        ids?: string[] | null | undefined;
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
        };
    }>;
    readonly recipe_deleteRecipes: import("ai").Tool<{
        ids: string[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
            message: string | undefined;
        };
    }>;
    readonly shopList_createShoppingItems: import("ai").Tool<{
        items: string[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
            message: string | undefined;
        };
    }>;
    readonly shopList_updateShoppingItems: import("ai").Tool<{
        items: {
            id: string;
            title?: string | null | undefined;
            quantity?: string | null | undefined;
            unit?: string | null | undefined;
        }[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
            message: string | undefined;
        };
    }>;
    readonly shopList_searchShoppingItems: import("ai").Tool<{
        query?: string | null | undefined;
        ids?: string[] | null | undefined;
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
        };
    }>;
    readonly shopList_deleteShoppingItems: import("ai").Tool<{
        ids: string[];
    }, {
        success: boolean;
        ids: string[];
        entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
        modelVisibleData: {
            data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
            message: string | undefined;
        };
    }>;
    readonly combined_searchEntities: import("ai").Tool<{
        category: import("../../services/actual/combined").CustomSearchCategory[];
        limit: number;
        query?: string | undefined;
        recipe_filter?: {
            ids: string[];
        } | undefined;
        mealplan_filter?: {
            ids: string[];
            start?: string | undefined;
            end?: string | undefined;
            meal_type?: import("../../services/interface/entities/mealPlan").MealType | undefined;
        } | undefined;
        tasks_filter?: {
            ids: string[];
            attendee_ids: string[];
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        event_filter?: {
            ids: string[];
            attendee_ids: string[];
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        shopping_filter?: {
            ids: string[];
        } | undefined;
    }, {
        success: boolean;
        combined_entities: {
            type: import("../../services/actual/type").IEntityType;
            item: import("../../services/interface/entities/event").IEventEntity | import("../../services/interface/entities/task").ITaskEntity | import("../../services/interface/entities/mealPlan").IMealPlanEntity | import("../../services/interface/entities/recipe").IFamilyRecipeEntity | import("../../services/interface/entities/shoopingItem").IShoppingItemEntity;
        }[];
        modelVisibleData: {
            data: {
                recipes: import("../../services/interface/entities/recipe").IFamilyRecipe[] | undefined;
                mealplans: import("../../services/interface/entities/mealPlan").IMealPlan[] | undefined;
                shoppings: import("../../services/interface/entities/shoopingItem").IShoppingItem[] | undefined;
                tasks: (import("../../services/interface/entities/task").ITask | undefined)[] | undefined;
                event: (import("../../services/interface/entities/event").IEvent | undefined)[] | undefined;
            };
        };
    }>;
    readonly combined_deleteEntities: import("ai").Tool<{
        taskIds?: string[] | undefined;
        eventIds?: string[] | undefined;
        recipeIds?: string[] | undefined;
        mealPlanIds?: string[] | undefined;
        shoppingIds?: string[] | undefined;
    }, {
        success: boolean;
        ids: (string | undefined)[];
        combined_entities: {
            type: import("../../services/actual/type").IEntityType;
            item: import("../../services/interface/entities/event").IEventEntity | import("../../services/interface/entities/task").ITaskEntity | import("../../services/interface/entities/mealPlan").IMealPlanEntity | import("../../services/interface/entities/recipe").IFamilyRecipeEntity | import("../../services/interface/entities/shoopingItem").IShoppingItemEntity | null;
        }[];
        modelVisibleData: {
            data: {
                recipes: (import("../../services/interface/entities/recipe").IFamilyRecipe | undefined)[];
                mealplans: (import("../../services/interface/entities/mealPlan").IMealPlan | undefined)[];
                shoppings: (import("../../services/interface/entities/shoopingItem").IShoppingItem | undefined)[];
                tasks: (import("../../services/interface/entities/task").ITask | undefined)[];
                event: (import("../../services/interface/entities/event").IEvent | undefined)[];
            };
        };
    }>;
    readonly system_replyToUser: import("ai").Tool<{
        content: string;
        responseType: import("./utils").ReplyType;
    }, string>;
    readonly system_intelligentSearch: import("ai").Tool<{
        query: string;
    }, {
        success: boolean;
        search_results: {
            title: string;
            url: string;
        }[];
        search_summary: string;
        modelVisibleData: {
            data: {
                search_summary: string;
            };
        };
    }>;
    readonly system_readUrl: import("ai").Tool<{
        url: string;
    }, {
        success: boolean;
        modelVisibleData: {
            content: string;
        };
    }>;
};
/**
 * Private tools for each small agent, not called by complex agents
 */
export declare const privateTools: ToolName[];
