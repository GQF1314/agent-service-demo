"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRecipeTool = exports.deleteRecipeTool = exports.updateRecipeTool = exports.createRecipeTool = void 0;
const v4_1 = __importDefault(require("zod/v4"));
const utils_1 = require("./utils");
const recipe_1 = require("../../services/interface/entities/recipe");
const combined_1 = require("../../services/actual/combined");
exports.createRecipeTool = (0, utils_1.createToolWrapper)({
    description: `Create new recipes (supports batch creation).`,
    inputSchema: v4_1.default.object({
        items: v4_1.default.array(v4_1.default.object({
            name: v4_1.default.string(),
            cooking_time: v4_1.default.number().nullable().optional().describe('Total time in minutes, including preparation and cooking'),
            servings: v4_1.default.number().nullable().optional().describe('How many portions the recipe yields'),
            instructions: v4_1.default.array(v4_1.default.object({
                // Define according to actual InstructionList structure
                step: v4_1.default.number(),
                content: v4_1.default.string(),
                // Other fields...
            })), // Define according to actual InstructionList structure
            ingredients_query: v4_1.default.array(v4_1.default.string()).nullish().describe("Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'"),
            note: v4_1.default.string().nullable().optional(),
            nutrition_info: v4_1.default.string().nullable().optional(),
        })),
    }),
    execute: async (data, options, context) => {
        const { recipeService } = context.services;
        const isOverLimit = data.items.length > utils_1.maxCreateUpdateDeleteLimit;
        const processedRecipes = data.items.slice(0, utils_1.maxCreateUpdateDeleteLimit).map((recipe) => ({
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
                data: resultRecipes.map(recipe_1.convertFamilyRecipeEntityToItem) ?? [],
                message: isOverLimit ? `You can only create up to ${utils_1.maxCreateUpdateDeleteLimit} recipes at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} recipes created this time` : undefined,
            },
        };
    },
});
exports.updateRecipeTool = (0, utils_1.createToolWrapper)({
    description: `Update recipes (supports batch updates).Except id.all fields are optional,Do not fill fields that are not to be updated.`,
    inputSchema: v4_1.default.object({
        items: v4_1.default.array(v4_1.default.object({
            id: v4_1.default.string(),
            name: v4_1.default.string().nullable().optional(),
            cooking_time: v4_1.default.number().nullable().optional(),
            servings: v4_1.default.number().nullable().optional(),
            instructions: v4_1.default.array(v4_1.default.object({
                // Define according to actual InstructionList structure
                step: v4_1.default.number(),
                content: v4_1.default.string(),
                // Other fields...
            })).optional(), // Define according to actual InstructionList structure
            note: v4_1.default.string().nullable().optional(),
            nutrition_info: v4_1.default.string().nullable().optional(),
            ingredients_query: v4_1.default.array(v4_1.default.string()).nullish().optional().describe("Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'"),
        })),
    }),
    execute: async (data, options, context) => {
        const { recipeService } = context.services;
        const isOverLimit = data.items.length > utils_1.maxCreateUpdateDeleteLimit;
        const processedUpdates = data.items.slice(0, utils_1.maxCreateUpdateDeleteLimit).map((update) => ({
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
                data: recipes.map(recipe_1.convertFamilyRecipeEntityToItem),
                message: isOverLimit ? `You can only update up to ${utils_1.maxCreateUpdateDeleteLimit} recipes at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} recipes updated this time` : undefined,
            },
        };
    },
});
exports.deleteRecipeTool = (0, utils_1.createToolWrapper)({
    description: `Delete recipes.`,
    inputSchema: v4_1.default.object({
        ids: v4_1.default.string().array().describe("Recipe ID"),
    }),
    execute: async ({ ids }, options, context) => {
        const { recipeService } = context.services;
        const isOverLimit = ids.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await recipeService.deleteRecipes({
            ids: ids.slice(0, utils_1.maxCreateUpdateDeleteLimit),
        });
        const recipes = result?.data?.recipes ?? [];
        return {
            success: true,
            ids: recipes.map((recipe) => recipe.id) || [],
            entities: recipes,
            modelVisibleData: {
                data: recipes.map(recipe_1.convertFamilyRecipeEntityToItem),
                message: isOverLimit ? `You can only delete up to ${utils_1.maxCreateUpdateDeleteLimit} recipes at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} recipes deleted this time` : undefined,
            },
        };
    },
});
exports.searchRecipeTool = (0, utils_1.createToolWrapper)({
    description: `Search recipes. Each call returns a maximum of 10 results.`,
    inputSchema: v4_1.default.object({
        query: v4_1.default.string().nullish(),
        ids: v4_1.default.array(v4_1.default.string()).nullish(),
    }),
    execute: async ({ query, ids }, options, context) => {
        const { combinedService } = context.services;
        const result = await combinedService.searchEntity({
            category: [combined_1.CustomSearchCategory.recipe],
            query: query ?? undefined,
            recipe_filter: {
                ids: ids ?? [],
            },
            limit: utils_1.searchLimit,
        });
        const searchResult = result?.data?.recipes?.items ?? [];
        return {
            success: true,
            ids: searchResult.map((recipe) => recipe.id),
            entities: searchResult,
            modelVisibleData: {
                data: searchResult.map(recipe_1.convertFamilyRecipeEntityToItem),
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FnZW50L3Rvb2xzL3JlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBdUI7QUFDdkIsbUNBQXFGO0FBQ3JGLHFFQUdrRDtBQUNsRCw2REFBc0U7QUFFekQsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLHlCQUFpQixFQUFDO0lBQ2hELFdBQVcsRUFBRSwrQ0FBK0M7SUFDNUQsV0FBVyxFQUFFLFlBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEIsS0FBSyxFQUFFLFlBQUMsQ0FBQyxLQUFLLENBQUMsWUFBQyxDQUFDLE1BQU0sQ0FBQztZQUN0QixJQUFJLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRTtZQUNoQixZQUFZLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQywwREFBMEQsQ0FBQztZQUNuSCxRQUFRLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQztZQUMxRixZQUFZLEVBQUUsWUFBQyxDQUFDLEtBQUssQ0FBQyxZQUFDLENBQUMsTUFBTSxDQUFDO2dCQUM3Qix1REFBdUQ7Z0JBQ3ZELElBQUksRUFBRSxZQUFDLENBQUMsTUFBTSxFQUFFO2dCQUNoQixPQUFPLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsa0JBQWtCO2FBQ25CLENBQUMsQ0FBQyxFQUFFLHVEQUF1RDtZQUM1RCxpQkFBaUIsRUFBRSxZQUFDLENBQUMsS0FBSyxDQUFDLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FDdkQsa09BQWtPLENBQ25PO1lBQ0QsSUFBSSxFQUFFLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUs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LHdDQUErQixDQUFDO2FBQ3hEO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeiBmcm9tIFwiem9kL3Y0XCI7XG5pbXBvcnQgeyBjcmVhdGVUb29sV3JhcHBlciwgbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQsIHNlYXJjaExpbWl0IH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7XG4gIGNvbnZlcnRGYW1pbHlSZWNpcGVFbnRpdHlUb0l0ZW0sXG4gIFJlY2lwZVNvdXJjZSxcbn0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2ludGVyZmFjZS9lbnRpdGllcy9yZWNpcGVcIjtcbmltcG9ydCB7IEN1c3RvbVNlYXJjaENhdGVnb3J5IH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2FjdHVhbC9jb21iaW5lZFwiO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVjaXBlVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBDcmVhdGUgbmV3IHJlY2lwZXMgKHN1cHBvcnRzIGJhdGNoIGNyZWF0aW9uKS5gLFxuICBpbnB1dFNjaGVtYTogei5vYmplY3Qoe1xuICAgIGl0ZW1zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgICBjb29raW5nX3RpbWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUb3RhbCB0aW1lIGluIG1pbnV0ZXMsIGluY2x1ZGluZyBwcmVwYXJhdGlvbiBhbmQgY29va2luZycpLFxuICAgICAgc2VydmluZ3M6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdIb3cgbWFueSBwb3J0aW9ucyB0aGUgcmVjaXBlIHlpZWxkcycpLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgLy8gRGVmaW5lIGFjY29yZGluZyB0byBhY3R1YWwgSW5zdHJ1Y3Rpb25MaXN0IHN0cnVjdHVyZVxuICAgICAgICBzdGVwOiB6Lm51bWJlcigpLFxuICAgICAgICBjb250ZW50OiB6LnN0cmluZygpLFxuICAgICAgICAvLyBPdGhlciBmaWVsZHMuLi5cbiAgICAgIH0pKSwgLy8gRGVmaW5lIGFjY29yZGluZyB0byBhY3R1YWwgSW5zdHJ1Y3Rpb25MaXN0IHN0cnVjdHVyZVxuICAgICAgaW5ncmVkaWVudHNfcXVlcnk6IHouYXJyYXkoei5zdHJpbmcoKSkubnVsbGlzaCgpLmRlc2NyaWJlKFxuICAgICAgICBcIkluZ3JlZGllbnRzIGluIGZvcm1hdDogcXVhbnRpdHkgdW5pdCBuYW1lLiBRdWFudGl0eSBtdXN0IGJlIGFuIGV4YWN0IG51bWJlcihpbnRlZ2VyIG9yIGZsb2F0KSwgbm90IHJhbmdlcyBvciBtaXhlZCBmcmFjdGlvbi4gR29vZCBjYXNlczogJzEgY3VwIGZsb3VyJywgJzIgZWdncycuIEJhZCBjYXNlczogJzEtMiBjdXBzIGZsb3VyJywgJ34xIHRzcCBzdWdhcicsJzEgMS8yIGN1cHMgZmxvdXInXCIsXG4gICAgICApLFxuICAgICAgbm90ZTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICBudXRyaXRpb25faW5mbzogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgfSkpLFxuICB9KSxcbiAgZXhlY3V0ZTogYXN5bmMgKGRhdGEsIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IHJlY2lwZVNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBkYXRhLml0ZW1zLmxlbmd0aCA+IG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0O1xuICAgIGNvbnN0IHByb2Nlc3NlZFJlY2lwZXMgPSBkYXRhLml0ZW1zLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KS5tYXAoKHJlY2lwZSkgPT4gKHtcbiAgICAgIC4uLnJlY2lwZSxcbiAgICAgIGluZ3JlZGllbnRzX3F1ZXJ5OiByZWNpcGUuaW5ncmVkaWVudHNfcXVlcnkgPz8gW10sXG4gICAgICBpbWFnZXM6IFtdLFxuICAgIH0pKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZWNpcGVTZXJ2aWNlLmNyZWF0ZVJlY2lwZXMoe1xuICAgICAgaXRlbXM6IHByb2Nlc3NlZFJlY2lwZXMsXG4gICAgfSk7XG4gICAgY29uc3QgcmVzdWx0UmVjaXBlcyA9IHJlc3VsdD8uZGF0YT8ucmVjaXBlcyA/PyBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGlkczogcmVzdWx0UmVjaXBlcy5tYXAoKHJlY2lwZSkgPT4gcmVjaXBlLmlkKSB8fCBbXSxcbiAgICAgIGVudGl0aWVzOiByZXN1bHRSZWNpcGVzLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiByZXN1bHRSZWNpcGVzLm1hcChjb252ZXJ0RmFtaWx5UmVjaXBlRW50aXR5VG9JdGVtKSA/PyBbXSxcbiAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IGNyZWF0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSByZWNpcGVzIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSByZWNpcGVzIGNyZWF0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3QgdXBkYXRlUmVjaXBlVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBVcGRhdGUgcmVjaXBlcyAoc3VwcG9ydHMgYmF0Y2ggdXBkYXRlcykuRXhjZXB0IGlkLmFsbCBmaWVsZHMgYXJlIG9wdGlvbmFsLERvIG5vdCBmaWxsIGZpZWxkcyB0aGF0IGFyZSBub3QgdG8gYmUgdXBkYXRlZC5gLFxuICBpbnB1dFNjaGVtYTogei5vYmplY3Qoe1xuICAgIGl0ZW1zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgIGlkOiB6LnN0cmluZygpLFxuICAgICAgbmFtZTogei5zdHJpbmcoKS5udWxsYWJsZSgpLm9wdGlvbmFsKCksXG4gICAgICBjb29raW5nX3RpbWU6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgc2VydmluZ3M6IHoubnVtYmVyKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgLy8gRGVmaW5lIGFjY29yZGluZyB0byBhY3R1YWwgSW5zdHJ1Y3Rpb25MaXN0IHN0cnVjdHVyZVxuICAgICAgICBzdGVwOiB6Lm51bWJlcigpLFxuICAgICAgICBjb250ZW50OiB6LnN0cmluZygpLFxuICAgICAgICAvLyBPdGhlciBmaWVsZHMuLi5cbiAgICAgIH0pKS5vcHRpb25hbCgpLCAvLyBEZWZpbmUgYWNjb3JkaW5nIHRvIGFjdHVhbCBJbnN0cnVjdGlvbkxpc3Qgc3RydWN0dXJlXG4gICAgICBub3RlOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgIG51dHJpdGlvbl9pbmZvOiB6LnN0cmluZygpLm51bGxhYmxlKCkub3B0aW9uYWwoKSxcbiAgICAgIGluZ3JlZGllbnRzX3F1ZXJ5OiB6LmFycmF5KHouc3RyaW5nKCkpLm51bGxpc2goKS5vcHRpb25hbCgpLmRlc2NyaWJlKFxuICAgICAgICBcIkluZ3JlZGllbnRzIGluIGZvcm1hdDogcXVhbnRpdHkgdW5pdCBuYW1lLiBRdWFudGl0eSBtdXN0IGJlIGFuIGV4YWN0IG51bWJlcihpbnRlZ2VyIG9yIGZsb2F0KSwgbm90IHJhbmdlcyBvciBtaXhlZCBmcmFjdGlvbi4gR29vZCBjYXNlczogJzEgY3VwIGZsb3VyJywgJzIgZWdncycuIEJhZCBjYXNlczogJzEtMiBjdXBzIGZsb3VyJywgJ34xIHRzcCBzdWdhcicsJzEgMS8yIGN1cHMgZmxvdXInXCIsXG4gICAgICApLFxuICAgIH0pKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jIChkYXRhLCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyByZWNpcGVTZXJ2aWNlIH0gPSBjb250ZXh0LnNlcnZpY2VzO1xuICAgIGNvbnN0IGlzT3ZlckxpbWl0ID0gZGF0YS5pdGVtcy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDtcbiAgICBjb25zdCBwcm9jZXNzZWRVcGRhdGVzID0gZGF0YS5pdGVtcy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCkubWFwKCh1cGRhdGUpID0+ICh7XG4gICAgICAuLi51cGRhdGUsXG4gICAgICBpbmdyZWRpZW50c19xdWVyeTogdXBkYXRlLmluZ3JlZGllbnRzX3F1ZXJ5ID8/IFtdLFxuICAgICAgaW1hZ2VzOiBbXSxcbiAgICAgIGluc3RydWN0aW9uczogdXBkYXRlLmluc3RydWN0aW9ucyA/PyB1bmRlZmluZWQsXG4gICAgfSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVjaXBlU2VydmljZS51cGRhdGVSZWNpcGVzKHtcbiAgICAgIGl0ZW1zOiBwcm9jZXNzZWRVcGRhdGVzLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlY2lwZXMgPSByZXN1bHQ/LmRhdGE/LnJlY2lwZXMgPz8gW107XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGlkczogcmVjaXBlcy5tYXAoKHJlY2lwZSkgPT4gcmVjaXBlLmlkKSB8fCBbXSxcbiAgICAgIGVudGl0aWVzOiByZWNpcGVzLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiByZWNpcGVzLm1hcChjb252ZXJ0RmFtaWx5UmVjaXBlRW50aXR5VG9JdGVtKSxcbiAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IHVwZGF0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSByZWNpcGVzIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSByZWNpcGVzIHVwZGF0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3QgZGVsZXRlUmVjaXBlVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBEZWxldGUgcmVjaXBlcy5gLFxuICBpbnB1dFNjaGVtYTogei5vYmplY3Qoe1xuICAgIGlkczogei5zdHJpbmcoKS5hcnJheSgpLmRlc2NyaWJlKFwiUmVjaXBlIElEXCIpLFxuICB9KSxcbiAgZXhlY3V0ZTogYXN5bmMgKHsgaWRzIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IHJlY2lwZVNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBpZHMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVjaXBlU2VydmljZS5kZWxldGVSZWNpcGVzKHtcbiAgICAgIGlkczogaWRzLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KSxcbiAgICB9KTtcbiAgICBjb25zdCByZWNpcGVzID0gcmVzdWx0Py5kYXRhPy5yZWNpcGVzID8/IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IHJlY2lwZXMubWFwKChyZWNpcGUpID0+IHJlY2lwZS5pZCkgfHwgW10sXG4gICAgICBlbnRpdGllczogcmVjaXBlcyxcbiAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgZGF0YTogcmVjaXBlcy5tYXAoY29udmVydEZhbWlseVJlY2lwZUVudGl0eVRvSXRlbSksXG4gICAgICAgIG1lc3NhZ2U6IGlzT3ZlckxpbWl0ID8gYFlvdSBjYW4gb25seSBkZWxldGUgdXAgdG8gJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gcmVjaXBlcyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gcmVjaXBlcyBkZWxldGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHNlYXJjaFJlY2lwZVRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgU2VhcmNoIHJlY2lwZXMuIEVhY2ggY2FsbCByZXR1cm5zIGEgbWF4aW11bSBvZiAxMCByZXN1bHRzLmAsXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgcXVlcnk6IHouc3RyaW5nKCkubnVsbGlzaCgpLFxuICAgIGlkczogei5hcnJheSh6LnN0cmluZygpKS5udWxsaXNoKCksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyBxdWVyeSwgaWRzIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IGNvbWJpbmVkU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb21iaW5lZFNlcnZpY2Uuc2VhcmNoRW50aXR5KHtcbiAgICAgIGNhdGVnb3J5OiBbQ3VzdG9tU2VhcmNoQ2F0ZWdvcnkucmVjaXBlXSxcbiAgICAgIHF1ZXJ5OiBxdWVyeSA/PyB1bmRlZmluZWQsXG4gICAgICByZWNpcGVfZmlsdGVyOiB7XG4gICAgICAgIGlkczogaWRzID8/IFtdLFxuICAgICAgfSxcbiAgICAgIGxpbWl0OiBzZWFyY2hMaW1pdCxcbiAgICB9KTtcbiAgICBjb25zdCBzZWFyY2hSZXN1bHQgPSByZXN1bHQ/LmRhdGE/LnJlY2lwZXM/Lml0ZW1zID8/IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaWRzOiBzZWFyY2hSZXN1bHQubWFwKChyZWNpcGUpID0+IHJlY2lwZS5pZCksXG4gICAgICBlbnRpdGllczogc2VhcmNoUmVzdWx0LFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiBzZWFyY2hSZXN1bHQubWFwKGNvbnZlcnRGYW1pbHlSZWNpcGVFbnRpdHlUb0l0ZW0pLFxuICAgICAgfSxcbiAgICB9O1xuICB9LFxufSk7XG4iXX0=