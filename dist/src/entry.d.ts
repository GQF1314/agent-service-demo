import { IMessageReqParams } from "./types/presentation-input";
import { PinoLogger } from "hono-pino";
import { IHeaderContext } from "./types/server";
import { RequestTimer } from "./utils/timing-logger";
export declare class AgentEntry {
    handleSession(input: IMessageReqParams, params: {
        signal: AbortSignal;
        headerContext: IHeaderContext;
        logger: PinoLogger;
        requestTimer: RequestTimer;
    }): ReadableStream<string>;
    private initializeAgent;
}
