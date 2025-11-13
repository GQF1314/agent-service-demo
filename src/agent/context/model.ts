import { LanguageModelV2 } from "@openrouter/ai-sdk-provider";
import { ModelMessage, ToolSet } from "ai";
import { v4 as uuidv4 } from "uuid";
import { IReportFn } from "../tools/utils";
import { getTools } from "../tools";
import { ErrorCode, errorStringify } from "../../constants";
import { AgentName, ICommonContext } from "../types/agent";
import { PinoLogger } from "hono-pino";
import config from "config";
import { AppConfig } from "../../index";
import omit from "lodash/omit";
import { createMiniRouter } from "../workflow/router-utils";
import { handlOff } from "../workflow";
import { formatInTimeZone } from "date-fns-tz";
import { addDays } from "date-fns";
import { logRouterTiming, AgentTimer } from "../../utils/timing-logger";

const secretConfig = config.get<AppConfig["secret"]>("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}
export class AgentContext {
    // === Stream 相关 ===
    private controller: ReadableStreamDefaultController<string> | null = null;
    private pendingMessages: string[] = [];
    private _disposed = false;
    public readonly stream: ReadableStream<string>;

    // 转为reply工具设计的
    private _agentName: AgentName = "self";
    public getAgentName(): AgentName {
        return this._agentName;
    }
    public setAgentName(value: AgentName) {
        this._agentName = value;
    }
    public inputStringMap: Record<string, string> = {};
    public replyTextMap: Record<string, string> = {};
    private _aborted: boolean = false;
    public logger: PinoLogger;

    public dispose(): void {
        if (this._disposed) return;
        this._disposed = true;

        try {
            // 只有在流未被错误关闭且 controller 存在时才 close
            if (this.controller && !this._aborted) {
                this.controller.close();
            }
        } catch (error) {
            // close() 可能因为流已关闭而抛异常,这是正常的
            this.logger.error(`dispose: stream already closed - %o`, { error });
        } finally {
            // Clear all references to allow garbage collection
            this.controller = null;
            this.pendingMessages = [];

            // Clear caches and maps
            this.inputStringMap = {};
            this.replyTextMap = {};

            // Break circular references with context
            // @ts-ignore - intentionally nulling to break reference chains
            this.context = null;

            // Clear provider references
            // @ts-ignore
            this._miniProvider = null;
            // @ts-ignore
            this._fastProvider = null;
            // @ts-ignore
            this._llmProvider = null;
        }
    }

    public abort(reason: string): void {
        if (this._disposed) return;  // 防止重复 abort

        this._aborted = true;
        if (this.controller) {
            try {
                this.controller.error(new Error(reason));
            } catch (error) {
                this.logger.error(`abort error: %o`, { error });
            }
        }
        this.dispose();
    }

    public get aborted(): boolean {
        return this._aborted;
    }
    public set aborted(value: boolean) {
        this._aborted = value;
    }

    private context: ICommonContext;
    private _conversationId: string | null = null;
    get conversationId(): string | null {
        return this._conversationId;
    }
    private _familyInfoPrompt: string = "";
    public get familyInfoPrompt(): string {
        return this._familyInfoPrompt;
    }

    constructor(
        context: ICommonContext,
    ) {
        this.context = context;
        this.logger = context.logger;

        // 初始化 ReadableStream
        this.stream = new ReadableStream({
            start: (controller) => {
                this.controller = controller;
                // 发送所有积压消息
                for (const msg of this.pendingMessages) {
                    controller.enqueue(msg);
                }
                this.pendingMessages = [];
            },
            cancel: (reason) => {
                this.logger.info("Stream cancelled by client: %o", { reason });
                // 客户端断开时,标记为已释放,避免后续操作失败
                this._disposed = true;
                this.controller = null;
                this.pendingMessages = [];
            }
        });
    }

    public report: IReportFn = (params) => {
        if (this._disposed) return;

        const reportContent = {
            ...omit(params, "providerMetadata"),
            timestamp: Date.now(),
        };
        this.logger.info(`report part: %o`, reportContent);

        const data = `data: ${JSON.stringify(reportContent)}\n\n`;

        if (this.controller) {
            this.controller.enqueue(data);
        } else {
            // Controller 还未就绪,缓存消息
            this.pendingMessages.push(data);
        }
    };
    public replyManual(params: {
        content: string;
        agentName: AgentName;
    }) {
        const { agentName, content } = params;
        const textId = uuidv4();
        this.report({
            type: "start",
            agentName,
        });
        this.report({
            type: "start-step",
            agentName,
        });
        this.report({
            type: "text-start",
            agentName,
            // @ts-ignore 联合类型问题
            id: textId,
        });
        this.report({
            type: "text-delta",
            agentName,
            // @ts-ignore 联合类型问题
            text: params.content,
            id: textId,
        });

        this.report({
            type: "text-end",
            agentName,
            // @ts-ignore 联合类型问题
            id: textId,
        });
        this.report({
            type: "finish-step",
            agentName,
            //@ts-ignore todo 添加usage
            usage: {},
        });
        this.report({
            type: "finish",
            agentName,
            //@ts-ignore todo 添加usage
            totalUsage: {},
        });
    }
    private _miniProvider: LanguageModelV2 | string =
        secretConfig?.LLM_MINI_MODEL ?? "";
    private _fastProvider: LanguageModelV2 | string =
        secretConfig?.LLM_FAST_MODEL ?? "";
    private _llmProvider: LanguageModelV2 | string =
        secretConfig?.LLM_FAST_MODEL ?? "";
    public get miniProvider(): LanguageModelV2 | string {
        return this._miniProvider;
    }
    public get fastProvider(): LanguageModelV2 | string {
        return this._fastProvider;
    }
    public get llmProvider(): LanguageModelV2 | string {
        return this._llmProvider;
    }
    getTools(agentName: AgentName): ToolSet {
        return getTools({ ...this.context, agentName });
    }
    get summary(): string {
        return this.context.summary
            ? `<history>${this.context.summary}</history>`
            : "";
    }
    get environmentInfoJson() {
        const { familyInfo, userBrief } = this.context;
            const currentDate = new Date();
            const timeZone = this.context.timeZone;
            const upcoming8Days = Array.from({ length: 8 }).map((_, index) => {
                const newDate = addDays(currentDate, index);
                const isoDate = formatInTimeZone(newDate, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
                const weekday = formatInTimeZone(newDate, timeZone, "EEEE");
                return {
                    weekday,
                    isoDate,
                };
            });
        
        const myInfo = familyInfo.roles.find((member) => member.user_id === this.context.userId);
        const envInfoJson = {
            familyName: familyInfo.name,
            familyMembers: familyInfo.roles.map((member) => ({
                roleName: member.role_name,
                name: member.role_nickname,
                roleId: member.family_role_id,
            })),
            myName: myInfo?.role_nickname,
            myRole: myInfo?.family_role_id,
            familyAddress: familyInfo.location,
            currentTaskLists: userBrief.task.task_lists?.map((taskList) => ({
                listName: taskList.name,
                listId: taskList.task_list_id,
                description: taskList.description,
            })),
            currentTime: `${upcoming8Days[0].weekday}, ISO format: ${upcoming8Days[0].isoDate}`,
            upcoming7Days: upcoming8Days.slice(1).map((day) => `${day.weekday},ISO format: ${day.isoDate}`).join("\n"),
            currentTimeZone: this.context.timeZone,
            userLanguage: 'en-US',
        } as const;
        return envInfoJson;
    }
    get environmentInfo(): string {
        return `
        # Please refer to the following information when using tools or replying to the user: 
        The following data contains family ID, family name, home location (family address), timezone, family members, and some basic information.
         ${JSON.stringify(omit(this.environmentInfoJson, ['upcoming7Days']))}`;
    }
    private _id = uuidv4();
    get id(): string {
        return this._id;
    }
    reportError(params: {
        agentName: AgentName;
        error?: {
            code: ErrorCode;
            message: string;
        };
    }) {
        const { agentName, error } = params;
        this.logger.error(`reportError: %o`, { agentName, error });
        this.report({
            type: "error",
            agentName,
            // @ts-ignore
            error,
        });
    }
    get messages(): ModelMessage[] {
        return this.context.messages;
    }

    // === 核心执行方法 ===
    public async execute(): Promise<void> {
        const traceId = this.context.traceId;
        const agentTimer = new AgentTimer(this.logger, traceId);
        agentTimer.logExecuteStart();

        try {
            // 检查是否已被中止或释放
            if (this._disposed || this._aborted) {
                this.logger.warn("Execute called on disposed/aborted context");
                return;
            }

            const routerStartTime = Date.now();
            const routerResult = await createMiniRouter(this);
            const { route, output } = routerResult;
            const routerDuration = Date.now() - routerStartTime;

            logRouterTiming(this.logger, traceId, routerDuration, route);
            this.logger.info(`routerResult: %o`, { route, output });
            // mark 这里 return 掉，用来调试 route
            //return;

            if (route === 'self') {
                this.replyManual({ content: output!, agentName: 'self' });
                agentTimer.logExecuteEnd(agentTimer.elapsed(), { route: 'self', selfReply: true });
                return;
            }

            await handlOff(this, route);
            agentTimer.logExecuteEnd(agentTimer.elapsed(), { route });
        } catch (error) {
            this.logger.error("Execute error: %o", { error });
            // 只有在未被中止时才发送错误报告
            if (!this._disposed && !this._aborted) {
                this.reportError({
                    agentName: 'self',
                    error: {
                        code: ErrorCode.UNKNOWN_ROUTE_ERROR,
                        message: errorStringify(error)
                    }
                });
            }
            agentTimer.logExecuteEnd(agentTimer.elapsed(), { error: errorStringify(error) });
        } finally {
            // 只有在未被中止时才发送结束消息
            if (!this._disposed && !this._aborted) {
                this.report({
                    // @ts-ignore
                    type: "stream_end",
                    message: "Conversation turn completed",
                });
            }
            // 确保资源被释放
            this.dispose();
        }
    }
}
