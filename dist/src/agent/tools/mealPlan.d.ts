import { MealType } from "../../services/interface/entities/mealPlan";
export declare const createMealPlanTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    mealPlans: {
        date: string;
        meal_type: MealType;
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
export declare const updateMealPlanTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    mealPlans: {
        meal_type: MealType;
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
export declare const deleteMealPlanTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
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
export declare const searchMealPlanTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query?: string | null | undefined;
    start?: string | null | undefined;
    end?: string | null | undefined;
    ids?: string[] | null | undefined;
    meal_type?: MealType | null | undefined;
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/mealPlan").IMealPlanEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/mealPlan").IMealPlan[];
    };
}>;
