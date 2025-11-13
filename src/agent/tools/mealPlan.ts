import * as z from "zod/v4";
import { createToolWrapper, maxCreateUpdateDeleteLimit, searchLimit } from "./utils";
import {
  convertMealPlanEntityToItem,
  MealType,
} from "../../services/interface/entities/mealPlan";
import { CustomSearchCategory } from "../../services/actual/combined";
import { RecipeSource } from "../../services/interface/entities/recipe";

export const createMealPlanTool = createToolWrapper({
  description:
    `Create new meal plans or add recipes to existing meal plans (supports batch creation).
    - Except id,all fields are optional,Do not fill fields that are not to be updated.
    - Each meal plan represents a single meal on a specific date.the recipe must from an existing recipe in the family or recommend recipe, You can search recipe first or create a new recipe first`,
  inputSchema: z.object({
    mealPlans: z.array(z.object({
      date: z.string().describe(`Meal date in YYYY-MM-DD format`),
      meal_type: z.enum(MealType), // Adjust according to actual MealType enum
      recipes: z.array(z.object({
        // Adjust according to actual MealplanRecipeRequest structure
        recipe_id: z.string().describe(
          `A recipe must from an existing recipe in the family or recommend recipe,
          you can find it from context or search recipe first or create a new recipe accroding to user's request. and then use the recipe id.
          Do not use recipe id that not existed`,
        ),
        mealplan_servings: z.number().describe(
          "meal plan servings, if not provided, you can pick a suitable servings from user's request or family people count",
        ),
        //这个字段不让模型填了，service层根据recipeid判断
        // from: z.enum(RecipeSource).describe(
        //   "recipe source, where the recipe comes from",
        // ),
        // Other fields...
      })),
    })),
  }),
  execute: async ({ mealPlans }, options, context) => {
    const { mealPlanService } = context.services;
    const isOverLimit = mealPlans.length > maxCreateUpdateDeleteLimit;
    const result = await mealPlanService.addRecipesToMealPlans({
      items: mealPlans.slice(0, maxCreateUpdateDeleteLimit),
    });
    const createdMealPlans = result.data?.meal_plans ?? [];
    return {
      success: true,
      ids: createdMealPlans.map((plan) => plan?.id) || [],
      entities: createdMealPlans,
      modelVisibleData: {
        data: createdMealPlans.map(convertMealPlanEntityToItem),
        message: isOverLimit ? `You can only create up to ${maxCreateUpdateDeleteLimit} meal plans at a time. Only  ${maxCreateUpdateDeleteLimit} meal plans created this time` : undefined,
      },
    };
  },
});

export const updateMealPlanTool = createToolWrapper({
  description:
    `Update meal plans (supports batch updates). Each meal plan represents a single meal on a specific date.`,
  inputSchema: z.object({
    mealPlans: z.array(z.object({
      id: z.string().nullable().optional(),
      date: z.string().nullable().optional().describe(`Meal date in YYYY-MM-DD format`),
      meal_type: z.enum(MealType), // Adjust according to actual MealType enum
      calories: z.number().nullable().optional(),
      nutrition_info: z.string().nullable().optional(),
      note: z.string().nullable().optional(),
      recipes: z.array(z.object({
        // Adjust according to actual MealplanRecipeRequest structure
        recipe_id: z.string(),
        mealplan_servings: z.number(),
        // Other fields...
      })),
    })),
  }),
  execute: async ({ mealPlans }, options, context) => {
    const { mealPlanService } = context.services;
    const isOverLimit = mealPlans.length > maxCreateUpdateDeleteLimit;
    const result = await mealPlanService.updateMealPlans({ items: mealPlans.slice(0, maxCreateUpdateDeleteLimit) });
    const updatedMealPlans = result.data?.meal_plans ?? [];
    return {
      success: true,
      ids: updatedMealPlans.map((plan) => plan?.id) || [],
      entities: updatedMealPlans,
      modelVisibleData: {
        data: updatedMealPlans.map(convertMealPlanEntityToItem),
        message: isOverLimit ? `You can only update up to ${maxCreateUpdateDeleteLimit} meal plans at a time. Only ${maxCreateUpdateDeleteLimit} meal plans updated this time` : undefined,
      },
    };
  },
});

export const deleteMealPlanTool = createToolWrapper({
  description: `Delete meal plans (supports batch deletion).`,
  inputSchema: z.object({
    mealPlans: z.array(z.object({
      id: z.string(),
    })),
  }),
  execute: async ({ mealPlans }, options, context) => {
    const { mealPlanService } = context.services;
    const isOverLimit = mealPlans.length > maxCreateUpdateDeleteLimit;
    const result = await mealPlanService.deleteMealPlans({
      ids: mealPlans.slice(0, maxCreateUpdateDeleteLimit).map((plan) => plan.id),
    });
    const deletedMealPlans = result.data?.meal_plans ?? [];
    return {
      success: true,
      ids: deletedMealPlans.map((plan) => plan?.id) || [],
      entities: deletedMealPlans,
      modelVisibleData: {
        data: deletedMealPlans.map(convertMealPlanEntityToItem),
        message: isOverLimit ? `You can only delete up to ${maxCreateUpdateDeleteLimit} meal plans at a time. Only ${maxCreateUpdateDeleteLimit} meal plans deleted this time` : undefined,
      },
    };
  },
});

export const searchMealPlanTool = createToolWrapper({
  description: `Search family meal plans list. Each call returns a maximum of 10 results.`,

  inputSchema: z.object({
    query: z.string().nullish(),
    start: z.string().nullish().describe("Date, YYYY-MM-DD"),
    end: z.string().nullish().describe("Date, YYYY-MM-DD"),
    ids: z.array(z.string()).nullish().describe("Meal plan IDs"),
    meal_type: z.enum(MealType).nullish().describe("Meal type"),
  }),
  execute: async ({ query, start, end, ids, meal_type }, options, context) => {
    const { combinedService } = context.services;
    const result = await combinedService.searchEntity({
      category: [CustomSearchCategory.mealplan],
      query: query ?? undefined,
      mealplan_filter: {
        start: start ?? undefined,
        end: end ?? undefined,
        meal_type: meal_type ?? undefined,
        ids: ids ?? [],
      },
      limit: searchLimit,
    });
    const searchResult =  result?.data?.mealplans?.items ?? [];
    return {
      success: true,
      ids: searchResult.map((mealplan) => mealplan?.id),
      entities: searchResult,
      modelVisibleData: {
        data: searchResult.map(convertMealPlanEntityToItem),
      },
    };
  },
});
