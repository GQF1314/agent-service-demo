import z from "zod/v4";
import { createToolWrapper, maxCreateUpdateDeleteLimit, searchLimit } from "./utils";
import { ReminderMethod } from "../../services/interface/entities/task";
import { CustomSearchCategory, SearchCategory } from "../../services/actual/combined";

export const createTaskTool = createToolWrapper({
  description: `Create new tasks (supports batch creation).`,
  inputSchema: z.object({
    tasks: z.array(z.object({
      list_id: z.string().optional().describe("Task list ID"),
      title: z.string().min(1, "Task title cannot be empty").describe(
        "Task title",
      ),
      description: z.string().optional().describe("Task description"),
      location: z.string().optional().describe("Task location"),
      end: z.string().optional().describe("Time when task will be done. Avoid setting times before now without confirmation. ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
      all_day: z.boolean().optional().describe("Task all day"),
      rrule: z.array(z.string()).optional().describe("Task recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
      assignees: z.array(z.string()).optional().describe("Task assignees"),
      reminderRule: z.array(z.object({
        method: z.enum(ReminderMethod).describe("Reminder method"),
        minutes_offset: z.number().describe(
          "Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day.",
        ),
      })).optional().describe("Task reminder rule"),
    })).min(1, "At least one task is required").describe(
      "Array of tasks to create",
    ),
  }),
  execute: async ({ tasks }, options, context) => {
    const { taskService } = context.services;
    try {
      const isOverLimit = tasks.length > maxCreateUpdateDeleteLimit;
      const result = await taskService.createTasksWrapper(tasks.slice(0, maxCreateUpdateDeleteLimit));
      const { data } = result;
      return {
        success: true,
        ids: data?.results?.map((task) => task.task?.id) || [],
        entities: data?.results?.map((task) => task.task) || [],
        modelVisibleData: {
          data: data?.results?.map((task) =>
            taskService.transformTaskToITask(task.task)
          ).filter(Boolean) || [],
          message: isOverLimit ? `You can only create up to ${maxCreateUpdateDeleteLimit} tasks at a time. Only ${maxCreateUpdateDeleteLimit} tasks created this time` : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      };
    }
  },
});

export const updateTaskTool = createToolWrapper({
  description: `Update tasks (supports batch updates).Do not fill fields that are not to be updated.`,
  inputSchema: z.object({
    updates: z.array(z.object({
      id: z.string().min(1, "Task ID cannot be empty").describe("Task ID"),
      list_id: z.string().optional().describe("if not provided ,pick a suitable list id from user's task list. If no suitable list id, leave it blank"),
      title: z.string().optional().describe(
        "Task title",
      ),
      description: z.string().optional().describe("Task description"),
      location: z.string().optional().describe("Task location"),
      end: z.string().optional().describe("Time when task will be done. Avoid setting times before now without confirmation. ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
      all_day: z.boolean().optional().describe("Task all day"),
      rrule: z.array(z.string()).optional().describe("Task recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
      assignees: z.array(z.string()).optional().describe("Task assignees"),
      reminderRule: z.array(z.object({
        method: z.enum(ReminderMethod).describe("Reminder method"),
        minutes_offset: z.number().describe(
          "Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day.",
        ),
      })).optional().describe("Task reminder rule"),
      is_completed: z.boolean().optional().describe("Task is completed"),
    })).min(1, "At least one task update is required").describe(
      "Array of task updates",
    ),
  }),
  execute: async ({ updates }, options, context) => {
    const { taskService } = context.services;
    try {
      const isOverLimit = updates.length > maxCreateUpdateDeleteLimit;
      const result = await taskService.updateTasks({
        tasks: updates.slice(0, maxCreateUpdateDeleteLimit).map((update) =>
          taskService.IUpdateTaskToUpdateTaskRequest(update)
        ),
      });
      const { data } = result;
      return {
        success: true,
        ids: data?.results?.map((task) => task.task?.id) || [],
        entities: data?.results?.map((task) => task.task) || [],
        modelVisibleData: {
          data: data?.results?.map((task) =>
            taskService.transformTaskToITask(task.task)
          ).filter(Boolean) || [],
          message: isOverLimit ? `You can only update up to ${maxCreateUpdateDeleteLimit} tasks at a time. Only ${maxCreateUpdateDeleteLimit} tasks updated this time` : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      };
    }
  },
});

export const deleteTaskTool = createToolWrapper({
  description: `Delete task.`,
  inputSchema: z.object({
    taskIds: z.array(z.string()).min(1, "Task ID cannot be empty").describe(
      "Task ID",
    ),
  }),
  execute: async ({ taskIds }, options, context) => {
    const { taskService } = context.services;
    try {
      const isOverLimit = taskIds.length > maxCreateUpdateDeleteLimit;
      const result = await taskService.deleteTasks({
        tasks: taskIds.slice(0, maxCreateUpdateDeleteLimit).map((id) => ({ id })),
      });
      const { data } = result;
      return {
        success: true,
        ids: data?.results?.map((task) => task.task?.id) || [],
        entities: data?.results?.map((task) => task.task) || [],
        modelVisibleData: {
          data: data?.results?.map((task) => task.task?.id) || [],
          message: isOverLimit ? `You can only delete up to ${maxCreateUpdateDeleteLimit} tasks at a time. Only ${maxCreateUpdateDeleteLimit} tasks deleted this time` : undefined,
        },
        entityType: "task",
        count: 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      };
    }
  },
});

export const searchTaskTool = createToolWrapper({
  description: `Search tasks. Each call returns a maximum of 10 results.`,
  inputSchema: z.object({
    query: z.string().nullish().describe("Search query,include title,description"),
    rangeStart: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
    rangeEnd: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
    assigneeIds: z.array(z.string()).nullish().describe("Assignee IDs"),
  }),
  execute: async (
    { query, rangeStart, rangeEnd, assigneeIds },
    options,
    context,
  ) => {
    const { combinedService, taskService } = context.services;
    const result = await combinedService.searchEntity({
      category: [CustomSearchCategory.task],
      query: query ?? undefined,
      tasks_filter: {
        start: rangeStart ?? undefined,
        end: rangeEnd ?? undefined,
        attendee_ids: assigneeIds ?? [],
        ids: [],
      },
      limit: searchLimit,
    });
    const searchResult = result?.data?.tasks?.items ?? [];
    return {
      success: true,
      ids: searchResult.map((task) => task.id),
      entities: searchResult,
      modelVisibleData: {
        data: searchResult.map((task) =>
          taskService.transformTaskToITask(task)
        ),
      },
    };
  },
});
