"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const entry_1 = require("./entry");
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
const timing_logger_1 = require("./utils/timing-logger");
const constants_1 = require("./constants");
const presentation_input_1 = require("./types/presentation-input");
const config_1 = __importDefault(require("config"));
const gen_recipe_1 = require("./endpoint/gen_recipe");
const stream_text_collector_1 = require("./utils/stream-text-collector");
let buildInfoFromFile = {};
try {
    buildInfoFromFile = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "build-info.json"), "utf-8"));
}
catch (error) {
    buildInfoFromFile = {};
}
const agentConfig = config_1.default.get("agent");
// Create service instance
const agentEntry = new entry_1.AgentEntry();
const app = new hono_1.Hono();
// CORS configuration
app.use("*", (0, cors_1.cors)({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Family-ID",
        "X-User-ID",
        "X-Timezone",
        "TraceId",
    ],
}));
(0, utils_1.setupLogger)(app);
// Health check
app.get("/healthz", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "ecs-server",
    });
});
// SSE route - connect agent
app.post("/agent/v1/chat/completion/stream", async (c) => {
    const logger = c.var.logger;
    let params;
    let requestTimer = null;
    const headerContext = {
        familyId: "",
        userId: "",
        timeZone: "",
        traceId: "",
    };
    const parseStartTime = Date.now();
    try {
        const body = await c.req.json();
        const result = presentation_input_1.ReqParamsSchema.safeParse(body);
        headerContext.familyId = c.req.header(constants_1.FamilyIDHeaderKey) ?? "";
        headerContext.userId = c.req.header(constants_1.UserIDHeaderKey) ?? "";
        headerContext.timeZone = c.req.header(constants_1.TimezoneHeaderKey) ?? "";
        headerContext.traceId = c.req.header(constants_1.TraceIDHeaderKey) ?? "";
        // 获取conversationId用于初始化计时器
        const conversationId = body?.environment?.chat_info?.conversation_id ?? "";
        requestTimer = new timing_logger_1.RequestTimer(logger, headerContext.traceId, conversationId);
        const parseDuration = Date.now() - parseStartTime;
        requestTimer.logParse(parseDuration);
        requestTimer.mark("parse_complete");
        logger.info("[server]: request enter: %o %o", headerContext, body);
        if (!result.success) {
            logger.error("[server]: invalid request params:", body);
            throw result.error;
        }
        if (!c.req.header(constants_1.FamilyIDHeaderKey) || !c.req.header(constants_1.UserIDHeaderKey)) {
            // console.error('family-id or user-id is required:',c.req.header());
            throw new Error(`family-id or user-id is required:${JSON.stringify(c.req.header())}`);
        }
        params = result.data;
    }
    catch (error) {
        console.error(error);
        logger.error("Error in SSE endpoint:", (0, constants_1.errorStringify)(error));
        if (requestTimer) {
            requestTimer.logEnd({ error: "parse_error" });
        }
        return (0, utils_1.createSSEErrorResponse)({
            type: "error",
            error: {
                code: constants_1.ErrorCode.INVALID_REQUEST_PARAMS,
                message: (0, constants_1.errorStringify)(error),
            },
        }, { origin: c.req.header("Origin") ?? undefined });
    }
    const conversationId = params?.environment?.chat_info?.conversation_id ?? "";
    c.set("conversationId", conversationId);
    try {
        requestTimer?.mark("agent_start");
        const stream = agentEntry.handleSession(params, {
            signal: c.req.raw.signal,
            headerContext,
            logger,
            requestTimer: requestTimer,
        });
        return (0, utils_1.createSSEStreamResponse)(stream, { origin: c.req.header("Origin") ?? undefined });
    }
    catch (error) {
        logger.error("[server]: Error in SSE endpoint:", error);
        if (requestTimer) {
            requestTimer.logEnd({ error: "execution_error" });
        }
        return (0, utils_1.createSSEErrorResponse)({
            type: "error",
            error: {
                code: constants_1.ErrorCode.UNKNOWN_SERVER_ERROR,
                message: (0, constants_1.errorStringify)(error),
            },
        }, { origin: c.req.header("Origin") ?? undefined });
    }
});
app.post("/agent/v1/recipe/gen", async (c) => {
    try {
        const body = await c.req.json();
        const result = await (0, gen_recipe_1.genRecipe)(c, body);
        return c.json(result);
    }
    catch (error) {
        return c.json({
            message: (0, constants_1.errorStringify)(error),
            code: constants_1.ErrorCode.UNKNOWN_SERVER_ERROR,
            data: null,
        });
    }
});
// Dialogflow CX Webhook 接口
app.post("/agent/v1/chat/completion/dialogflow-webhook", async (c) => {
    const logger = c.var.logger;
    const startTime = Date.now();
    const requestId = `webhook-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    try {
        // 1. 解析 Dialogflow WebhookRequest
        const webhookRequest = await c.req.json();
        // 打印完整的请求体,方便检索和调试
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK-REQUEST] Incoming request",
            requestId: requestId,
            timestamp: new Date().toISOString(),
            fullRequest: webhookRequest,
            detectIntentResponseId: webhookRequest.detectIntentResponseId,
            languageCode: webhookRequest.languageCode,
            session: webhookRequest.sessionInfo?.session,
            intentName: webhookRequest.intentInfo?.displayName,
            pageName: webhookRequest.pageInfo?.displayName,
        });
        // 2. 提取用户输入文本
        const userInput = webhookRequest.text || webhookRequest.transcript;
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK] Extracted user input",
            requestId: requestId,
            userInput: userInput,
            inputSource: webhookRequest.text ? "text" : "transcript",
        });
        if (!userInput) {
            logger.error({
                msg: "[DIALOGFLOW-WEBHOOK-ERROR] No user input text found",
                requestId: requestId,
                webhookRequest: webhookRequest,
            });
            const errorResponse = {
                fulfillmentResponse: {
                    messages: [
                        {
                            text: {
                                text: ["Sorry, I couldn't understand your input. Please try again."]
                            }
                        }
                    ]
                }
            };
            logger.info({
                msg: "[DIALOGFLOW-WEBHOOK-RESPONSE] Sending error response (no input)",
                requestId: requestId,
                response: errorResponse,
            });
            return c.json(errorResponse);
        }
        // 3. 写死的参数(复用 /text 接口的配置)
        const FIXED_FAMILY_ID = "5c5686b5-d5dc-4a21-bbbc-08a74c03e082";
        const FIXED_USER_ID = "25beada0-3fb0-44f7-bc37-63b67a633695";
        const FIXED_ROLE_ID = "d5095d10-079c-4566-bfc6-1a07f8746e85";
        const FIXED_TIMEZONE = "UTC";
        // 4. 生成会话ID和追踪ID
        const conversationId = webhookRequest.sessionInfo?.session
            ? `dialogflow-${webhookRequest.sessionInfo.session.split('/').pop()}`
            : `conv-${Date.now()}`;
        const traceId = `dialogflow-${webhookRequest.detectIntentResponseId}`;
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK] Generated IDs",
            requestId: requestId,
            conversationId: conversationId,
            traceId: traceId,
        });
        // 5. 构造内部请求参数
        const params = {
            environment: {
                family_info: {
                    family_id: FIXED_FAMILY_ID,
                    name: "Family",
                    roles: [
                        {
                            family_role_id: FIXED_ROLE_ID,
                            user_id: FIXED_USER_ID,
                            role_name: "User",
                            role_nickname: "User",
                            birthday: null,
                        }
                    ],
                    location: null,
                    locale: webhookRequest.languageCode || "en-US",
                },
                user_brief: {
                    task: {
                        task_lists: [],
                    },
                    calendar: {
                        default_calendar: null,
                    },
                },
                chat_info: {
                    conversation_id: conversationId,
                    turn_id: `turn-${Date.now()}`,
                    user_ui_message_id: `msg-user-${Date.now()}`,
                    assistant_ui_message_id: `msg-assistant-${Date.now()}`,
                },
            },
            recent_messages: [
                {
                    role: presentation_input_1.MessageRole.USER,
                    content: [
                        {
                            type: presentation_input_1.SegmentType.TEXT,
                            text: userInput,
                        }
                    ],
                }
            ],
        };
        // 6. 创建header上下文
        const headerContext = {
            familyId: FIXED_FAMILY_ID,
            userId: FIXED_USER_ID,
            timeZone: FIXED_TIMEZONE,
            traceId: traceId,
        };
        // 7. 创建请求计时器
        const requestTimer = new timing_logger_1.RequestTimer(logger, headerContext.traceId, conversationId);
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK] Calling agent with parameters",
            requestId: requestId,
            internalParams: {
                conversationId: conversationId,
                traceId: traceId,
                familyId: FIXED_FAMILY_ID,
                userId: FIXED_USER_ID,
                locale: webhookRequest.languageCode || "en-US",
                userMessage: userInput,
            },
        });
        // 8. 调用agent获取stream
        const stream = agentEntry.handleSession(params, {
            signal: c.req.raw.signal,
            headerContext,
            logger,
            requestTimer,
        });
        // 9. 阻塞等待stream完成,收集所有文本
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK] Waiting for agent response stream",
            requestId: requestId,
        });
        const resultText = await (0, stream_text_collector_1.collectTextFromStream)(stream);
        const endTime = Date.now();
        const duration = endTime - startTime;
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK] Agent response received",
            requestId: requestId,
            responseText: resultText,
            responseLength: resultText.length,
            durationMs: duration,
        });
        // 10. 构造 Dialogflow WebhookResponse
        const webhookResponse = {
            fulfillmentResponse: {
                messages: [
                    {
                        text: {
                            text: [resultText]
                        }
                    }
                ]
            }
        };
        // 11. 记录完整的请求-响应日志(用于检索和调试)
        logger.info({
            msg: "=== [DIALOGFLOW-WEBHOOK-COMPLETE] Full Request-Response Log ===",
            requestId: requestId,
            timestamp: new Date().toISOString(),
            request: {
                fullWebhookRequest: webhookRequest,
                detectIntentResponseId: webhookRequest.detectIntentResponseId,
                languageCode: webhookRequest.languageCode,
                session: webhookRequest.sessionInfo?.session,
                userInput: userInput,
                inputLength: userInput.length,
                intentName: webhookRequest.intentInfo?.displayName,
                pageName: webhookRequest.pageInfo?.displayName,
            },
            response: {
                fullWebhookResponse: webhookResponse,
                responseText: resultText,
                textLength: resultText.length,
                textPreview: resultText.substring(0, 200),
            },
            performance: {
                startTime: startTime,
                endTime: endTime,
                durationMs: duration,
                durationSec: (duration / 1000).toFixed(2),
            },
            internalContext: {
                traceId: traceId,
                conversationId: conversationId,
                familyId: FIXED_FAMILY_ID,
                userId: FIXED_USER_ID,
            },
        });
        // 12. 简单的一行输入输出日志(便于快速查看)
        logger.info(`[DIALOGFLOW-IO] RequestId=${requestId} | Input="${userInput}" | Output="${resultText}" | Duration=${duration}ms`);
        return c.json(webhookResponse);
    }
    catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        // 记录详细的错误信息
        logger.error({
            msg: "=== [DIALOGFLOW-WEBHOOK-ERROR] Request Failed ===",
            requestId: requestId,
            timestamp: new Date().toISOString(),
            error: (0, constants_1.errorStringify)(error),
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            performance: {
                startTime: startTime,
                endTime: endTime,
                durationMs: duration,
                durationSec: (duration / 1000).toFixed(2),
            },
        });
        // 返回友好的错误消息给用户
        const errorResponse = {
            fulfillmentResponse: {
                messages: [
                    {
                        text: {
                            text: ["Sorry, I encountered an error processing your request. Please try again later."]
                        }
                    }
                ]
            }
        };
        logger.info({
            msg: "[DIALOGFLOW-WEBHOOK-RESPONSE] Sending error response",
            requestId: requestId,
            errorResponse: errorResponse,
        });
        return c.json(errorResponse, 500);
    }
});
// 新接口：阻塞式调用agent，返回文本结果
app.post("/agent/v1/chat/completion/text", async (c) => {
    const logger = c.var.logger;
    const startTime = Date.now();
    try {
        // 写死的参数（基于实际业务数据）
        const FIXED_FAMILY_ID = "5c5686b5-d5dc-4a21-bbbc-08a74c03e082";
        const FIXED_USER_ID = "25beada0-3fb0-44f7-bc37-63b67a633695";
        const FIXED_ROLE_ID = "d5095d10-079c-4566-bfc6-1a07f8746e85";
        const FIXED_TIMEZONE = "UTC";
        // 从请求body获取消息内容
        const body = await c.req.json();
        const userMessage = body.text || body.message || "Hello";
        // 构造固定的请求参数
        const params = {
            environment: {
                family_info: {
                    family_id: FIXED_FAMILY_ID,
                    name: "Family",
                    roles: [
                        {
                            family_role_id: FIXED_ROLE_ID,
                            user_id: FIXED_USER_ID,
                            role_name: "User",
                            role_nickname: "User",
                            birthday: null,
                        }
                    ],
                    location: null,
                    locale: "en-US",
                },
                user_brief: {
                    task: {
                        task_lists: [],
                    },
                    calendar: {
                        default_calendar: null,
                    },
                },
                chat_info: {
                    conversation_id: `conv-${Date.now()}`,
                    turn_id: `turn-${Date.now()}`,
                    user_ui_message_id: `msg-user-${Date.now()}`,
                    assistant_ui_message_id: `msg-assistant-${Date.now()}`,
                },
            },
            recent_messages: [
                {
                    role: presentation_input_1.MessageRole.USER,
                    content: [
                        {
                            type: presentation_input_1.SegmentType.TEXT,
                            text: userMessage,
                        }
                    ],
                }
            ],
        };
        // 固定的header上下文
        const headerContext = {
            familyId: FIXED_FAMILY_ID,
            userId: FIXED_USER_ID,
            timeZone: FIXED_TIMEZONE,
            traceId: `trace-${Date.now()}`,
        };
        // 创建请求计时器
        const conversationId = params.environment.chat_info.conversation_id;
        const requestTimer = new timing_logger_1.RequestTimer(logger, headerContext.traceId, conversationId);
        // 调用agent获取stream
        const stream = agentEntry.handleSession(params, {
            signal: c.req.raw.signal,
            headerContext,
            logger,
            requestTimer,
        });
        // 阻塞等待stream完成，收集所有文本
        const resultText = await (0, stream_text_collector_1.collectTextFromStream)(stream);
        const endTime = Date.now();
        const duration = endTime - startTime;
        // 返回JSON格式的文本结果
        const response = {
            success: true,
            text: resultText,
            timestamp: endTime,
        };
        // 一次性打印完整的请求-响应日志
        logger.info({
            msg: "=== [TEXT-ENDPOINT] Complete Request-Response ===",
            textEndpointRequest: {
                userMessage: userMessage,
                messageLength: userMessage.length,
                requestBody: body,
                traceId: headerContext.traceId,
                conversationId: conversationId,
            },
            textEndpointResponse: {
                success: response.success,
                text: resultText,
                textLength: resultText.length,
                textPreview: resultText.substring(0, 200),
                timestamp: response.timestamp,
            },
            textEndpointPerformance: {
                startTime: startTime,
                endTime: endTime,
                durationMs: duration,
                durationSec: (duration / 1000).toFixed(2),
            },
        });
        // 简单的单行日志,只打印输入输出
        logger.info(`[TEXT-IO] Input: "${userMessage}" | Output: "${resultText}"`);
        return c.json(response);
    }
    catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        logger.error("=== [TEXT-ENDPOINT] Request Failed ===", {
            error: (0, constants_1.errorStringify)(error),
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            performance: {
                startTime: startTime,
                endTime: endTime,
                durationMs: duration,
                durationSec: (duration / 1000).toFixed(2),
            },
        });
        return c.json({
            success: false,
            error: (0, constants_1.errorStringify)(error),
            code: constants_1.ErrorCode.UNKNOWN_SERVER_ERROR,
        }, 500);
    }
});
// Version info route
app.get("/api/version", async (c) => {
    const logger = c.var.logger;
    try {
        let buildInfo = {
            gitHash: "unknown",
            gitBranch: "unknown",
            buildTime: new Date().toISOString(),
            version: "0.1.0",
        };
        try {
            buildInfo = { ...buildInfo, ...buildInfoFromFile };
        }
        catch (error) {
            // If file doesn't exist, use default values
            logger.warn("build-info.json not found, using defaults");
        }
        return c.json(buildInfo);
    }
    catch (error) {
        logger.error("Error reading version info:", error);
        return c.json({
            gitHash: "error",
            gitBranch: "error",
            buildTime: new Date().toISOString(),
            version: "0.1.0",
            error: "Failed to read build info",
        }, 500);
    }
});
console.log(`🚀 Starting server...`);
try {
    // Cloud Run 要求: 优先使用 $PORT 环境变量
    // 如果没有设置,则使用配置文件中的端口,最后默认为 8080
    const port = parseInt(process.env.PORT || '') || agentConfig?.port || 8080;
    const host = "0.0.0.0"; // 必须绑定到所有接口
    console.log(`📝 Configuration: PORT=${process.env.PORT}, config.port=${agentConfig?.port}, final port=${port}`);
    (0, node_server_1.serve)({
        fetch: app.fetch,
        port,
        hostname: host,
    });
    console.log(`📡 Server listening on http://${host}:${port}`);
    console.log(`✅ Ready to accept requests`);
}
catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
}
// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n👋 Shutting down server...");
    // Resources are cleaned up per-request, no global cleanup needed
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n👋 Shutting down server...");
    // Resources are cleaned up per-request, no global cleanup needed
    process.exit(0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lY3Mtc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUJBQXVCO0FBQ3ZCLG1EQUEwQztBQUMxQywrQkFBNEI7QUFDNUIsb0NBQWlDO0FBQ2pDLG1DQUFxQztBQUNyQywyQkFBa0M7QUFDbEMsK0JBQTRCO0FBRTVCLG1DQUlpQjtBQUNqQix5REFBcUQ7QUFDckQsMkNBT3FCO0FBQ3JCLG1FQUEwRztBQUMxRyxvREFBNEI7QUFFNUIsc0RBQXdFO0FBRXhFLHlFQUFzRTtBQTRCdEUsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDM0IsSUFBSSxDQUFDO0lBQ0gsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDNUIsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUM5RCxDQUFDO0FBQ0osQ0FBQztBQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7SUFDZixpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDekIsQ0FBQztBQUNELE1BQU0sV0FBVyxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFxQixPQUFPLENBQUMsQ0FBQztBQUU1RCwwQkFBMEI7QUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQkFBVSxFQUFFLENBQUM7QUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFJLEVBRWhCLENBQUM7QUFDTCxxQkFBcUI7QUFDckIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBQSxXQUFJLEVBQUM7SUFDaEIsTUFBTSxFQUFFLHVCQUF1QjtJQUMvQixZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQztJQUN4QyxZQUFZLEVBQUU7UUFDWixjQUFjO1FBQ2QsZUFBZTtRQUNmLGFBQWE7UUFDYixXQUFX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QUUsSUFBSSxnQkFBZ0IsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUVoSCxJQUFBLG1CQUFLLEVBQUM7UUFDSixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7UUFDaEIsSUFBSTtRQUNKLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO0lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQzVDLGlFQUFpRTtJQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQzVDLGlFQUFpRTtJQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiZG90ZW52L2NvbmZpZ1wiO1xuaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiQGhvbm8vbm9kZS1zZXJ2ZXJcIjtcbmltcG9ydCB7IEhvbm8gfSBmcm9tIFwiaG9ub1wiO1xuaW1wb3J0IHsgY29ycyB9IGZyb20gXCJob25vL2NvcnNcIjtcbmltcG9ydCB7IEFnZW50RW50cnkgfSBmcm9tIFwiLi9lbnRyeVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IEFwcENvbmZpZyB9IGZyb20gXCIuL2luZGV4XCI7XG5pbXBvcnQge1xuICBjcmVhdGVTU0VFcnJvclJlc3BvbnNlLFxuICBjcmVhdGVTU0VTdHJlYW1SZXNwb25zZSxcbiAgc2V0dXBMb2dnZXIsXG59IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBSZXF1ZXN0VGltZXIgfSBmcm9tIFwiLi91dGlscy90aW1pbmctbG9nZ2VyXCI7XG5pbXBvcnQge1xuICBFcnJvckNvZGUsXG4gIGVycm9yU3RyaW5naWZ5LFxuICBGYW1pbHlJREhlYWRlcktleSxcbiAgVGltZXpvbmVIZWFkZXJLZXksXG4gIFRyYWNlSURIZWFkZXJLZXksXG4gIFVzZXJJREhlYWRlcktleSxcbn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBJTWVzc2FnZVJlcVBhcmFtcywgUmVxUGFyYW1zU2NoZW1hLCBNZXNzYWdlUm9sZSwgU2VnbWVudFR5cGUgfSBmcm9tIFwiLi90eXBlcy9wcmVzZW50YXRpb24taW5wdXRcIjtcbmltcG9ydCBjb25maWcgZnJvbSBcImNvbmZpZ1wiO1xuaW1wb3J0IHsgSUhlYWRlckNvbnRleHQsIElTZXJ2ZXJDb250ZXh0IH0gZnJvbSBcIi4vdHlwZXMvc2VydmVyXCI7XG5pbXBvcnQgeyBnZW5SZWNpcGUsIEdlblJlY2lwZUlucHV0U2NoZW1hIH0gZnJvbSBcIi4vZW5kcG9pbnQvZ2VuX3JlY2lwZVwiO1xuaW1wb3J0IHogZnJvbSBcInpvZFwiO1xuaW1wb3J0IHsgY29sbGVjdFRleHRGcm9tU3RyZWFtIH0gZnJvbSBcIi4vdXRpbHMvc3RyZWFtLXRleHQtY29sbGVjdG9yXCI7XG5cbi8vIERpYWxvZ2Zsb3cgQ1ggV2ViaG9va1JlcXVlc3Qg57G75Z6L5a6a5LmJXG5pbnRlcmZhY2UgRGlhbG9nZmxvd1dlYmhvb2tSZXF1ZXN0IHtcbiAgZGV0ZWN0SW50ZW50UmVzcG9uc2VJZDogc3RyaW5nO1xuICBsYW5ndWFnZUNvZGU/OiBzdHJpbmc7XG4gIHRleHQ/OiBzdHJpbmc7XG4gIHRyYW5zY3JpcHQ/OiBzdHJpbmc7XG4gIGZ1bGZpbGxtZW50SW5mbz86IGFueTtcbiAgaW50ZW50SW5mbz86IGFueTtcbiAgcGFnZUluZm8/OiBhbnk7XG4gIHNlc3Npb25JbmZvPzoge1xuICAgIHNlc3Npb24/OiBzdHJpbmc7XG4gICAgcGFyYW1ldGVycz86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIH07XG59XG5cbi8vIERpYWxvZ2Zsb3cgQ1ggV2ViaG9va1Jlc3BvbnNlIOexu+Wei+WumuS5iVxuaW50ZXJmYWNlIERpYWxvZ2Zsb3dXZWJob29rUmVzcG9uc2Uge1xuICBmdWxmaWxsbWVudFJlc3BvbnNlPzoge1xuICAgIG1lc3NhZ2VzOiBBcnJheTx7XG4gICAgICB0ZXh0Pzoge1xuICAgICAgICB0ZXh0OiBzdHJpbmdbXTtcbiAgICAgIH07XG4gICAgfT47XG4gIH07XG59XG5cbmxldCBidWlsZEluZm9Gcm9tRmlsZSA9IHt9O1xudHJ5IHtcbiAgYnVpbGRJbmZvRnJvbUZpbGUgPSBKU09OLnBhcnNlKFxuICAgIHJlYWRGaWxlU3luYyhqb2luKHByb2Nlc3MuY3dkKCksIFwiYnVpbGQtaW5mby5qc29uXCIpLCBcInV0Zi04XCIpLFxuICApO1xufSBjYXRjaCAoZXJyb3IpIHtcbiAgYnVpbGRJbmZvRnJvbUZpbGUgPSB7fTtcbn1cbmNvbnN0IGFnZW50Q29uZmlnID0gY29uZmlnLmdldDxBcHBDb25maWdbXCJhZ2VudFwiXT4oXCJhZ2VudFwiKTtcblxuLy8gQ3JlYXRlIHNlcnZpY2UgaW5zdGFuY2VcbmNvbnN0IGFnZW50RW50cnkgPSBuZXcgQWdlbnRFbnRyeSgpO1xuY29uc3QgYXBwID0gbmV3IEhvbm88e1xuICBWYXJpYWJsZXM6SVNlcnZlckNvbnRleHQ7XG59PigpO1xuLy8gQ09SUyBjb25maWd1cmF0aW9uXG5hcHAudXNlKFwiKlwiLCBjb3JzKHtcbiAgb3JpZ2luOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLFxuICBhbGxvd01ldGhvZHM6IFtcIkdFVFwiLCBcIlBPU1RcIiwgXCJPUFRJT05TXCJdLFxuICBhbGxvd0hlYWRlcnM6IFtcbiAgICBcIkNvbnRlbnQtVHlwZVwiLFxuICAgIFwiQXV0aG9yaXphdGlvblwiLFxuICAgIFwiWC1GYW1pbHktSURcIixcbiAgICBcIlgtVXNlci1JRFwiLFxuICAgIFwiWC1UaW1lem9uZVwiLFxuICAgIFwiVHJhY2VJZFwiLFxuICBdLFxufSkpO1xuc2V0dXBMb2dnZXIoYXBwKTtcbi8vIEhlYWx0aCBjaGVja1xuYXBwLmdldChcIi9oZWFsdGh6XCIsIChjKSA9PiB7XG4gIHJldHVybiBjLmpzb24oe1xuICAgIHN0YXR1czogXCJva1wiLFxuICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHNlcnZpY2U6IFwiZWNzLXNlcnZlclwiLFxuICB9KTtcbn0pO1xuLy8gU1NFIHJvdXRlIC0gY29ubmVjdCBhZ2VudFxuYXBwLnBvc3QoXCIvYWdlbnQvdjEvY2hhdC9jb21wbGV0aW9uL3N0cmVhbVwiLCBhc3luYyAoYykgPT4ge1xuICBjb25zdCBsb2dnZXIgPSBjLnZhci5sb2dnZXI7XG4gIGxldCBwYXJhbXM6IElNZXNzYWdlUmVxUGFyYW1zO1xuICBsZXQgcmVxdWVzdFRpbWVyOiBSZXF1ZXN0VGltZXIgfCBudWxsID0gbnVsbDtcbiAgY29uc3QgaGVhZGVyQ29udGV4dDogSUhlYWRlckNvbnRleHQgPSB7XG4gICAgZmFtaWx5SWQ6IFwiXCIsXG4gICAgdXNlcklkOiBcIlwiLFxuICAgIHRpbWVab25lOiBcIlwiLFxuICAgIHRyYWNlSWQ6IFwiXCIsXG4gIH07XG5cbiAgY29uc3QgcGFyc2VTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICB0cnkge1xuICAgIGNvbnN0IGJvZHk6IElNZXNzYWdlUmVxUGFyYW1zID0gYXdhaXQgYy5yZXEuanNvbigpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFJlcVBhcmFtc1NjaGVtYS5zYWZlUGFyc2UoYm9keSk7XG4gICAgaGVhZGVyQ29udGV4dC5mYW1pbHlJZCA9IGMucmVxLmhlYWRlcihGYW1pbHlJREhlYWRlcktleSkgPz8gXCJcIjtcbiAgICBoZWFkZXJDb250ZXh0LnVzZXJJZCA9IGMucmVxLmhlYWRlcihVc2VySURIZWFkZXJLZXkpID8/IFwiXCI7XG4gICAgaGVhZGVyQ29udGV4dC50aW1lWm9uZSA9IGMucmVxLmhlYWRlcihUaW1lem9uZUhlYWRlcktleSkgPz8gXCJcIjtcbiAgICBoZWFkZXJDb250ZXh0LnRyYWNlSWQgPSBjLnJlcS5oZWFkZXIoVHJhY2VJREhlYWRlcktleSkgPz8gXCJcIjtcblxuICAgIC8vIOiOt+WPlmNvbnZlcnNhdGlvbklk55So5LqO5Yid5aeL5YyW6K6h5pe25ZmoXG4gICAgY29uc3QgY29udmVyc2F0aW9uSWQgPSBib2R5Py5lbnZpcm9ubWVudD8uY2hhdF9pbmZvPy5jb252ZXJzYXRpb25faWQgPz8gXCJcIjtcbiAgICByZXF1ZXN0VGltZXIgPSBuZXcgUmVxdWVzdFRpbWVyKGxvZ2dlciwgaGVhZGVyQ29udGV4dC50cmFjZUlkLCBjb252ZXJzYXRpb25JZCk7XG5cbiAgICBjb25zdCBwYXJzZUR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHBhcnNlU3RhcnRUaW1lO1xuICAgIHJlcXVlc3RUaW1lci5sb2dQYXJzZShwYXJzZUR1cmF0aW9uKTtcbiAgICByZXF1ZXN0VGltZXIubWFyayhcInBhcnNlX2NvbXBsZXRlXCIpO1xuXG4gICAgbG9nZ2VyLmluZm8oXCJbc2VydmVyXTogcmVxdWVzdCBlbnRlcjogJW8gJW9cIiwgaGVhZGVyQ29udGV4dCxib2R5KTtcblxuICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcIltzZXJ2ZXJdOiBpbnZhbGlkIHJlcXVlc3QgcGFyYW1zOlwiLCBib2R5KTtcbiAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgaWYgKCFjLnJlcS5oZWFkZXIoRmFtaWx5SURIZWFkZXJLZXkpIHx8ICFjLnJlcS5oZWFkZXIoVXNlcklESGVhZGVyS2V5KSkge1xuICAgICAgLy8gY29uc29sZS5lcnJvcignZmFtaWx5LWlkIG9yIHVzZXItaWQgaXMgcmVxdWlyZWQ6JyxjLnJlcS5oZWFkZXIoKSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBmYW1pbHktaWQgb3IgdXNlci1pZCBpcyByZXF1aXJlZDoke0pTT04uc3RyaW5naWZ5KGMucmVxLmhlYWRlcigpKX1gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBwYXJhbXMgPSByZXN1bHQuZGF0YTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCBlcnJvcik7XG4gICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgaW4gU1NFIGVuZHBvaW50OlwiLCBlcnJvclN0cmluZ2lmeShlcnJvcikpO1xuICAgIGlmIChyZXF1ZXN0VGltZXIpIHtcbiAgICAgIHJlcXVlc3RUaW1lci5sb2dFbmQoeyBlcnJvcjogXCJwYXJzZV9lcnJvclwiIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU1NFRXJyb3JSZXNwb25zZSh7XG4gICAgICB0eXBlOiBcImVycm9yXCIsXG4gICAgICBlcnJvcjoge1xuICAgICAgICBjb2RlOiBFcnJvckNvZGUuSU5WQUxJRF9SRVFVRVNUX1BBUkFNUyxcbiAgICAgICAgbWVzc2FnZTogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgfSxcbiAgICB9LCB7IG9yaWdpbjogYy5yZXEuaGVhZGVyKFwiT3JpZ2luXCIpID8/IHVuZGVmaW5lZCB9KTtcbiAgfVxuICBjb25zdCBjb252ZXJzYXRpb25JZCA9IHBhcmFtcz8uZW52aXJvbm1lbnQ/LmNoYXRfaW5mbz8uY29udmVyc2F0aW9uX2lkID8/IFwiXCI7XG4gIGMuc2V0KFwiY29udmVyc2F0aW9uSWRcIiwgY29udmVyc2F0aW9uSWQpO1xuXG4gIHRyeSB7XG4gICAgcmVxdWVzdFRpbWVyPy5tYXJrKFwiYWdlbnRfc3RhcnRcIik7XG4gICAgY29uc3Qgc3RyZWFtID0gYWdlbnRFbnRyeS5oYW5kbGVTZXNzaW9uKHBhcmFtcywge1xuICAgICAgc2lnbmFsOiBjLnJlcS5yYXcuc2lnbmFsLFxuICAgICAgaGVhZGVyQ29udGV4dCxcbiAgICAgIGxvZ2dlcixcbiAgICAgIHJlcXVlc3RUaW1lcjogcmVxdWVzdFRpbWVyISxcbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlU1NFU3RyZWFtUmVzcG9uc2Uoc3RyZWFtLCB7IG9yaWdpbjogYy5yZXEuaGVhZGVyKFwiT3JpZ2luXCIpID8/IHVuZGVmaW5lZCB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoXCJbc2VydmVyXTogRXJyb3IgaW4gU1NFIGVuZHBvaW50OlwiLCBlcnJvcik7XG4gICAgaWYgKHJlcXVlc3RUaW1lcikge1xuICAgICAgcmVxdWVzdFRpbWVyLmxvZ0VuZCh7IGVycm9yOiBcImV4ZWN1dGlvbl9lcnJvclwiIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU1NFRXJyb3JSZXNwb25zZSh7XG4gICAgICB0eXBlOiBcImVycm9yXCIsXG4gICAgICBlcnJvcjoge1xuICAgICAgICBjb2RlOiBFcnJvckNvZGUuVU5LTk9XTl9TRVJWRVJfRVJST1IsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yU3RyaW5naWZ5KGVycm9yKSxcbiAgICAgIH0sXG4gICAgfSwgeyBvcmlnaW46IGMucmVxLmhlYWRlcihcIk9yaWdpblwiKSA/PyB1bmRlZmluZWQgfSk7XG4gIH1cbn0pO1xuYXBwLnBvc3QoXCIvYWdlbnQvdjEvcmVjaXBlL2dlblwiLCBhc3luYyAoYykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJvZHk6IHouaW5mZXI8dHlwZW9mIEdlblJlY2lwZUlucHV0U2NoZW1hPiA9IGF3YWl0IGMucmVxLmpzb24oKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZW5SZWNpcGUoYywgYm9keSk7XG4gICAgcmV0dXJuIGMuanNvbihyZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBjLmpzb24oe1xuICAgICAgbWVzc2FnZTogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgY29kZTogRXJyb3JDb2RlLlVOS05PV05fU0VSVkVSX0VSUk9SLFxuICAgICAgZGF0YTogbnVsbCxcbiAgICB9KTtcbiAgfVxufSlcblxuLy8gRGlhbG9nZmxvdyBDWCBXZWJob29rIOaOpeWPo1xuYXBwLnBvc3QoXCIvYWdlbnQvdjEvY2hhdC9jb21wbGV0aW9uL2RpYWxvZ2Zsb3ctd2ViaG9va1wiLCBhc3luYyAoYykgPT4ge1xuICBjb25zdCBsb2dnZXIgPSBjLnZhci5sb2dnZXI7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gIGNvbnN0IHJlcXVlc3RJZCA9IGB3ZWJob29rLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNyl9YDtcblxuICB0cnkge1xuICAgIC8vIDEuIOino+aekCBEaWFsb2dmbG93IFdlYmhvb2tSZXF1ZXN0XG4gICAgY29uc3Qgd2ViaG9va1JlcXVlc3Q6IERpYWxvZ2Zsb3dXZWJob29rUmVxdWVzdCA9IGF3YWl0IGMucmVxLmpzb24oKTtcblxuICAgIC8vIOaJk+WNsOWujOaVtOeahOivt+axguS9kyzmlrnkvr/mo4DntKLlkozosIPor5VcbiAgICBsb2dnZXIuaW5mbyh7XG4gICAgICBtc2c6IFwiW0RJQUxPR0ZMT1ctV0VCSE9PSy1SRVFVRVNUXSBJbmNvbWluZyByZXF1ZXN0XCIsXG4gICAgICByZXF1ZXN0SWQ6IHJlcXVlc3RJZCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgZnVsbFJlcXVlc3Q6IHdlYmhvb2tSZXF1ZXN0LFxuICAgICAgZGV0ZWN0SW50ZW50UmVzcG9uc2VJZDogd2ViaG9va1JlcXVlc3QuZGV0ZWN0SW50ZW50UmVzcG9uc2VJZCxcbiAgICAgIGxhbmd1YWdlQ29kZTogd2ViaG9va1JlcXVlc3QubGFuZ3VhZ2VDb2RlLFxuICAgICAgc2Vzc2lvbjogd2ViaG9va1JlcXVlc3Quc2Vzc2lvbkluZm8/LnNlc3Npb24sXG4gICAgICBpbnRlbnROYW1lOiB3ZWJob29rUmVxdWVzdC5pbnRlbnRJbmZvPy5kaXNwbGF5TmFtZSxcbiAgICAgIHBhZ2VOYW1lOiB3ZWJob29rUmVxdWVzdC5wYWdlSW5mbz8uZGlzcGxheU5hbWUsXG4gICAgfSk7XG5cbiAgICAvLyAyLiDmj5Dlj5bnlKjmiLfovpPlhaXmlofmnKxcbiAgICBjb25zdCB1c2VySW5wdXQgPSB3ZWJob29rUmVxdWVzdC50ZXh0IHx8IHdlYmhvb2tSZXF1ZXN0LnRyYW5zY3JpcHQ7XG5cbiAgICBsb2dnZXIuaW5mbyh7XG4gICAgICBtc2c6IFwiW0RJQUxPR0ZMT1ctV0VCSE9PS10gRXh0cmFjdGVkIHVzZXIgaW5wdXRcIixcbiAgICAgIHJlcXVlc3RJZDogcmVxdWVzdElkLFxuICAgICAgdXNlcklucHV0OiB1c2VySW5wdXQsXG4gICAgICBpbnB1dFNvdXJjZTogd2ViaG9va1JlcXVlc3QudGV4dCA/IFwidGV4dFwiIDogXCJ0cmFuc2NyaXB0XCIsXG4gICAgfSk7XG5cbiAgICBpZiAoIXVzZXJJbnB1dCkge1xuICAgICAgbG9nZ2VyLmVycm9yKHtcbiAgICAgICAgbXNnOiBcIltESUFMT0dGTE9XLVdFQkhPT0stRVJST1JdIE5vIHVzZXIgaW5wdXQgdGV4dCBmb3VuZFwiLFxuICAgICAgICByZXF1ZXN0SWQ6IHJlcXVlc3RJZCxcbiAgICAgICAgd2ViaG9va1JlcXVlc3Q6IHdlYmhvb2tSZXF1ZXN0LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlcnJvclJlc3BvbnNlOiBEaWFsb2dmbG93V2ViaG9va1Jlc3BvbnNlID0ge1xuICAgICAgICBmdWxmaWxsbWVudFJlc3BvbnNlOiB7XG4gICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIHRleHQ6IFtcIlNvcnJ5LCBJIGNvdWxkbid0IHVuZGVyc3RhbmQgeW91ciBpbnB1dC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIl1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbG9nZ2VyLmluZm8oe1xuICAgICAgICBtc2c6IFwiW0RJQUxPR0ZMT1ctV0VCSE9PSy1SRVNQT05TRV0gU2VuZGluZyBlcnJvciByZXNwb25zZSAobm8gaW5wdXQpXCIsXG4gICAgICAgIHJlcXVlc3RJZDogcmVxdWVzdElkLFxuICAgICAgICByZXNwb25zZTogZXJyb3JSZXNwb25zZSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gYy5qc29uKGVycm9yUmVzcG9uc2UpO1xuICAgIH1cblxuICAgIC8vIDMuIOWGmeatu+eahOWPguaVsCjlpI3nlKggL3RleHQg5o6l5Y+j55qE6YWN572uKVxuICAgIGNvbnN0IEZJWEVEX0ZBTUlMWV9JRCA9IFwiNWM1Njg2YjUtZDVkYy00YTIxLWJiYmMtMDhhNzRjMDNlMDgyXCI7XG4gICAgY29uc3QgRklYRURfVVNFUl9JRCA9IFwiMjViZWFkYTAtM2ZiMC00NGY3LWJjMzctNjNiNjdhNjMzNjk1XCI7XG4gICAgY29uc3QgRklYRURfUk9MRV9JRCA9IFwiZDUwOTVkMTAtMDc5Yy00NTY2LWJmYzYtMWEwN2Y4NzQ2ZTg1XCI7XG4gICAgY29uc3QgRklYRURfVElNRVpPTkUgPSBcIlVUQ1wiO1xuXG4gICAgLy8gNC4g55Sf5oiQ5Lya6K+dSUTlkozov73ouKpJRFxuICAgIGNvbnN0IGNvbnZlcnNhdGlvbklkID0gd2ViaG9va1JlcXVlc3Quc2Vzc2lvbkluZm8/LnNlc3Npb25cbiAgICAgID8gYGRpYWxvZ2Zsb3ctJHt3ZWJob29rUmVxdWVzdC5zZXNzaW9uSW5mby5zZXNzaW9uLnNwbGl0KCcvJykucG9wKCl9YFxuICAgICAgOiBgY29udi0ke0RhdGUubm93KCl9YDtcbiAgICBjb25zdCB0cmFjZUlkID0gYGRpYWxvZ2Zsb3ctJHt3ZWJob29rUmVxdWVzdC5kZXRlY3RJbnRlbnRSZXNwb25zZUlkfWA7XG5cbiAgICBsb2dnZXIuaW5mbyh7XG4gICAgICBtc2c6IFwiW0RJQUxPR0ZMT1ctV0VCSE9PS10gR2VuZXJhdGVkIElEc1wiLFxuICAgICAgcmVxdWVzdElkOiByZXF1ZXN0SWQsXG4gICAgICBjb252ZXJzYXRpb25JZDogY29udmVyc2F0aW9uSWQsXG4gICAgICB0cmFjZUlkOiB0cmFjZUlkLFxuICAgIH0pO1xuXG4gICAgLy8gNS4g5p6E6YCg5YaF6YOo6K+35rGC5Y+C5pWwXG4gICAgY29uc3QgcGFyYW1zOiBJTWVzc2FnZVJlcVBhcmFtcyA9IHtcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIGZhbWlseV9pbmZvOiB7XG4gICAgICAgICAgZmFtaWx5X2lkOiBGSVhFRF9GQU1JTFlfSUQsXG4gICAgICAgICAgbmFtZTogXCJGYW1pbHlcIixcbiAgICAgICAgICByb2xlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBmYW1pbHlfcm9sZV9pZDogRklYRURfUk9MRV9JRCxcbiAgICAgICAgICAgICAgdXNlcl9pZDogRklYRURfVVNFUl9JRCxcbiAgICAgICAgICAgICAgcm9sZV9uYW1lOiBcIlVzZXJcIixcbiAgICAgICAgICAgICAgcm9sZV9uaWNrbmFtZTogXCJVc2VyXCIsXG4gICAgICAgICAgICAgIGJpcnRoZGF5OiBudWxsLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgbG9jYXRpb246IG51bGwsXG4gICAgICAgICAgbG9jYWxlOiB3ZWJob29rUmVxdWVzdC5sYW5ndWFnZUNvZGUgfHwgXCJlbi1VU1wiLFxuICAgICAgICB9LFxuICAgICAgICB1c2VyX2JyaWVmOiB7XG4gICAgICAgICAgdGFzazoge1xuICAgICAgICAgICAgdGFza19saXN0czogW10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjYWxlbmRhcjoge1xuICAgICAgICAgICAgZGVmYXVsdF9jYWxlbmRhcjogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBjaGF0X2luZm86IHtcbiAgICAgICAgICBjb252ZXJzYXRpb25faWQ6IGNvbnZlcnNhdGlvbklkLFxuICAgICAgICAgIHR1cm5faWQ6IGB0dXJuLSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgIHVzZXJfdWlfbWVzc2FnZV9pZDogYG1zZy11c2VyLSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgIGFzc2lzdGFudF91aV9tZXNzYWdlX2lkOiBgbXNnLWFzc2lzdGFudC0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByZWNlbnRfbWVzc2FnZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHJvbGU6IE1lc3NhZ2VSb2xlLlVTRVIsXG4gICAgICAgICAgY29udGVudDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiBTZWdtZW50VHlwZS5URVhULFxuICAgICAgICAgICAgICB0ZXh0OiB1c2VySW5wdXQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICB9O1xuXG4gICAgLy8gNi4g5Yib5bu6aGVhZGVy5LiK5LiL5paHXG4gICAgY29uc3QgaGVhZGVyQ29udGV4dDogSUhlYWRlckNvbnRleHQgPSB7XG4gICAgICBmYW1pbHlJZDogRklYRURfRkFNSUxZX0lELFxuICAgICAgdXNlcklkOiBGSVhFRF9VU0VSX0lELFxuICAgICAgdGltZVpvbmU6IEZJWEVEX1RJTUVaT05FLFxuICAgICAgdHJhY2VJZDogdHJhY2VJZCxcbiAgICB9O1xuXG4gICAgLy8gNy4g5Yib5bu66K+35rGC6K6h5pe25ZmoXG4gICAgY29uc3QgcmVxdWVzdFRpbWVyID0gbmV3IFJlcXVlc3RUaW1lcihsb2dnZXIsIGhlYWRlckNvbnRleHQudHJhY2VJZCwgY29udmVyc2F0aW9uSWQpO1xuXG4gICAgbG9nZ2VyLmluZm8oe1xuICAgICAgbXNnOiBcIltESUFMT0dGTE9XLVdFQkhPT0tdIENhbGxpbmcgYWdlbnQgd2l0aCBwYXJhbWV0ZXJzXCIsXG4gICAgICByZXF1ZXN0SWQ6IHJlcXVlc3RJZCxcbiAgICAgIGludGVybmFsUGFyYW1zOiB7XG4gICAgICAgIGNvbnZlcnNhdGlvbklkOiBjb252ZXJzYXRpb25JZCxcbiAgICAgICAgdHJhY2VJZDogdHJhY2VJZCxcbiAgICAgICAgZmFtaWx5SWQ6IEZJWEVEX0ZBTUlMWV9JRCxcbiAgICAgICAgdXNlcklkOiBGSVhFRF9VU0VSX0lELFxuICAgICAgICBsb2NhbGU6IHdlYmhvb2tSZXF1ZXN0Lmxhbmd1YWdlQ29kZSB8fCBcImVuLVVTXCIsXG4gICAgICAgIHVzZXJNZXNzYWdlOiB1c2VySW5wdXQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gOC4g6LCD55SoYWdlbnTojrflj5ZzdHJlYW1cbiAgICBjb25zdCBzdHJlYW0gPSBhZ2VudEVudHJ5LmhhbmRsZVNlc3Npb24ocGFyYW1zLCB7XG4gICAgICBzaWduYWw6IGMucmVxLnJhdy5zaWduYWwsXG4gICAgICBoZWFkZXJDb250ZXh0LFxuICAgICAgbG9nZ2VyLFxuICAgICAgcmVxdWVzdFRpbWVyLFxuICAgIH0pO1xuXG4gICAgLy8gOS4g6Zi75aGe562J5b6Fc3RyZWFt5a6M5oiQLOaUtumbhuaJgOacieaWh+acrFxuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIG1zZzogXCJbRElBTE9HRkxPVy1XRUJIT09LXSBXYWl0aW5nIGZvciBhZ2VudCByZXNwb25zZSBzdHJlYW1cIixcbiAgICAgIHJlcXVlc3RJZDogcmVxdWVzdElkLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0VGV4dCA9IGF3YWl0IGNvbGxlY3RUZXh0RnJvbVN0cmVhbShzdHJlYW0pO1xuICAgIGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZTtcblxuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIG1zZzogXCJbRElBTE9HRkxPVy1XRUJIT09LXSBBZ2VudCByZXNwb25zZSByZWNlaXZlZFwiLFxuICAgICAgcmVxdWVzdElkOiByZXF1ZXN0SWQsXG4gICAgICByZXNwb25zZVRleHQ6IHJlc3VsdFRleHQsXG4gICAgICByZXNwb25zZUxlbmd0aDogcmVzdWx0VGV4dC5sZW5ndGgsXG4gICAgICBkdXJhdGlvbk1zOiBkdXJhdGlvbixcbiAgICB9KTtcblxuICAgIC8vIDEwLiDmnoTpgKAgRGlhbG9nZmxvdyBXZWJob29rUmVzcG9uc2VcbiAgICBjb25zdCB3ZWJob29rUmVzcG9uc2U6IERpYWxvZ2Zsb3dXZWJob29rUmVzcG9uc2UgPSB7XG4gICAgICBmdWxmaWxsbWVudFJlc3BvbnNlOiB7XG4gICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICB0ZXh0OiBbcmVzdWx0VGV4dF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gMTEuIOiusOW9leWujOaVtOeahOivt+axgi3lk43lupTml6Xlv5co55So5LqO5qOA57Si5ZKM6LCD6K+VKVxuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIG1zZzogXCI9PT0gW0RJQUxPR0ZMT1ctV0VCSE9PSy1DT01QTEVURV0gRnVsbCBSZXF1ZXN0LVJlc3BvbnNlIExvZyA9PT1cIixcbiAgICAgIHJlcXVlc3RJZDogcmVxdWVzdElkLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICByZXF1ZXN0OiB7XG4gICAgICAgIGZ1bGxXZWJob29rUmVxdWVzdDogd2ViaG9va1JlcXVlc3QsXG4gICAgICAgIGRldGVjdEludGVudFJlc3BvbnNlSWQ6IHdlYmhvb2tSZXF1ZXN0LmRldGVjdEludGVudFJlc3BvbnNlSWQsXG4gICAgICAgIGxhbmd1YWdlQ29kZTogd2ViaG9va1JlcXVlc3QubGFuZ3VhZ2VDb2RlLFxuICAgICAgICBzZXNzaW9uOiB3ZWJob29rUmVxdWVzdC5zZXNzaW9uSW5mbz8uc2Vzc2lvbixcbiAgICAgICAgdXNlcklucHV0OiB1c2VySW5wdXQsXG4gICAgICAgIGlucHV0TGVuZ3RoOiB1c2VySW5wdXQubGVuZ3RoLFxuICAgICAgICBpbnRlbnROYW1lOiB3ZWJob29rUmVxdWVzdC5pbnRlbnRJbmZvPy5kaXNwbGF5TmFtZSxcbiAgICAgICAgcGFnZU5hbWU6IHdlYmhvb2tSZXF1ZXN0LnBhZ2VJbmZvPy5kaXNwbGF5TmFtZSxcbiAgICAgIH0sXG4gICAgICByZXNwb25zZToge1xuICAgICAgICBmdWxsV2ViaG9va1Jlc3BvbnNlOiB3ZWJob29rUmVzcG9uc2UsXG4gICAgICAgIHJlc3BvbnNlVGV4dDogcmVzdWx0VGV4dCxcbiAgICAgICAgdGV4dExlbmd0aDogcmVzdWx0VGV4dC5sZW5ndGgsXG4gICAgICAgIHRleHRQcmV2aWV3OiByZXN1bHRUZXh0LnN1YnN0cmluZygwLCAyMDApLFxuICAgICAgfSxcbiAgICAgIHBlcmZvcm1hbmNlOiB7XG4gICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lOiBlbmRUaW1lLFxuICAgICAgICBkdXJhdGlvbk1zOiBkdXJhdGlvbixcbiAgICAgICAgZHVyYXRpb25TZWM6IChkdXJhdGlvbiAvIDEwMDApLnRvRml4ZWQoMiksXG4gICAgICB9LFxuICAgICAgaW50ZXJuYWxDb250ZXh0OiB7XG4gICAgICAgIHRyYWNlSWQ6IHRyYWNlSWQsXG4gICAgICAgIGNvbnZlcnNhdGlvbklkOiBjb252ZXJzYXRpb25JZCxcbiAgICAgICAgZmFtaWx5SWQ6IEZJWEVEX0ZBTUlMWV9JRCxcbiAgICAgICAgdXNlcklkOiBGSVhFRF9VU0VSX0lELFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIDEyLiDnroDljZXnmoTkuIDooYzovpPlhaXovpPlh7rml6Xlv5co5L6/5LqO5b+r6YCf5p+l55yLKVxuICAgIGxvZ2dlci5pbmZvKGBbRElBTE9HRkxPVy1JT10gUmVxdWVzdElkPSR7cmVxdWVzdElkfSB8IElucHV0PVwiJHt1c2VySW5wdXR9XCIgfCBPdXRwdXQ9XCIke3Jlc3VsdFRleHR9XCIgfCBEdXJhdGlvbj0ke2R1cmF0aW9ufW1zYCk7XG5cbiAgICByZXR1cm4gYy5qc29uKHdlYmhvb2tSZXNwb25zZSk7XG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBlbmRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG5cbiAgICAvLyDorrDlvZXor6bnu4bnmoTplJnor6/kv6Hmga9cbiAgICBsb2dnZXIuZXJyb3Ioe1xuICAgICAgbXNnOiBcIj09PSBbRElBTE9HRkxPVy1XRUJIT09LLUVSUk9SXSBSZXF1ZXN0IEZhaWxlZCA9PT1cIixcbiAgICAgIHJlcXVlc3RJZDogcmVxdWVzdElkLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBlcnJvcjogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgZXJyb3JUeXBlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IuY29uc3RydWN0b3IubmFtZSA6IHR5cGVvZiBlcnJvcixcbiAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgZXJyb3JTdGFjazogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnN0YWNrIDogdW5kZWZpbmVkLFxuICAgICAgcGVyZm9ybWFuY2U6IHtcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIGVuZFRpbWU6IGVuZFRpbWUsXG4gICAgICAgIGR1cmF0aW9uTXM6IGR1cmF0aW9uLFxuICAgICAgICBkdXJhdGlvblNlYzogKGR1cmF0aW9uIC8gMTAwMCkudG9GaXhlZCgyKSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyDov5Tlm57lj4vlpb3nmoTplJnor6/mtojmga/nu5nnlKjmiLdcbiAgICBjb25zdCBlcnJvclJlc3BvbnNlOiBEaWFsb2dmbG93V2ViaG9va1Jlc3BvbnNlID0ge1xuICAgICAgZnVsZmlsbG1lbnRSZXNwb25zZToge1xuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgdGV4dDogW1wiU29ycnksIEkgZW5jb3VudGVyZWQgYW4gZXJyb3IgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuXCJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfTtcblxuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIG1zZzogXCJbRElBTE9HRkxPVy1XRUJIT09LLVJFU1BPTlNFXSBTZW5kaW5nIGVycm9yIHJlc3BvbnNlXCIsXG4gICAgICByZXF1ZXN0SWQ6IHJlcXVlc3RJZCxcbiAgICAgIGVycm9yUmVzcG9uc2U6IGVycm9yUmVzcG9uc2UsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gYy5qc29uKGVycm9yUmVzcG9uc2UsIDUwMCk7XG4gIH1cbn0pO1xuXG5cbi8vIOaWsOaOpeWPo++8mumYu+WhnuW8j+iwg+eUqGFnZW5077yM6L+U5Zue5paH5pys57uT5p6cXG5hcHAucG9zdChcIi9hZ2VudC92MS9jaGF0L2NvbXBsZXRpb24vdGV4dFwiLCBhc3luYyAoYykgPT4ge1xuICBjb25zdCBsb2dnZXIgPSBjLnZhci5sb2dnZXI7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgdHJ5IHtcbiAgICAvLyDlhpnmrbvnmoTlj4LmlbDvvIjln7rkuo7lrp7pmYXkuJrliqHmlbDmja7vvIlcbiAgICBjb25zdCBGSVhFRF9GQU1JTFlfSUQgPSBcIjVjNTY4NmI1LWQ1ZGMtNGEyMS1iYmJjLTA4YTc0YzAzZTA4MlwiO1xuICAgIGNvbnN0IEZJWEVEX1VTRVJfSUQgPSBcIjI1YmVhZGEwLTNmYjAtNDRmNy1iYzM3LTYzYjY3YTYzMzY5NVwiO1xuICAgIGNvbnN0IEZJWEVEX1JPTEVfSUQgPSBcImQ1MDk1ZDEwLTA3OWMtNDU2Ni1iZmM2LTFhMDdmODc0NmU4NVwiO1xuICAgIGNvbnN0IEZJWEVEX1RJTUVaT05FID0gXCJVVENcIjtcblxuICAgIC8vIOS7juivt+axgmJvZHnojrflj5bmtojmga/lhoXlrrlcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgYy5yZXEuanNvbigpO1xuICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYm9keS50ZXh0IHx8IGJvZHkubWVzc2FnZSB8fCBcIkhlbGxvXCI7XG5cbiAgICAvLyDmnoTpgKDlm7rlrprnmoTor7fmsYLlj4LmlbBcbiAgICBjb25zdCBwYXJhbXM6IElNZXNzYWdlUmVxUGFyYW1zID0ge1xuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgZmFtaWx5X2luZm86IHtcbiAgICAgICAgICBmYW1pbHlfaWQ6IEZJWEVEX0ZBTUlMWV9JRCxcbiAgICAgICAgICBuYW1lOiBcIkZhbWlseVwiLFxuICAgICAgICAgIHJvbGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGZhbWlseV9yb2xlX2lkOiBGSVhFRF9ST0xFX0lELFxuICAgICAgICAgICAgICB1c2VyX2lkOiBGSVhFRF9VU0VSX0lELFxuICAgICAgICAgICAgICByb2xlX25hbWU6IFwiVXNlclwiLFxuICAgICAgICAgICAgICByb2xlX25pY2tuYW1lOiBcIlVzZXJcIixcbiAgICAgICAgICAgICAgYmlydGhkYXk6IG51bGwsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBsb2NhdGlvbjogbnVsbCxcbiAgICAgICAgICBsb2NhbGU6IFwiZW4tVVNcIixcbiAgICAgICAgfSxcbiAgICAgICAgdXNlcl9icmllZjoge1xuICAgICAgICAgIHRhc2s6IHtcbiAgICAgICAgICAgIHRhc2tfbGlzdHM6IFtdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY2FsZW5kYXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHRfY2FsZW5kYXI6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgY2hhdF9pbmZvOiB7XG4gICAgICAgICAgY29udmVyc2F0aW9uX2lkOiBgY29udi0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICB0dXJuX2lkOiBgdHVybi0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICB1c2VyX3VpX21lc3NhZ2VfaWQ6IGBtc2ctdXNlci0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICBhc3Npc3RhbnRfdWlfbWVzc2FnZV9pZDogYG1zZy1hc3Npc3RhbnQtJHtEYXRlLm5vdygpfWAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcmVjZW50X21lc3NhZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByb2xlOiBNZXNzYWdlUm9sZS5VU0VSLFxuICAgICAgICAgIGNvbnRlbnQ6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogU2VnbWVudFR5cGUuVEVYVCxcbiAgICAgICAgICAgICAgdGV4dDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICB9O1xuXG4gICAgLy8g5Zu65a6a55qEaGVhZGVy5LiK5LiL5paHXG4gICAgY29uc3QgaGVhZGVyQ29udGV4dDogSUhlYWRlckNvbnRleHQgPSB7XG4gICAgICBmYW1pbHlJZDogRklYRURfRkFNSUxZX0lELFxuICAgICAgdXNlcklkOiBGSVhFRF9VU0VSX0lELFxuICAgICAgdGltZVpvbmU6IEZJWEVEX1RJTUVaT05FLFxuICAgICAgdHJhY2VJZDogYHRyYWNlLSR7RGF0ZS5ub3coKX1gLFxuICAgIH07XG5cbiAgICAvLyDliJvlu7ror7fmsYLorqHml7blmahcbiAgICBjb25zdCBjb252ZXJzYXRpb25JZCA9IHBhcmFtcy5lbnZpcm9ubWVudC5jaGF0X2luZm8uY29udmVyc2F0aW9uX2lkO1xuICAgIGNvbnN0IHJlcXVlc3RUaW1lciA9IG5ldyBSZXF1ZXN0VGltZXIobG9nZ2VyLCBoZWFkZXJDb250ZXh0LnRyYWNlSWQsIGNvbnZlcnNhdGlvbklkKTtcblxuICAgIC8vIOiwg+eUqGFnZW506I635Y+Wc3RyZWFtXG4gICAgY29uc3Qgc3RyZWFtID0gYWdlbnRFbnRyeS5oYW5kbGVTZXNzaW9uKHBhcmFtcywge1xuICAgICAgc2lnbmFsOiBjLnJlcS5yYXcuc2lnbmFsLFxuICAgICAgaGVhZGVyQ29udGV4dCxcbiAgICAgIGxvZ2dlcixcbiAgICAgIHJlcXVlc3RUaW1lcixcbiAgICB9KTtcblxuICAgIC8vIOmYu+WhnuetieW+hXN0cmVhbeWujOaIkO+8jOaUtumbhuaJgOacieaWh+acrFxuICAgIGNvbnN0IHJlc3VsdFRleHQgPSBhd2FpdCBjb2xsZWN0VGV4dEZyb21TdHJlYW0oc3RyZWFtKTtcbiAgICBjb25zdCBlbmRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG5cbiAgICAvLyDov5Tlm55KU09O5qC85byP55qE5paH5pys57uT5p6cXG4gICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgdGV4dDogcmVzdWx0VGV4dCxcbiAgICAgIHRpbWVzdGFtcDogZW5kVGltZSxcbiAgICB9O1xuXG4gICAgLy8g5LiA5qyh5oCn5omT5Y2w5a6M5pW055qE6K+35rGCLeWTjeW6lOaXpeW/l1xuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIG1zZzogXCI9PT0gW1RFWFQtRU5EUE9JTlRdIENvbXBsZXRlIFJlcXVlc3QtUmVzcG9uc2UgPT09XCIsXG4gICAgICB0ZXh0RW5kcG9pbnRSZXF1ZXN0OiB7XG4gICAgICAgIHVzZXJNZXNzYWdlOiB1c2VyTWVzc2FnZSxcbiAgICAgICAgbWVzc2FnZUxlbmd0aDogdXNlck1lc3NhZ2UubGVuZ3RoLFxuICAgICAgICByZXF1ZXN0Qm9keTogYm9keSxcbiAgICAgICAgdHJhY2VJZDogaGVhZGVyQ29udGV4dC50cmFjZUlkLFxuICAgICAgICBjb252ZXJzYXRpb25JZDogY29udmVyc2F0aW9uSWQsXG4gICAgICB9LFxuICAgICAgdGV4dEVuZHBvaW50UmVzcG9uc2U6IHtcbiAgICAgICAgc3VjY2VzczogcmVzcG9uc2Uuc3VjY2VzcyxcbiAgICAgICAgdGV4dDogcmVzdWx0VGV4dCxcbiAgICAgICAgdGV4dExlbmd0aDogcmVzdWx0VGV4dC5sZW5ndGgsXG4gICAgICAgIHRleHRQcmV2aWV3OiByZXN1bHRUZXh0LnN1YnN0cmluZygwLCAyMDApLFxuICAgICAgICB0aW1lc3RhbXA6IHJlc3BvbnNlLnRpbWVzdGFtcCxcbiAgICAgIH0sXG4gICAgICB0ZXh0RW5kcG9pbnRQZXJmb3JtYW5jZToge1xuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgZW5kVGltZTogZW5kVGltZSxcbiAgICAgICAgZHVyYXRpb25NczogZHVyYXRpb24sXG4gICAgICAgIGR1cmF0aW9uU2VjOiAoZHVyYXRpb24gLyAxMDAwKS50b0ZpeGVkKDIpLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIOeugOWNleeahOWNleihjOaXpeW/lyzlj6rmiZPljbDovpPlhaXovpPlh7pcbiAgICBsb2dnZXIuaW5mbyhgW1RFWFQtSU9dIElucHV0OiBcIiR7dXNlck1lc3NhZ2V9XCIgfCBPdXRwdXQ6IFwiJHtyZXN1bHRUZXh0fVwiYCk7XG5cbiAgICByZXR1cm4gYy5qc29uKHJlc3BvbnNlKTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZTtcblxuICAgIGxvZ2dlci5lcnJvcihcIj09PSBbVEVYVC1FTkRQT0lOVF0gUmVxdWVzdCBGYWlsZWQgPT09XCIsIHtcbiAgICAgIGVycm9yOiBlcnJvclN0cmluZ2lmeShlcnJvciksXG4gICAgICBlcnJvclR5cGU6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5jb25zdHJ1Y3Rvci5uYW1lIDogdHlwZW9mIGVycm9yLFxuICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICBlcnJvclN0YWNrOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3Iuc3RhY2sgOiB1bmRlZmluZWQsXG4gICAgICBwZXJmb3JtYW5jZToge1xuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgZW5kVGltZTogZW5kVGltZSxcbiAgICAgICAgZHVyYXRpb25NczogZHVyYXRpb24sXG4gICAgICAgIGR1cmF0aW9uU2VjOiAoZHVyYXRpb24gLyAxMDAwKS50b0ZpeGVkKDIpLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBjLmpzb24oe1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgY29kZTogRXJyb3JDb2RlLlVOS05PV05fU0VSVkVSX0VSUk9SLFxuICAgIH0sIDUwMCk7XG4gIH1cbn0pXG4vLyBWZXJzaW9uIGluZm8gcm91dGVcbmFwcC5nZXQoXCIvYXBpL3ZlcnNpb25cIiwgYXN5bmMgKGMpID0+IHtcbiAgY29uc3QgbG9nZ2VyID0gYy52YXIubG9nZ2VyO1xuICB0cnkge1xuICAgIGxldCBidWlsZEluZm8gPSB7XG4gICAgICBnaXRIYXNoOiBcInVua25vd25cIixcbiAgICAgIGdpdEJyYW5jaDogXCJ1bmtub3duXCIsXG4gICAgICBidWlsZFRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHZlcnNpb246IFwiMC4xLjBcIixcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGJ1aWxkSW5mbyA9IHsgLi4uYnVpbGRJbmZvLCAuLi5idWlsZEluZm9Gcm9tRmlsZSB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBJZiBmaWxlIGRvZXNuJ3QgZXhpc3QsIHVzZSBkZWZhdWx0IHZhbHVlc1xuICAgICAgbG9nZ2VyLndhcm4oXCJidWlsZC1pbmZvLmpzb24gbm90IGZvdW5kLCB1c2luZyBkZWZhdWx0c1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYy5qc29uKGJ1aWxkSW5mbyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgcmVhZGluZyB2ZXJzaW9uIGluZm86XCIsIGVycm9yKTtcbiAgICByZXR1cm4gYy5qc29uKHtcbiAgICAgIGdpdEhhc2g6IFwiZXJyb3JcIixcbiAgICAgIGdpdEJyYW5jaDogXCJlcnJvclwiLFxuICAgICAgYnVpbGRUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB2ZXJzaW9uOiBcIjAuMS4wXCIsXG4gICAgICBlcnJvcjogXCJGYWlsZWQgdG8gcmVhZCBidWlsZCBpbmZvXCIsXG4gICAgfSwgNTAwKTtcbiAgfVxufSk7XG5cbmNvbnNvbGUubG9nKGDwn5qAIFN0YXJ0aW5nIHNlcnZlci4uLmApO1xudHJ5IHtcbiAgLy8gQ2xvdWQgUnVuIOimgeaxgjog5LyY5YWI5L2/55SoICRQT1JUIOeOr+Wig+WPmOmHj1xuICAvLyDlpoLmnpzmsqHmnInorr7nva4s5YiZ5L2/55So6YWN572u5paH5Lu25Lit55qE56uv5Y+jLOacgOWQjum7mOiupOS4uiA4MDgwXG4gIGNvbnN0IHBvcnQgPSBwYXJzZUludChwcm9jZXNzLmVudi5QT1JUIHx8ICcnKSB8fCBhZ2VudENvbmZpZz8ucG9ydCB8fCA4MDgwO1xuICBjb25zdCBob3N0ID0gXCIwLjAuMC4wXCI7IC8vIOW/hemhu+e7keWumuWIsOaJgOacieaOpeWPo1xuXG4gIGNvbnNvbGUubG9nKGDwn5OdIENvbmZpZ3VyYXRpb246IFBPUlQ9JHtwcm9jZXNzLmVudi5QT1JUfSwgY29uZmlnLnBvcnQ9JHthZ2VudENvbmZpZz8ucG9ydH0sIGZpbmFsIHBvcnQ9JHtwb3J0fWApO1xuXG4gIHNlcnZlKHtcbiAgICBmZXRjaDogYXBwLmZldGNoLFxuICAgIHBvcnQsXG4gICAgaG9zdG5hbWU6IGhvc3QsXG4gIH0pO1xuICBjb25zb2xlLmxvZyhg8J+ToSBTZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHA6Ly8ke2hvc3R9OiR7cG9ydH1gKTtcbiAgY29uc29sZS5sb2coYOKchSBSZWFkeSB0byBhY2NlcHQgcmVxdWVzdHNgKTtcbn0gY2F0Y2ggKGVycm9yKSB7XG4gIGNvbnNvbGUuZXJyb3IoXCLinYwgRXJyb3Igc3RhcnRpbmcgc2VydmVyOlwiLCBlcnJvcik7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLy8gR3JhY2VmdWwgc2h1dGRvd25cbnByb2Nlc3Mub24oXCJTSUdJTlRcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcIlxcbvCfkYsgU2h1dHRpbmcgZG93biBzZXJ2ZXIuLi5cIik7XG4gIC8vIFJlc291cmNlcyBhcmUgY2xlYW5lZCB1cCBwZXItcmVxdWVzdCwgbm8gZ2xvYmFsIGNsZWFudXAgbmVlZGVkXG4gIHByb2Nlc3MuZXhpdCgwKTtcbn0pO1xuXG5wcm9jZXNzLm9uKFwiU0lHVEVSTVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiXFxu8J+RiyBTaHV0dGluZyBkb3duIHNlcnZlci4uLlwiKTtcbiAgLy8gUmVzb3VyY2VzIGFyZSBjbGVhbmVkIHVwIHBlci1yZXF1ZXN0LCBubyBnbG9iYWwgY2xlYW51cCBuZWVkZWRcbiAgcHJvY2Vzcy5leGl0KDApO1xufSk7XG4iXX0=