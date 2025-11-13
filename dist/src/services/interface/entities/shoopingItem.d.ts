import { UTCString } from "./types";
interface ShoppingWithRecipe {
    recipe_id: string;
    recipe_name: string;
}
export interface IShoppingItemEntity {
    id: string;
    family_id: string;
    title: string;
    quantity?: string | null;
    unit?: string | null;
    is_checked: boolean;
    checked_at?: string | null;
    checked_by_user?: string | null;
    checked_by_role?: string | null;
    is_deleted: boolean;
    deleted_at?: string | null;
    deleted_by_user?: string | null;
    deleted_by_role?: string | null;
    created_at: UTCString;
    updated_at: UTCString;
    assets?: {
        file_key: string;
        filename: string;
        mime_type: string;
    }[];
    sort?: number | null;
    category_id?: string | null;
    used_by_family_recipes: ShoppingWithRecipe[];
}
interface IBatchUpdateShoppingItem {
    id: string;
    title?: string | null;
    quantity?: string | null;
    unit?: string | null;
    recipe_ids?: string[];
    assets_url?: string | null;
    category_id?: string | null;
}
export interface IBatchCreateShoppingRequest {
    items: string[];
}
export interface IBatchUpdateShoppingRequest {
    items: IBatchUpdateShoppingItem[];
}
export interface IBatchDeleteShoppingRequest {
    ids: string[];
}
export interface IBatchShoppingItemResponse {
    items: IShoppingItemEntity[];
}
export interface IShoppingItem {
    id: string;
    title: string;
    quantity?: string | null;
    unit?: string | null;
    is_checked: boolean;
    checked_at?: string | null;
    checked_by_role?: string | null;
    assets?: {
        file_key: string;
        filename: string;
        mime_type: string;
    }[];
    category_id?: string | null;
    used_by_family_recipes: ShoppingWithRecipe[];
}
export declare function convertShoppingEntityToItem(shoppingItem: IShoppingItemEntity): IShoppingItem;
export {};
