import { IOutputMessage } from "../agent/types/output-message";
/**
 * 从SSE流中收集所有文本内容
 * 阻塞等待直到流结束，然后返回拼接后的文本
 */
export declare function collectTextFromStream(stream: ReadableStream<string>): Promise<string>;
/**
 * 从SSE流中收集所有事件数据（用于调试或更复杂的处理）
 */
export declare function collectAllEventsFromStream(stream: ReadableStream<string>): Promise<IOutputMessage[]>;
