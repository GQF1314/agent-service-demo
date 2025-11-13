export type UUID = string;
export type DateTimeString = string;
export type UTCString = string;
interface Image {
    asset_id: string;
    url: string;
    width: number;
    height: number;
}
export type ImageList = Image[];
interface Ingredient {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    is_optional: boolean;
}
export type IngredientList = Ingredient[];
export declare const RECOMMAND_RECIPE_PREFIX = "c06f7d7-";
export declare const isRecommandRecipe: (id: string) => boolean;
export declare const removeRecommandRecipePrefix: (id: string) => string;
export {};
