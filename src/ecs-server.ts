import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import { SpeechClient, protos as speechProtos } from "@google-cloud/speech";
import { AgentEntry } from "./entry";
import { readFileSync } from "fs";
import { join } from "path";
import type { Duplex } from "stream";
import type { WSContext, WSReadyState } from "hono/ws";
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

// Dialogflow CX WebhookRequest 类型定义
interface DialogflowWebhookRequest {
  detectIntentResponseId: string;
  languageCode?: string;
  text?: string;
  transcript?: string;
  fulfillmentInfo?: any;
  intentInfo?: any;
  pageInfo?: any;
  sessionInfo?: {
    session?: string;
    parameters?: Record<string, any>;
  };
}

// Dialogflow CX WebhookResponse 类型定义
interface DialogflowWebhookResponse {
  fulfillmentResponse?: {
    messages: Array<{
      text?: {
        text: string[];
      };
    }>;
  };
}

let buildInfoFromFile = {};
try {
  buildInfoFromFile = JSON.parse(
    readFileSync(join(process.cwd(), "build-info.json"), "utf-8"),
  );
} catch (error) {
  buildInfoFromFile = {};
}
const agentConfig = config.get<AppConfig["agent"]>("agent");
const secretConfig = config.get<AppConfig["secret"]>("secret");

// const googleSpeechApiKey =
//   process.env.GOOGLE_SPEECH_API_KEY ?? secretConfig.GOOGLE_SPEECH_API_KEY ?? "";

let cachedSpeechClient: SpeechClient | null = null;

const getSpeechClient = () => {
  // if (!googleSpeechApiKey) {
  //   throw new Error("GOOGLE_SPEECH_API_KEY is not configured");
  // }
  // console.log("------googleSpeechApiKey", googleSpeechApiKey);

  if (!cachedSpeechClient) {
    cachedSpeechClient = new SpeechClient({
      projectId: secretConfig.asr_google_project_id,
      credentials: {
        client_email: secretConfig.asr_google_client_email,
        private_key: secretConfig.asr_google_private_key,
      },
    });
  }

  return cachedSpeechClient;
};

const DEFAULT_SPEECH_LANGUAGE = "en-US";
const DEFAULT_SPEECH_SAMPLE_RATE = 16000;
const DEFAULT_SPEECH_ENCODING = "LINEAR16";
const FALSE_LIKE_VALUES = new Set(["false", "0", "no"]);

interface SpeechStreamingConfigOptions {
  encoding?: string | null;
  language?: string | null;
  sampleRate?: string | null;
  interimResults?: string | null;
  model?: string | null;
}

const createSpeechStreamingConfig = (options: SpeechStreamingConfigOptions) => {
  const encoding = (options.encoding ?? DEFAULT_SPEECH_ENCODING).trim().toUpperCase();
  const languageCode = options.language?.trim() || DEFAULT_SPEECH_LANGUAGE;
  const parsedSampleRate = Number.parseInt(options.sampleRate ?? "", 10);
  const sampleRateHertz =
    Number.isFinite(parsedSampleRate) && parsedSampleRate > 0
      ? parsedSampleRate
      : DEFAULT_SPEECH_SAMPLE_RATE;
  const interimFlag = options.interimResults?.trim().toLowerCase();
  const interimResults =
    interimFlag === undefined || interimFlag === ""
      ? true
      : !FALSE_LIKE_VALUES.has(interimFlag);

  const streamingConfig: Record<string, unknown> = {
    config: {
      encoding,
      languageCode,
      sampleRateHertz,
      enableAutomaticPunctuation: true,
    },
    interimResults,
  };

  if (options.model) {
    (streamingConfig.config as Record<string, unknown>).model = options.model;
  }

  return streamingConfig;
};

type ControlEvent = "stop" | "ping";

const parseControlEvent = (raw: string): ControlEvent | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.toLowerCase();
  if (normalized === "stop" || normalized === "end" || normalized === "close") {
    return "stop";
  }
  if (normalized === "ping") {
    return "ping";
  }
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const eventValue = parsed?.event ?? parsed?.type;
    if (typeof eventValue === "string") {
      const event = eventValue.toLowerCase();
      if (event === "stop" || event === "end" || event === "close") {
        return "stop";
      }
      if (event === "ping") {
        return "ping";
      }
    }
  } catch {
    // Ignore JSON parse errors, treat as binary/base64 payloads.
  }
  return null;
};

