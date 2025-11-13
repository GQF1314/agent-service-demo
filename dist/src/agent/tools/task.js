"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTaskTool = exports.deleteTaskTool = exports.updateTaskTool = exports.createTaskTool = void 0;
const v4_1 = __importDefault(require("zod/v4"));
const utils_1 = require("./utils");
const task_1 = require("../../services/interface/entities/task");
const combined_1 = require("../../services/actual/combined");
exports.createTaskTool = (0, utils_1.createToolWrapper)({
    description: `Create new tasks (supports batch creation).`,
    inputSchema: v4_1.default.object({
        tasks: v4_1.default.array(v4_1.default.object({
            list_id: v4_1.default.string().optional().describe("Task list ID"),
            title: v4_1.default.string().min(1, "Task title cannot be empty").describe("Task title"),
            description: v4_1.default.string().optional().describe("Task description"),
            location: v4_1.default.string().optional().describe("Task location"),
            end: v4_1.default.string().optional().describe("Time when task will be done. Avoid setting times before now without confirmation. ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            all_day: v4_1.default.boolean().optional().describe("Task all day"),
            rrule: v4_1.default.array(v4_1.default.string()).optional().describe("Task recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
            assignees: v4_1.default.array(v4_1.default.string()).optional().describe("Task assignees"),
            reminderRule: v4_1.default.array(v4_1.default.object({
                method: v4_1.default.enum(task_1.ReminderMethod).describe("Reminder method"),
                minutes_offset: v4_1.default.number().describe("Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day."),
            })).optional().describe("Task reminder rule"),
        })).min(1, "At least one task is required").describe("Array of tasks to create"),
    }),
    execute: async ({ tasks }, options, context) => {
        const { taskService } = context.services;
        try {
            const isOverLimit = tasks.length > utils_1.maxCreateUpdateDeleteLimit;
            const result = await taskService.createTasksWrapper(tasks.slice(0, utils_1.maxCreateUpdateDeleteLimit));
            const { data } = result;
            return {
                success: true,
                ids: data?.results?.map((task) => task.task?.id) || [],
                entities: data?.results?.map((task) => task.task) || [],
                modelVisibleData: {
                    data: data?.results?.map((task) => taskService.transformTaskToITask(task.task)).filter(Boolean) || [],
                    message: isOverLimit ? `You can only create up to ${utils_1.maxCreateUpdateDeleteLimit} tasks at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} tasks created this time` : undefined,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "unknown error",
            };
        }
    },
});
exports.updateTaskTool = (0, utils_1.createToolWrapper)({
    description: `Update tasks (supports batch updates).Do not fill fields that are not to be updated.`,
    inputSchema: v4_1.default.object({
        updates: v4_1.default.array(v4_1.default.object({
            id: v4_1.default.string().min(1, "Task ID cannot be empty").describe("Task ID"),
            list_id: v4_1.default.string().optional().describe("if not provided ,pick a suitable list id from user's task list. If no suitable list id, leave it blank"),
            title: v4_1.default.string().optional().describe("Task title"),
            description: v4_1.default.string().optional().describe("Task description"),
            location: v4_1.default.string().optional().describe("Task location"),
            end: v4_1.default.string().optional().describe("Time when task will be done. Avoid setting times before now without confirmation. ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            all_day: v4_1.default.boolean().optional().describe("Task all day"),
            rrule: v4_1.default.array(v4_1.default.string()).optional().describe("Task recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
            assignees: v4_1.default.array(v4_1.default.string()).optional().describe("Task assignees"),
            reminderRule: v4_1.default.array(v4_1.default.object({
                method: v4_1.default.enum(task_1.ReminderMethod).describe("Reminder method"),
                minutes_offset: v4_1.default.number().describe("Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day."),
            })).optional().describe("Task reminder rule"),
            is_completed: v4_1.default.boolean().optional().describe("Task is completed"),
        })).min(1, "At least one task update is required").describe("Array of task updates"),
    }),
    execute: async ({ updates }, options, context) => {
        const { taskService } = context.services;
        try {
            const isOverLimit = updates.length > utils_1.maxCreateUpdateDeleteLimit;
            const result = await taskService.updateTasks({
                tasks: updates.slice(0, utils_1.maxCreateUpdateDeleteLimit).map((update) => taskService.IUpdateTaskToUpdateTaskRequest(update)),
            });
            const { data } = result;
            return {
                success: true,
                ids: data?.results?.map((task) => task.task?.id) || [],
                entities: data?.results?.map((task) => task.task) || [],
                modelVisibleData: {
                    data: data?.results?.map((task) => taskService.transformTaskToITask(task.task)).filter(Boolean) || [],
                    message: isOverLimit ? `You can only update up to ${utils_1.maxCreateUpdateDeleteLimit} tasks at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} tasks updated this time` : undefined,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "unknown error",
            };
        }
    },
});
exports.deleteTaskTool = (0, utils_1.createToolWrapper)({
    description: `Delete task.`,
    inputSchema: v4_1.default.object({
        taskIds: v4_1.default.array(v4_1.default.string()).min(1, "Task ID cannot be empty").describe("Task ID"),
    }),
    execute: async ({ taskIds }, options, context) => {
        const { taskService } = context.services;
        try {
            const isOverLimit = taskIds.length > utils_1.maxCreateUpdateDeleteLimit;
            const result = await taskService.deleteTasks({
                tasks: taskIds.slice(0, utils_1.maxCreateUpdateDeleteLimit).map((id) => ({ id })),
            });
            const { data } = result;
            return {
                success: true,
                ids: data?.results?.map((task) => task.task?.id) || [],
                entities: data?.results?.map((task) => task.task) || [],
                modelVisibleData: {
                    data: data?.results?.map((task) => task.task?.id) || [],
                    message: isOverLimit ? `You can only delete up to ${utils_1.maxCreateUpdateDeleteLimit} tasks at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} tasks deleted this time` : undefined,
                },
                entityType: "task",
                count: 1,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "unknown error",
            };
        }
    },
});
exports.searchTaskTool = (0, utils_1.createToolWrapper)({
    description: `Search tasks. Each call returns a maximum of 10 results.`,
    inputSchema: v4_1.default.object({
        query: v4_1.default.string().nullish().describe("Search query,include title,description"),
        rangeStart: v4_1.default.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
        rangeEnd: v4_1.default.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
        assigneeIds: v4_1.default.array(v4_1.default.string()).nullish().describe("Assignee IDs"),
    }),
    execute: async ({ query, rangeStart, rangeEnd, assigneeIds }, options, context) => {
        const { combinedService, taskService } = context.services;
        const result = await combinedService.searchEntity({
            category: [combined_1.CustomSearchCategory.task],
            query: query ?? undefined,
            tasks_filter: {
                start: rangeStart ?? undefined,
                end: rangeEnd ?? undefined,
                attendee_ids: assigneeIds ?? [],
                ids: [],
            },
            limit: utils_1.searchLimit,
        });
        const searchResult = result?.data?.tasks?.items ?? [];
        return {
            success: true,
            ids: searchResult.map((task) => task.id),
            entities: searchResult,
            modelVisibleData: {
                data: searchResult.map((task) => taskService.transformTaskToITask(task)),
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hZ2VudC90b29scy90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQUF1QjtBQUN2QixtQ0FBcUY7QUFDckYsaUVBQXdFO0FBQ3hFLDZEQUFzRjtBQUV6RSxRQUFBLGNBQWMsR0FBRyxJQUFBLHlCQUFpQixFQUFDO0lBQzlDLFdBQVcsRUFBRSw2Q0FBNkM7SUFDMUQsV0FBVyxFQUFFLFlBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEIsS0FBSyxFQUFFLFlBQUMsQ0FBQyxLQUFLLENBQUMsWUFBQyxDQUFDLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDdkQsS0FBSyxFQUFFLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUMsUUFBUSxDQUM3RCxZQUFZLENBQ2I7WUFDRCxXQUFXLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztZQUMvRCxRQUFRLEVBQUUsWUFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7WUFDekQsR0FBRyxFQUFFLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsNElBQTRJLENBQUM7WUFDakwsT0FBTyxFQUFFLFlBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQ3hELEtBQUssRUFBRSxZQUFDLENBQUMsS0FBSyxDQUFDLFlBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FB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QUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN0RCxPQUFPO1lBQ0wsT0FBTyxFQUFFLElBQUk7WUFDYixHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4QyxRQUFRLEVBQUUsWUFBWTtZQUN0QixnQkFBZ0IsRUFBRTtnQkFDaEIsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUM5QixXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQ3ZDO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB6IGZyb20gXCJ6b2QvdjRcIjtcbmltcG9ydCB7IGNyZWF0ZVRvb2xXcmFwcGVyLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCwgc2VhcmNoTGltaXQgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgUmVtaW5kZXJNZXRob2QgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvaW50ZXJmYWNlL2VudGl0aWVzL3Rhc2tcIjtcbmltcG9ydCB7IEN1c3RvbVNlYXJjaENhdGVnb3J5LCBTZWFyY2hDYXRlZ29yeSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9hY3R1YWwvY29tYmluZWRcIjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRhc2tUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYENyZWF0ZSBuZXcgdGFza3MgKHN1cHBvcnRzIGJhdGNoIGNyZWF0aW9uKS5gLFxuICBpbnB1dFNjaGVtYTogei5vYmplY3Qoe1xuICAgIHRhc2tzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgIGxpc3RfaWQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgbGlzdCBJRFwiKSxcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLm1pbigxLCBcIlRhc2sgdGl0bGUgY2Fubm90IGJlIGVtcHR5XCIpLmRlc2NyaWJlKFxuICAgICAgICBcIlRhc2sgdGl0bGVcIixcbiAgICAgICksXG4gICAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiVGFzayBkZXNjcmlwdGlvblwiKSxcbiAgICAgIGxvY2F0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJUYXNrIGxvY2F0aW9uXCIpLFxuICAgICAgZW5kOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJUaW1lIHdoZW4gdGFzayB3aWxsIGJlIGRvbmUuIEF2b2lkIHNldHRpbmcgdGltZXMgYmVmb3JlIG5vdyB3aXRob3V0IGNvbmZpcm1hdGlvbi4gSVNPIGZvcm1hdCB3aXRoIHRpbWV6b25lLCBsaWtlIDIwMjUtMDktMTVUMTA6MDA6MDArMDg6MDBcIiksXG4gICAgICBhbGxfZGF5OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiVGFzayBhbGwgZGF5XCIpLFxuICAgICAgcnJ1bGU6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgcmVjdXJyZW5jZSBydWxlLCBmb2xsb3dpbmcgdGhlIGlDYWxlbmRhciBzcGVjaWZpY2F0aW9uLiBUaGUgRlJFUSBmaWVsZCBpcyBsaW1pdGVkIHRvIFlFQVJMWSwgTU9OVEhMWSwgV0VFS0xZLCBhbmQgREFJTFkgdmFsdWVzLiBGb3IgbW9yZSBjb21wbGV4IHJlY3VycmVuY2UgcGF0dGVybnMsIHVzZSB0aGUgSU5URVJWQUwgcGFyYW1ldGVyIGluIGNvbWJpbmF0aW9uIHdpdGggRlJFUS5cIiksXG4gICAgICBhc3NpZ25lZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgYXNzaWduZWVzXCIpLFxuICAgICAgcmVtaW5kZXJSdWxlOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbWV0aG9kOiB6LmVudW0oUmVtaW5kZXJNZXRob2QpLmRlc2NyaWJlKFwiUmVtaW5kZXIgbWV0aG9kXCIpLFxuICAgICAgICBtaW51dGVzX29mZnNldDogei5udW1iZXIoKS5kZXNjcmliZShcbiAgICAgICAgICBcIk1pbnV0ZXMgb2Zmc2V0IGZvciByZW1pbmRlciB0aW1lLiBGb3Igbm9uLWFsbC1kYXkgZXZlbnRzL3Rhc2tzOiBuZWdhdGl2ZSB2YWx1ZSBmb3IgYWR2YW5jZSByZW1pbmRlciwgcmVsYXRpdmUgdG8gc3RhcnQgdGltZSAoZXZlbnQpIG9yIGR1ZSB0aW1lICh0YXNrKS4gRS5nLiwgLTE1IG1lYW5zIDE1IG1pbnV0ZXMgYmVmb3JlLCAwIG1lYW5zIGF0IGR1ZSB0aW1lLiBGb3IgYWxsLWRheSBldmVudHMvdGFza3M6IG9mZnNldCBmcm9tIG1pZG5pZ2h0ICgwMDowMCkgb2YgdGhlIGV2ZW50IGRheS4gRS5nLiwgNTQwIG1lYW5zIDk6MDAgQU0gc2FtZSBkYXksIC0xODAgbWVhbnMgOTowMCBQTSBwcmV2aW91cyBkYXkuXCIsXG4gICAgICAgICksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgcmVtaW5kZXIgcnVsZVwiKSxcbiAgICB9KSkubWluKDEsIFwiQXQgbGVhc3Qgb25lIHRhc2sgaXMgcmVxdWlyZWRcIikuZGVzY3JpYmUoXG4gICAgICBcIkFycmF5IG9mIHRhc2tzIHRvIGNyZWF0ZVwiLFxuICAgICksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyB0YXNrcyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyB0YXNrU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICB0cnkge1xuICAgICAgY29uc3QgaXNPdmVyTGltaXQgPSB0YXNrcy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2tTZXJ2aWNlLmNyZWF0ZVRhc2tzV3JhcHBlcih0YXNrcy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCkpO1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSByZXN1bHQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBpZHM6IGRhdGE/LnJlc3VsdHM/Lm1hcCgodGFzaykgPT4gdGFzay50YXNrPy5pZCkgfHwgW10sXG4gICAgICAgIGVudGl0aWVzOiBkYXRhPy5yZXN1bHRzPy5tYXAoKHRhc2spID0+IHRhc2sudGFzaykgfHwgW10sXG4gICAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgICBkYXRhOiBkYXRhPy5yZXN1bHRzPy5tYXAoKHRhc2spID0+XG4gICAgICAgICAgICB0YXNrU2VydmljZS50cmFuc2Zvcm1UYXNrVG9JVGFzayh0YXNrLnRhc2spXG4gICAgICAgICAgKS5maWx0ZXIoQm9vbGVhbikgfHwgW10sXG4gICAgICAgICAgbWVzc2FnZTogaXNPdmVyTGltaXQgPyBgWW91IGNhbiBvbmx5IGNyZWF0ZSB1cCB0byAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSB0YXNrcyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gdGFza3MgY3JlYXRlZCB0aGlzIHRpbWVgIDogdW5kZWZpbmVkLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwidW5rbm93biBlcnJvclwiLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZVRhc2tUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYFVwZGF0ZSB0YXNrcyAoc3VwcG9ydHMgYmF0Y2ggdXBkYXRlcykuRG8gbm90IGZpbGwgZmllbGRzIHRoYXQgYXJlIG5vdCB0byBiZSB1cGRhdGVkLmAsXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgdXBkYXRlczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICBpZDogei5zdHJpbmcoKS5taW4oMSwgXCJUYXNrIElEIGNhbm5vdCBiZSBlbXB0eVwiKS5kZXNjcmliZShcIlRhc2sgSURcIiksXG4gICAgICBsaXN0X2lkOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJpZiBub3QgcHJvdmlkZWQgLHBpY2sgYSBzdWl0YWJsZSBsaXN0IGlkIGZyb20gdXNlcidzIHRhc2sgbGlzdC4gSWYgbm8gc3VpdGFibGUgbGlzdCBpZCwgbGVhdmUgaXQgYmxhbmtcIiksXG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFxuICAgICAgICBcIlRhc2sgdGl0bGVcIixcbiAgICAgICksXG4gICAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiVGFzayBkZXNjcmlwdGlvblwiKSxcbiAgICAgIGxvY2F0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJUYXNrIGxvY2F0aW9uXCIpLFxuICAgICAgZW5kOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJUaW1lIHdoZW4gdGFzayB3aWxsIGJlIGRvbmUuIEF2b2lkIHNldHRpbmcgdGltZXMgYmVmb3JlIG5vdyB3aXRob3V0IGNvbmZpcm1hdGlvbi4gSVNPIGZvcm1hdCB3aXRoIHRpbWV6b25lLCBsaWtlIDIwMjUtMDktMTVUMTA6MDA6MDArMDg6MDBcIiksXG4gICAgICBhbGxfZGF5OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiVGFzayBhbGwgZGF5XCIpLFxuICAgICAgcnJ1bGU6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgcmVjdXJyZW5jZSBydWxlLCBmb2xsb3dpbmcgdGhlIGlDYWxlbmRhciBzcGVjaWZpY2F0aW9uLiBUaGUgRlJFUSBmaWVsZCBpcyBsaW1pdGVkIHRvIFlFQVJMWSwgTU9OVEhMWSwgV0VFS0xZLCBhbmQgREFJTFkgdmFsdWVzLiBGb3IgbW9yZSBjb21wbGV4IHJlY3VycmVuY2UgcGF0dGVybnMsIHVzZSB0aGUgSU5URVJWQUwgcGFyYW1ldGVyIGluIGNvbWJpbmF0aW9uIHdpdGggRlJFUS5cIiksXG4gICAgICBhc3NpZ25lZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgYXNzaWduZWVzXCIpLFxuICAgICAgcmVtaW5kZXJSdWxlOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbWV0aG9kOiB6LmVudW0oUmVtaW5kZXJNZXRob2QpLmRlc2NyaWJlKFwiUmVtaW5kZXIgbWV0aG9kXCIpLFxuICAgICAgICBtaW51dGVzX29mZnNldDogei5udW1iZXIoKS5kZXNjcmliZShcbiAgICAgICAgICBcIk1pbnV0ZXMgb2Zmc2V0IGZvciByZW1pbmRlciB0aW1lLiBGb3Igbm9uLWFsbC1kYXkgZXZlbnRzL3Rhc2tzOiBuZWdhdGl2ZSB2YWx1ZSBmb3IgYWR2YW5jZSByZW1pbmRlciwgcmVsYXRpdmUgdG8gc3RhcnQgdGltZSAoZXZlbnQpIG9yIGR1ZSB0aW1lICh0YXNrKS4gRS5nLiwgLTE1IG1lYW5zIDE1IG1pbnV0ZXMgYmVmb3JlLCAwIG1lYW5zIGF0IGR1ZSB0aW1lLiBGb3IgYWxsLWRheSBldmVudHMvdGFza3M6IG9mZnNldCBmcm9tIG1pZG5pZ2h0ICgwMDowMCkgb2YgdGhlIGV2ZW50IGRheS4gRS5nLiwgNTQwIG1lYW5zIDk6MDAgQU0gc2FtZSBkYXksIC0xODAgbWVhbnMgOTowMCBQTSBwcmV2aW91cyBkYXkuXCIsXG4gICAgICAgICksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgcmVtaW5kZXIgcnVsZVwiKSxcbiAgICAgIGlzX2NvbXBsZXRlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRhc2sgaXMgY29tcGxldGVkXCIpLFxuICAgIH0pKS5taW4oMSwgXCJBdCBsZWFzdCBvbmUgdGFzayB1cGRhdGUgaXMgcmVxdWlyZWRcIikuZGVzY3JpYmUoXG4gICAgICBcIkFycmF5IG9mIHRhc2sgdXBkYXRlc1wiLFxuICAgICksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyB1cGRhdGVzIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IHRhc2tTZXJ2aWNlIH0gPSBjb250ZXh0LnNlcnZpY2VzO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBpc092ZXJMaW1pdCA9IHVwZGF0ZXMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0YXNrU2VydmljZS51cGRhdGVUYXNrcyh7XG4gICAgICAgIHRhc2tzOiB1cGRhdGVzLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KS5tYXAoKHVwZGF0ZSkgPT5cbiAgICAgICAgICB0YXNrU2VydmljZS5JVXBkYXRlVGFza1RvVXBkYXRlVGFza1JlcXVlc3QodXBkYXRlKVxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IHJlc3VsdDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGlkczogZGF0YT8ucmVzdWx0cz8ubWFwKCh0YXNrKSA9PiB0YXNrLnRhc2s/LmlkKSB8fCBbXSxcbiAgICAgICAgZW50aXRpZXM6IGRhdGE/LnJlc3VsdHM/Lm1hcCgodGFzaykgPT4gdGFzay50YXNrKSB8fCBbXSxcbiAgICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICAgIGRhdGE6IGRhdGE/LnJlc3VsdHM/Lm1hcCgodGFzaykgPT5cbiAgICAgICAgICAgIHRhc2tTZXJ2aWNlLnRyYW5zZm9ybVRhc2tUb0lUYXNrKHRhc2sudGFzaylcbiAgICAgICAgICApLmZpbHRlcihCb29sZWFuKSB8fCBbXSxcbiAgICAgICAgICBtZXNzYWdlOiBpc092ZXJMaW1pdCA/IGBZb3UgY2FuIG9ubHkgdXBkYXRlIHVwIHRvICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IHRhc2tzIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSB0YXNrcyB1cGRhdGVkIHRoaXMgdGltZWAgOiB1bmRlZmluZWQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJ1bmtub3duIGVycm9yXCIsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3QgZGVsZXRlVGFza1Rvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgRGVsZXRlIHRhc2suYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICB0YXNrSWRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm1pbigxLCBcIlRhc2sgSUQgY2Fubm90IGJlIGVtcHR5XCIpLmRlc2NyaWJlKFxuICAgICAgXCJUYXNrIElEXCIsXG4gICAgKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jICh7IHRhc2tJZHMgfSwgb3B0aW9ucywgY29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHsgdGFza1NlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGlzT3ZlckxpbWl0ID0gdGFza0lkcy5sZW5ndGggPiBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2tTZXJ2aWNlLmRlbGV0ZVRhc2tzKHtcbiAgICAgICAgdGFza3M6IHRhc2tJZHMuc2xpY2UoMCwgbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQpLm1hcCgoaWQpID0+ICh7IGlkIH0pKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSByZXN1bHQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBpZHM6IGRhdGE/LnJlc3VsdHM/Lm1hcCgodGFzaykgPT4gdGFzay50YXNrPy5pZCkgfHwgW10sXG4gICAgICAgIGVudGl0aWVzOiBkYXRhPy5yZXN1bHRzPy5tYXAoKHRhc2spID0+IHRhc2sudGFzaykgfHwgW10sXG4gICAgICAgIG1vZGVsVmlzaWJsZURhdGE6IHtcbiAgICAgICAgICBkYXRhOiBkYXRhPy5yZXN1bHRzPy5tYXAoKHRhc2spID0+IHRhc2sudGFzaz8uaWQpIHx8IFtdLFxuICAgICAgICAgIG1lc3NhZ2U6IGlzT3ZlckxpbWl0ID8gYFlvdSBjYW4gb25seSBkZWxldGUgdXAgdG8gJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gdGFza3MgYXQgYSB0aW1lLiBPbmx5ICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IHRhc2tzIGRlbGV0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSxcbiAgICAgICAgZW50aXR5VHlwZTogXCJ0YXNrXCIsXG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwidW5rbm93biBlcnJvclwiLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHNlYXJjaFRhc2tUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYFNlYXJjaCB0YXNrcy4gRWFjaCBjYWxsIHJldHVybnMgYSBtYXhpbXVtIG9mIDEwIHJlc3VsdHMuYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBxdWVyeTogei5zdHJpbmcoKS5udWxsaXNoKCkuZGVzY3JpYmUoXCJTZWFyY2ggcXVlcnksaW5jbHVkZSB0aXRsZSxkZXNjcmlwdGlvblwiKSxcbiAgICByYW5nZVN0YXJ0OiB6LnN0cmluZygpLm51bGxpc2goKS5kZXNjcmliZShcIklTTyBmb3JtYXQgd2l0aCB0aW1lem9uZSwgbGlrZSAyMDI1LTA5LTE1VDEwOjAwOjAwKzA4OjAwXCIpLFxuICAgIHJhbmdlRW5kOiB6LnN0cmluZygpLm51bGxpc2goKS5kZXNjcmliZShcIklTTyBmb3JtYXQgd2l0aCB0aW1lem9uZSwgbGlrZSAyMDI1LTA5LTE1VDEwOjAwOjAwKzA4OjAwXCIpLFxuICAgIGFzc2lnbmVlSWRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm51bGxpc2goKS5kZXNjcmliZShcIkFzc2lnbmVlIElEc1wiKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jIChcbiAgICB7IHF1ZXJ5LCByYW5nZVN0YXJ0LCByYW5nZUVuZCwgYXNzaWduZWVJZHMgfSxcbiAgICBvcHRpb25zLFxuICAgIGNvbnRleHQsXG4gICkgPT4ge1xuICAgIGNvbnN0IHsgY29tYmluZWRTZXJ2aWNlLCB0YXNrU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb21iaW5lZFNlcnZpY2Uuc2VhcmNoRW50aXR5KHtcbiAgICAgIGNhdGVnb3J5OiBbQ3VzdG9tU2VhcmNoQ2F0ZWdvcnkudGFza10sXG4gICAgICBxdWVyeTogcXVlcnkgPz8gdW5kZWZpbmVkLFxuICAgICAgdGFza3NfZmlsdGVyOiB7XG4gICAgICAgIHN0YXJ0OiByYW5nZVN0YXJ0ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZW5kOiByYW5nZUVuZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIGF0dGVuZGVlX2lkczogYXNzaWduZWVJZHMgPz8gW10sXG4gICAgICAgIGlkczogW10sXG4gICAgICB9LFxuICAgICAgbGltaXQ6IHNlYXJjaExpbWl0LFxuICAgIH0pO1xuICAgIGNvbnN0IHNlYXJjaFJlc3VsdCA9IHJlc3VsdD8uZGF0YT8udGFza3M/Lml0ZW1zID8/IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaWRzOiBzZWFyY2hSZXN1bHQubWFwKCh0YXNrKSA9PiB0YXNrLmlkKSxcbiAgICAgIGVudGl0aWVzOiBzZWFyY2hSZXN1bHQsXG4gICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgIGRhdGE6IHNlYXJjaFJlc3VsdC5tYXAoKHRhc2spID0+XG4gICAgICAgICAgdGFza1NlcnZpY2UudHJhbnNmb3JtVGFza1RvSVRhc2sodGFzaylcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuIl19