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
exports.deleteEventTool = exports.updateEventTool = exports.searchEventsTool = exports.createEventTool = void 0;
const z = __importStar(require("zod/v4"));
const utils_1 = require("./utils");
const event_1 = require("../../services/interface/entities/event");
const combined_1 = require("../../services/actual/combined");
exports.createEventTool = (0, utils_1.createToolWrapper)({
    description: `Create new calendar events (supports batch creation). Only title is necessary from user(you can summary from user's request), other fields you can fill with your best guess.`,
    inputSchema: z.object({
        events: z.array(z.object({
            title: z.string().min(1, "Title cannot be empty").describe("Event title"),
            all_day: z.boolean().optional().describe("Is all-day event"),
            use_default_reminders: z.boolean().optional().describe("Use default reminders"),
            rrule: z.array(z.string()).optional().describe("Recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
            attendees: z.array(z.string()).optional().describe("Array of participant user IDs"),
            reminderRule: z.array(z.object({
                method: z.enum(event_1.ReminderMethod).describe("Reminder method"),
                minutes_offset: z.number().describe("Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day."),
            })).optional().describe("Array of reminder rules"),
            location: z.string().optional().describe("Location"),
            start: z.string().describe("Start time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            end: z.string().describe("End time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            description: z.string().optional().describe("Event description"),
        })).min(1, "At least one event is required").describe("Array of events to create"),
    }),
    execute: async ({ events }, options, context) => {
        const { calendarService } = context.services;
        const isOverLimit = events.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await calendarService.createEventsWrapper(events.slice(0, utils_1.maxCreateUpdateDeleteLimit));
        const { data } = result;
        return {
            success: true,
            ids: data?.results?.map((event) => event.event?.id) || [],
            entities: data?.results?.map((event) => event.event) || [],
            modelVisibleData: {
                data: data?.results?.map((event) => calendarService.transformEventToIEvent(event.event)) || [],
                message: isOverLimit ? `You can only create up to ${utils_1.maxCreateUpdateDeleteLimit} events at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} events created this time` : undefined,
            },
        };
    },
});
exports.searchEventsTool = (0, utils_1.createToolWrapper)({
    description: `Search family calendar events list. Each call returns a maximum of 10 results.`,
    inputSchema: z.object({
        query: z.string().nullish().describe("Search query,include title,description"),
        rangeStart: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
        rangeEnd: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
        attendeeIds: z.array(z.string()).nullish().describe("Attendee IDs"),
    }),
    execute: async ({ query, rangeStart, rangeEnd, attendeeIds }, options, context) => {
        const { combinedService, calendarService } = context.services;
        try {
            const result = await combinedService.searchEntity({
                category: [combined_1.CustomSearchCategory.event],
                query: query ?? undefined,
                event_filter: {
                    start: rangeStart ?? undefined,
                    end: rangeEnd ?? undefined,
                    ids: [],
                    attendee_ids: attendeeIds ?? [],
                },
                limit: utils_1.searchLimit,
            });
            const searchResult = result?.data?.event?.items ?? [];
            return {
                success: true,
                ids: searchResult.map((event) => event?.id),
                entities: searchResult,
                modelVisibleData: {
                    data: searchResult.map((event) => calendarService.transformEventToIEvent(event)),
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
exports.updateEventTool = (0, utils_1.createToolWrapper)({
    description: `Update calendar events (supports batch updates).Except id,all fields are optional.Do not fill fields that are not to be updated.`,
    inputSchema: z.object({
        updates: z.array(z.object({
            id: z.string().min(1, "ID cannot be empty").describe("Event ID"),
            title: z.string().optional().describe("Event title"),
            all_day: z.boolean().optional().describe("Is all-day event"),
            use_default_reminders: z.boolean().optional().describe("Use default reminders"),
            rrule: z.array(z.string()).optional().describe("Recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
            attendees: z.array(z.string()).optional().describe("Array of participant user IDs"),
            reminderRule: z.array(z.object({
                method: z.enum(event_1.ReminderMethod).describe("Reminder method"),
                minutes_offset: z.number().describe("Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day."),
            })).optional().describe("Array of reminder rules"),
            location: z.string().optional().describe("Location"),
            start: z.string().optional().describe("Start time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            end: z.string().optional().describe("End time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
            description: z.string().optional().describe("Event description"),
        })).min(1, "At least one event update is required").describe("Array of event updates"),
    }),
    execute: async ({ updates }, options, context) => {
        const { calendarService } = context.services;
        const isOverLimit = updates.length > utils_1.maxCreateUpdateDeleteLimit;
        updates.forEach((update) => {
            update.start = update.start
                ? (0, utils_1.padTimezone)(update.start, context.timeZone)
                : undefined;
            update.end = update.end
                ? (0, utils_1.padTimezone)(update.end, context.timeZone)
                : undefined;
        });
        const result = await calendarService.updateEventsWrapper(updates.slice(0, utils_1.maxCreateUpdateDeleteLimit));
        const { data } = result;
        return {
            success: true,
            ids: data?.results?.map((event) => event.event?.id) || [],
            entities: data?.results?.map((event) => event.event) || [],
            modelVisibleData: {
                data: data?.results?.map((event) => calendarService.transformEventToIEvent(event.event)) || [],
                message: isOverLimit ? `You can only update up to ${utils_1.maxCreateUpdateDeleteLimit} events at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} events updated this time` : undefined,
            },
        };
    },
});
exports.deleteEventTool = (0, utils_1.createToolWrapper)({
    description: `Delete calendar event.`,
    inputSchema: z.object({
        eventIds: z.array(z.string()).min(1, "Event ID cannot be empty").describe("Event ID"),
    }),
    execute: async ({ eventIds }, options, context) => {
        const { calendarService } = context.services;
        const isOverLimit = eventIds.length > utils_1.maxCreateUpdateDeleteLimit;
        const result = await calendarService.deleteEventsWrapper(eventIds.slice(0, utils_1.maxCreateUpdateDeleteLimit));
        const { data } = result;
        return {
            success: true,
            ids: data?.results?.map((event) => event.event?.id) || [],
            entities: data?.results?.map((event) => event.event) || [],
            modelVisibleData: {
                data: data?.results?.map((event) => calendarService.transformEventToIEvent(event.event)) || [],
                message: isOverLimit ? `You can only delete up to ${utils_1.maxCreateUpdateDeleteLimit} events at a time. Only ${utils_1.maxCreateUpdateDeleteLimit} events deleted this time` : undefined,
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvdG9vbHMvY2FsZW5kYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQ0FBNEI7QUFDNUIsbUNBQWtHO0FBRWxHLG1FQUdpRDtBQUNqRCw2REFBc0U7QUFFekQsUUFBQSxlQUFlLEdBQUcsSUFBQSx5QkFBaUIsRUFBQztJQUMvQyxXQUFXLEVBQUUsK0tBQStLO0lBQzVMLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztZQUN6RSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztZQUM1RCxxQkFBcUIsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDO1lBQy9FLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyw0TkFBNE4sQ0FBQztZQUM1USxTQUFTLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQ2hELCtCQUErQixDQUNoQztZQUNELFlBQVksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQzdCLE1BQU0sRUFBRSxDQUFDLENB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QUksRUFBRTtnQkFDUCxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsa0NBQTBCLDJCQUEyQixrQ0FBMEIsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDM0s7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHogZnJvbSBcInpvZC92NFwiO1xuaW1wb3J0IHsgY3JlYXRlVG9vbFdyYXBwZXIsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0LCBwYWRUaW1lem9uZSwgc2VhcmNoTGltaXQgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgdXRjVG9UaW1lem9uZURhdGUgfSBmcm9tIFwiLi4vdXRpbHMvZGF0ZS10aW1lXCI7XG5pbXBvcnQge1xuICBFdmVudFN0YXR1cyxcbiAgUmVtaW5kZXJNZXRob2QsXG59IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9pbnRlcmZhY2UvZW50aXRpZXMvZXZlbnRcIjtcbmltcG9ydCB7IEN1c3RvbVNlYXJjaENhdGVnb3J5IH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2FjdHVhbC9jb21iaW5lZFwiO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRXZlbnRUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICBkZXNjcmlwdGlvbjogYENyZWF0ZSBuZXcgY2FsZW5kYXIgZXZlbnRzIChzdXBwb3J0cyBiYXRjaCBjcmVhdGlvbikuIE9ubHkgdGl0bGUgaXMgbmVjZXNzYXJ5IGZyb20gdXNlcih5b3UgY2FuIHN1bW1hcnkgZnJvbSB1c2VyJ3MgcmVxdWVzdCksIG90aGVyIGZpZWxkcyB5b3UgY2FuIGZpbGwgd2l0aCB5b3VyIGJlc3QgZ3Vlc3MuYCxcbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICBldmVudHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEsIFwiVGl0bGUgY2Fubm90IGJlIGVtcHR5XCIpLmRlc2NyaWJlKFwiRXZlbnQgdGl0bGVcIiksXG4gICAgICBhbGxfZGF5OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiSXMgYWxsLWRheSBldmVudFwiKSxcbiAgICAgIHVzZV9kZWZhdWx0X3JlbWluZGVyczogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIlVzZSBkZWZhdWx0IHJlbWluZGVyc1wiKSxcbiAgICAgIHJydWxlOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJSZWN1cnJlbmNlIHJ1bGUsIGZvbGxvd2luZyB0aGUgaUNhbGVuZGFyIHNwZWNpZmljYXRpb24uIFRoZSBGUkVRIGZpZWxkIGlzIGxpbWl0ZWQgdG8gWUVBUkxZLCBNT05USExZLCBXRUVLTFksIGFuZCBEQUlMWSB2YWx1ZXMuIEZvciBtb3JlIGNvbXBsZXggcmVjdXJyZW5jZSBwYXR0ZXJucywgdXNlIHRoZSBJTlRFUlZBTCBwYXJhbWV0ZXIgaW4gY29tYmluYXRpb24gd2l0aCBGUkVRLlwiKSxcbiAgICAgIGF0dGVuZGVlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKFxuICAgICAgICBcIkFycmF5IG9mIHBhcnRpY2lwYW50IHVzZXIgSURzXCIsXG4gICAgICApLFxuICAgICAgcmVtaW5kZXJSdWxlOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbWV0aG9kOiB6LmVudW0oUmVtaW5kZXJNZXRob2QpLmRlc2NyaWJlKFwiUmVtaW5kZXIgbWV0aG9kXCIpLFxuICAgICAgICBtaW51dGVzX29mZnNldDogei5udW1iZXIoKS5kZXNjcmliZShcbiAgICAgICAgICBcIk1pbnV0ZXMgb2Zmc2V0IGZvciByZW1pbmRlciB0aW1lLiBGb3Igbm9uLWFsbC1kYXkgZXZlbnRzL3Rhc2tzOiBuZWdhdGl2ZSB2YWx1ZSBmb3IgYWR2YW5jZSByZW1pbmRlciwgcmVsYXRpdmUgdG8gc3RhcnQgdGltZSAoZXZlbnQpIG9yIGR1ZSB0aW1lICh0YXNrKS4gRS5nLiwgLTE1IG1lYW5zIDE1IG1pbnV0ZXMgYmVmb3JlLCAwIG1lYW5zIGF0IGR1ZSB0aW1lLiBGb3IgYWxsLWRheSBldmVudHMvdGFza3M6IG9mZnNldCBmcm9tIG1pZG5pZ2h0ICgwMDowMCkgb2YgdGhlIGV2ZW50IGRheS4gRS5nLiwgNTQwIG1lYW5zIDk6MDAgQU0gc2FtZSBkYXksIC0xODAgbWVhbnMgOTowMCBQTSBwcmV2aW91cyBkYXkuXCIsXG4gICAgICAgICksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZShcIkFycmF5IG9mIHJlbWluZGVyIHJ1bGVzXCIpLFxuICAgICAgbG9jYXRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkxvY2F0aW9uXCIpLFxuICAgICAgc3RhcnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoXCJTdGFydCB0aW1lLCBJU08gZm9ybWF0IHdpdGggdGltZXpvbmUsIGxpa2UgMjAyNS0wOS0xNVQxMDowMDowMCswODowMFwiKSxcbiAgICAgIGVuZDogei5zdHJpbmcoKS5kZXNjcmliZShcIkVuZCB0aW1lLCBJU08gZm9ybWF0IHdpdGggdGltZXpvbmUsIGxpa2UgMjAyNS0wOS0xNVQxMDowMDowMCswODowMFwiKSxcbiAgICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJFdmVudCBkZXNjcmlwdGlvblwiKSxcbiAgICB9KSkubWluKDEsIFwiQXQgbGVhc3Qgb25lIGV2ZW50IGlzIHJlcXVpcmVkXCIpLmRlc2NyaWJlKFxuICAgICAgXCJBcnJheSBvZiBldmVudHMgdG8gY3JlYXRlXCIsXG4gICAgKSxcbiAgfSksXG4gIGV4ZWN1dGU6IGFzeW5jICh7IGV2ZW50cyB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBjYWxlbmRhclNlcnZpY2UgfSA9IGNvbnRleHQuc2VydmljZXM7XG4gICAgY29uc3QgaXNPdmVyTGltaXQgPSBldmVudHMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2FsZW5kYXJTZXJ2aWNlLmNyZWF0ZUV2ZW50c1dyYXBwZXIoZXZlbnRzLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KSk7XG4gICAgY29uc3QgeyBkYXRhIH0gPSByZXN1bHQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IGRhdGE/LnJlc3VsdHM/Lm1hcCgoZXZlbnQpID0+IGV2ZW50LmV2ZW50Py5pZCkgfHwgW10sXG4gICAgICBlbnRpdGllczogZGF0YT8ucmVzdWx0cz8ubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnQpIHx8IFtdLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiBkYXRhPy5yZXN1bHRzPy5tYXAoKGV2ZW50KSA9PlxuICAgICAgICAgIGNhbGVuZGFyU2VydmljZS50cmFuc2Zvcm1FdmVudFRvSUV2ZW50KGV2ZW50LmV2ZW50KVxuICAgICAgICApIHx8IFtdLFxuICAgICAgICBtZXNzYWdlOiBpc092ZXJMaW1pdCA/IGBZb3UgY2FuIG9ubHkgY3JlYXRlIHVwIHRvICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IGV2ZW50cyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gZXZlbnRzIGNyZWF0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2VhcmNoRXZlbnRzVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBTZWFyY2ggZmFtaWx5IGNhbGVuZGFyIGV2ZW50cyBsaXN0LiBFYWNoIGNhbGwgcmV0dXJucyBhIG1heGltdW0gb2YgMTAgcmVzdWx0cy5gLFxuXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgcXVlcnk6IHouc3RyaW5nKCkubnVsbGlzaCgpLmRlc2NyaWJlKFwiU2VhcmNoIHF1ZXJ5LGluY2x1ZGUgdGl0bGUsZGVzY3JpcHRpb25cIiksXG4gICAgcmFuZ2VTdGFydDogei5zdHJpbmcoKS5udWxsaXNoKCkuZGVzY3JpYmUoXCJJU08gZm9ybWF0IHdpdGggdGltZXpvbmUsIGxpa2UgMjAyNS0wOS0xNVQxMDowMDowMCswODowMFwiKSxcbiAgICByYW5nZUVuZDogei5zdHJpbmcoKS5udWxsaXNoKCkuZGVzY3JpYmUoXCJJU08gZm9ybWF0IHdpdGggdGltZXpvbmUsIGxpa2UgMjAyNS0wOS0xNVQxMDowMDowMCswODowMFwiKSxcbiAgICBhdHRlbmRlZUlkczogei5hcnJheSh6LnN0cmluZygpKS5udWxsaXNoKCkuZGVzY3JpYmUoXCJBdHRlbmRlZSBJRHNcIiksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoXG4gICAgeyBxdWVyeSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQsIGF0dGVuZGVlSWRzIH0sXG4gICAgb3B0aW9ucyxcbiAgICBjb250ZXh0LFxuICApID0+IHtcbiAgICBjb25zdCB7IGNvbWJpbmVkU2VydmljZSwgY2FsZW5kYXJTZXJ2aWNlIH0gPSBjb250ZXh0LnNlcnZpY2VzO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb21iaW5lZFNlcnZpY2Uuc2VhcmNoRW50aXR5KHtcbiAgICAgICAgY2F0ZWdvcnk6IFtDdXN0b21TZWFyY2hDYXRlZ29yeS5ldmVudF0sXG4gICAgICAgIHF1ZXJ5OiBxdWVyeSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50X2ZpbHRlcjoge1xuICAgICAgICAgIHN0YXJ0OiByYW5nZVN0YXJ0ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICBlbmQ6IHJhbmdlRW5kID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICBpZHM6IFtdLFxuICAgICAgICAgIGF0dGVuZGVlX2lkczogYXR0ZW5kZWVJZHMgPz8gW10sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbWl0OiBzZWFyY2hMaW1pdCxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0ID0gcmVzdWx0Py5kYXRhPy5ldmVudD8uaXRlbXMgPz8gW107XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBpZHM6IHNlYXJjaFJlc3VsdC5tYXAoKGV2ZW50KSA9PiBldmVudD8uaWQpLFxuICAgICAgICBlbnRpdGllczogc2VhcmNoUmVzdWx0LFxuICAgICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgICAgZGF0YTogc2VhcmNoUmVzdWx0Lm1hcCgoZXZlbnQpID0+XG4gICAgICAgICAgICBjYWxlbmRhclNlcnZpY2UudHJhbnNmb3JtRXZlbnRUb0lFdmVudChldmVudClcbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwidW5rbm93biBlcnJvclwiLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUV2ZW50VG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgZGVzY3JpcHRpb246IGBVcGRhdGUgY2FsZW5kYXIgZXZlbnRzIChzdXBwb3J0cyBiYXRjaCB1cGRhdGVzKS5FeGNlcHQgaWQsYWxsIGZpZWxkcyBhcmUgb3B0aW9uYWwuRG8gbm90IGZpbGwgZmllbGRzIHRoYXQgYXJlIG5vdCB0byBiZSB1cGRhdGVkLmAsXG5cbiAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICB1cGRhdGVzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgIGlkOiB6LnN0cmluZygpLm1pbigxLCBcIklEIGNhbm5vdCBiZSBlbXB0eVwiKS5kZXNjcmliZShcIkV2ZW50IElEXCIpLFxuICAgICAgdGl0bGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkV2ZW50IHRpdGxlXCIpLFxuICAgICAgYWxsX2RheTogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklzIGFsbC1kYXkgZXZlbnRcIiksXG4gICAgICB1c2VfZGVmYXVsdF9yZW1pbmRlcnM6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJVc2UgZGVmYXVsdCByZW1pbmRlcnNcIiksXG4gICAgICBycnVsZTogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiUmVjdXJyZW5jZSBydWxlLCBmb2xsb3dpbmcgdGhlIGlDYWxlbmRhciBzcGVjaWZpY2F0aW9uLiBUaGUgRlJFUSBmaWVsZCBpcyBsaW1pdGVkIHRvIFlFQVJMWSwgTU9OVEhMWSwgV0VFS0xZLCBhbmQgREFJTFkgdmFsdWVzLiBGb3IgbW9yZSBjb21wbGV4IHJlY3VycmVuY2UgcGF0dGVybnMsIHVzZSB0aGUgSU5URVJWQUwgcGFyYW1ldGVyIGluIGNvbWJpbmF0aW9uIHdpdGggRlJFUS5cIiksXG4gICAgICBhdHRlbmRlZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZShcbiAgICAgICAgXCJBcnJheSBvZiBwYXJ0aWNpcGFudCB1c2VyIElEc1wiLFxuICAgICAgKSxcbiAgICAgIHJlbWluZGVyUnVsZTogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIG1ldGhvZDogei5lbnVtKFJlbWluZGVyTWV0aG9kKS5kZXNjcmliZShcIlJlbWluZGVyIG1ldGhvZFwiKSxcbiAgICAgICAgbWludXRlc19vZmZzZXQ6IHoubnVtYmVyKCkuZGVzY3JpYmUoXG4gICAgICAgICAgXCJNaW51dGVzIG9mZnNldCBmb3IgcmVtaW5kZXIgdGltZS4gRm9yIG5vbi1hbGwtZGF5IGV2ZW50cy90YXNrczogbmVnYXRpdmUgdmFsdWUgZm9yIGFkdmFuY2UgcmVtaW5kZXIsIHJlbGF0aXZlIHRvIHN0YXJ0IHRpbWUgKGV2ZW50KSBvciBkdWUgdGltZSAodGFzaykuIEUuZy4sIC0xNSBtZWFucyAxNSBtaW51dGVzIGJlZm9yZSwgMCBtZWFucyBhdCBkdWUgdGltZS4gRm9yIGFsbC1kYXkgZXZlbnRzL3Rhc2tzOiBvZmZzZXQgZnJvbSBtaWRuaWdodCAoMDA6MDApIG9mIHRoZSBldmVudCBkYXkuIEUuZy4sIDU0MCBtZWFucyA5OjAwIEFNIHNhbWUgZGF5LCAtMTgwIG1lYW5zIDk6MDAgUE0gcHJldmlvdXMgZGF5LlwiLFxuICAgICAgICApLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJBcnJheSBvZiByZW1pbmRlciBydWxlc1wiKSxcbiAgICAgIGxvY2F0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJMb2NhdGlvblwiKSxcbiAgICAgIHN0YXJ0OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXG4gICAgICAgIFwiU3RhcnQgdGltZSwgSVNPIGZvcm1hdCB3aXRoIHRpbWV6b25lLCBsaWtlIDIwMjUtMDktMTVUMTA6MDA6MDArMDg6MDBcIixcbiAgICAgICksXG4gICAgICBlbmQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkVuZCB0aW1lLCBJU08gZm9ybWF0IHdpdGggdGltZXpvbmUsIGxpa2UgMjAyNS0wOS0xNVQxMDowMDowMCswODowMFwiKSxcbiAgICAgIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJFdmVudCBkZXNjcmlwdGlvblwiKSxcbiAgICB9KSkubWluKDEsIFwiQXQgbGVhc3Qgb25lIGV2ZW50IHVwZGF0ZSBpcyByZXF1aXJlZFwiKS5kZXNjcmliZShcbiAgICAgIFwiQXJyYXkgb2YgZXZlbnQgdXBkYXRlc1wiLFxuICAgICksXG4gIH0pLFxuICBleGVjdXRlOiBhc3luYyAoeyB1cGRhdGVzIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IGNhbGVuZGFyU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICBjb25zdCBpc092ZXJMaW1pdCA9IHVwZGF0ZXMubGVuZ3RoID4gbWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXQ7XG4gICAgdXBkYXRlcy5mb3JFYWNoKCh1cGRhdGUpID0+IHtcbiAgICAgIHVwZGF0ZS5zdGFydCA9IHVwZGF0ZS5zdGFydFxuICAgICAgICA/IHBhZFRpbWV6b25lKHVwZGF0ZS5zdGFydCwgY29udGV4dC50aW1lWm9uZSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICB1cGRhdGUuZW5kID0gdXBkYXRlLmVuZFxuICAgICAgICA/IHBhZFRpbWV6b25lKHVwZGF0ZS5lbmQsIGNvbnRleHQudGltZVpvbmUpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNhbGVuZGFyU2VydmljZS51cGRhdGVFdmVudHNXcmFwcGVyKFxuICAgICAgdXBkYXRlcy5zbGljZSgwLCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCksXG4gICAgKTtcbiAgICBjb25zdCB7IGRhdGEgfSA9IHJlc3VsdDtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGlkczogZGF0YT8ucmVzdWx0cz8ubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnQ/LmlkKSB8fCBbXSxcbiAgICAgIGVudGl0aWVzOiBkYXRhPy5yZXN1bHRzPy5tYXAoKGV2ZW50KSA9PiBldmVudC5ldmVudCkgfHwgW10sXG4gICAgICBtb2RlbFZpc2libGVEYXRhOiB7XG4gICAgICAgIGRhdGE6IGRhdGE/LnJlc3VsdHM/Lm1hcCgoZXZlbnQpID0+XG4gICAgICAgICAgY2FsZW5kYXJTZXJ2aWNlLnRyYW5zZm9ybUV2ZW50VG9JRXZlbnQoZXZlbnQuZXZlbnQpXG4gICAgICAgICkgfHwgW10sXG4gICAgICAgIG1lc3NhZ2U6IGlzT3ZlckxpbWl0ID8gYFlvdSBjYW4gb25seSB1cGRhdGUgdXAgdG8gJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gZXZlbnRzIGF0IGEgdGltZS4gT25seSAke21heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0fSBldmVudHMgdXBkYXRlZCB0aGlzIHRpbWVgIDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuICB9LFxufSk7XG5cbmV4cG9ydCBjb25zdCBkZWxldGVFdmVudFRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gIGRlc2NyaXB0aW9uOiBgRGVsZXRlIGNhbGVuZGFyIGV2ZW50LmAsXG4gIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgZXZlbnRJZHM6IHouYXJyYXkoei5zdHJpbmcoKSkubWluKDEsIFwiRXZlbnQgSUQgY2Fubm90IGJlIGVtcHR5XCIpLmRlc2NyaWJlKFxuICAgICAgXCJFdmVudCBJRFwiLFxuICAgICksXG4gIH0pLFxuXG4gIGV4ZWN1dGU6IGFzeW5jICh7IGV2ZW50SWRzIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCB7IGNhbGVuZGFyU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICBjb25zdCBpc092ZXJMaW1pdCA9IGV2ZW50SWRzLmxlbmd0aCA+IG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0O1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNhbGVuZGFyU2VydmljZS5kZWxldGVFdmVudHNXcmFwcGVyKGV2ZW50SWRzLnNsaWNlKDAsIG1heENyZWF0ZVVwZGF0ZURlbGV0ZUxpbWl0KSk7XG4gICAgY29uc3QgeyBkYXRhIH0gPSByZXN1bHQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBpZHM6IGRhdGE/LnJlc3VsdHM/Lm1hcCgoZXZlbnQpID0+IGV2ZW50LmV2ZW50Py5pZCkgfHwgW10sXG4gICAgICBlbnRpdGllczogZGF0YT8ucmVzdWx0cz8ubWFwKChldmVudCkgPT4gZXZlbnQuZXZlbnQpIHx8IFtdLFxuICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICBkYXRhOiBkYXRhPy5yZXN1bHRzPy5tYXAoKGV2ZW50KSA9PlxuICAgICAgICAgIGNhbGVuZGFyU2VydmljZS50cmFuc2Zvcm1FdmVudFRvSUV2ZW50KGV2ZW50LmV2ZW50KVxuICAgICAgICApIHx8IFtdLFxuICAgICAgICBtZXNzYWdlOiBpc092ZXJMaW1pdCA/IGBZb3UgY2FuIG9ubHkgZGVsZXRlIHVwIHRvICR7bWF4Q3JlYXRlVXBkYXRlRGVsZXRlTGltaXR9IGV2ZW50cyBhdCBhIHRpbWUuIE9ubHkgJHttYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdH0gZXZlbnRzIGRlbGV0ZWQgdGhpcyB0aW1lYCA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn0pO1xuIl19