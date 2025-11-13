import { ReminderMethod } from "../../services/interface/entities/event";
export declare const createEventTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    events: {
        title: string;
        start: string;
        end: string;
        all_day?: boolean | undefined;
        use_default_reminders?: boolean | undefined;
        rrule?: string[] | undefined;
        attendees?: string[] | undefined;
        reminderRule?: {
            method: ReminderMethod;
            minutes_offset: number;
        }[] | undefined;
        location?: string | undefined;
        description?: string | undefined;
    }[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/event").IEvent | undefined)[];
        message: string | undefined;
    };
}>;
export declare const searchEventsTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query?: string | null | undefined;
    rangeStart?: string | null | undefined;
    rangeEnd?: string | null | undefined;
    attendeeIds?: string[] | null | undefined;
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/event").IEventEntity[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/event").IEvent | undefined)[];
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    ids?: undefined;
    entities?: undefined;
    modelVisibleData?: undefined;
}>;
export declare const updateEventTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    updates: {
        id: string;
        title?: string | undefined;
        all_day?: boolean | undefined;
        use_default_reminders?: boolean | undefined;
        rrule?: string[] | undefined;
        attendees?: string[] | undefined;
        reminderRule?: {
            method: ReminderMethod;
            minutes_offset: number;
        }[] | undefined;
        location?: string | undefined;
        start?: string | undefined;
        end?: string | undefined;
        description?: string | undefined;
    }[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/event").IEvent | undefined)[];
        message: string | undefined;
    };
}>;
export declare const deleteEventTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    eventIds: string[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/event").IEventEntity | undefined)[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/event").IEvent | undefined)[];
        message: string | undefined;
    };
}>;
