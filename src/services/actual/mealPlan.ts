import { BaseService } from "./base";
import { IResponse } from "./type";
import {
    IBatchAddRecipesToMealPlansRequest,
    IBatchCreateMealPlansRequest,
    IBatchDeleteMealPlanRequest,
    IBatchMealPlanOperationResult,
    IBatchUpdateMealPlanRequest,
} from "../interface/entities/mealPlan";
import { isRecommandRecipe, removeRecommandRecipePrefix } from "../interface/entities/types";
import { RecipeSource } from "../interface/entities/recipe";

export class MealPlanService extends BaseService {
    public deleteMealPlans = async (
        mealPlans: IBatchDeleteMealPlanRequest,
    ) => {
        return this.request<IResponse<IBatchMealPlanOperationResult>>(
            "/mealplans/batch_delete",
            "POST",
            {
                data: mealPlans,
            },
        );
    };
    public createMealPlans = async (
        mealPlans: IBatchCreateMealPlansRequest,
    ) => {
        mealPlans.meal_plans.forEach((mealPlan) => {
            mealPlan.recipes.forEach((recipe) => {
                const recipeId = recipe.recipe_id;
                const from =isRecommandRecipe(recipeId) ? RecipeSource.recipe_recommend : RecipeSource.recipe_family;
                recipe.recipe_id = removeRecommandRecipePrefix(recipe.recipe_id);
                recipe.from = from;
            });
        });
        return this.request<IResponse<IBatchMealPlanOperationResult>>(
            "/mealplans/batch_create",
            "POST",
            {
                data: mealPlans,
            },
        );
    };
    public addRecipesToMealPlans = async (
        mealPlans: IBatchAddRecipesToMealPlansRequest,
    ) => {
        mealPlans.items.forEach((mealPlan) => {
            mealPlan.recipes.forEach((recipe) => {
                const recipeId = recipe.recipe_id;
                const from =isRecommandRecipe(recipeId) ? RecipeSource.recipe_recommend : RecipeSource.recipe_family;
                recipe.recipe_id = removeRecommandRecipePrefix(recipe.recipe_id);
                recipe.from = from;
            });
        });
        return this.request<IResponse<IBatchMealPlanOperationResult>>(
            "/mealplans/batch_add_recipes",
            "POST",
            {
                data: mealPlans,
            },
        );
    };
    public updateMealPlans = async (
        mealPlans: IBatchUpdateMealPlanRequest,
    ) => {
        mealPlans.items.forEach((mealPlan) => {
            mealPlan.recipes.forEach((recipe) => {
                const recipeId = recipe.recipe_id;
                const from =isRecommandRecipe(recipeId) ? RecipeSource.recipe_recommend : RecipeSource.recipe_family;
                recipe.recipe_id = removeRecommandRecipePrefix(recipe.recipe_id);
                recipe.from = from;
            });
        });
        return this.request<IResponse<IBatchMealPlanOperationResult>>(
            "/mealplans/batch_update",
            "POST",
            {
                data: mealPlans,
            },
        );
    };
}
