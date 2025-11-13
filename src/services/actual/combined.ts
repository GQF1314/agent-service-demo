/**
 * Search API TypeScript interface definitions
 * Complete type definitions based on Go backend SearchHandler
 */

import { ICommonContext } from "../../agent/types/agent";
import {
    BatchOperationResult,
    IEventEntity,
} from "../interface/entities/event";
import {
    IBatchMealPlanOperationResult,
    IMealPlanEntity,
    MealType,
} from "../interface/entities/mealPlan";
import {
    IBatchRecipeOperationResult,
    IFamilyRecipeEntity,
    RecipeSource,
} from "../interface/entities/recipe";
import {
    IBatchShoppingItemResponse,
    IShoppingItemEntity,
} from "../interface/entities/shoopingItem";
import {
    BatchTaskOperationResult,
    ITaskEntity,
} from "../interface/entities/task";
import { BaseService } from "./base";
import { CalendarService } from "./calendar";
import { MealPlanService } from "./mealPlan";
import { RecipeService } from "./recipe";
import { ShoppingItemService } from "./shoppingItem";
import { TaskService } from "./task";
import { IEntityType, IResponse } from "./type";
import { isRecommandRecipe, removeRecommandRecipePrefix } from "../interface/entities/types";

// ==================== Search request types ====================

export enum SearchCategory {
    recipe = "recipe",
    mealplan = "mealplan",
    shopping = "shopping",
    event = "event",
    task = "task",
}
export enum CustomSearchCategory {
    recipe = "recipe",
    mealplan = "mealplan",
    shopping = "shopping",
    event = "event",
    task = "task",
}
const mappingCustomSearchCategoryToSearchCategory = {
    [CustomSearchCategory.mealplan]: SearchCategory.mealplan,
    [CustomSearchCategory.shopping]: SearchCategory.shopping,
    [CustomSearchCategory.event]: SearchCategory.event,
    [CustomSearchCategory.task]: SearchCategory.task,
};
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

// ==================== Filter types ====================

export interface FamilyRecipeVecFilter {
    tags: string[];
    recipe_allergic_tag: string[];
    ids: string[];
}

