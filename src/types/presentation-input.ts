import {
  FilePart,
  ImagePart,
  ModelMessage,
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "ai";
import { isNull } from "lodash";
import { z } from "zod/v4";

// UIExtraData holds additional data needed for UI display
// This field is specifically used for UI message conversion and is not visible to the AI model
export interface UIExtraData {
  // ToolEntities contains the full entities data for tool results UI display
  // This ensures entities data persists through streaming snapshots
  tool_entities?: string; // []byte in Go becomes string in TypeScript
  
  // ToolEntityIDs contains related entity IDs from tool output
  tool_entity_ids?: string[];
  
  // ToolName is used to identify which tool generated this data
  tool_name?: string;
  
  // Additional metadata that may be needed for UI display
  metadata?: Record<string, any>; // map[string]interface{} in Go
}

// MessageSegment represents a message segment
export interface MessageSegment {
  type: SegmentType;
  text?: string; // *string in Go becomes optional string
  tool_call?: ToolCall;
  tool_result?: ToolResult;
  attachment?: Attachment;
  ui_extra?: UIExtraData;
  
  // EventID stores the original event ID from streaming events (e.g., text-start.id, tool_call.id)
  // This enables stable anchor generation using real IDs instead of counters
  event_id?: string; // *string in Go becomes optional string
}

// MessageSegmentList represents a list of message segments
export type MessageSegmentList = MessageSegment[];

// ToolCall represents a tool call
export interface ToolCall {
  id: string;
  name: string;
  arguments: any; // jsoniter.RawMessage in Go becomes any in TypeScript
}

// ToolResult represents a tool result
export interface ToolResult {
  tool_call_id: string;
  name: string;
  success: boolean;
  content?: string; // *string in Go becomes optional string
  error?: string; // *string in Go becomes optional string

  // New protocol support: simplified data for different consumers  
  entity_ids?: string[]; // Related entity IDs from output.ids
}

// Attachment represents an attachment
export interface Attachment {
  type: AttachmentType;
  url: string; // URL in Go becomes url in TypeScript (camelCase)
  mime_type: string;
  size?: number; // int64 in Go becomes number in TypeScript
  metadata?: any; // jsoniter.RawMessage in Go becomes any in TypeScript
}

// Message role enum
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
  TOOL = "tool",
  SUMMARY = "summary",
}

// Message status enum
export enum MessageStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Attachment type enum
export enum AttachmentType {
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file",
}

// Message segment type enum
export enum SegmentType {
  TEXT = "text",
  TOOL_CALL = "tool_call",
  TOOL_RESULT = "tool_result",
  ATTACHMENT = "attachment",
}
// Zod schemas for message segments
export const SegmentTypeSchema = z.enum(["text", "tool_call", "tool_result", "attachment"]);
export const AttachmentTypeSchema = z.enum(["image", "audio", "video", "file"]);

export const UIExtraDataSchema = z.object({
  tool_entities: z.string().optional(),
  tool_entity_ids: z.array(z.string()).optional(),
  tool_name: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.any(),
});

export const ToolResultSchema = z.object({
  tool_call_id: z.string(),
  name: z.string(),
  success: z.boolean(),
  content: z.string().optional(),
  error: z.string().optional(),
  entity_ids: z.array(z.string()).optional(),
});

export const AttachmentSchema = z.object({
  type: AttachmentTypeSchema,
  url: z.string(),
  mime_type: z.string(),
  size: z.number().optional(),
  metadata: z.any().optional(),
});

export const MessageSegmentSchema = z.object({
  type: SegmentTypeSchema,
  text: z.string().optional(),
  tool_call: ToolCallSchema.optional(),
  tool_result: ToolResultSchema.optional(),
  attachment: AttachmentSchema.optional(),
  ui_extra: UIExtraDataSchema.optional(),
  event_id: z.string().optional(),
});

export const MessageSegmentListSchema = z.array(MessageSegmentSchema);

export type IChatInfo=z.infer<typeof ReqParamsSchema>['environment']['chat_info'];
export type IFamilyInfo=z.infer<typeof ReqParamsSchema>['environment']['family_info'];
export type IUserBrief=z.infer<typeof ReqParamsSchema>['environment']['user_brief'];

