"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMealPlanTool = exports.deleteMealPlanTool = exports.updateMealPlanTool = exports.createMealPlanTool = void 0;
const z = __importStar(require("zod/v4"));
const utils_1 = require("./utils");
const mealPlan_1 = require("../../services/interface/entities/mealPlan");
const combined_1 = require("../../services/actual/combined");
exports.createMealPlanTool = (0, utils_1.createToolWrapper)({
    description: `Create new meal plans or add recipes to existing meal plans (supports batch creation).
    - Except id,all fields are optional,Do not fill fields that are not to be updated.
    - Each meal plan represents a single meal on a specific date.the recipe must from an existing recipe in the family or recommend recipe, You can search recipe first or create a new recipe first`,
    inputSchema: z.object({
        mealPlans: z.array(z.object({
            date: z.string().describe(`Meal date in YYYY-MM-DD format`),
            meal_type: z.enum(mealPlan_1.MealType), // Adjust according to actual MealType enum
            recipes: z.array(z.object({
                // Adjust according to actual MealplanRecipeRequest structure
                recipe_id: z.string().describe(`A recipe must from an existing recipe in the family or recommend recipe,
          you can find it from context or search recipe first or create a new recipe accroding to user's request. and then use the recipe id.
          Do not use recipe id that not existed`),
                mealplan_servings: z.number().describe("meal plan servings, if not provided, you can pick a suitable servings from user's request or family people count"),
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
        const isOverLimit = mealPlans.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await mealPlanService.addRecipesToMealPlans({
            items: mealPlans.slice(0, utils_1.maxCreateUpdateDeleteLimit),
        });
        const createdMealPlans = result.data?.meal_plans ?? [];
        return {
            success: true,
            ids: createdMealPlans.map((plan) => plan?.id) || [],
            entities: createdMealPlans,
            modelVisibleData: {
                data: createdMealPlans.map(mealPlan_1.convertMealPlanEntityToItem),
                message: isOverLimit ? `You can only create up to ${utils_1.maxCreateUpdateDeleteLimit} meal plans at a time. Only  ${utils_1.maxCreateUpdateDeleteLimit} meal plans created this time` : undefined,
            },
        };
    },
});
exports.updateMealPlanTool = (0, utils_1.createToolWrapper)({
    description: `Update meal plans (supports batch updates). Each meal plan represents a single meal on a specific date.`,
    inputSchema: z.object({
        mealPlans: z.array(z.object({
            id: z.string().nullable().optional(),
            date: z.string().nullable().optional().describe(`Meal date in YYYY-MM-DD format`),
            meal_type: z.enum(mealPlan_1.MealType), // Adjust according to actual MealType enum
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
        const isOverLimit = mealPlans.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await mealPlanService.updateMealPlans({ items: mealPlans.slice(0, utils_1.maxCreateUpdateDeleteLimit) });
        const updatedMealPlans = result.data?.meal_plans ?? [];
        return {
            success: true,
            ids: updatedMealPlans.map((plan) => plan?.id) || [],
            entities: updatedMealPlans,
            modelVisibleData: {
                data: updatedMealPlans.map(mealPlan_1.convertMealPlanEntityToItem),
                message: isOverLimit ? `You can only update up to ${utils_1.maxCreateUpdateDeleteLimit} meal plans at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} meal plans updated this time` : undefined,
            },
        };
    },
});
exports.deleteMealPlanTool = (0, utils_1.createToolWrapper)({
    description: `Delete meal plans (supports batch deletion).`,
    inputSchema: z.object({
        mealPlans: z.array(z.object({
            id: z.string(),
        })),
    }),
    execute: async ({ mealPlans }, options, context) => {
        const { mealPlanService } = context.services;
        const isOverLimit = mealPlans.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await mealPlanService.deleteMealPlans({
            ids: mealPlans.slice(0, utils_1.maxCreateUpdateDeleteLimit).map((plan) => plan.id),
        });
        const deletedMealPlans = result.data?.meal_plans ?? [];
        return {
            success: true,
            ids: deletedMealPlans.map((plan) => plan?.id) || [],
            entities: deletedMealPlans,
            modelVisibleData: {
                data: deletedMealPlans.map(mealPlan_1.convertMealPlanEntityToItem),
                message: isOverLimit ? `You can only delete up to ${utils_1.maxCreateUpdateDeleteLimit} meal plans at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} meal plans deleted this time` : undefined,
            },
        };
    },
});
exports.searchMealPlanTool = (0, utils_1.createToolWrapper)({
    description: `Search family meal plans list. Each call returns a maximum of 10 results.`,
    inputSchema: z.object({
        query: z.string().nullish(),
        start: z.string().nullish().describe("Date, YYYY-MM-DD"),
        end: z.string().nullish().describe("Date, YYYY-MM-DD"),
        ids: z.array(z.string()).nullish().describe("Meal plan IDs"),
        meal_type: z.enum(mealPlan_1.MealType).nullish().describe("Meal type"),
    }),
    execute: async ({ query, start, end, ids, meal_type }, options, context) => {
        const { combinedService } = context.services;
        const result = await combinedService.searchEntity({
            category: [combined_1.CustomSearchCategory.mealplan],
            query: query ?? undefined,
            mealplan_filter: {
                start: start ?? undefined,
                end: end ?? undefined,
                meal_type: meal_type ?? undefined,
                ids: ids ?? [],
            },
            limit: utils_1.searchLimit,
        });
        const searchResult = result?.data?.mealplans?.items ?? [];
        return {
            success: true,
            ids: searchResult.map((mealplan) => mealplan?.id),
            entities: searchResult,
            modelVisibleData: {
                data: searchResult.map(mealPlan_1.convertMealPlanEntityToItem),
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhbFBsYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvdG9vbHMvbWVhbFBsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQ0FBNEI7QUFDNUIsbUNBQXFGO0FBQ3JGLHlFQUdvRDtBQUNwRCw2REFBc0U7QUFHekQsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLHlCQUFpQixFQUFDO0lBQ2xELFdBQVcsRUFDVDs7cU1BRWlNO0lBQ25NLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3BCLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLENBQUM7WUFDM0QsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQVEsQ0FBQyxFQUFFLDJDQUEyQztZQUN4RSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUN4Qiw2REFBNkQ7Z0JBQzdELFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUM1Qjs7Z0RBRXNDLENBQ3ZDO2dCQUNELGlCQUFpQixFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQ3BDLGtIQUFrSCxDQUNuSDtnQkFDRCxpQ0FBaUM7Z0JBQ2pDLHVDQUF1QztnQkFDdkMsa0RBQWtEO2dCQUNsRCxLQUFLO2dCQUNMLGtCQUFrQjthQUNuQixDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7S0FDSixDQUFDO0lBQ0YsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNqRCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxD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LEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDekUsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDN0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFlLENBQUMsWUFBWSxDQUFDO1lBQ2hELFFBQVEsRUFBRSxDQUFDLCtCQUFvQixDQUFDLFFBQVEsQ0FBQztZQUN6QyxLQUFLLEVBQUUsS0FBSyxJQUFJLFNBQVM7WUFDekIsZUFBZSxFQUFFO2dCQUNmLEtBQUssRUFBRSxLQUFLLElBQUksU0FBUztnQkFDekIsR0FBRyxFQUFFLEdBQUcsSUFBSSxTQUFTO2dCQUNyQixTQUFTLEVBQUUsU0FBUyxJQUFJLFNBQVM7Z0JBQ2pDLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRTthQUNmO1lBQ0QsS0FBSyxFQUFFLG1CQUFXO1NBQ25CLENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFJLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDM0QsT0FBTztZQUNMLE9BQU8sRUFBRSxJQUFJO1lBQ2IsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDakQsUUFBUSxFQUFFLFlBQVk7WUFDdEIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLElBQUksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLHNDQUEyQixDQUFDO2FBQ3BEO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB6IGZyb20gXCJ6b2QvdjRcIjtcbmltcG9ydCB7IGNyZWF0ZVRvb2xXcmFwcGVyLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCwgc2VhcmNoTGltaXQgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHtcbiAgY29udmVydE1lYWxQbGFuRW50aXR5VG9JdGVtLFxuICBNZWFsVHlwZSxcbn0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2ludGVyZmFjZS9lbnRpdGllcy9tZWFsUGxhblwiO1xuaW1wb3J0IHsgQ3VzdG9tU2VhcmNoQ2F0ZWdvcnkgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvYWN0dWFsL2NvbWJpbmVkXCI7XG5pbXBvcnQgeyBSZWNpcGVTb3VyY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvaW50ZXJmYWNlL2VudGl0aWVzL3JlY2lwZVwiO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlTWVhbFBsYW5Ub29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjpcbiAgICBgQ3JlYXRlIG5ldyBtZWFsIHBsYW5zIG9yIGFkZCByZWNpcGVzIHRvIGV4aXN0aW5nIG1lYWwgcGxhbnMgKHN1cHBvcnRzIGJhdGNoIGNyZWF0aW9uKS5cbiAgICAtIEV4Y2VwdCBpZCxhbGwgZmllbGRzIGFyZSBvcHRpb25hbCxEbyBub3QgZmlsbCBmaWVsZHMgdGhhdCBhcmUgbm90IHRvIGJlIHVwZGF0ZWQuXG4gICAgLSBFYWNoIG1lYWwgcGxhbiByZXByZXNlbnRzIGEgc2luZ2xlIG1lYWwgb24gYSBzcGVjaWZpYyBkYXRlLnRoZSByZWNpcGUgbXVzdCBmcm9tIGFuIGV4aXN0aW5nIHJlY2lwZSBpbiB0aGUgZmFtaWx5IG9yIHJlY29tbWVuZCByZWNpcGUsIFlvdSBjYW4gc2VhcmNoIHJlY2lwZSBmaXJzdCBvciBjcmVhdGUgYSBuZXcgcmVjaXBlIGZpcnN0YCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBtZWFsUGxhbnM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgZGF0ZTogei5zdHJpbmcoKS5kZXNjcmliZShgTWVhbCBkYXRlIGluIFlZWVktTU0tREQgZm9ybWF0YCksXG4gICAgICBtZWFsX3R5cGU6IHouZW51bShNZWFsVHlwZSksIC8vIEFkanVzdCBhY2NvcmRpbmcgdG8gYWN0dWFsIE1lYWxUeXBlIGVudW1cbiAgICAgIHJlY2lwZXM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICAvLyBBZGp1c3QgYWNjb3JkaW5nIHRvIGFjdHVhbCBNZWFscGxhblJlY2lwZVJlcXVlc3Qgc3RydWN0dXJlXG4gICAgICAgIHJlY2lwZV9pZDogei5zdHJpbmcoKS5kZXNjcmliZShcbiAgICAgICAgICBgQSByZWNpcGUgbXVzdCBmcm9tIGFuIGV4aXN0aW5nIHJlY2lwZSBpbiB0aGUgZmFtaWx5IG9yIHJlY29tbWVuZCByZWNpcGUsXG4gICAgICAgICAgeW91IGNhbiBmaW5kIGl0IGZyb20gY29udGV4dCBvciBzZWFyY2ggcmVjaXBlIGZpcnN0IG9yIGNyZWF0ZSBhIG5ldyByZWNpcGUgYWNjcm9kaW5nIHRvIHVzZXIncyByZXF1ZXN0LiBhbmQgdGhlbiB1c2UgdGhlIHJlY2lwZSBpZC5cbiAgICAgICAgICBEbyBub3QgdXNlIHJlY2lwZSBpZCB0aGF0IG5vdCBleGlzdGVkYCxcbiAgICAgICAgKSxcbiAgICAgICAgbWVhbHBsYW5fc2VydmluZ3M6IHoubnVtYmVyKCkuZGVzY3JpYmUoXG4gICAgICAgICAgXCJtZWFsIHBsYW4gc2VydmluZ3MsIGlmIG5vdCBwcm92aWRlZCwgeW91IGNhbiBwaWNrIGEgc3VpdGFibGUgc2VydmluZ3MgZnJvbSB1c2VyJ3MgcmVxdWVzdCBvciBmYW1pbHkgcGVvcGxlIGNvdW50XCIsXG4gICAgICAgICksXG4gICAgICAgIC8v6L+Z5Liq5a2X5q615LiN6K6p5qih5Z6L5aGr5LqG77yMc2VydmljZeWxguagueaNrnJlY2lwZWlk5Yik5patXG4gICAgICAgIC8vIGZyb206IHouZW51bShSZWNpcGVTb3VyY2UpLmRlc2NyaWJlKFxuICAgICAgICAvLyAgIFwicmVjaXBlIHNvdXJjZSwgd2hlcmUgdGhlIHJlY2lwZSBjb21lcyBmcm9tXCIsXG4gICAgICAgIC8vICksXG4gICAgICAgIC8vIE90aGVyIGZpZWxkcy4uLlxuICAgICAgfSkpLFxuICAgIH0pKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jICh7IG1lYWxQbGFucyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBtZWFsUGxhblNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBtZWFsUGxhbnMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWVhbFBsYW5TZXJ2aWNlLmFkZFJlY2lwZXNUb01lYWxQbGFucyh7XG4gICAgICBpdGVtczogbWVhbFBsYW5zLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KSxcbiAgICB9KTtcbiAgICBjb25zdCBjcmVhdGVkTWVhbFBsYW5zID0gcmVzdWx0LmRhdGE/Lm1lYWxfcGxhbnMgPz8gW107XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IGNyZWF0ZWRNZWFsUGxhbnMubWFwKChwbGFuKSA9PiBwbGFuPy5pZCkgfHwgW10sXG4gICAgICBlbnRpdGllczogY3JlYXRlZE1lYWxQbGFucyxcbiAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgZGF0YTogY3JlYXRlZE1lYWxQbGFucy5tYXAoY29udmVydE1lYWxQbGFuRW50aXR5VG9JdGVtKSxcbiAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IGNyZWF0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBtZWFsIHBsYW5zIGF0IGEgdGltZS4gT25seSAgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gbWVhbCBwbGFucyBjcmVhdGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZU1lYWxQbGFuVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246XG4gICAgYFVwZGF0ZSBtZWFsIHBsYW5zIChzdXBwb3J0cyBiYXRjaCB1cGRhdGVzKS4gRWFjaCBtZWFsIHBsYW4gcmVwcmVzZW50cyBhIHNpbmdsZSBtZWFsIG9uIGEgc3BlY2lmaWMgZGF0ZS5gLFxuICBpbnB1dFNjaGVtYTogei5vYmplY3Qoe1xuICAgIG1lYWxQbGFuczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICBpZDogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICBkYXRlOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKS5kZXNjcmliZShgTWVhbCBkYXRlIGluIFlZWVktTU0tREQgZm9ybWF0YCksXG4gICAgICBtZWFsX3R5cGU6IHouZW51bShNZWFsVHlwZSksIC8vIEFkanVzdCBhY2NvcmRpbmcgdG8gYWN0dWFsIE1lYWxUeXBlIGVudW1cbiAgICAgIGNhbG9yaWVzOiB6Lm51bWJlcigpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgIG51dHJpdGlvbl9pbmZvOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgIG5vdGU6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgcmVjaXBlczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIC8vIEFkanVzdCBhY2NvcmRpbmcgdG8gYWN0dWFsIE1lYWxwbGFuUmVjaXBlUmVxdWVzdCBzdHJ1Y3R1cmVcbiAgICAgICAgcmVjaXBlX2lkOiB6LnN0cmluZygpLFxuICAgICAgICBtZWFscGxhbl9zZXJ2aW5nczogei5udW1iZXIoKSxcbiAgICAgICAgLy8gT3RoZXIgZmllbGRzLi4uXG4gICAgICB9KSksXG4gICAgfSkpLFxuICB9KSxcbiAgZXhlY3V0ZTogYXN5bmMgKHsgbWVhbFBsYW5zIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IG1lYWxQbGFuU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICBjb25zdCBpc092ZXJMaW1pdCA9IG1lYWxQbGFucy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtZWFsUGxhblNlcnZpY2UudXBkYXRlTWVhbFBsYW5zKHsgaXRlbXM6IG1lYWxQbGFucy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCkgfSk7XG4gICAgY29uc3QgdXBkYXRlZE1lYWxQbGFucyA9IHJlc3VsdC5kYXRhPy5tZWFsX3BsYW5zID8/IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaWRzOiB1cGRhdGVkTWVhbFBsYW5zLm1hcCgocGxhbikgPT4gcGxhbj8uaWQpIHx8IFtdLFxuICAgICAgZW50aXRpZXM6IHVwZGF0ZWRNZWFsUGxhbnMsXG4gICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgIGRhdGE6IHVwZGF0ZWRNZWFsUGxhbnMubWFwKGNvbnZlcnRNZWFsUGxhbkVudGl0eVRvSXRlbSksXG4gICAgICAgIG1lc3NhZ2U6IGlzT3ZlckxpbWl0ID8gYFlvdSBjYW4gb25seSB1cGRhdGUgdXAgdG8gJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gbWVhbCBwbGFucyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gbWVhbCBwbGFucyB1cGRhdGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZU1lYWxQbGFuVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBEZWxldGUgbWVhbCBwbGFucyAoc3VwcG9ydHMgYmF0Y2ggZGVsZXRpb24pLmAsXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgbWVhbFBsYW5zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgIGlkOiB6LnN0cmluZygpLFxuICAgIH0pKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jICh7IG1lYWxQbGFucyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBtZWFsUGxhblNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBtZWFsUGxhbnMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWVhbFBsYW5TZXJ2aWNlLmRlbGV0ZU1lYWxQbGFucyh7XG4gICAgICBpZHM6IG1lYWxQbGFucy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCkubWFwKChwbGFuKSA9PiBwbGFuLmlkKSxcbiAgICB9KTtcbiAgICBjb25zdCBkZWxldGVkTWVhbFBsYW5zID0gcmVzdWx0LmRhdGE/Lm1lYWxfcGxhbnMgPz8gW107XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IGRlbGV0ZWRNZWFsUGxhbnMubWFwKChwbGFuKSA9PiBwbGFuPy5pZCkgfHwgW10sXG4gICAgICBlbnRpdGllczogZGVsZXRlZE1lYWxQbGFucyxcbiAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgZGF0YTogZGVsZXRlZE1lYWxQbGFucy5tYXAoY29udmVydE1lYWxQbGFuRW50aXR5VG9JdGVtKSxcbiAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IGRlbGV0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBtZWFsIHBsYW5zIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBtZWFsIHBsYW5zIGRlbGV0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2VhcmNoTWVhbFBsYW5Ub29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYFNlYXJjaCBmYW1pbHkgbWVhbCBwbGFucyBsaXN0LiBFYWNoIGNhbGwgcmV0dXJucyBhIG1heGltdW0gb2YgMTAgcmVzdWx0cy5gLFxuXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgcXVlcnk6IHouc3RyaW5nKCkubnVsbGlzaCgpLFxuICAgIHN0YXJ0OiB6LnN0cmluZygpLm51bGxpc2goKS5kZXNjcmliZShcIkRhdGUsIFlZWVktTU0tRERcIiksXG4gICAgZW5kOiB6LnN0cmluZygpLm51bGxpc2goKS5kZXNjcmliZShcIkRhdGUsIFlZWVktTU0tRERcIiksXG4gICAgaWRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm51bGxpc2goKS5kZXNjcmliZShcIk1lYWwgcGxhbiBJRHNcIiksXG4gICAgbWVhbF90eXBlOiB6LmVudW0oTWVhbFR5cGUpLm51bGxpc2goKS5kZXNjcmliZShcIk1lYWwgdHlwZVwiKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jICh7IHF1ZXJ5LCBzdGFydCwgZW5kLCBpZHMsIG1lYWxfdHlwZSB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBjb21iaW5lZFNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29tYmluZWRTZXJ2aWNlLnNlYXJjaEVudGl0eSh7XG4gICAgICBjYXRlZ29yeTogW0N1c3RvbVNlYXJjaENhdGVnb3J5Lm1lYWxwbGFuXSxcbiAgICAgIHF1ZXJ5OiBxdWVyeSA/PyB1bmRlZmluZWQsXG4gICAgICBtZWFscGxhbl9maWx0ZXI6IHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZW5kOiBlbmQgPz8gdW5kZWZpbmVkLFxuICAgICAgICBtZWFsX3R5cGU6IG1lYWxfdHlwZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGlkczogaWRzID8/IFtdLFxuICAgICAgfSxcbiAgICAgIGxpbWl0OiBzZWFyY2hMaW1pdCxcbiAgICB9KTtcbiAgICBjb25zdCBzZWFyY2hSZXN1bHQgPSAgcmVzdWx0Py5kYXRhPy5tZWFscGxhbnM/Lml0ZW1zID8/IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaWRzOiBzZWFyY2hSZXN1bHQubWFwKChtZWFscGxhbikgPT4gbWVhbHBsYW4/LmlkKSxcbiAgICAgIGVudGl0aWVzOiBzZWFyY2hSZXN1bHQsXG4gICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgIGRhdGE6IHNlYXJjaFJlc3VsdC5tYXAoY29udmVydE1lYWxQbGFuRW50aXR5VG9JdGVtKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuIl19