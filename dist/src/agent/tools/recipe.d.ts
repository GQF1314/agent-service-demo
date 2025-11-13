export declare const createRecipeTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    items: {
        name: string;
        instructions: {
            step: number;
            content: string;
        }[];
        cooking_time?: number | null | undefined;
        servings?: number | null | undefined;
        ingredients_query?: string[] | null | undefined;
        note?: string | null | undefined;
        nutrition_info?: string | null | undefined;
    }[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
        message: string | undefined;
    };
}>;
export declare const updateRecipeTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    items: {
        id: string;
        name?: string | null | undefined;
        cooking_time?: number | null | undefined;
        servings?: number | null | undefined;
        instructions?: {
            step: number;
            content: string;
        }[] | undefined;
        note?: string | null | undefined;
        nutrition_info?: string | null | undefined;
        ingredients_query?: string[] | null | undefined;
    }[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
        message: string | undefined;
    };
}>;
export declare const deleteRecipeTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    ids: string[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
        message: string | undefined;
    };
}>;
export declare const searchRecipeTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query?: string | null | undefined;
    ids?: string[] | null | undefined;
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/recipe").IFamilyRecipeEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/recipe").IFamilyRecipe[];
    };
}>;
