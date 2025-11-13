"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchShoppingItemTool = exports.deleteShoppingItemTool = exports.updateShoppingItemTool = exports.createShoppingItemTool = void 0;
const v4_1 = __importDefault(require("zod/v4"));
const utils_1 = require("./utils");
const shoopingItem_1 = require("../../services/interface/entities/shoopingItem");
const combined_1 = require("../../services/actual/combined");
exports.createShoppingItemTool = (0, utils_1.createToolWrapper)({
    description: `Add shopping items (supports batch creation).`,
    inputSchema: v4_1.default.object({
        items: v4_1.default.array(v4_1.default.string().describe("Shopping item description, like: 2 piece bread , 5.5 cup of water and so on ")),
    }),
    execute: async ({ items }, options, context) => {
        const { shoppingService } = context.services;
        const isOverLimit = items.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await shoppingService.createShoppingItems({
            items: items.slice(0, utils_1.maxCreateUpdateDeleteLimit),
        });
        const shoppingItems = result?.data?.items ?? [];
        return {
            success: true,
            ids: shoppingItems.map((item) => item.id),
            entities: shoppingItems,
            modelVisibleData: {
                data: shoppingItems.map(shoopingItem_1.convertShoppingEntityToItem),
                message: isOverLimit ? `You can only create up to ${utils_1.maxCreateUpdateDeleteLimit} shopping items at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} shopping items created this time` : undefined,
            },
        };
    },
});
exports.updateShoppingItemTool = (0, utils_1.createToolWrapper)({
    description: `Update shopping items (supports batch updates).Except id,all fields are optional,Do not fill fields that are not to be updated.`,
    inputSchema: v4_1.default.object({
        items: v4_1.default.array(v4_1.default.object({
            id: v4_1.default.string(),
            title: v4_1.default.string().nullish(),
            quantity: v4_1.default.string().nullish().describe("fill with integer 、decimal number or fraction number like 1/2, 1.5, 1"),
            unit: v4_1.default.string().nullish().describe("Unit"),
        })).describe("Array of shopping item updates"),
    }),
    execute: async ({ items }, options, context) => {
        const { shoppingService } = context.services;
        const isOverLimit = items.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await shoppingService.updateShoppingItems({ items: items.slice(0, utils_1.maxCreateUpdateDeleteLimit) });
        const shoppingItems = result?.data?.items ?? [];
        return {
            success: true,
            ids: shoppingItems.map((item) => item.id),
            entities: shoppingItems,
            modelVisibleData: {
                data: shoppingItems.map(shoopingItem_1.convertShoppingEntityToItem),
                message: isOverLimit ? `You can only update up to ${utils_1.maxCreateUpdateDeleteLimit} shopping items at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} shopping items updated this time` : undefined,
            },
        };
    },
});
exports.deleteShoppingItemTool = (0, utils_1.createToolWrapper)({
    description: `Delete shopping item.`,
    inputSchema: v4_1.default.object({
        ids: v4_1.default.string().array().describe("Shopping item ID"),
    }),
    execute: async ({ ids }, options, context) => {
        const { shoppingService } = context.services;
        const isOverLimit = ids.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await shoppingService.deleteShoppingItems({ ids: ids.slice(0, utils_1.maxCreateUpdateDeleteLimit) });
        const shoppingItems = result?.data?.items ?? [];
        return {
            success: true,
            ids: shoppingItems.map((item) => item.id),
            entities: shoppingItems,
            modelVisibleData: {
                data: shoppingItems.map(shoopingItem_1.convertShoppingEntityToItem),
                message: isOverLimit ? `You can only delete up to ${utils_1.maxCreateUpdateDeleteLimit} shopping items at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} shopping items deleted this time` : undefined,
            },
        };
    },
});
exports.searchShoppingItemTool = (0, utils_1.createToolWrapper)({
    description: `Search shopping items. Each call returns a maximum of 10 results.`,
    inputSchema: v4_1.default.object({
        query: v4_1.default.string().nullish(),
        ids: v4_1.default.array(v4_1.default.string()).nullish().describe("Shopping item IDs"),
    }),
    execute: async ({ query, ids }, options, context) => {
        const { combinedService } = context.services;
        const result = await combinedService.searchEntity({
            category: [combined_1.CustomSearchCategory.shopping],
            query: query ?? undefined,
            shopping_filter: {
                ids: ids ?? [],
            },
            limit: utils_1.searchLimit,
        });
        const searchResult = result?.data?.shoppings?.items ?? [];
        return {
            success: true,
            ids: searchResult.map((shopping) => shopping.id),
            entities: searchResult,
            modelVisibleData: {
                data: searchResult.map(shoopingItem_1.convertShoppingEntityToItem),
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvcHBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvdG9vbHMvc2hvcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0RBQXVCO0FBQ3ZCLG1DQUFxRjtBQUNyRixpRkFBNkY7QUFDN0YsNkRBQXNGO0FBRXpFLFFBQUEsc0JBQXNCLEdBQUcsSUFBQSx5QkFBaUIsRUFBQztJQUN0RCxXQUFXLEVBQUUsK0NBQStDO0lBQzVELFdBQVcsRUFBRSxZQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3BCLEtBQUssRUFBRSxZQUFDLENBQUMsS0FBSyxDQUFDLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsOEVBQThFLENBQUMsQ0FBQztLQUNwSCxDQUFDO0lBQ0YsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUM3QyxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUM3QyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLGtDQUEwQixDQUFDO1FBQzlELE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBZSxDQUFDLG1CQUFtQixDQUFDO1lBQ3ZELEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxrQ0FBMEIsQ0FBQztTQUNsRCxDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDaEQsT0FBTztZQUNMLE9BQU8sRUFBRSxJQUFJO1lBQ2IsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDekMsUUFBUSxFQUFFLGFBQWE7WUFDdkIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLElBQUks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QUFlLEVBQUU7Z0JBQ2YsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFO2FBQ2Y7WUFDRCxLQUFLLEVBQUUsbUJBQVc7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUMxRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLElBQUk7WUFDYixHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNoRCxRQUFRLEVBQUUsWUFBWTtZQUN0QixnQkFBZ0IsRUFBRTtnQkFDaEIsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsMENBQTJCLENBQUM7YUFDcEQ7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB6IGZyb20gXCJ6b2QvdjRcIjtcbmltcG9ydCB7IGNyZWF0ZVRvb2xXcmFwcGVyLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCwgc2VhcmNoTGltaXQgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgY29udmVydFNob3BwaW5nRW50aXR5VG9JdGVtIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2ludGVyZmFjZS9lbnRpdGllcy9zaG9vcGluZ0l0ZW1cIjtcbmltcG9ydCB7IEN1c3RvbVNlYXJjaENhdGVnb3J5LCBTZWFyY2hDYXRlZ29yeSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9hY3R1YWwvY29tYmluZWRcIjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNob3BwaW5nSXRlbVRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgQWRkIHNob3BwaW5nIGl0ZW1zIChzdXBwb3J0cyBiYXRjaCBjcmVhdGlvbikuYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBpdGVtczogei5hcnJheSh6LnN0cmluZygpLmRlc2NyaWJlKFwiU2hvcHBpbmcgaXRlbSBkZXNjcmlwdGlvbiwgbGlrZTogMiBwaWVjZSBicmVhZCAsIDUuNSBjdXAgb2Ygd2F0ZXIgYW5kIHNvIG9uIFwiKSksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyBpdGVtcyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBzaG9wcGluZ1NlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBpdGVtcy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDsgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNob3BwaW5nU2VydmljZS5jcmVhdGVTaG9wcGluZ0l0ZW1zKHtcbiAgICAgIGl0ZW1zOiBpdGVtcy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCksXG4gICAgfSk7XG4gICAgY29uc3Qgc2hvcHBpbmdJdGVtcyA9IHJlc3VsdD8uZGF0YT8uaXRlbXMgPz8gW107XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IHNob3BwaW5nSXRlbXMubWFwKChpdGVtKSA9PiBpdGVtLmlkKSxcbiAgICAgIGVudGl0aWVzOiBzaG9wcGluZ0l0ZW1zLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiBzaG9wcGluZ0l0ZW1zLm1hcChjb252ZXJ0U2hvcHBpbmdFbnRpdHlUb0l0ZW0pLFxuICAgICAgICBtZXNzYWdlOiBpc092ZXJMaW1pdCA/IGBZb3UgY2FuIG9ubHkgY3JlYXRlIHVwIHRvICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IHNob3BwaW5nIGl0ZW1zIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBzaG9wcGluZyBpdGVtcyBjcmVhdGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZVNob3BwaW5nSXRlbVRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgVXBkYXRlIHNob3BwaW5nIGl0ZW1zIChzdXBwb3J0cyBiYXRjaCB1cGRhdGVzKS5FeGNlcHQgaWQsYWxsIGZpZWxkcyBhcmUgb3B0aW9uYWwsRG8gbm90IGZpbGwgZmllbGRzIHRoYXQgYXJlIG5vdCB0byBiZSB1cGRhdGVkLmAsXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgaXRlbXM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgaWQ6IHouc3RyaW5nKCksXG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5udWxsaXNoKCksXG4gICAgICBxdWFudGl0eTogei5zdHJpbmcoKS5udWxsaXNoKCkuZGVzY3JpYmUoXCJmaWxsIHdpdGggaW50ZWdlciDjgIFkZWNpbWFsIG51bWJlciBvciBmcmFjdGlvbiBudW1iZXIgbGlrZSAxLzIsIDEuNSwgMVwiKSxcbiAgICAgIHVuaXQ6IHouc3RyaW5nKCkubnVsbGlzaCgpLmRlc2NyaWJlKFwiVW5pdFwiKSxcbiAgICB9KSkuZGVzY3JpYmUoXG4gICAgICBcIkFycmF5IG9mIHNob3BwaW5nIGl0ZW0gdXBkYXRlc1wiLFxuICAgICksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyBpdGVtcyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBzaG9wcGluZ1NlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBpdGVtcy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzaG9wcGluZ1NlcnZpY2UudXBkYXRlU2hvcHBpbmdJdGVtcyh7IGl0ZW1zOiBpdGVtcy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCkgfSk7XG4gICAgY29uc3Qgc2hvcHBpbmdJdGVtcyA9IHJlc3VsdD8uZGF0YT8uaXRlbXMgPz8gW107XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IHNob3BwaW5nSXRlbXMubWFwKChpdGVtKSA9PiBpdGVtLmlkKSxcbiAgICAgIGVudGl0aWVzOiBzaG9wcGluZ0l0ZW1zLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiBzaG9wcGluZ0l0ZW1zLm1hcChjb252ZXJ0U2hvcHBpbmdFbnRpdHlUb0l0ZW0pLFxuICAgICAgICBtZXNzYWdlOiBpc092ZXJMaW1pdCA/IGBZb3UgY2FuIG9ubHkgdXBkYXRlIHVwIHRvICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IHNob3BwaW5nIGl0ZW1zIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBzaG9wcGluZyBpdGVtcyB1cGRhdGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZVNob3BwaW5nSXRlbVRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgRGVsZXRlIHNob3BwaW5nIGl0ZW0uYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBpZHM6IHouc3RyaW5nKCkuYXJyYXkoKS5kZXNjcmliZShcIlNob3BwaW5nIGl0ZW0gSURcIiksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyBpZHMgfSwgb3B0aW9ucywgY29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHsgc2hvcHBpbmdTZXJ2aWNlIH0gPSBjb250ZXh0LnNlcnZpY2VzO1xuICAgIGNvbnN0IGlzT3ZlckxpbWl0ID0gaWRzLmxlbmd0aCA+IG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0O1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNob3BwaW5nU2VydmljZS5kZWxldGVTaG9wcGluZ0l0ZW1zKHsgaWRzOiBpZHMuc2xpY2UoMCwgbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQpIH0pO1xuICAgIGNvbnN0IHNob3BwaW5nSXRlbXMgPSByZXN1bHQ/LmRhdGE/Lml0ZW1zID8/IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaWRzOiBzaG9wcGluZ0l0ZW1zLm1hcCgoaXRlbSkgPT4gaXRlbS5pZCksXG4gICAgICBlbnRpdGllczogc2hvcHBpbmdJdGVtcyxcbiAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgZGF0YTogc2hvcHBpbmdJdGVtcy5tYXAoY29udmVydFNob3BwaW5nRW50aXR5VG9JdGVtKSxcbiAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IGRlbGV0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBzaG9wcGluZyBpdGVtcyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gc2hvcHBpbmcgaXRlbXMgZGVsZXRlZCB0aGlzIHRpbWVgIDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuICB9LFxufSk7XG5cbmV4cG9ydCBjb25zdCBzZWFyY2hTaG9wcGluZ0l0ZW1Ub29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYFNlYXJjaCBzaG9wcGluZyBpdGVtcy4gRWFjaCBjYWxsIHJldHVybnMgYSBtYXhpbXVtIG9mIDEwIHJlc3VsdHMuYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBxdWVyeTogei5zdHJpbmcoKS5udWxsaXNoKCksXG4gICAgaWRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm51bGxpc2goKS5kZXNjcmliZShcIlNob3BwaW5nIGl0ZW0gSURzXCIpLFxuICB9KSxcbiAgZXhlY3V0ZTogYXN5bmMgKHsgcXVlcnksIGlkcyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBjb21iaW5lZFNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29tYmluZWRTZXJ2aWNlLnNlYXJjaEVudGl0eSh7XG4gICAgICBjYXRlZ29yeTogW0N1c3RvbVNlYXJjaENhdGVnb3J5LnNob3BwaW5nXSxcbiAgICAgIHF1ZXJ5OiBxdWVyeSA/PyB1bmRlZmluZWQsXG4gICAgICBzaG9wcGluZ19maWx0ZXI6IHtcbiAgICAgICAgaWRzOiBpZHMgPz8gW10sXG4gICAgICB9LFxuICAgICAgbGltaXQ6IHNlYXJjaExpbWl0LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlYXJjaFJlc3VsdCA9IHJlc3VsdD8uZGF0YT8uc2hvcHBpbmdzPy5pdGVtcyA/PyBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGlkczogc2VhcmNoUmVzdWx0Lm1hcCgoc2hvcHBpbmcpID0+IHNob3BwaW5nLmlkKSxcbiAgICAgIGVudGl0aWVzOiBzZWFyY2hSZXN1bHQsXG4gICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgIGRhdGE6IHNlYXJjaFJlc3VsdC5tYXAoY29udmVydFNob3BwaW5nRW50aXR5VG9JdGVtKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuIl19