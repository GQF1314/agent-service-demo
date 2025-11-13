import { ImageList, IngredientList, UTCString } from "./types";
export declare enum RecipeSource {
    recipe_family = "recipe_family",
    recipe_recommend = "recipe_recommend"
}
interface InstructionStep {
    step: number;
    content: string;
}
type InstructionList = InstructionStep[];
export interface IFamilyRecipeEntity {
    from: RecipeSource;
    id: string;
    source_recipe_id?: string | null;
    source_version_at?: UTCString | null;
    family_id: string;
    name: string;
    cooking_time?: number | null;
    servings?: number | null;
    images?: ImageList;
    instructions: InstructionList;
    ingredients: IngredientList;
    nutrition_info?: string | null;
    note?: string | null;
    is_edited: boolean;
    is_deleted: boolean;
    deleted_at?: UTCString | null;
    deleted_by_user?: string | null;
    deleted_by_role?: string | null;
    created_by_role?: string | null;
    created_by_user?: string | null;
    created_at: UTCString;
    updated_at: UTCString;
    reference_count: number;
    tags: string[];
    allergy_tags: string[];
}
interface CreateFamilyRecipeRequestItem {
    name: string;
    cooking_time?: number | null;
    servings?: number | null;
    images: ImageList;
    instructions: InstructionList;
    ingredients_query?: string[];
    note?: string | null;
    nutrition_info?: string | null;
}
/**
 * Batch create family recipes request type
 */
export interface IBatchCreateFamilyRecipeRequest {
    items: CreateFamilyRecipeRequestItem[];
}
/**
 * Batch update family recipe item type
 */
export interface IBatchUpdateFamilyRecipeItem {
    id: string;
    name?: string | null;
    from?: RecipeSource;
    cooking_time?: number | null;
    servings?: number | null;
    images?: ImageList;
    instructions?: InstructionList;
    note?: string | null;
    nutrition_info?: string | null;
    ingredients_query?: string[] | null;
}
/**
 * Batch update family recipes request type
 */
export interface IBatchUpdateFamilyRecipeRequest {
    items: IBatchUpdateFamilyRecipeItem[];
}
/**
 * Batch delete family recipes request type
 */
export interface IBatchDeleteFamilyRecipesRequest {
    ids: string[];
}
export interface IBatchRecipeOperationResult {
    recipes: IFamilyRecipeEntity[];
}
export interface IFamilyRecipe {
    id: string;
    name: string;
    cooking_time?: number | null;
    servings?: number | null;
    images?: ImageList;
    instructions: string;
    ingredients: string;
    nutrition_info?: string | null;
    note?: string | null;
    reference_count: number;
    tags: string[];
    allergy_tags: string[];
}
export declare function convertFamilyRecipeEntityToItem(familyRecipe: IFamilyRecipeEntity): IFamilyRecipe;
export {};
