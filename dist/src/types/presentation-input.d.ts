import { ModelMessage } from "ai";
import { z } from "zod/v4";
export interface UIExtraData {
    tool_entities?: string;
    tool_entity_ids?: string[];
    tool_name?: string;
    metadata?: Record<string, any>;
}
export interface MessageSegment {
    type: SegmentType;
    text?: string;
    tool_call?: ToolCall;
    tool_result?: ToolResult;
    attachment?: Attachment;
    ui_extra?: UIExtraData;
    event_id?: string;
}
export type MessageSegmentList = MessageSegment[];
export interface ToolCall {
    id: string;
    name: string;
    arguments: any;
}
export interface ToolResult {
    tool_call_id: string;
    name: string;
    success: boolean;
    content?: string;
    error?: string;
    entity_ids?: string[];
}
export interface Attachment {
    type: AttachmentType;
    url: string;
    mime_type: string;
    size?: number;
    metadata?: any;
}
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system",
    TOOL = "tool",
    SUMMARY = "summary"
}
export declare enum MessageStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum AttachmentType {
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    FILE = "file"
}
export declare enum SegmentType {
    TEXT = "text",
    TOOL_CALL = "tool_call",
    TOOL_RESULT = "tool_result",
    ATTACHMENT = "attachment"
}
export declare const SegmentTypeSchema: z.ZodEnum<{
    text: "text";
    tool_call: "tool_call";
    tool_result: "tool_result";
    attachment: "attachment";
}>;
export declare const AttachmentTypeSchema: z.ZodEnum<{
    file: "file";
    image: "image";
    audio: "audio";
    video: "video";
}>;
export declare const UIExtraDataSchema: z.ZodObject<{
    tool_entities: z.ZodOptional<z.ZodString>;
    tool_entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    tool_name: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const ToolCallSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    arguments: z.ZodAny;
}, z.core.$strip>;
export declare const ToolResultSchema: z.ZodObject<{
    tool_call_id: z.ZodString;
    name: z.ZodString;
    success: z.ZodBoolean;
    content: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const AttachmentSchema: z.ZodObject<{
    type: z.ZodEnum<{
        file: "file";
        image: "image";
        audio: "audio";
        video: "video";
    }>;
    url: z.ZodString;
    mime_type: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const MessageSegmentSchema: z.ZodObject<{
    type: z.ZodEnum<{
        text: "text";
        tool_call: "tool_call";
        tool_result: "tool_result";
        attachment: "attachment";
    }>;
    text: z.ZodOptional<z.ZodString>;
    tool_call: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        arguments: z.ZodAny;
    }, z.core.$strip>>;
    tool_result: z.ZodOptional<z.ZodObject<{
        tool_call_id: z.ZodString;
        name: z.ZodString;
        success: z.ZodBoolean;
        content: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    attachment: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            file: "file";
            image: "image";
            audio: "audio";
            video: "video";
        }>;
        url: z.ZodString;
        mime_type: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    ui_extra: z.ZodOptional<z.ZodObject<{
        tool_entities: z.ZodOptional<z.ZodString>;
        tool_entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
        tool_name: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const MessageSegmentListSchema: z.ZodArray<z.ZodObject<{
    type: z.ZodEnum<{
        text: "text";
        tool_call: "tool_call";
        tool_result: "tool_result";
        attachment: "attachment";
    }>;
    text: z.ZodOptional<z.ZodString>;
    tool_call: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        arguments: z.ZodAny;
    }, z.core.$strip>>;
    tool_result: z.ZodOptional<z.ZodObject<{
        tool_call_id: z.ZodString;
        name: z.ZodString;
        success: z.ZodBoolean;
        content: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    attachment: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            file: "file";
            image: "image";
            audio: "audio";
            video: "video";
        }>;
        url: z.ZodString;
        mime_type: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    ui_extra: z.ZodOptional<z.ZodObject<{
        tool_entities: z.ZodOptional<z.ZodString>;
        tool_entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
        tool_name: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    event_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
export type IChatInfo = z.infer<typeof ReqParamsSchema>['environment']['chat_info'];
export type IFamilyInfo = z.infer<typeof ReqParamsSchema>['environment']['family_info'];
export type IUserBrief = z.infer<typeof ReqParamsSchema>['environment']['user_brief'];
export declare const ReqParamsSchema: z.ZodObject<{
    environment: z.ZodObject<{
        family_info: z.ZodObject<{
            family_id: z.ZodString;
            name: z.ZodString;
            roles: z.ZodArray<z.ZodObject<{
                family_role_id: z.ZodString;
                user_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                role_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                role_nickname: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                birthday: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
            location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            locale: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
        user_brief: z.ZodObject<{
            task: z.ZodObject<{
                task_lists: z.ZodArray<z.ZodObject<{
                    task_list_id: z.ZodString;
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            calendar: z.ZodObject<{
                default_calendar: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    calendar_id: z.ZodString;
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>;
        }, z.core.$strip>;
        chat_info: z.ZodObject<{
            conversation_id: z.ZodString;
            turn_id: z.ZodString;
            user_ui_message_id: z.ZodString;
            assistant_ui_message_id: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    recent_messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<typeof MessageRole>;
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                text: "text";
                tool_call: "tool_call";
                tool_result: "tool_result";
                attachment: "attachment";
            }>;
            text: z.ZodOptional<z.ZodString>;
            tool_call: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                arguments: z.ZodAny;
            }, z.core.$strip>>;
            tool_result: z.ZodOptional<z.ZodObject<{
                tool_call_id: z.ZodString;
                name: z.ZodString;
                success: z.ZodBoolean;
                content: z.ZodOptional<z.ZodString>;
                error: z.ZodOptional<z.ZodString>;
                entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            attachment: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<{
                    file: "file";
                    image: "image";
                    audio: "audio";
                    video: "video";
                }>;
                url: z.ZodString;
                mime_type: z.ZodString;
                size: z.ZodOptional<z.ZodNumber>;
                metadata: z.ZodOptional<z.ZodAny>;
            }, z.core.$strip>>;
            ui_extra: z.ZodOptional<z.ZodObject<{
                tool_entities: z.ZodOptional<z.ZodString>;
                tool_entity_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
                tool_name: z.ZodOptional<z.ZodString>;
                metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$strip>>;
            event_id: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type IMessageReqParams = z.infer<typeof ReqParamsSchema>;
export declare function getSummaryMessage(msg: IMessageReqParams["recent_messages"]): string;
export declare function ServerModelMessageToModelMessage(msg: IMessageReqParams["recent_messages"][0]): ModelMessage | null;
export declare function ServerModelMessagesToModelMessages(msg: IMessageReqParams["recent_messages"]): ModelMessage[];
