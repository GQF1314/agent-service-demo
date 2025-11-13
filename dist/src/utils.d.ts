import { Hono } from "hono";
import { IServerContext } from "./types/server";
export declare function createSSEErrorResponse(json: Record<string, any>, options?: {
    origin?: string;
}): Response;
export declare function createSSEStreamResponse(stream: ReadableStream<string>, options?: {
    origin?: string;
}): Response;
export declare function setupLogger(app: Hono<{
    Variables: IServerContext;
}>): void;