const normalizeWsPayload = (
  payload: unknown,
): { chunk: Buffer | null; control?: ControlEvent } => {
  if (payload == null) {
    return { chunk: null };
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(payload)) {
    return { chunk: payload };
  }

  if (payload instanceof ArrayBuffer) {
    return { chunk: Buffer.from(payload) };
  }

  if (ArrayBuffer.isView(payload)) {
    const view = payload as ArrayBufferView;
    return {
      chunk: Buffer.from(view.buffer, view.byteOffset, view.byteLength),
    };
  }

  if (typeof payload === "string") {
    const control = parseControlEvent(payload);
    if (control) {
      return { chunk: null, control };
    }
    try {
      return { chunk: Buffer.from(payload, "base64") };
    } catch {
      return { chunk: null };
    }
  }

  return { chunk: null };
};

// Create service instance
const agentEntry = new AgentEntry();
const app = new Hono<{
  Variables:IServerContext;
}>();
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
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

app.get("/agent/v1/speech/ws", upgradeWebSocket((c) => {
  const logger = c.var.logger;
  const streamingConfig = createSpeechStreamingConfig({
    encoding: c.req.header("x-audio-encoding") ?? c.req.query("encoding"),
    language: c.req.header("x-speech-language") ?? c.req.query("language"),
    sampleRate: c.req.header("x-audio-sample-rate") ?? c.req.query("sampleRate"),
    interimResults:
      c.req.header("x-speech-interim-results") ?? c.req.query("interimResults"),
    model: c.req.header("x-speech-model") ?? c.req.query("model"),
  });

  const pendingAudio: Buffer[] = [];
  const WS_OPEN_STATE: WSReadyState = 1;
  let recognizeStream: Duplex | null = null;
  let streamReady = false;
  let wsClosed = false;

  const sendWsMessage = (
    ws: WSContext,
    payload: Record<string, unknown>,
  ) => {
    if (ws.readyState !== WS_OPEN_STATE) {
      return;
    }
    try {
      ws.send(JSON.stringify(payload));
    } catch (error) {
      logger.warn(
        "[speech]: failed to send ws payload: %s",
        errorStringify(error),
      );
    }
  };

  const drainPendingAudio = () => {
    if (!recognizeStream) {
      return;
    }
    let chunk: Buffer | undefined;
    while ((chunk = pendingAudio.shift())) {
      recognizeStream.write(chunk);
    }
  };

  const closeRecognizeStream = () => {
    if (!recognizeStream) {
      return;
    }
    try {
      recognizeStream.end();
    } catch (error) {
      logger.warn(
        "[speech]: failed to end recognize stream: %s",
        errorStringify(error),
      );
    }
    recognizeStream.removeAllListeners();
    recognizeStream = null;
    streamReady = false;
    pendingAudio.length = 0;
  };

  const startSpeechStream = async (ws: WSContext) => {
    try {
      const client = getSpeechClient();
      await client.initialize();
      recognizeStream = client.streamingRecognize(
        streamingConfig as speechProtos.google.cloud.speech.v1.IStreamingRecognitionConfig,
      ) as unknown as Duplex;
      streamReady = true;
      sendWsMessage(ws, {
        type: "ready",
        config: streamingConfig,
      });
      drainPendingAudio();

      recognizeStream.on("data", (data: any) => {
        const results = data?.results ?? [];
        const latestResult = results[results.length - 1];
        const alternative = latestResult?.alternatives?.[0];
        if (!alternative?.transcript) {
          return;
        }
        sendWsMessage(ws, {
          type: "transcript",
          transcript: alternative.transcript,
          isFinal: Boolean(latestResult?.isFinal ?? latestResult?.is_final),
          confidence: alternative.confidence,
          resultIndex: data?.resultIndex ?? 0,
        });
      });

      recognizeStream.on("error", (error: unknown) => {
        if (wsClosed) {
          return;
        }
        logger.error(
          "[speech]: google streaming error: %s",
          errorStringify(error),
        );
        sendWsMessage(ws, {
          type: "error",
          message: "speech_stream_error",
          detail: errorStringify(error),
        });
        ws.close(1011, "speech_stream_error");
      });

      recognizeStream.on("end", () => {
        if (wsClosed) {
          return;
        }
        sendWsMessage(ws, { type: "end" });
        ws.close(1000, "speech_stream_finished");
      });
    } catch (error) {
      logger.error(
        "[speech]: unable to initialize speech client: %s",
        errorStringify(error),
      );
      sendWsMessage(ws, {
        type: "error",
        message: "speech_client_not_ready",
        detail: errorStringify(error),
      });
      ws.close(1011, "speech_client_not_ready");
    }
  };

  return {
    onOpen: (_event, ws) => {
      // if (!googleSpeechApiKey) {
      //   sendWsMessage(ws, {
      //     type: "error",
      //     message: "GOOGLE_SPEECH_API_KEY is not configured",
      //   });
      //   ws.close(1011, "speech_api_key_missing");
      //   return;
      // }
      void startSpeechStream(ws);
    },
    onMessage: (event, ws) => {
      const { chunk, control } = normalizeWsPayload(event.data);
      if (control === "ping") {
        sendWsMessage(ws, { type: "pong", timestamp: Date.now() });
        return;
      }
      if (control === "stop") {
        closeRecognizeStream();
        ws.close(1000, "speech_stream_stopped");
        return;
      }
      if (!chunk || chunk.length === 0) {
        return;
      }
      if (!streamReady || !recognizeStream) {
        pendingAudio.push(chunk);
        return;
      }
      const wrote = recognizeStream.write(chunk);
      if (!wrote) {
        sendWsMessage(ws, {
          type: "info",
          message: "speech_stream_backpressure",
        });
      }
    },
    onClose: () => {
      wsClosed = true;
      closeRecognizeStream();
    },
    onError: (event, ws) => {
      if (wsClosed) {
        return;
      }
      logger.error("[speech]: ws error: %s", errorStringify(event));
      sendWsMessage(ws, {
        type: "error",
        message: "speech_ws_error",
        detail: errorStringify(event),
      });
      wsClosed = true;
      closeRecognizeStream();
    },
  };
}));

