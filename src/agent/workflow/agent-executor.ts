import { streamText, ToolCallPart } from "ai";
import pick from "lodash/pick";
import omit from "lodash/omit";
import { AgentContext } from "../context/model";
import { createSystemMessage, waitStream } from "./utils";
import { composeRules } from "../prompt/action_rules";
import { privateTools } from "../tools";
import { AGENT_CONFIG_MAP } from "./config";
import { ErrorCode, errorStringify } from "../../constants";
import { AgentName } from "../types/agent";
import { SYSTEM_TOOLS } from "../tools/constants";
import { ReplyType } from "../tools/utils";
import { ModelTimer } from "../../utils/timing-logger";


const maxSteps = 20;
export class AgentExecutor {
    private context: AgentContext;
    private agentName: AgentName;
    constructor(context: AgentContext) {
        this.context = context;
    }
    async executeAgent(agentName: AgentName) {
        try {
            this.agentName = agentName;
            await this.generateAgentResponse(agentName);
        } catch (error) {
            this.context.logger.error(`executeAgent error: ${error}`, {
                error,
            });
            this.context.reportError({
                agentName,
                error: {
                    code: ErrorCode.UNKNOWN_EXECUTION_ERROR,
                    message: errorStringify(error),
                },
            });
        }
    }

    private async generateAgentResponse(agentName: AgentName): Promise<void> {
        this.context.setAgentName(agentName);
        this.context.logger.debug(`start generateAgentResponse: ${agentName} `);

        const traceId = this.context.logger.bindings().traceId as string || "";
        const modelTimer = new ModelTimer(this.context.logger, traceId, agentName);

        const model = this.selectModel(agentName);
        const constructParams = AGENT_CONFIG_MAP[agentName];
        const system = this.buildSystemMessage(constructParams.prompt, agentName);
        const tools = this.selectTools(agentName, constructParams);

        this.context.logger.debug(`original messages: %o`, {
            tools
        });
        const streamResult = streamText({
            maxOutputTokens: 20000,
            maxRetries:1,
            model: model,
            experimental_context: this.context,
            messages: [system, ...this.context.messages],
            tools: tools,
            providerOptions: {
                openrouter: {
                    usage: { include: true },
                },
            },
            toolChoice: "required",
            onStepFinish: (step) => {
                // 记录每个step的耗时和统计信息
                modelTimer.logStep(0, {
                    finishReason: step.finishReason,
                    toolCallsCount: step.toolCalls?.length || 0,
                    usage: step.usage,
                });

                this.context.logger.debug(`step finish: %o`,{
                    step
                });
            },
            stopWhen: ({ steps }) => {
                if (this.context.aborted || steps.length >= maxSteps) {
                    return true;
                }

                const lastStep = steps[steps.length - 1];
                const toolCall = lastStep?.toolCalls;
                const replyToUserToolName = SYSTEM_TOOLS.REPLY_TO_USER;
                // No tool calls
                const isLastReply = !toolCall[0] ||
                    // Only replyToUser tool call
                    // (toolCall[0].toolName===replyToUserToolName&&toolCall.length===1)||
                    // replyToUser tool call and isEnd is true
                    toolCall.some((t) =>
                        t.toolName === replyToUserToolName &&
                        (t.input as { responseType: ReplyType })
                                .responseType === ReplyType.COMPLETION
                    );

                lastStep.finishReason === "error" &&
                    this.context.logger.error(`last step error: %o`, {
                        lastStep,
                    });
                    console.log('isLastReply: %o', { isLastReply });
                return isLastReply;
            },
        });

        try {
            await waitStream(streamResult, (part) => {
                // const agentPart = transStreamPartToAgentPart(part);
                if (!part) {
                    return;
                }
                let processedPart: any = part;
                if (part.type === "start-step") {
                    processedPart = omit(part, "request");
                }
                if (part.type.includes("tool")) {
                    const replyToUserToolName = SYSTEM_TOOLS.REPLY_TO_USER;

                    if ((part as ToolCallPart).toolName === replyToUserToolName) {
                        return;
                    }
                }
                // if(part.type==='finish'){
                //     console.log('finish: %o', { part });
                // }

                this.context.report({
                    ...processedPart,
                    agentName: this.agentName,
                });
            });

            // 记录模型调用总耗时和token统计
            const usage = await streamResult.usage;
            modelTimer.logEnd({
                totalTokens: usage?.totalTokens,
                inputTokens: usage?.inputTokens,
                outputTokens: usage?.outputTokens,
            });
        } finally {
            // Ensure stream is cancelled to release resources
            try {
                if (streamResult.fullStream) {
                    await streamResult.fullStream.cancel();
                }
            } catch (e) {
                // Ignore cancellation errors - stream may already be closed
                this.context.logger.debug(`Stream cancellation: %o`, { error: e });
            }
        }

    }

    private selectModel(agentName: AgentName) {
        return agentName === "super"
            ? this.context.llmProvider
            : this.context.fastProvider;
    }

    private buildSystemMessage(prompt: string, agentName: AgentName) {
        const system = `${prompt}\n${this.context.environmentInfo}`;
        return createSystemMessage(`${system}\n\n${composeRules(this.context, agentName)}`);
    }

    private selectTools(
        agentName: AgentName,
        constructParams: typeof AGENT_CONFIG_MAP[AgentName],
    ) {
        const allTools = this.context.getTools(agentName);

        if (agentName === "super") {
            return omit(allTools, privateTools);
        }

        return constructParams.toolsPick
            ? pick(allTools, constructParams.toolsPick)
            : allTools;
    }
}
