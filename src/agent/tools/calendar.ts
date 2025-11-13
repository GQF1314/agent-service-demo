import * as z from "zod/v4";
import { createToolWrapper, maxCreateUpdateDeleteLimit, padTimezone, searchLimit } from "./utils";
import { utcToTimezoneDate } from "../utils/date-time";
import {
  EventStatus,
  ReminderMethod,
} from "../../services/interface/entities/event";
import { CustomSearchCategory } from "../../services/actual/combined";

export const createEventTool = createToolWrapper({
  description: `Create new calendar events (supports batch creation). Only title is necessary from user(you can summary from user's request), other fields you can fill with your best guess.`,
  inputSchema: z.object({
    events: z.array(z.object({
      title: z.string().min(1, "Title cannot be empty").describe("Event title"),
      all_day: z.boolean().optional().describe("Is all-day event"),
      use_default_reminders: z.boolean().optional().describe("Use default reminders"),
      rrule: z.array(z.string()).optional().describe("Recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
      attendees: z.array(z.string()).optional().describe(
        "Array of participant user IDs",
      ),
      reminderRule: z.array(z.object({
        method: z.enum(ReminderMethod).describe("Reminder method"),
        minutes_offset: z.number().describe(
          "Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day.",
        ),
      })).optional().describe("Array of reminder rules"),
      location: z.string().optional().describe("Location"),
      start: z.string().describe("Start time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
      end: z.string().describe("End time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
      description: z.string().optional().describe("Event description"),
    })).min(1, "At least one event is required").describe(
      "Array of events to create",
    ),
  }),
  execute: async ({ events }, options, context) => {
    const { calendarService } = context.services;
    const isOverLimit = events.length > maxCreateUpdateDeleteLimit;
    const result = await calendarService.createEventsWrapper(events.slice(0, maxCreateUpdateDeleteLimit));
    const { data } = result;
    return {
      success: true,
      ids: data?.results?.map((event) => event.event?.id) || [],
      entities: data?.results?.map((event) => event.event) || [],
      modelVisibleData: {
        data: data?.results?.map((event) =>
          calendarService.transformEventToIEvent(event.event)
        ) || [],
        message: isOverLimit ? `You can only create up to ${maxCreateUpdateDeleteLimit} events at a time. Only ${maxCreateUpdateDeleteLimit} events created this time` : undefined,
      },
    };
  },
});

export const searchEventsTool = createToolWrapper({
  description: `Search family calendar events list. Each call returns a maximum of 10 results.`,

  inputSchema: z.object({
    query: z.string().nullish().describe("Search query,include title,description"),
    rangeStart: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
    rangeEnd: z.string().nullish().describe("ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
    attendeeIds: z.array(z.string()).nullish().describe("Attendee IDs"),
  }),
  execute: async (
    { query, rangeStart, rangeEnd, attendeeIds },
    options,
    context,
  ) => {
    const { combinedService, calendarService } = context.services;
    try {
      const result = await combinedService.searchEntity({
        category: [CustomSearchCategory.event],
        query: query ?? undefined,
        event_filter: {
          start: rangeStart ?? undefined,
          end: rangeEnd ?? undefined,
          ids: [],
          attendee_ids: attendeeIds ?? [],
        },
        limit: searchLimit,
      });
      const searchResult = result?.data?.event?.items ?? [];
      return {
        success: true,
        ids: searchResult.map((event) => event?.id),
        entities: searchResult,
        modelVisibleData: {
          data: searchResult.map((event) =>
            calendarService.transformEventToIEvent(event)
          ),
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

export const updateEventTool = createToolWrapper({
  description: `Update calendar events (supports batch updates).Except id,all fields are optional.Do not fill fields that are not to be updated.`,

  inputSchema: z.object({
    updates: z.array(z.object({
      id: z.string().min(1, "ID cannot be empty").describe("Event ID"),
      title: z.string().optional().describe("Event title"),
      all_day: z.boolean().optional().describe("Is all-day event"),
      use_default_reminders: z.boolean().optional().describe("Use default reminders"),
      rrule: z.array(z.string()).optional().describe("Recurrence rule, following the iCalendar specification. The FREQ field is limited to YEARLY, MONTHLY, WEEKLY, and DAILY values. For more complex recurrence patterns, use the INTERVAL parameter in combination with FREQ."),
      attendees: z.array(z.string()).optional().describe(
        "Array of participant user IDs",
      ),
      reminderRule: z.array(z.object({
        method: z.enum(ReminderMethod).describe("Reminder method"),
        minutes_offset: z.number().describe(
          "Minutes offset for reminder time. For non-all-day events/tasks: negative value for advance reminder, relative to start time (event) or due time (task). E.g., -15 means 15 minutes before, 0 means at due time. For all-day events/tasks: offset from midnight (00:00) of the event day. E.g., 540 means 9:00 AM same day, -180 means 9:00 PM previous day.",
        ),
      })).optional().describe("Array of reminder rules"),
      location: z.string().optional().describe("Location"),
      start: z.string().optional().describe(
        "Start time, ISO format with timezone, like 2025-09-15T10:00:00+08:00",
      ),
      end: z.string().optional().describe("End time, ISO format with timezone, like 2025-09-15T10:00:00+08:00"),
      description: z.string().optional().describe("Event description"),
    })).min(1, "At least one event update is required").describe(
      "Array of event updates",
    ),
  }),
  execute: async ({ updates }, options, context) => {
    const { calendarService } = context.services;
    const isOverLimit = updates.length > maxCreateUpdateDeleteLimit;
    updates.forEach((update) => {
      update.start = update.start
        ? padTimezone(update.start, context.timeZone)
        : undefined;
      update.end = update.end
        ? padTimezone(update.end, context.timeZone)
        : undefined;
    });
    const result = await calendarService.updateEventsWrapper(
      updates.slice(0, maxCreateUpdateDeleteLimit),
    );
    const { data } = result;
    return {
      success: true,
      ids: data?.results?.map((event) => event.event?.id) || [],
      entities: data?.results?.map((event) => event.event) || [],
      modelVisibleData: {
        data: data?.results?.map((event) =>
          calendarService.transformEventToIEvent(event.event)
        ) || [],
        message: isOverLimit ? `You can only update up to ${maxCreateUpdateDeleteLimit} events at a time. Only ${maxCreateUpdateDeleteLimit} events updated this time` : undefined,
      },
    };
  },
});

export const deleteEventTool = createToolWrapper({
  description: `Delete calendar event.`,
  inputSchema: z.object({
    eventIds: z.array(z.string()).min(1, "Event ID cannot be empty").describe(
      "Event ID",
    ),
  }),

  execute: async ({ eventIds }, options, context) => {
    const { calendarService } = context.services;
    const isOverLimit = eventIds.length > maxCreateUpdateDeleteLimit;
    const result = await calendarService.deleteEventsWrapper(eventIds.slice(0, maxCreateUpdateDeleteLimit));
    const { data } = result;
    return {
      success: true,
      ids: data?.results?.map((event) => event.event?.id) || [],
      entities: data?.results?.map((event) => event.event) || [],
      modelVisibleData: {
        data: data?.results?.map((event) =>
          calendarService.transformEventToIEvent(event.event)
        ) || [],
        message: isOverLimit ? `You can only delete up to ${maxCreateUpdateDeleteLimit} events at a time. Only ${maxCreateUpdateDeleteLimit} events deleted this time` : undefined,
      },
    };
  },
});
