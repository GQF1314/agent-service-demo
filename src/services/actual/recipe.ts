import { BaseService } from "./base";
import {
    IBatchCreateFamilyRecipeRequest,
    IBatchDeleteFamilyRecipesRequest,
    IBatchRecipeOperationResult,
    IBatchUpdateFamilyRecipeRequest,
    RecipeSource,
} from "../interface/entities/recipe";
import { IResponse } from "./type";
import { isRecommandRecipe, removeRecommandRecipePrefix } from "../interface/entities/types";

export class RecipeService extends BaseService {
    public deleteRecipes = async (
        recipes: IBatchDeleteFamilyRecipesRequest,
    ) => {
        // 只删除family_recipe，recommand_recipe不能删除
        recipes.ids = recipes.ids.filter((id) => !isRecommandRecipe(id));
        return this.request<IResponse<IBatchRecipeOperationResult>>(
            "/recipes/batch_delete",
            "POST",
            {
                data: recipes,
            },
        );
    };
    public createRecipes = async (recipes: IBatchCreateFamilyRecipeRequest) => {
        return this.request<IResponse<IBatchRecipeOperationResult>>(
            "/recipes/batch_create",
            "POST",
            {
                data: recipes,
            },
        );
    };
    public updateRecipes = async (recipes: IBatchUpdateFamilyRecipeRequest) => {
        const idTransedRecipes = recipes.items.map((recipe) => ({
            ...recipe,
            from: isRecommandRecipe(recipe.id) ? RecipeSource.recipe_recommend : RecipeSource.recipe_family,
            id: removeRecommandRecipePrefix(recipe.id),
        }));
        // todo 这里有一个问题，recommand_recipe不能更新，更新实际为新创建一个family_recipe 关联到recommand_recipe,要用单独的接口，但是没有实现
        return this.request<IResponse<IBatchRecipeOperationResult>>(
            "/recipes/batch_update",
            "POST",
            {
                data: {items: idTransedRecipes},
            },
        );
    };
}
