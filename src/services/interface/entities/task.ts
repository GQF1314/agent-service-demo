import { IResponse } from "../../actual/type";

  
export interface CreateTaskRequest {
    list_id?: string; // Optional, task list ID
    title: string; // Required, task title
    description?: string; // Optional, task description
    location?: LocationData; // Optional, location information
    attachments?: AttachmentRequest[]; // Optional, attachment list
    start_at?: string; // Optional, start time (ISO 8601 format)
    start_at_tz?: string; // Optional, start timezone
    end_at?: string; // Optional, end time (ISO 8601 format)
    end_at_tz?: string; // Optional, end timezone
    all_day: boolean; // Required, whether it's an all-day task
    start_on?: string; // Optional, start date (YYYY-MM-DD format)
    end_on?: string; // Optional, end date (YYYY-MM-DD format)
    privacy_level: TaskPrivacyLevel; // Required, privacy level
    rrule?: string[]; // Optional, recurrence rules
    assignees?: CreateAttendeeRequest[]; // Optional, assignee list
    use_default_reminders: boolean; // Required, whether to use default reminders
    reminders?: ReminderRule[]; // Optional, reminder rules
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
  
  export enum TaskPrivacyLevel {
    Protected = 0, // Visible to creator/participants
    Family = 1     // Visible to family members
  }
  
  export enum ReminderMethod {
    App = "app",
    Call = "call"
  }



  export interface BatchTaskOperationResult {
    success_count: number; // Success count
    failure_count: number; // Failure count
    errors?: BatchTaskOperationError[]; // Error list
    results?: BatchTaskOperationItem[]; // Result list
  }
  
  interface BatchTaskOperationError {
    index: number; // Error index
    task_id?: string; // Task ID
    error: string; // Error message
  }
  
  export interface BatchTaskOperationItem {
    index: number; // Result index
    task?: ITaskEntity; // Task details
    status: string; // Status
  }
  
  export interface ITaskEntity {
    id: string;
    family_id: string;
    list_id?: string;
    title: string;
    description?: string;
    location?: LocationData;
    attachments?: AttachmentData[];
    start_at?: string;
    start_at_tz?: string;
    end_at?: string;
    end_at_tz?: string;
    all_day: boolean;
    start_on?: string;
    end_on?: string;
    creator_role_id: string;
    privacy_level: TaskPrivacyLevel;
    is_completed: boolean;
    completed_at?: string;
    completed_by_role?: string;
    completed_by_user?: string;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by_role?: string;
    deleted_by_user?: string;
    rrule?: string[];
    recurrence_master_id?: string;
    recurrence_date?: string;
    is_recurrence_exception: boolean;
    sort?: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    assignees?: User[];
    reminders?: TaskReminder[];
  }
  
  export interface AttachmentData {
    assetId: string;
    name: string;
    mimeType: string;
  }
  
  export interface User {
    user_id?: string;
    role_id: string;
    role_name: string;
    color_id: string;
    avatar?: Image;
  }
  
  export interface Image {
    asset_id: string;
    url: string;
    width: number;
    height: number;
  }
  
  export interface TaskReminder {
    id: string;
    task_id: string;
    family_role_id: string;
    method: string;
    minutes_offset: number;
    is_sent: boolean;
    sent_at?: string;
    delivery_status?: string;
    error_message?: string;
    is_default: boolean;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by_role?: string;
    deleted_by_user?: string;
    created_at: string;
    updated_at: string;
  }



  
  export interface BatchUpdateTaskItem {
    id: string; // Required, task ID
    list_id?: string;
    title?: string;
    description?: string;
    location?: LocationData;
    attachments?: AttachmentRequest[];
    privacy_level?: TaskPrivacyLevel;
    start_at?: string;
    start_at_tz?: string;
    end_at?: string;
    end_at_tz?: string;
    all_day?: boolean;
    start_on?: string;
    end_on?: string;
    rrule?: string[];
    assignees?: CreateAttendeeRequest[];
    use_default_reminders?: boolean;
    reminders?: ReminderRule[];
    update_scope?: UpdateScope;
    is_completed?: boolean;
  }
  
  enum UpdateScope {
    This = 0,    // Update current instance only
    All = 1,     // Update all instances
    Future = 2   // Update future instances
  }

  export interface BatchDeleteTasksInput {
    tasks: {id:string}[]; // Required, 1-100 task IDs
  }

  export interface BatchCreateTasksInput {
    tasks: CreateTaskRequest[]; // Required, 1-100 tasks
  }

  export interface BatchUpdateTasksInput {
    tasks: BatchUpdateTaskItem[]; // Required, 1-100 task update items
  }

  export interface IUpdateTasksRequest{
    (params:BatchUpdateTasksInput):Promise<IResponse<BatchTaskOperationResult>>;
  }

  export interface ICreateTasksRequest{
    (params:BatchCreateTasksInput):Promise<IResponse<BatchTaskOperationResult>>;
  }

  export interface IDeleteTasksRequest{
    (params:BatchDeleteTasksInput):Promise<IResponse<BatchTaskOperationResult>>;
  }


  export interface ITask {
    id: string;
    list_id?: string;
    title: string; // Required, task title
    description?: string; // Optional, task description
    location?: string; // Optional, location information
    end?: string; // Optional, end time (ISO 8601 format)
    all_day?: boolean; // Required, whether it's an all-day task
    rrule?: string[]; // Optional, recurrence rules
    assignees?: string[]; // Optional, assignee list
    reminderRule?: ReminderRule[];
    is_completed: boolean;
    completed_at?: string;
    completed_by_role?: string;
  }

  export type IUpdateTask = Partial<Omit<ITask,"completed_at"|"completed_by_role">>&{id:string};
  export type ICreateTask = Omit<ITask,"id"|"is_completed"|"completed_at"|"completed_by_role">;
