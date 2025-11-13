import z from "zod/v4";
import { createToolWrapper, maxCreateUpdateDeleteLimit, searchLimit } from "./utils";
import {
  convertFamilyRecipeEntityToItem,
  RecipeSource,
} from "../../services/interface/entities/recipe";
import { CustomSearchCategory } from "../../services/actual/combined";

export const createRecipeTool = createToolWrapper({
  description: `Create new recipes (supports batch creation).`,
  inputSchema: z.object({
    items: z.array(z.object({
      name: z.string(),
      cooking_time: z.number().nullable().optional().describe('Total time in minutes, including preparation and cooking'),
      servings: z.number().nullable().optional().describe('How many portions the recipe yields'),
      instructions: z.array(z.object({
        // Define according to actual InstructionList structure
        step: z.number(),
        content: z.string(),
        // Other fields...
      })), // Define according to actual InstructionList structure
      ingredients_query: z.array(z.string()).nullish().describe(
        "Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'",
      ),
      note: z.string().nullable().optional(),
      nutrition_info: z.string().nullable().optional(),
    })),
  }),
  execute: async (data, options, context) => {
    const { recipeService } = context.services;
    const isOverLimit = data.items.length > maxCreateUpdateDeleteLimit;
    const processedRecipes = data.items.slice(0, maxCreateUpdateDeleteLimit).map((recipe) => ({
      ...recipe,
      ingredients_query: recipe.ingredients_query ?? [],
      images: [],
    }));
    const result = await recipeService.createRecipes({
      items: processedRecipes,
    });
    const resultRecipes = result?.data?.recipes ?? [];
    return {
      success: true,
      ids: resultRecipes.map((recipe) => recipe.id) || [],
      entities: resultRecipes,
      modelVisibleData: {
        data: resultRecipes.map(convertFamilyRecipeEntityToItem) ?? [],
        message: isOverLimit ? `You can only create up to ${maxCreateUpdateDeleteLimit} recipes at a time. Only ${maxCreateUpdateDeleteLimit} recipes created this time` : undefined,
      },
    };
  },
});

export const updateRecipeTool = createToolWrapper({
  description: `Update recipes (supports batch updates).Except id.all fields are optional,Do not fill fields that are not to be updated.`,
  inputSchema: z.object({
    items: z.array(z.object({
      id: z.string(),
      name: z.string().nullable().optional(),
      cooking_time: z.number().nullable().optional(),
      servings: z.number().nullable().optional(),
      instructions: z.array(z.object({
        // Define according to actual InstructionList structure
        step: z.number(),
        content: z.string(),
        // Other fields...
      })).optional(), // Define according to actual InstructionList structure
      note: z.string().nullable().optional(),
      nutrition_info: z.string().nullable().optional(),
      ingredients_query: z.array(z.string()).nullish().optional().describe(
        "Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'",
      ),
    })),
  }),
  execute: async (data, options, context) => {
    const { recipeService } = context.services;
    const isOverLimit = data.items.length > maxCreateUpdateDeleteLimit;
    const processedUpdates = data.items.slice(0, maxCreateUpdateDeleteLimit).map((update) => ({
      ...update,
      ingredients_query: update.ingredients_query ?? [],
      images: [],
      instructions: update.instructions ?? undefined,
    }));

    const result = await recipeService.updateRecipes({
      items: processedUpdates,
    });
    const recipes = result?.data?.recipes ?? [];

    return {
      success: true,
      ids: recipes.map((recipe) => recipe.id) || [],
      entities: recipes,
      modelVisibleData: {
        data: recipes.map(convertFamilyRecipeEntityToItem),
        message: isOverLimit ? `You can only update up to ${maxCreateUpdateDeleteLimit} recipes at a time. Only ${maxCreateUpdateDeleteLimit} recipes updated this time` : undefined,
      },
    };
  },
});

export const deleteRecipeTool = createToolWrapper({
  description: `Delete recipes.`,
  inputSchema: z.object({
    ids: z.string().array().describe("Recipe ID"),
  }),
  execute: async ({ ids }, options, context) => {
    const { recipeService } = context.services;
    const isOverLimit = ids.length > maxCreateUpdateDeleteLimit;
    const result = await recipeService.deleteRecipes({
      ids: ids.slice(0, maxCreateUpdateDeleteLimit),
    });
    const recipes = result?.data?.recipes ?? [];

    return {
      success: true,
      ids: recipes.map((recipe) => recipe.id) || [],
      entities: recipes,
      modelVisibleData: {
        data: recipes.map(convertFamilyRecipeEntityToItem),
        message: isOverLimit ? `You can only delete up to ${maxCreateUpdateDeleteLimit} recipes at a time. Only ${maxCreateUpdateDeleteLimit} recipes deleted this time` : undefined,
      },
    };
  },
});

export const searchRecipeTool = createToolWrapper({
  description: `Search recipes. Each call returns a maximum of 10 results.`,
  inputSchema: z.object({
    query: z.string().nullish(),
    ids: z.array(z.string()).nullish(),
  }),
  execute: async ({ query, ids }, options, context) => {
    const { combinedService } = context.services;
    const result = await combinedService.searchEntity({
      category: [CustomSearchCategory.recipe],
      query: query ?? undefined,
      recipe_filter: {
        ids: ids ?? [],
      },
      limit: searchLimit,
    });
    const searchResult = result?.data?.recipes?.items ?? [];
    return {
      success: true,
      ids: searchResult.map((recipe) => recipe.id),
      entities: searchResult,
      modelVisibleData: {
        data: searchResult.map(convertFamilyRecipeEntityToItem),
      },
    };
  },
});
