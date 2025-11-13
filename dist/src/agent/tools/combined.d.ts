import { CustomSearchCategory } from "../../services/actual/combined";
import { IMealPlanEntity, MealType } from "../../services/interface/entities/mealPlan";
import { IFamilyRecipeEntity } from "../../services/interface/entities/recipe";
import { IShoppingItemEntity } from "../../services/interface/entities/shoopingItem";
import { ITaskEntity } from "../../services/interface/entities/task";
import { IEventEntity } from "../../services/interface/entities/event";
import { IEntityType } from "../../services/actual/type";
export declare const searchEntityTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    category: CustomSearchCategory[];
    limit: number;
    query?: string | undefined;
    recipe_filter?: {
        ids: string[];
    } | undefined;
    mealplan_filter?: {
        ids: string[];
        start?: string | undefined;
        end?: string | undefined;
        meal_type?: MealType | undefined;
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
        type: IEntityType;
        item: IEventEntity | ITaskEntity | IMealPlanEntity | IFamilyRecipeEntity | IShoppingItemEntity;
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
export declare const deleteEntityTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    taskIds?: string[] | undefined;
    eventIds?: string[] | undefined;
    recipeIds?: string[] | undefined;
    mealPlanIds?: string[] | undefined;
    shoppingIds?: string[] | undefined;
}, {
    success: boolean;
    ids: (string | undefined)[];
    combined_entities: {
        type: IEntityType;
        item: IEventEntity | ITaskEntity | IMealPlanEntity | IFamilyRecipeEntity | IShoppingItemEntity | null;
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
