import { UTCString } from "./types";

// Shopping item and recipe association type
interface ShoppingWithRecipe {
  recipe_id: string;
  recipe_name: string;
}

// Shopping item response type
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
// Update shopping item request type

// Batch update shopping item type
interface IBatchUpdateShoppingItem {
  id: string;
  title?: string | null;
  quantity?: string | null;
  unit?: string | null;
  recipe_ids?: string[];
  assets_url?: string | null;
  category_id?: string | null;
}

// ========== Three batch operation request types ==========

// 1. Batch create shopping items request
export interface IBatchCreateShoppingRequest {
  items: string[];
}

// 2. Batch update shopping items request
export interface IBatchUpdateShoppingRequest {
  items: IBatchUpdateShoppingItem[];
}

// 3. Batch delete shopping items request
export interface IBatchDeleteShoppingRequest {
  ids: string[];
}

// ========== Unified batch operation response types ==========

// Unified batch operation response type (for create, update, delete)
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

export function convertShoppingEntityToItem(shoppingItem: IShoppingItemEntity): IShoppingItem {
  return {
    id: shoppingItem.id,
    title: shoppingItem.title,
    quantity: shoppingItem.quantity,
    unit: shoppingItem.unit,
    is_checked: shoppingItem.is_checked,
    checked_at: shoppingItem.checked_at,
    checked_by_role: shoppingItem.checked_by_role,
    assets: shoppingItem.assets,
    category_id: shoppingItem.category_id,
    used_by_family_recipes: shoppingItem.used_by_family_recipes,
  };
}