import { BaseService } from "./base";
import {
    IBatchCreateShoppingRequest,
    IBatchDeleteShoppingRequest,
    IBatchShoppingItemResponse,
    IBatchUpdateShoppingRequest,
} from "../interface/entities/shoopingItem";
import { IResponse } from "./type";

export class ShoppingItemService extends BaseService {
    public deleteShoppingItems = async (
        shoppingItems: IBatchDeleteShoppingRequest,
    ) => {
        return this.request<IResponse<IBatchShoppingItemResponse>>(
            "/shoppings/batch_delete",
            "POST",
            {
                data: shoppingItems,
            },
        );
    };
    public createShoppingItems = async (
        shoppingItems: IBatchCreateShoppingRequest,
    ) => {
        return this.request<IResponse<IBatchShoppingItemResponse>>(
            "/shoppings/batch_add",
            "POST",
            {
                data: shoppingItems,
            },
        );
    };
    public updateShoppingItems = async (
        shoppingItems: IBatchUpdateShoppingRequest,
    ) => {
        return this.request<IResponse<IBatchShoppingItemResponse>>(
            "/shoppings/batch_update",
            "POST",
            {
                data: shoppingItems,
            },
        );
    };
    // public searchRecipes = async (recipes: ISearchRecipesRequest) => {
    //     return this.request<IBatchRecipeOperationResult>('/recipes/search', 'POST', {
    //         data: recipes
    //     });
    // }
}
