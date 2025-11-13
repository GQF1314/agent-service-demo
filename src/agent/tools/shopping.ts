import z from "zod/v4";
import { createToolWrapper, maxCreateUpdateDeleteLimit, searchLimit } from "./utils";
import { convertShoppingEntityToItem } from "../../services/interface/entities/shoopingItem";
import { CustomSearchCategory, SearchCategory } from "../../services/actual/combined";

export const createShoppingItemTool = createToolWrapper({
  description: `Add shopping items (supports batch creation).`,
  inputSchema: z.object({
    items: z.array(z.string().describe("Shopping item description, like: 2 piece bread , 5.5 cup of water and so on ")),
  }),
  execute: async ({ items }, options, context) => {
    const { shoppingService } = context.services;
    const isOverLimit = items.length > maxCreateUpdateDeleteLimit;  
    const result = await shoppingService.createShoppingItems({
      items: items.slice(0, maxCreateUpdateDeleteLimit),
    });
    const shoppingItems = result?.data?.items ?? [];
    return {
      success: true,
      ids: shoppingItems.map((item) => item.id),
      entities: shoppingItems,
      modelVisibleData: {
        data: shoppingItems.map(convertShoppingEntityToItem),
        message: isOverLimit ? `You can only create up to ${maxCreateUpdateDeleteLimit} shopping items at a time. Only ${maxCreateUpdateDeleteLimit} shopping items created this time` : undefined,
      },
    };
  },
});

export const updateShoppingItemTool = createToolWrapper({
  description: `Update shopping items (supports batch updates).Except id,all fields are optional,Do not fill fields that are not to be updated.`,
  inputSchema: z.object({
    items: z.array(z.object({
      id: z.string(),
      title: z.string().nullish(),
      quantity: z.string().nullish().describe("fill with integer 、decimal number or fraction number like 1/2, 1.5, 1"),
      unit: z.string().nullish().describe("Unit"),
    })).describe(
      "Array of shopping item updates",
    ),
  }),
  execute: async ({ items }, options, context) => {
    const { shoppingService } = context.services;
    const isOverLimit = items.length > maxCreateUpdateDeleteLimit;
    const result = await shoppingService.updateShoppingItems({ items: items.slice(0, maxCreateUpdateDeleteLimit) });
    const shoppingItems = result?.data?.items ?? [];
    return {
      success: true,
      ids: shoppingItems.map((item) => item.id),
      entities: shoppingItems,
      modelVisibleData: {
        data: shoppingItems.map(convertShoppingEntityToItem),
        message: isOverLimit ? `You can only update up to ${maxCreateUpdateDeleteLimit} shopping items at a time. Only ${maxCreateUpdateDeleteLimit} shopping items updated this time` : undefined,
      },
    };
  },
});

export const deleteShoppingItemTool = createToolWrapper({
  description: `Delete shopping item.`,
  inputSchema: z.object({
    ids: z.string().array().describe("Shopping item ID"),
  }),
  execute: async ({ ids }, options, context) => {
    const { shoppingService } = context.services;
    const isOverLimit = ids.length > maxCreateUpdateDeleteLimit;
    const result = await shoppingService.deleteShoppingItems({ ids: ids.slice(0, maxCreateUpdateDeleteLimit) });
    const shoppingItems = result?.data?.items ?? [];
    return {
      success: true,
      ids: shoppingItems.map((item) => item.id),
      entities: shoppingItems,
      modelVisibleData: {
        data: shoppingItems.map(convertShoppingEntityToItem),
        message: isOverLimit ? `You can only delete up to ${maxCreateUpdateDeleteLimit} shopping items at a time. Only ${maxCreateUpdateDeleteLimit} shopping items deleted this time` : undefined,
      },
    };
  },
});

export const searchShoppingItemTool = createToolWrapper({
  description: `Search shopping items. Each call returns a maximum of 10 results.`,
  inputSchema: z.object({
    query: z.string().nullish(),
    ids: z.array(z.string()).nullish().describe("Shopping item IDs"),
  }),
  execute: async ({ query, ids }, options, context) => {
    const { combinedService } = context.services;
    const result = await combinedService.searchEntity({
      category: [CustomSearchCategory.shopping],
      query: query ?? undefined,
      shopping_filter: {
        ids: ids ?? [],
      },
      limit: searchLimit,
    });
    const searchResult = result?.data?.shoppings?.items ?? [];
    return {
      success: true,
      ids: searchResult.map((shopping) => shopping.id),
      entities: searchResult,
      modelVisibleData: {
        data: searchResult.map(convertShoppingEntityToItem),
      },
    };
  },
});
