import { PinoLogger } from "hono-pino";


export interface IServerContext {
    logger: PinoLogger;
    conversationId: string;
}

export interface IHeaderContext {
    familyId: string;
    userId: string;
    timeZone: string;
    traceId: string;
}