// Zod schema for IReqParams
export const ReqParamsSchema = z.object({
  environment: z.object({
    family_info: z.object({
      family_id: z.string(),
      name: z.string(),
      roles: z.array(z.object({
        family_role_id: z.string(),
        user_id: z.string().nullish(),
        // 角色名，爸爸妈妈

        role_name: z.string().nullish(),
        // 人物名：Nacy，Michael
        role_nickname: z.string().nullish(),
        birthday: z.string().nullish(), // ISO string format for time.Time
      })),
      location: z.string().nullish(),
      locale: z.string().default("en-US"),
    }),
    user_brief: z.object({
      task: z.object({
        task_lists: z.array(z.object({
          task_list_id: z.string(),
          name: z.string(),
          description: z.string().nullish(),
        })),
      }),
      calendar: z.object({
        default_calendar: z.object({
          calendar_id: z.string(),
          name: z.string(),
          description: z.string().nullish(),
        }).nullish(),
      }),
    }),
    chat_info: z.object({
      conversation_id: z.string(),
      turn_id: z.string(),
      user_ui_message_id: z.string(),
      assistant_ui_message_id: z.string(),
    }),
  }),
  recent_messages: z.array(z.object({
    role: z.enum(MessageRole),
    content: MessageSegmentListSchema,
  })),
});

// Export types
export type IMessageReqParams = z.infer<typeof ReqParamsSchema>;

export function getSummaryMessage(
  msg: IMessageReqParams["recent_messages"],
): string {
  const firstMessage = msg[0];
  if (firstMessage.role !== MessageRole.SUMMARY) {
    return "";
  }
  const { content } = firstMessage;
  // Assume the first element in content array is text content
  return typeof content[0] === 'string' ? content[0] : "";
}

const roleMapping = {
  [MessageRole.USER]: "user",
  [MessageRole.ASSISTANT]: "assistant",
  [MessageRole.SYSTEM]: "system",
  [MessageRole.TOOL]: "tool",
} as const;
export function ServerModelMessageToModelMessage(
  msg: IMessageReqParams["recent_messages"][0],
): ModelMessage | null {
  const { role, content } = msg;
  if (role === MessageRole.SUMMARY) {
    return null;
  }

  
  // Since content is any[] in the new data structure, we need to adapt
  // Here we assume elements in content array are already in correct ModelMessage content format
  const messageContent: ModelMessage["content"] = content.map((segment) => {
    if (segment.type === SegmentType.TEXT) {
      if (!segment.text) {
        return null;
      }
      const { text } = segment;
      const textPart: TextPart = {
        type: "text",
        text: text || "",
      };
      return textPart;
    }
    if (segment.type === SegmentType.TOOL_CALL) {
      const { tool_call } = segment;
      if (!tool_call) {
        return null;
      }
      const toolCallPart: ToolCallPart = {
        type: "tool-call",
        toolCallId: tool_call.id,
        toolName: tool_call.name,
        input: tool_call.arguments,
      };
      return toolCallPart;
    }
    if (segment.type === SegmentType.TOOL_RESULT) {
      const { tool_result } = segment;
      if (!tool_result) {
        return null;
      }
      const toolResultPart: ToolResultPart = {
        type: "tool-result",
        toolCallId: tool_result.tool_call_id,
        output: {
          type: "text",
          value: tool_result.content || "",
        },
        toolName: tool_result.name,
      };
      return toolResultPart;
    }
    if (segment.type === SegmentType.ATTACHMENT) {
      const { attachment } = segment;
      if (!attachment) {
        return null;
      }
      if (attachment.type === AttachmentType.IMAGE) {
        const imagePart: ImagePart = {
          type: "image",
          image: attachment.url,
          mediaType:attachment.mime_type,
        };
        return imagePart;
      }
      const attachmentPart: FilePart = {
        type: "file",
        data: attachment.url,
        // TODO: filename 
        filename:attachment.metadata?.filename??'',
        mediaType:attachment.mime_type,
      
      };
      return attachmentPart;
    }
    return null;
  }).filter((v) => !isNull(v)) as ModelMessage["content"];
  return {
    role: roleMapping[role],
    content: messageContent,
  } as ModelMessage;
}

export function ServerModelMessagesToModelMessages(
  msg: IMessageReqParams["recent_messages"],
): ModelMessage[] {
  return msg.map(ServerModelMessageToModelMessage).filter((v) => !isNull(v)) as ModelMessage[];
}