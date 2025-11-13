import { IngredientList } from "./types";

// Meal type enum
export enum MealType {
  Breakfast = "Breakfast",
  Lunch = "Lunch",
  Dinner = "Dinner",
  Snack = "Snack",
}


// Meal plan recipe request type
export interface MealplanRecipeRequest {
  recipe_id: string;
  mealplan_servings: number;
  // 在service层是必填的，但是不让模型处理了，类型很难写，这里设置为可选
  from?: string;
}

// Meal plan recipe response item type
interface MealPlanRecipeResponseItem {
  id: string;
  name: string;
  cooking_time?: number | null;
  servings?: string | null;
  sort: number;
  tags: string[];
  allergy_tags: string[];
  ingredients: IngredientList; // Need to import Ingredient type from recipes module
}

// Meal plan type with recipes
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

// Create meal plan request type
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

// Update meal plan request type
interface UpdateMealPlanRequest {
  id?: string | null;
  date?: string | null;
  meal_type?: MealType | null;
  calories?: number | null;
  nutrition_info?: string | null;
  note?: string | null;
  recipes: MealplanRecipeRequest[];
}

// ========== Batch operation related types ==========

// Batch create meal plans request type
export interface IBatchCreateMealPlansRequest {
  meal_plans: CreateMealPlanRequest[];
}

// Batch add recipes to meal plans request type
export interface IBatchAddRecipesToMealPlansRequest {
  items: AddRecipesToMealPlanItem[];
}

// Batch update meal plans request type
export interface IBatchUpdateMealPlanRequest {
  items: UpdateMealPlanRequest[];
}

// Batch delete meal plans request type
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

export function convertMealPlanEntityToItem(mealPlan: IMealPlanEntity): IMealPlan {
  return {
    id: mealPlan.id,
    date: mealPlan.date,
    meal_type: mealPlan.meal_type,
    calories: mealPlan.calories,
    nutrition_info: mealPlan.nutrition_info,
    note: mealPlan.note,
    recipes: mealPlan.recipes,
  };
}