// Dialogflow CX Webhook 接口
app.post("/agent/v1/chat/completion/dialogflow-webhook", async (c) => {
  const logger = c.var.logger;
  const startTime = Date.now();
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    // 1. 解析 Dialogflow WebhookRequest
    const webhookRequest: DialogflowWebhookRequest = await c.req.json();

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
      const errorResponse: DialogflowWebhookResponse = {
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
          role: MessageRole.USER,
          content: [
            {
              type: SegmentType.TEXT,
              text: userInput,
            }
          ],
        }
      ],
    };

    // 6. 创建header上下文
    const headerContext: IHeaderContext = {
      familyId: FIXED_FAMILY_ID,
      userId: FIXED_USER_ID,
      timeZone: FIXED_TIMEZONE,
      traceId: traceId,
    };

    // 7. 创建请求计时器
    const requestTimer = new RequestTimer(logger, headerContext.traceId, conversationId);

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

    const resultText = await collectTextFromStream(stream);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 如果结果为空,记录警告
    if (!resultText || resultText.length === 0) {
      logger.warn({
        msg: "[DIALOGFLOW-WEBHOOK-WARNING] Empty response from agent",
        requestId: requestId,
        note: "Agent returned empty text. This might indicate the agent did not generate any response.",
      });
    }

    logger.info({
      msg: "[DIALOGFLOW-WEBHOOK] Agent response received",
      requestId: requestId,
      responseText: resultText,
      responseLength: resultText.length,
      durationMs: duration,
    });

    // 10. 构造 Dialogflow WebhookResponse
    const webhookResponse: DialogflowWebhookResponse = {
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

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 记录详细的错误信息
    logger.error({
      msg: "=== [DIALOGFLOW-WEBHOOK-ERROR] Request Failed ===",
      requestId: requestId,
      timestamp: new Date().toISOString(),
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

    // 返回友好的错误消息给用户
    const errorResponse: DialogflowWebhookResponse = {
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

    logger.error({
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
    }, "=== [TEXT-ENDPOINT] Request Failed ===");

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

  const server = serve({
    fetch: app.fetch,
    port,
    hostname: host,
  });
  injectWebSocket(server);
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
