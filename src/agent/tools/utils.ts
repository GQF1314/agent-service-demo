import { Tool, ToolCallOptions } from "ai";
import { IOutputMessage } from "../types/output-message";
import { IAgentContext } from "../types/agent";
import { pick } from "lodash";
import { errorStringify } from "../../constants";
import { formatInTimeZone } from "date-fns-tz";
import { ToolTimer } from "../../utils/timing-logger";

export type IReportFn = (params: Omit<IOutputMessage, "timestamp">) => any;

export interface IToolContext extends IAgentContext {
  toolName: string;
}

type ExtendedToolExecuteFunction<INPUT, OUTPUT> = (
  input: INPUT,
  options: ToolCallOptions,
  context: IToolContext,
) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;

// Then define extended Tool type
type ExtendedTool<INPUT, OUTPUT> = Omit<Tool<INPUT, OUTPUT>, "execute"> & {
  execute: ExtendedToolExecuteFunction<INPUT, OUTPUT>;
  onInputStart?: (input: ToolCallOptions, context: IToolContext) => void;
  onInputDelta?: (
    options: {
      inputTextDelta: string;
    } & ToolCallOptions,
    context: IToolContext,
  ) => void;
  onInputAvailable?: (
    input: ToolCallOptions & {
      input: [INPUT] extends [never] ? undefined : INPUT;
    },
    context: IToolContext,
  ) => void;
};
export const createToolWrapper = <INPUT, OUTPUT>(
  tool: ExtendedTool<INPUT, OUTPUT>,
) => {
  return (context: IToolContext) => {
    return {
      ...tool,
      toModelOutput: (result: OUTPUT) => {
        return {
          type: "json",
          value: {
            ...pick(result, ["success", "error"]),
            //@ts-ignore
            ...result.modelVisibleData,
          },
        };
      },
      onInputStart: (input) => {
        tool.onInputStart?.(input, context);
      },
      onInputDelta: (delta) => {
        tool.onInputDelta?.(delta, context);
      },
      onInputAvailable: (input) => {
        tool.onInputAvailable?.(input, context);
      },
      execute: async (input: INPUT, options: ToolCallOptions) => {
        const traceId = context.logger.bindings().traceId as string || "";
        const toolTimer = new ToolTimer(context.logger, traceId, context.toolName);

        context.logger.info(`[tool]:  input: ${context.toolName} %o`, {
          input,
        });
        try {
          const result = await tool.execute(input, options, context);
          context.logger.info(`[tool]:  result: ${context.toolName} %o`, {
            result,
          });

          // 记录工具执行成功的耗时
          toolTimer.logEnd({
            success: true,
            inputSize: JSON.stringify(input).length,
            outputSize: JSON.stringify(result).length,
          });

          return result;
        } catch (error) {
          context.logger.error(
            `[tool]: error result ${context.toolName} %o`,
            { error: errorStringify(error) },
          );

          // 记录工具执行失败的耗时
          toolTimer.logEnd({
            success: false,
            error: errorStringify(error),
          });

          let errorMessage = "unknown error when execute tool";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "object" && error !== null) {
            if ("message" in error && typeof error.message === "string") {
              errorMessage = error.message;
            } else if ("code" in error && "message" in error) {
              errorMessage = `[${error.code}] ${error.message}`;
            } else {
              errorMessage = JSON.stringify(error);
            }
          } else {
            errorMessage = String(error);
          }

          return {
            success: false,
            error: errorMessage,
            ...(typeof error === "object" && error !== null &&
                "requestDetails" in error
              ? { requestDetails: error.requestDetails }
              : {}),
          };
        }
      },
    } as Tool<INPUT, OUTPUT>;
  };
};

export function genClientToolExecutor<T>(params: {
  toolName: string;
  report: IReportFn;
}) {
  return async (subParams: T) => {
    const { toolName, report } = params;
    return {};
    // return await report({
    //     id: uuidv4(),
    //     type: 'client_tool_call',
    //     data: subParams,
    //     stage: 'start',
    //     toolName
    // })
  };
}

export function padTimezone(date: string, timezone: string) {
  if (date.includes("Z")) {
    return date;
  }
  return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export const searchLimit = 10;


export enum ReplyType {
  PROGRESS = "PROGRESS",
  COMPLETION = "COMPLETION",
}


//创建/更新/删除操作的最大限制
export const maxCreateUpdateDeleteLimit = 10;