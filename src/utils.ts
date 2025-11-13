import { Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { requestId } from "hono/request-id";
import { pino, stdTimeFunctions } from "pino";
import { pinoLogger } from "hono-pino";
import { IServerContext } from "./types/server";
import { TraceIDHeaderKey } from "./constants";

export function createSSEErrorResponse(
    json: Record<string, any>,
    options?: { origin?: string }
): Response {
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(json)}\n\n`),
            );
            controller.close();
        },
    });
    console.error("SSE Error Response:", json);
    const allowOrigin = options?.origin ?? "http://localhost:3000";
    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": allowOrigin,
            "Vary": "Origin",
            "Access-Control-Allow-Headers": [
                "Content-Type",
                "Authorization",
                "X-Family-ID",
                "X-User-ID",
                "X-Timezone",
                "TraceId",
            ].join(", "),
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
    });
}
const logger = createMiddleware(async (c, next) => {
    c.set("logger", {
        info: () => {
        },
        error: () => {
        },
        debug: () => {
        },
        warn: () => {
        },
        trace: () => {
        },
    });
    await next()
  })
export function createSSEStreamResponse(
    stream: ReadableStream<string>,
    options?: { origin?: string }
): Response {
    // 将 string 流转换为 Uint8Array 流
    const encodedStream = stream.pipeThrough(new TextEncoderStream());

    const allowOrigin = options?.origin ?? "http://localhost:3000";
    return new Response(encodedStream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": allowOrigin,
            "Vary": "Origin",
            "Access-Control-Allow-Headers": [
                "Content-Type",
                "Authorization",
                "X-Family-ID",
                "X-User-ID",
                "X-Timezone",
                "TraceId",
            ].join(", "),
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
    });
}
console.log('------------setupLogger-------------',process.env.NODE_ENV);

export function setupLogger(
    app: Hono<{ Variables: IServerContext }>,
) {
    const isDev = process.env.NODE_ENV === "development";
    const logLevel = process.env.LOG_LEVEL || (isDev ? "debug" : "info");  // ← 生产改用 info 以支持 timing 日志

    if (isDev) {
        // 本地开发:美化输出到控制台 + 写入日志文件
        app.use(
            pinoLogger({
                pino: () => pino({
                    level: logLevel,
                    transport: {
                        targets: [
                            {
                                target: "pino-pretty",
                                level: logLevel,
                                options: {
                                    colorize: true,
                                    translateTime: "HH:MM:ss",
                                    ignore: "pid,hostname",
                                },
                            },
                            {
                                target: "pino/file",
                                level: 'trace',
                                options: {
                                    destination: "./logs/dev.log",
                                },
                            },
                        ],
                    },
                }),
            }),
        );
    } else {
        // 生产环境:JSON 输出,高性能
        app.use(
            pinoLogger({
                pino: (c: Context<{
                    Variables: IServerContext;
                }>) => pino({
                    base: {
                        traceId: c.req.header(TraceIDHeaderKey),
                    },
                    level: logLevel,
                    // 直接写 stdout,由容器日志系统收集
                }),
            }),
        );
    }
}
