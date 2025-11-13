import { Tool, ToolCallOptions } from "ai";
import { IOutputMessage } from "../types/output-message";
import { IAgentContext } from "../types/agent";
export type IReportFn = (params: Omit<IOutputMessage, "timestamp">) => any;
export interface IToolContext extends IAgentContext {
    toolName: string;
}
type ExtendedToolExecuteFunction<INPUT, OUTPUT> = (input: INPUT, options: ToolCallOptions, context: IToolContext) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;
type ExtendedTool<INPUT, OUTPUT> = Omit<Tool<INPUT, OUTPUT>, "execute"> & {
    execute: ExtendedToolExecuteFunction<INPUT, OUTPUT>;
    onInputStart?: (input: ToolCallOptions, context: IToolContext) => void;
    onInputDelta?: (options: {
        inputTextDelta: string;
    } & ToolCallOptions, context: IToolContext) => void;
    onInputAvailable?: (input: ToolCallOptions & {
        input: [INPUT] extends [never] ? undefined : INPUT;
    }, context: IToolContext) => void;
};
export declare const createToolWrapper: <INPUT, OUTPUT>(tool: ExtendedTool<INPUT, OUTPUT>) => (context: IToolContext) => Tool<INPUT, OUTPUT>;
export declare function genClientToolExecutor<T>(params: {
    toolName: string;
    report: IReportFn;
}): (subParams: T) => Promise<{}>;
export declare function padTimezone(date: string, timezone: string): string;
export declare const searchLimit = 10;
export declare enum ReplyType {
    PROGRESS = "PROGRESS",
    COMPLETION = "COMPLETION"
}
export declare const maxCreateUpdateDeleteLimit = 10;
export {};
