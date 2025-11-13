export type UUID = string;
export type DateTimeString = string; // ISO 8601 format
export type UTCString = string; // UTC format

// Image related types
interface Image {
    asset_id: string;
    url: string;
    width: number;
    height: number;
}

export type ImageList = Image[];

// Ingredient related types
interface Ingredient {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    is_optional: boolean;
}

export type IngredientList = Ingredient[];


export const RECOMMAND_RECIPE_PREFIX = "c06f7d7-";
export const isRecommandRecipe = (id: string) => {
    return id.startsWith(RECOMMAND_RECIPE_PREFIX);
}
export const removeRecommandRecipePrefix = (id: string) => {
    if (isRecommandRecipe(id)) {
        return id.replace(RECOMMAND_RECIPE_PREFIX, "");
    }
    return id;
}