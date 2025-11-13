//-------request
import { IResponse } from "../../actual/type";

export interface CreateEventRequestData {
    calendar_id: string; // Required, calendar ID
    title: string; // Required, event title
    description?: string; // Optional, event description
    location?: LocationData; // Optional, location information
    attachments?: AttachmentRequest[]; // Optional, attachment list
    start_at?: string; // Optional, start time (ISO 8601 format)
    end_at?: string; // Optional, end time (ISO 8601 format)
    start_tz?: string; // Optional, start timezone
    end_tz?: string; // Optional, end timezone
    all_day?: boolean; // Required, whether it's an all-day event
    start_on?: string; // Optional, start date (YYYY-MM-DD format)
    end_on?: string; // Optional, end date (YYYY-MM-DD format)
    privacy_level: PrivacyLevel; // Required, privacy level, default 1
    rrule?: string[]; // Optional, recurrence rules
    use_default_reminders?: boolean; // Required, whether to use default reminders
    reminders?: ReminderRule[]; // Optional, reminder rules
    attendees?: CreateAttendeeRequest[]; // Optional, attendee list
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

export enum PrivacyLevel {
    Protected = 0, // Protected
    Family = 1, // Family visible
}

export enum ReminderMethod {
    App = "app",
    Call = "call"
}


//----response

export interface BatchOperationResult {
    success_count: number; // Success count
    failure_count: number; // Failure count
    errors?: BatchOperationError[]; // Error list
    results?: BatchOperationItem[]; // Result list
}

interface BatchOperationError {
    index: number; // Error index
    event_id?: string; // Event ID
    error: string; // Error message
}

interface BatchOperationItem {
    index: number; // Result index
    event?: IEventEntity; // Event details
    status: string; // Status
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

export enum EventStatus {
    Tentative = "tentative",
    Confirmed = "confirmed",
    Cancelled = "cancelled",
}

export enum EventTransparency {
    Opaque = "opaque",
    Transparent = "transparent",
}

export enum CalendarSource {
    Internal = 0,
    External = 1,
}



export interface BatchUpdateEventItemData {
    id: string; // Required, event ID
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

enum UpdateScope {
    This = 0, // Update current instance only
    All = 1, // Update all instances
    Future = 2, // Update future instances
}

//----delete request
export interface BatchDeleteEventsInput {
    events: {id:string}[]; // Required, 1-100 event IDs
}

export interface BatchCreateEventsInput {
    events: CreateEventRequestData[]; // Required, 1-100 events
}
//----update request
export interface BatchUpdateEventsInput {
    events: BatchUpdateEventItemData[]; // Required, 1-100 event update items
}

export interface IDeleteEventsRequest{
    (params:BatchDeleteEventsInput):Promise<IResponse<BatchOperationResult>>;
}

export interface IUpdateEventsRequest{
    (params:BatchUpdateEventsInput):Promise<IResponse<BatchOperationResult>>;
}

export interface ICreateEventsRequest{
    (params:BatchCreateEventsInput):Promise<IResponse<BatchOperationResult>>;
}

//------------
export interface IEvent {
    id: string;
    title: string; // Required, event title
    description?: string; // Optional, event description
    location?: string; // Optional, location information
    start?: string; // Optional, start time (ISO 8601 format)
    end?: string; // Optional, end time (ISO 8601 format)
    all_day?: boolean; // Required, whether it's an all-day event
    rrule?: string[]; // Optional, recurrence rules
    attendees?: string[]; // Optional, attendee list
    reminderRule?: ReminderRule[];
    status?: EventStatus;
    use_default_reminders?: boolean;
}

export type IUpdateEvent = Partial<IEvent>&{id:string};
export type ICreateEvent = Omit<IEvent,"id"|"status">;