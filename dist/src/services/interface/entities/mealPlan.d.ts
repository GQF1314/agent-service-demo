import { IngredientList } from "./types";
export declare enum MealType {
    Breakfast = "Breakfast",
    Lunch = "Lunch",
    Dinner = "Dinner",
    Snack = "Snack"
}
export interface MealplanRecipeRequest {
    recipe_id: string;
    mealplan_servings: number;
    from?: string;
}
interface MealPlanRecipeResponseItem {
    id: string;
    name: string;
    cooking_time?: number | null;
    servings?: string | null;
    sort: number;
    tags: string[];
    allergy_tags: string[];
    ingredients: IngredientList;
}
export interface IMealPlanEntity {
    id: string;
    family_id: string;
    date: string;
    meal_type: string;
    calories: number;
    nutrition_info: string;
    note?: string | null;
    is_deleted: boolean;
    deleted_at?: string | null;
    deleted_by_user?: string | null;
    deleted_by_role?: string | null;
    created_by_role?: string | null;
    created_by_user?: string | null;
    created_at: string;
    updated_at: string;
    recipes: MealPlanRecipeResponseItem[];
}
interface CreateMealPlanRequest {
    date?: string | null;
    meal_type?: MealType | null;
    calories?: number | null;
    nutrition_info?: string | null;
    note?: string | null;
    recipes: MealplanRecipeRequest[];
}
interface AddRecipesToMealPlanItem {
    date: string;
    meal_type: MealType;
    recipes: MealplanRecipeRequest[];
}
interface UpdateMealPlanRequest {
    id?: string | null;
    date?: string | null;
    meal_type?: MealType | null;
    calories?: number | null;
    nutrition_info?: string | null;
    note?: string | null;
    recipes: MealplanRecipeRequest[];
}
export interface IBatchCreateMealPlansRequest {
    meal_plans: CreateMealPlanRequest[];
}
export interface IBatchAddRecipesToMealPlansRequest {
    items: AddRecipesToMealPlanItem[];
}
export interface IBatchUpdateMealPlanRequest {
    items: UpdateMealPlanRequest[];
}
export interface IBatchDeleteMealPlanRequest {
    ids: string[];
}
export interface IBatchMealPlanOperationResult {
    meal_plans: IMealPlanEntity[];
}
export interface IMealPlan {
    id: string;
    date: string;
    meal_type: string;
    calories: number;
    nutrition_info: string;
    note?: string | null;
    recipes: MealPlanRecipeResponseItem[];
}
export declare function convertMealPlanEntityToItem(mealPlan: IMealPlanEntity): IMealPlan;
export {};
