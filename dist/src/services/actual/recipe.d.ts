import { BaseService } from "./base";
import { IBatchCreateFamilyRecipeRequest, IBatchDeleteFamilyRecipesRequest, IBatchRecipeOperationResult, IBatchUpdateFamilyRecipeRequest } from "../interface/entities/recipe";
import { IResponse } from "./type";
export declare class RecipeService extends BaseService {
    deleteRecipes: (recipes: IBatchDeleteFamilyRecipesRequest) => Promise<IResponse<IBatchRecipeOperationResult>>;
    createRecipes: (recipes: IBatchCreateFamilyRecipeRequest) => Promise<IResponse<IBatchRecipeOperationResult>>;
    updateRecipes: (recipes: IBatchUpdateFamilyRecipeRequest) => Promise<IResponse<IBatchRecipeOperationResult>>;
}
