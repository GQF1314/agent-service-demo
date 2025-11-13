import { BaseService } from "./base";
import { IBatchCreateShoppingRequest, IBatchDeleteShoppingRequest, IBatchShoppingItemResponse, IBatchUpdateShoppingRequest } from "../interface/entities/shoopingItem";
import { IResponse } from "./type";
export declare class ShoppingItemService extends BaseService {
    deleteShoppingItems: (shoppingItems: IBatchDeleteShoppingRequest) => Promise<IResponse<IBatchShoppingItemResponse>>;
    createShoppingItems: (shoppingItems: IBatchCreateShoppingRequest) => Promise<IResponse<IBatchShoppingItemResponse>>;
    updateShoppingItems: (shoppingItems: IBatchUpdateShoppingRequest) => Promise<IResponse<IBatchShoppingItemResponse>>;
}
