import { IResponse } from "../../actual/type";
export interface CreateEventRequestData {
    calendar_id: string;
    title: string;
    description?: string;
    location?: LocationData;
    attachments?: AttachmentRequest[];
    start_at?: string;
    end_at?: string;
    start_tz?: string;
    end_tz?: string;
    all_day?: boolean;
    start_on?: string;
    end_on?: string;
    privacy_level: PrivacyLevel;
    rrule?: string[];
    use_default_reminders?: boolean;
    reminders?: ReminderRule[];
    attendees?: CreateAttendeeRequest[];
}
export interface LocationData {
    address?: string;
    latitude?: number;
    longitude?: number;
}
export interface AttachmentRequest {
    assetId: string;
}
export interface ReminderRule {
    method: ReminderMethod;
    minutes_offset: number;
}
export interface CreateAttendeeRequest {
    role_id?: string;
}
export declare enum PrivacyLevel {
    Protected = 0,// Protected
    Family = 1
}
export declare enum ReminderMethod {
    App = "app",
    Call = "call"
}
export interface BatchOperationResult {
    success_count: number;
    failure_count: number;
    errors?: BatchOperationError[];
    results?: BatchOperationItem[];
}
interface BatchOperationError {
    index: number;
    event_id?: string;
    error: string;
}
interface BatchOperationItem {
    index: number;
    event?: IEventEntity;
    status: string;
}
export interface IEventEntity {
    id: string;
    family_id: string;
    calendar_id?: string;
    title: string;
    description?: string;
    location?: LocationData;
    attachments?: AttachmentData[];
    start_at?: string;
    end_at?: string;
    start_tz?: string;
    end_tz?: string;
    all_day: boolean;
    start_on?: string;
    end_on?: string;
    creator_role_id: string;
    privacy_level: PrivacyLevel;
    rrule?: string[];
    recurrence_master_id?: string;
    original_start_at?: string;
    is_recurrence_exception: boolean;
    status: EventStatus;
    transparency: EventTransparency;
    source: CalendarSource;
    external_event_id?: string;
    external_etag?: string;
    version: number;
    sequence: number;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by_role?: string;
    deleted_by_user?: string;
    created_at: string;
    updated_at: string;
    attendees?: User[];
    reminders?: EventReminder[];
}
interface AttachmentData {
    assetId: string;
    name: string;
    mimeType: string;
}
interface User {
    user_id?: string;
    role_id: string;
    role_name: string;
    color_id: string;
    avatar?: Image;
}
interface Image {
    asset_id: string;
    url: string;
    width: number;
    height: number;
}
interface EventReminder {
    id: string;
    event_id: string;
    family_role_id?: string;
    method: string;
    minutes: number;
    is_sent: boolean;
    sent_at?: string;
    delivery_status?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
}
export declare enum EventStatus {
    Tentative = "tentative",
    Confirmed = "confirmed",
    Cancelled = "cancelled"
}
export declare enum EventTransparency {
    Opaque = "opaque",
    Transparent = "transparent"
}
export declare enum CalendarSource {
    Internal = 0,
    External = 1
}
export interface BatchUpdateEventItemData {
    id: string;
    title?: string;
    description?: string;
    location?: LocationData;
    attachments?: AttachmentRequest[];
    start_at?: string;
    end_at?: string;
    start_tz?: string;
    end_tz?: string;
    all_day?: boolean;
    start_on?: string;
    end_on?: string;
    privacy_level?: PrivacyLevel;
    rrule?: string[];
    status?: EventStatus;
    transparency?: EventTransparency;
    external_event_id?: string;
    use_default_reminders?: boolean;
    reminders?: ReminderRule[];
    attendees?: CreateAttendeeRequest[];
    send_updates?: boolean;
    update_scope?: UpdateScope;
}
declare enum UpdateScope {
    This = 0,// Update current instance only
    All = 1,// Update all instances
    Future = 2
}
export interface BatchDeleteEventsInput {
    events: {
        id: string;
    }[];
}
export interface BatchCreateEventsInput {
    events: CreateEventRequestData[];
}
export interface BatchUpdateEventsInput {
    events: BatchUpdateEventItemData[];
}
export interface IDeleteEventsRequest {
    (params: BatchDeleteEventsInput): Promise<IResponse<BatchOperationResult>>;
}
export interface IUpdateEventsRequest {
    (params: BatchUpdateEventsInput): Promise<IResponse<BatchOperationResult>>;
}
export interface ICreateEventsRequest {
    (params: BatchCreateEventsInput): Promise<IResponse<BatchOperationResult>>;
}
export interface IEvent {
    id: string;
    title: string;
    description?: string;
    location?: string;
    start?: string;
    end?: string;
    all_day?: boolean;
    rrule?: string[];
    attendees?: string[];
    reminderRule?: ReminderRule[];
    status?: EventStatus;
    use_default_reminders?: boolean;
}
export type IUpdateEvent = Partial<IEvent> & {
    id: string;
};
export type ICreateEvent = Omit<IEvent, "id" | "status">;
export {};
