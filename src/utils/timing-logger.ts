import { format } from "date-fns";
import { PinoLogger } from "hono-pino";

/**
 * 统一的时间统计日志工具
 * 使用 [TIMING] 作为统一搜索关键字
 */

export type TimingPhase = "request" | "agent" | "model" | "tool" | "router";
export type TimingAction = "start" | "end" | "step" | "execute";

export interface TimingLogData {
  tag: string; // [TIMING:xxx]
  phase: TimingPhase;
  action: TimingAction;
  timestamp: string; // 可读格式 YYYY-MM-DD HH:mm:ss.SSS
  timestampMs: number; // Unix毫秒时间戳
  traceId?: string;
  conversationId?: string;
  duration?: number; // 耗时（毫秒）
  details?: Record<string, any>;
}

/**
 * 格式化时间戳为可读格式（毫秒精度）
 */
export function formatTimestamp(date: Date = new Date()): string {
  const formatted = format(date, "yyyy-MM-dd HH:mm:ss");
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${formatted}.${ms}`;
}

/**
 * 创建计时器
 */
export class Timer {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 标记一个时间点
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  /**
   * 获取从开始到现在的耗时
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * 获取两个标记点之间的耗时
   */
  duration(fromMark?: string, toMark?: string): number {
    const from = fromMark ? this.marks.get(fromMark) ?? this.startTime : this.startTime;
    const to = toMark ? this.marks.get(toMark) ?? Date.now() : Date.now();
    return to - from;
  }

  /**
   * 获取所有标记点的耗时分布
   */
  getBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    let lastTime = this.startTime;
    let lastName = "start";

    for (const [name, time] of this.marks.entries()) {
      breakdown[`${lastName}_to_${name}`] = time - lastTime;
      lastTime = time;
      lastName = name;
    }

    // 最后一段到现在
    if (this.marks.size > 0) {
      breakdown[`${lastName}_to_now`] = Date.now() - lastTime;
    }

    return breakdown;
  }

  /**
   * 重置计时器
   */
  reset(): void {
    this.startTime = Date.now();
    this.marks.clear();
  }
}

/**
 * 记录timing日志的统一函数
 */
export function logTiming(
  logger: PinoLogger,
  phase: TimingPhase,
  action: TimingAction,
  options: {
    traceId?: string;
    conversationId?: string;
    duration?: number;
    details?: Record<string, any>;
    subPhase?: string; // 子阶段标识，如 "AGENT_INIT", "MODEL_STEP"
  } = {}
): void {
  const now = new Date();
  const subPhase = options.subPhase ? `_${options.subPhase}` : "";
  const tag = `TIMING:${phase.toUpperCase()}${subPhase}`;

  const logData: TimingLogData = {
    tag,
    phase,
    action,
    timestamp: formatTimestamp(now),
    timestampMs: now.getTime(),
    traceId: options.traceId,
    conversationId: options.conversationId,
    duration: options.duration,
    details: options.details,
  };

  // 移除undefined字段
  Object.keys(logData).forEach((key) => {
    if (logData[key as keyof TimingLogData] === undefined) {
      delete logData[key as keyof TimingLogData];
    }
  });

  logger.info(`[${tag}] %o`, logData);
}

/**
 * 创建请求级别的计时器
 */
export class RequestTimer extends Timer {
  constructor(
    private logger: PinoLogger,
    private traceId: string,
    private conversationId: string
  ) {
    super();
    this.logStart();
  }

  private logStart(): void {
    logTiming(this.logger, "request", "start", {
      traceId: this.traceId,
      conversationId: this.conversationId,
    });
  }

  logEnd(details?: Record<string, any>): void {
    logTiming(this.logger, "request", "end", {
      traceId: this.traceId,
      conversationId: this.conversationId,
      duration: this.elapsed(),
      details,
    });
  }

  logParse(duration: number): void {
    logTiming(this.logger, "request", "step", {
      traceId: this.traceId,
      conversationId: this.conversationId,
      duration,
      subPhase: "PARSE",
    });
  }
}

/**
 * 创建Agent级别的计时器
 */
export class AgentTimer extends Timer {
  constructor(
    private logger: PinoLogger,
    private traceId: string
  ) {
    super();
  }

  logInit(duration: number, details?: Record<string, any>): void {
    logTiming(this.logger, "agent", "end", {
      traceId: this.traceId,
      duration,
      details,
      subPhase: "INIT",
    });
  }

  logExecuteStart(): void {
    logTiming(this.logger, "agent", "start", {
      traceId: this.traceId,
      subPhase: "EXECUTE",
    });
  }

  logExecuteEnd(duration: number, details?: Record<string, any>): void {
    logTiming(this.logger, "agent", "end", {
      traceId: this.traceId,
      duration,
      details,
      subPhase: "EXECUTE",
    });
  }
}

/**
 * 创建Model级别的计时器
 */
export class ModelTimer extends Timer {
  private stepCount = 0;

  constructor(
    private logger: PinoLogger,
    private traceId: string,
    private agentName: string
  ) {
    super();
    this.logStart();
  }

  private logStart(): void {
    logTiming(this.logger, "model", "start", {
      traceId: this.traceId,
      details: { agentName: this.agentName },
    });
  }

  logStep(duration: number, details?: Record<string, any>): void {
    this.stepCount++;
    logTiming(this.logger, "model", "step", {
      traceId: this.traceId,
      duration,
      details: {
        ...details,
        stepNumber: this.stepCount,
        agentName: this.agentName
      },
    });
  }

  logEnd(details?: Record<string, any>): void {
    logTiming(this.logger, "model", "end", {
      traceId: this.traceId,
      duration: this.elapsed(),
      details: {
        ...details,
        totalSteps: this.stepCount,
        agentName: this.agentName
      },
      subPhase: "TOTAL",
    });
  }
}

/**
 * 创建Tool级别的计时器
 */
export class ToolTimer extends Timer {
  constructor(
    private logger: PinoLogger,
    private traceId: string,
    private toolName: string
  ) {
    super();
    this.logStart();
  }

  private logStart(): void {
    logTiming(this.logger, "tool", "start", {
      traceId: this.traceId,
      details: { toolName: this.toolName },
    });
  }

  logEnd(details?: Record<string, any>): void {
    logTiming(this.logger, "tool", "end", {
      traceId: this.traceId,
      duration: this.elapsed(),
      details: {
        ...details,
        toolName: this.toolName
      },
    });
  }
}

/**
 * 记录Router耗时
 */
export function logRouterTiming(
  logger: PinoLogger,
  traceId: string,
  duration: number,
  route: string
): void {
  logTiming(logger, "router", "end", {
    traceId,
    duration,
    details: { route },
  });
}
