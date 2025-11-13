import { LanguageModelV2 } from "@openrouter/ai-sdk-provider";
import { ModelMessage, ToolSet } from "ai";
import { IReportFn } from "../tools/utils";
import { ErrorCode } from "../../constants";
import { AgentName, ICommonContext } from "../types/agent";
import { PinoLogger } from "hono-pino";
export declare class AgentContext {
    private controller;
    private pendingMessages;
    private _disposed;
    readonly stream: ReadableStream<string>;
    private _agentName;
    getAgentName(): AgentName;
    setAgentName(value: AgentName): void;
    inputStringMap: Record<string, string>;
    replyTextMap: Record<string, string>;
    private _aborted;
    logger: PinoLogger;
    dispose(): void;
    abort(reason: string): void;
    get aborted(): boolean;
    set aborted(value: boolean);
    private context;
    private _conversationId;
    get conversationId(): string | null;
    private _familyInfoPrompt;
    get familyInfoPrompt(): string;
    constructor(context: ICommonContext);
    report: IReportFn;
    replyManual(params: {
        content: string;
        agentName: AgentName;
    }): void;
    private _miniProvider;
    private _fastProvider;
    private _llmProvider;
    get miniProvider(): LanguageModelV2 | string;
    get fastProvider(): LanguageModelV2 | string;
    get llmProvider(): LanguageModelV2 | string;
    getTools(agentName: AgentName): ToolSet;
    get summary(): string;
    get environmentInfoJson(): {
        readonly familyName: string;
        readonly familyMembers: {
            roleName: string | null | undefined;
            name: string | null | undefined;
            roleId: string;
        }[];
        readonly myName: string | null | undefined;
        readonly myRole: string | undefined;
        readonly familyAddress: string | null | undefined;
        readonly currentTaskLists: {
            listName: string;
            listId: string;
            description: string | null | undefined;
        }[];
        readonly currentTime: `${string}, ISO format: ${string}`;
        readonly upcoming7Days: string;
        readonly currentTimeZone: string;
        readonly userLanguage: "en-US";
    };
    get environmentInfo(): string;
    private _id;
    get id(): string;
    reportError(params: {
        agentName: AgentName;
        error?: {
            code: ErrorCode;
            message: string;
        };
    }): void;
    get messages(): ModelMessage[];
    execute(): Promise<void>;
}
