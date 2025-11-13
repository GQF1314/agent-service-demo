import { StreamTextResult, SystemModelMessage, TextStreamPart } from "ai";
export declare const createSystemMessage: (content: string) => SystemModelMessage;
export declare function waitStream(stream: StreamTextResult<any, any>, cb: (part: TextStreamPart<any>) => void): Promise<unknown>;
