import { z } from "zod/v4";
import { createToolWrapper } from "./utils";
import { CustomSearchCategory } from "../../services/actual/combined";
import {
  convertMealPlanEntityToItem,
  IMealPlanEntity,
  MealType,
} from "../../services/interface/entities/mealPlan";
import {
  convertFamilyRecipeEntityToItem,
  IFamilyRecipeEntity,
  RecipeSource,
} from "../../services/interface/entities/recipe";
import {
  convertShoppingEntityToItem,
  IShoppingItemEntity,
} from "../../services/interface/entities/shoopingItem";
import { ITaskEntity } from "../../services/interface/entities/task";
import { IEventEntity } from "../../services/interface/entities/event";
import { IEntityType } from "../../services/actual/type";
export const searchEntityTool = createToolWrapper({
  description:
    `Tool for searching entities, like event(calendarEvent), task(todoItem), shopping(shoppingItem), mealplan(mealItem), recipe(recipeItem)`,
  inputSchema: z.object({
    category: z.array(z.enum(CustomSearchCategory)),
    query: z.string().optional(),
    recipe_filter: z.object({
      ids: z.array(z.string()),
    }).optional(),
    mealplan_filter: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      meal_type: z.enum(MealType).optional(),
      ids: z.array(z.string()),
    }).optional(),
    tasks_filter: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      ids: z.array(z.string()),
      attendee_ids: z.array(z.string()),
    }).optional(),
    event_filter: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      ids: z.array(z.string()),
      attendee_ids: z.array(z.string()),
    }).optional(),
    shopping_filter: z.object({
      ids: z.array(z.string()),
    }).optional(),
    limit: z.number().int().positive(),
  }),
  execute: async (params, options, context) => {
    const { combinedService, taskService, calendarService } = context.services;
    const result = await combinedService.searchEntity(params);
    const entities: {
      type: IEntityType;
      entity:
        | ITaskEntity
        | IEventEntity
        | IMealPlanEntity
        | IShoppingItemEntity
        | IFamilyRecipeEntity;
    }[] = [];
    result?.data?.recipes?.items?.forEach((recipe) => {
      entities.push({ type: IEntityType.recipe, entity: recipe });
    });
    result?.data?.mealplans?.items?.forEach((mealplan) => {
      entities.push({ type: IEntityType.mealPlan, entity: mealplan });
    });
    result?.data?.shoppings?.items?.forEach((shopping) => {
      entities.push({ type: IEntityType.shoppingItem, entity: shopping });
    });
    result?.data?.tasks?.items?.forEach((task) => {
      entities.push({ type: IEntityType.task, entity: task });
    });
    result?.data?.event?.items?.forEach((event) => {
      entities.push({ type: IEntityType.calendar, entity: event });
    });
    return {
      success: true,
      combined_entities: entities.map((entity) => {
        return {
          type: entity.type,
          item: entity.entity,
        };
      }),
      modelVisibleData: {
        data: {
          recipes: result?.data?.recipes?.items?.map(
            convertFamilyRecipeEntityToItem,
          ),
          mealplans: result?.data?.mealplans?.items?.map(
            convertMealPlanEntityToItem,
          ),
          shoppings: result?.data?.shoppings?.items?.map(
            convertShoppingEntityToItem,
          ),
          tasks: result?.data?.tasks?.items?.map(taskService.transformTaskToITask),
          event: result?.data?.event?.items?.map(
            calendarService.transformEventToIEvent,
          ),
        },
      },
    };
  },
});

export const deleteEntityTool = createToolWrapper({
  description:
    `tool for deleting entities, like event(calendarEvent), task(todoItem), shopping(shoppingItem), mealplan(mealItem), recipe(recipeItem)`,
  inputSchema: z.object({
    taskIds: z.array(z.string()).optional(),
    eventIds: z.array(z.string()).optional(),
    recipeIds: z.array(z.string()).optional(),
    mealPlanIds: z.array(z.string()).optional(),
    shoppingIds: z.array(z.string()).optional(),
  }),
  execute: async (params, options, context) => {
    const { combinedService, taskService, calendarService } = context.services;
    const result = await combinedService.deleteEntity(params);
    return {
      success: true,
      ids: result.map((entity) => entity.item?.id),
      combined_entities: result.map((entity) => ({
        type: entity.type,
        item: entity.item,
      })),
      modelVisibleData: {
        data: {
          recipes: result.filter((entity) => entity.type === IEntityType.recipe)
            .map(
              (v) => {
                return v.item
                  ? convertFamilyRecipeEntityToItem(
                    v.item as IFamilyRecipeEntity,
                  )
                  : undefined;
              },
            ),
          mealplans: result.filter((entity) =>
            entity.type === IEntityType.mealPlan
          ).map(
            (v) => {
              return v.item
                ? convertMealPlanEntityToItem(v.item as IMealPlanEntity)
                : undefined;
            },
          ),
          shoppings: result.filter((entity) =>
            entity.type === IEntityType.shoppingItem
          ).map(
            (v) => {
              return v.item
                ? convertShoppingEntityToItem(v.item as IShoppingItemEntity)
                : undefined;
            },
          ),
          tasks: result.filter((entity) => entity.type === IEntityType.task)
            .map(
              (v) => {
                return v.item
                  ? taskService.transformTaskToITask(v.item as ITaskEntity)
                  : undefined;
              },
            ),
          event: result.filter((entity) => entity.type === IEntityType.calendar)
            .map(
              (v) => {
                return v.item
                  ? calendarService.transformEventToIEvent(
                    v.item as IEventEntity,
                  )
                  : undefined;
              },
            ),
        },
      },
    };
  },
});
