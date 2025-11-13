import { PinoLogger } from "hono-pino";
/**
 * 统一的时间统计日志工具
 * 使用 [TIMING] 作为统一搜索关键字
 */
export type TimingPhase = "request" | "agent" | "model" | "tool" | "router";
export type TimingAction = "start" | "end" | "step" | "execute";
export interface TimingLogData {
    tag: string;
    phase: TimingPhase;
    action: TimingAction;
    timestamp: string;
    timestampMs: number;
    traceId?: string;
    conversationId?: string;
    duration?: number;
    details?: Record<string, any>;
}
/**
 * 格式化时间戳为可读格式（毫秒精度）
 */
export declare function formatTimestamp(date?: Date): string;
/**
 * 创建计时器
 */
export declare class Timer {
    private startTime;
    private marks;
    constructor();
    /**
     * 标记一个时间点
     */
    mark(name: string): void;
    /**
     * 获取从开始到现在的耗时
     */
    elapsed(): number;
    /**
     * 获取两个标记点之间的耗时
     */
    duration(fromMark?: string, toMark?: string): number;
    /**
     * 获取所有标记点的耗时分布
     */
    getBreakdown(): Record<string, number>;
    /**
     * 重置计时器
     */
    reset(): void;
}
/**
 * 记录timing日志的统一函数
 */
export declare function logTiming(logger: PinoLogger, phase: TimingPhase, action: TimingAction, options?: {
    traceId?: string;
    conversationId?: string;
    duration?: number;
    details?: Record<string, any>;
    subPhase?: string;
}): void;
/**
 * 创建请求级别的计时器
 */
export declare class RequestTimer extends Timer {
    private logger;
    private traceId;
    private conversationId;
    constructor(logger: PinoLogger, traceId: string, conversationId: string);
    private logStart;
    logEnd(details?: Record<string, any>): void;
    logParse(duration: number): void;
}
/**
 * 创建Agent级别的计时器
 */
export declare class AgentTimer extends Timer {
    private logger;
    private traceId;
    constructor(logger: PinoLogger, traceId: string);
    logInit(duration: number, details?: Record<string, any>): void;
    logExecuteStart(): void;
    logExecuteEnd(duration: number, details?: Record<string, any>): void;
}
/**
 * 创建Model级别的计时器
 */
export declare class ModelTimer extends Timer {
    private logger;
    private traceId;
    private agentName;
    private stepCount;
    constructor(logger: PinoLogger, traceId: string, agentName: string);
    private logStart;
    logStep(duration: number, details?: Record<string, any>): void;
    logEnd(details?: Record<string, any>): void;
}
/**
 * 创建Tool级别的计时器
 */
export declare class ToolTimer extends Timer {
    private logger;
    private traceId;
    private toolName;
    constructor(logger: PinoLogger, traceId: string, toolName: string);
    private logStart;
    logEnd(details?: Record<string, any>): void;
}
/**
 * 记录Router耗时
 */
export declare function logRouterTiming(logger: PinoLogger, traceId: string, duration: number, route: string): void;