export interface RecipeSourceVecFilter {
    ids: { family_recipe_id?: string; recipe_source_id?: string }[];
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

// ==================== Response types ====================

interface SearchEntityResponseWrapper<T> {
    items?: T[]|null;
}

export interface CustomSearchRequest {
    category: CustomSearchCategory[];
    query?: string;
    recipe_filter?: {
        ids:string[];
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
// Search response
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
export class CombinedService extends BaseService {
    private depServices: {
        calendarService: CalendarService;
        taskService: TaskService;
        recipeService: RecipeService;
        mealPlanService: MealPlanService;
        shoppingService: ShoppingItemService;
    };
    constructor(context: Omit<ICommonContext, "services">, depServices: {
        calendarService: CalendarService;
        taskService: TaskService;
        recipeService: RecipeService;
        mealPlanService: MealPlanService;
        shoppingService: ShoppingItemService;
    }) {
        super(context);
        this.depServices = depServices;
    }
    searchEntity = async (request: CustomSearchRequest) => {
        const transedRequest = convertCustomSearchRequestToSearchRequest(
            request,
        );
        const response = await this.request<IResponse<SearchResponse>>(
            `/${this.context.familyId}/search`,
            "POST",
            {
                data: transedRequest,
            },
        );
        return response;
    };
    deleteEntity = async (request: DeleteEntityRequest) => {
        const {
            calendarService,
            taskService,
            recipeService,
            mealPlanService,
            shoppingService,
        } = this.depServices;
        const { taskIds, eventIds, recipeIds, mealPlanIds, shoppingIds } =
            request;
        const taskReq = taskIds?.length
            ? taskService.deleteTasksWrapper(taskIds)
            : null;
        const eventReq = eventIds?.length
            ? calendarService.deleteEventsWrapper(eventIds)
            : null;
        const recipeReq = recipeIds?.length
            ? recipeService.deleteRecipes({ ids: recipeIds })
            : null;
        const mealPlanReq = mealPlanIds?.length
            ? mealPlanService.deleteMealPlans({ ids: mealPlanIds })
            : null;
        const shoppingReq = shoppingIds?.length
            ? shoppingService.deleteShoppingItems({ ids: shoppingIds })
            : null;
        const reqGroups = [
            taskReq,
            eventReq,
            recipeReq,
            mealPlanReq,
            shoppingReq,
        ];
        const entityTypeArray = [
            IEntityType.task,
            IEntityType.calendar,
            IEntityType.recipe,
            IEntityType.mealPlan,
            IEntityType.shoppingItem,
        ];
        const results = await Promise.allSettled(reqGroups);
        const entities: {
            type: IEntityType;
            item:
                | ITaskEntity
                | IEventEntity
                | IFamilyRecipeEntity
                | IMealPlanEntity
                | IShoppingItemEntity
                | null;
        }[] = [];
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                const type = entityTypeArray[index];
                if (type === IEntityType.task) {
                    const value = result.value as IResponse<
                        BatchTaskOperationResult
                    >;
                    const items = value?.data?.results ?? [];
                    items.forEach((item) => {
                        entities.push({
                            type: IEntityType.task,
                            item: item.task ?? null,
                        });
                    });
                }
                if (type === IEntityType.calendar) {
                    const value = result.value as IResponse<
                        BatchOperationResult
                    >;
                    const items = value?.data?.results ?? [];
                    items.forEach((item) => {
                        entities.push({
                            type: IEntityType.calendar,
                            item: item.event ?? null,
                        });
                    });
                }
                if (type === IEntityType.recipe) {
                    const value = result.value as IResponse<
                        IBatchRecipeOperationResult
                    >;
                    const items = value?.data?.recipes ?? [];
                    items.forEach((item) => {
                        entities.push({
                            type: IEntityType.recipe,
                            item: item,
                        });
                    });
                }
                if (type === IEntityType.mealPlan) {
                    const value = result.value as IResponse<
                        IBatchMealPlanOperationResult
                    >;
                    const items = value?.data?.meal_plans ?? [];
                    items.forEach((item) => {
                        entities.push({
                            type: IEntityType.mealPlan,
                            item: item,
                        });
                    });
                }
                if (type === IEntityType.shoppingItem) {
                    const value = result.value as IResponse<
                        IBatchShoppingItemResponse
                    >;
                    const items = value?.data?.items ?? [];
                    items.forEach((item) => {
                        entities.push({
                            type: IEntityType.shoppingItem,
                            item: item,
                        });
                    });
                }
            }
        });

        return entities;
    };
}

export const convertCustomSearchRequestToSearchRequest = (
    request: CustomSearchRequest,
): SearchRequest => {
    const categories: Set<SearchCategory> = new Set();
    request.category.map((category) => {
        if (category === CustomSearchCategory.recipe) {
            categories.add(SearchCategory.recipe);
        }
        const mappingedCategory =
            //@ts-ignore
            mappingCustomSearchCategoryToSearchCategory[category];
        if (mappingedCategory) {
            categories.add(mappingedCategory);
        }
    });
    return {
        category: Array.from(categories),
        query: request.query,
        recipe_filter: request.recipe_filter
            ? {
                ids: request.recipe_filter.ids.map((id) => {
                    return isRecommandRecipe(id)
                        ? { recipe_source_id: removeRecommandRecipePrefix(id) }
                        : { family_recipe_id: removeRecommandRecipePrefix(id) };
                }),
            }
            : undefined,
        mealplan_filter: request.mealplan_filter
            ? {
                start_at: request.mealplan_filter.start,
                end_at: request.mealplan_filter.end,
                meal_type: request.mealplan_filter.meal_type,
                ids: request.mealplan_filter.ids,
            }
            : undefined,
        tasks_filter: request.tasks_filter
            ? {
                attendees: request.tasks_filter.attendee_ids,
                start_at: request.tasks_filter.start,
                end_at: request.tasks_filter.end,
                ids: request.tasks_filter.ids,
                is_completed: request.tasks_filter.is_checked,
            }
            : undefined,
        event_filter: request.event_filter
            ? {
                attendees: request.event_filter.attendee_ids,
                start_at: request.event_filter.start,
                end_at: request.event_filter.end,
                ids: request.event_filter.ids,
            }
            : undefined,
        shopping_filter: request.shopping_filter
            ? {
                ids: request.shopping_filter.ids,
            }
            : undefined,
        limit: request.limit,
    };
};
