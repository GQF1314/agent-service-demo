import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AgentEntry } from "./entry";
import { readFileSync } from "fs";
import { join } from "path";
import { AppConfig } from "./index";
import {
  createSSEErrorResponse,
  createSSEStreamResponse,
  setupLogger,
} from "./utils";
import { RequestTimer } from "./utils/timing-logger";
import {
  ErrorCode,
  errorStringify,
  FamilyIDHeaderKey,
  TimezoneHeaderKey,
  TraceIDHeaderKey,
  UserIDHeaderKey,
} from "./constants";
import { IMessageReqParams, ReqParamsSchema, MessageRole, SegmentType } from "./types/presentation-input";
import config from "config";
import { IHeaderContext, IServerContext } from "./types/server";
import { genRecipe, GenRecipeInputSchema } from "./endpoint/gen_recipe";
import z from "zod";
import { collectTextFromStream } from "./utils/stream-text-collector";

let buildInfoFromFile = {};
try {
  buildInfoFromFile = JSON.parse(
    readFileSync(join(process.cwd(), "build-info.json"), "utf-8"),
  );
} catch (error) {
  buildInfoFromFile = {};
}
const agentConfig = config.get<AppConfig["agent"]>("agent");

// Create service instance
const agentEntry = new AgentEntry();
const app = new Hono<{
  Variables:IServerContext;
}>();
// CORS configuration
app.use("*", cors({
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
setupLogger(app);
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
  let params: IMessageReqParams;
  let requestTimer: RequestTimer | null = null;
  const headerContext: IHeaderContext = {
    familyId: "",
    userId: "",
    timeZone: "",
    traceId: "",
  };

  const parseStartTime = Date.now();
  try {
    const body: IMessageReqParams = await c.req.json();
    const result = ReqParamsSchema.safeParse(body);
    headerContext.familyId = c.req.header(FamilyIDHeaderKey) ?? "";
    headerContext.userId = c.req.header(UserIDHeaderKey) ?? "";
    headerContext.timeZone = c.req.header(TimezoneHeaderKey) ?? "";
    headerContext.traceId = c.req.header(TraceIDHeaderKey) ?? "";

    // 获取conversationId用于初始化计时器
    const conversationId = body?.environment?.chat_info?.conversation_id ?? "";
    requestTimer = new RequestTimer(logger, headerContext.traceId, conversationId);

    const parseDuration = Date.now() - parseStartTime;
    requestTimer.logParse(parseDuration);
    requestTimer.mark("parse_complete");

    logger.info("[server]: request enter: %o %o", headerContext,body);

    if (!result.success) {
      logger.error("[server]: invalid request params:", body);
      throw result.error;
    }
    if (!c.req.header(FamilyIDHeaderKey) || !c.req.header(UserIDHeaderKey)) {
      // console.error('family-id or user-id is required:',c.req.header());
      throw new Error(
        `family-id or user-id is required:${JSON.stringify(c.req.header())}`,
      );
    }

    params = result.data;
  } catch (error) {
    console.error( error);
    logger.error("Error in SSE endpoint:", errorStringify(error));
    if (requestTimer) {
      requestTimer.logEnd({ error: "parse_error" });
    }
    return createSSEErrorResponse({
      type: "error",
      error: {
        code: ErrorCode.INVALID_REQUEST_PARAMS,
        message: errorStringify(error),
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
      requestTimer: requestTimer!,
    });
    return createSSEStreamResponse(stream, { origin: c.req.header("Origin") ?? undefined });
  } catch (error) {
    logger.error("[server]: Error in SSE endpoint:", error);
    if (requestTimer) {
      requestTimer.logEnd({ error: "execution_error" });
    }
    return createSSEErrorResponse({
      type: "error",
      error: {
        code: ErrorCode.UNKNOWN_SERVER_ERROR,
        message: errorStringify(error),
      },
    }, { origin: c.req.header("Origin") ?? undefined });
  }
});
app.post("/agent/v1/recipe/gen", async (c) => {
  try {
    const body: z.infer<typeof GenRecipeInputSchema> = await c.req.json();
    const result = await genRecipe(c, body);
    return c.json(result);
  } catch (error) {
    return c.json({
      message: errorStringify(error),
      code: ErrorCode.UNKNOWN_SERVER_ERROR,
      data: null,
    });
  }
})

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
    const params: IMessageReqParams = {
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
          role: MessageRole.USER,
          content: [
            {
              type: SegmentType.TEXT,
              text: userMessage,
            }
          ],
        }
      ],
    };

    // 固定的header上下文
    const headerContext: IHeaderContext = {
      familyId: FIXED_FAMILY_ID,
      userId: FIXED_USER_ID,
      timeZone: FIXED_TIMEZONE,
      traceId: `trace-${Date.now()}`,
    };

    // 创建请求计时器
    const conversationId = params.environment.chat_info.conversation_id;
    const requestTimer = new RequestTimer(logger, headerContext.traceId, conversationId);

    // 调用agent获取stream
    const stream = agentEntry.handleSession(params, {
      signal: c.req.raw.signal,
      headerContext,
      logger,
      requestTimer,
    });

    // 阻塞等待stream完成，收集所有文本
    const resultText = await collectTextFromStream(stream);
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

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.error("=== [TEXT-ENDPOINT] Request Failed ===", {
      error: errorStringify(error),
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
      error: errorStringify(error),
      code: ErrorCode.UNKNOWN_SERVER_ERROR,
    }, 500);
  }
})
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
    } catch (error) {
      // If file doesn't exist, use default values
      logger.warn("build-info.json not found, using defaults");
    }

    return c.json(buildInfo);
  } catch (error) {
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

  serve({
    fetch: app.fetch,
    port,
    hostname: host,
  });
  console.log(`📡 Server listening on http://${host}:${port}`);
  console.log(`✅ Ready to accept requests`);
} catch (error) {
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
