/**
 * Search API TypeScript interface definitions
 * Complete type definitions based on Go backend SearchHandler
 */
import { ICommonContext } from "../../agent/types/agent";
import { IEventEntity } from "../interface/entities/event";
import { IMealPlanEntity, MealType } from "../interface/entities/mealPlan";
import { IFamilyRecipeEntity } from "../interface/entities/recipe";
import { IShoppingItemEntity } from "../interface/entities/shoopingItem";
import { ITaskEntity } from "../interface/entities/task";
import { BaseService } from "./base";
import { CalendarService } from "./calendar";
import { MealPlanService } from "./mealPlan";
import { RecipeService } from "./recipe";
import { ShoppingItemService } from "./shoppingItem";
import { TaskService } from "./task";
import { IEntityType, IResponse } from "./type";
export declare enum SearchCategory {
    recipe = "recipe",
    mealplan = "mealplan",
    shopping = "shopping",
    event = "event",
    task = "task"
}
export declare enum CustomSearchCategory {
    recipe = "recipe",
    mealplan = "mealplan",
    shopping = "shopping",
    event = "event",
    task = "task"
}
export interface SearchRequest {
    category: SearchCategory[];
    query?: string;
    recipe_filter?: RecipeSourceVecFilter;
    mealplan_filter?: MealplanFilter;
    tasks_filter?: TaskVecFilter;
    event_filter?: EventVecFilter;
    shopping_filter?: GroceryListVecFilter;
    limit: number;
}
export interface FamilyRecipeVecFilter {
    tags: string[];
    recipe_allergic_tag: string[];
    ids: string[];
}
export interface RecipeSourceVecFilter {
    ids: {
        family_recipe_id?: string;
        recipe_source_id?: string;
    }[];
}
export interface MealplanFilter {
    start_at?: string;
    end_at?: string;
    meal_type?: MealType;
    ids: string[];
}
export interface TaskVecFilter {
    attendees: string[];
    end_at?: string;
    start_at?: string;
    ids: string[];
    is_completed?: boolean;
}
export interface EventVecFilter {
    ids: string[];
    attendees: string[];
    end_at?: string;
    start_at?: string;
}
export interface GroceryListVecFilter {
    ids: string[];
}
interface SearchEntityResponseWrapper<T> {
    items?: T[] | null;
}
export interface CustomSearchRequest {
    category: CustomSearchCategory[];
    query?: string;
    recipe_filter?: {
        ids: string[];
    };
    mealplan_filter?: {
        start?: string;
        end?: string;
        meal_type?: MealType;
        ids: string[];
    };
    tasks_filter?: {
        attendee_ids: string[];
        start?: string;
        end?: string;
        ids: string[];
        is_checked?: boolean;
    };
    event_filter?: {
        attendee_ids: string[];
        start?: string;
        end?: string;
        ids: string[];
        is_checked?: boolean;
    };
    shopping_filter?: {
        ids: string[];
    };
    limit: number;
}
export interface SearchResponse {
    recipes: SearchEntityResponseWrapper<IFamilyRecipeEntity>;
    mealplans: SearchEntityResponseWrapper<IMealPlanEntity>;
    shoppings: SearchEntityResponseWrapper<IShoppingItemEntity>;
    tasks: SearchEntityResponseWrapper<ITaskEntity>;
    event: SearchEntityResponseWrapper<IEventEntity>;
}
interface DeleteEntityRequest {
    taskIds?: string[];
    eventIds?: string[];
    recipeIds?: string[];
    mealPlanIds?: string[];
    shoppingIds?: string[];
}
export declare class CombinedService extends BaseService {
    private depServices;
    constructor(context: Omit<ICommonContext, "services">, depServices: {
        calendarService: CalendarService;
        taskService: TaskService;
        recipeService: RecipeService;
        mealPlanService: MealPlanService;
        shoppingService: ShoppingItemService;
    });
    searchEntity: (request: CustomSearchRequest) => Promise<IResponse<SearchResponse>>;
    deleteEntity: (request: DeleteEntityRequest) => Promise<{
        type: IEntityType;
        item: ITaskEntity | IEventEntity | IFamilyRecipeEntity | IMealPlanEntity | IShoppingItemEntity | null;
    }[]>;
}
export declare const convertCustomSearchRequestToSearchRequest: (request: CustomSearchRequest) => SearchRequest;
export {};
