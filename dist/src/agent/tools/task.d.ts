import { ReminderMethod } from "../../services/interface/entities/task";
export declare const createTaskTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    tasks: {
        title: string;
        list_id?: string | undefined;
        description?: string | undefined;
        location?: string | undefined;
        end?: string | undefined;
        all_day?: boolean | undefined;
        rrule?: string[] | undefined;
        assignees?: string[] | undefined;
        reminderRule?: {
            method: ReminderMethod;
            minutes_offset: number;
        }[] | undefined;
    }[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/task").ITask | undefined)[];
        message: string | undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    ids?: undefined;
    entities?: undefined;
    modelVisibleData?: undefined;
}>;
export declare const updateTaskTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    updates: {
        id: string;
        list_id?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        location?: string | undefined;
        end?: string | undefined;
        all_day?: boolean | undefined;
        rrule?: string[] | undefined;
        assignees?: string[] | undefined;
        reminderRule?: {
            method: ReminderMethod;
            minutes_offset: number;
        }[] | undefined;
        is_completed?: boolean | undefined;
    }[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/task").ITask | undefined)[];
        message: string | undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    ids?: undefined;
    entities?: undefined;
    modelVisibleData?: undefined;
}>;
export declare const deleteTaskTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    taskIds: string[];
}, {
    success: boolean;
    ids: (string | undefined)[];
    entities: (import("../../services/interface/entities/task").ITaskEntity | undefined)[];
    modelVisibleData: {
        data: (string | undefined)[];
        message: string | undefined;
    };
    entityType: string;
    count: number;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    ids?: undefined;
    entities?: undefined;
    modelVisibleData?: undefined;
    entityType?: undefined;
    count?: undefined;
}>;
export declare const searchTaskTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query?: string | null | undefined;
    rangeStart?: string | null | undefined;
    rangeEnd?: string | null | undefined;
    assigneeIds?: string[] | null | undefined;
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/task").ITaskEntity[];
    modelVisibleData: {
        data: (import("../../services/interface/entities/task").ITask | undefined)[];
    };
}>;
