import { success, z } from "zod/v4";
import { createToolWrapper, ReplyType } from "./utils";
import * as datefns from "date-fns";
import { AgentContext } from "../context/model";
import { TextStreamPart } from "ai";
import { parse } from "best-effort-json-parser";

class CodeInterpreter {
    private context: Record<string, any>;
    private dangerousGlobals = [
        "process",
        "require",
        "global",
        "Buffer",
        "module",
        "exports",
        "eval",
        "Function",
        "setTimeout",
        "setInterval",
        "clearTimeout",
        "clearInterval",
    ];

    constructor(context: Record<string, any> = {}) {
        this.context = { ...context };
    }

    /**
     * Safely execute JavaScript code
     * @param code Code string to execute
     * @returns Execution result
     */
    async execute(code: string): Promise<any> {
        try {
            this.validateCode(code);
            const contextKeys = Object.keys(this.context);
            const contextValues = Object.values(this.context);
            const safeCode = this.wrapCodeForSafeExecution(code);
            const func = new Function(...contextKeys, safeCode);
            const result = await func(...contextValues);

            return result;
        } catch (error) {
            throw new Error(
                `Code execution failed: ${error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }

    /**
     * Validate code safety
     */
    private validateCode(code: string): void {
        for (const dangerous of this.dangerousGlobals) {
            if (code.includes(dangerous)) {
                throw new Error(
                    `Code contains dangerous operation: ${dangerous}`,
                );
            }
        }
        const dangerousPatterns = [
            /import\s+.*from/gi, // ES6 imports
            /require\s*\(/gi, // CommonJS require
            /new\s+Function/gi, // Dynamic function creation
            /eval\s*\(/gi, // eval call
            /document\./gi, // DOM operations
            /window\./gi, // window object
            /location\./gi, // location object
            /fetch\s*\(/gi, // Network requests
            /XMLHttpRequest/gi, // Ajax requests
            /WebSocket/gi, // WebSocket
            /localStorage/gi, // Local storage
            /sessionStorage/gi, // Session storage
            /\.constructor/gi, // Constructor access
            /__proto__/gi, // Prototype chain operations
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                throw new Error(
                    `Code contains unsafe operation pattern: ${pattern.source}`,
                );
            }
        }

        if (code.length > 10000) {
            throw new Error("Code length exceeds limit (max 10000 characters)");
        }
    }

    /**
     * Wrap code to support async execution and result return
     */
    private wrapCodeForSafeExecution(code: string): string {
        const hasAsync = /\b(async|await)\b/.test(code);

        if (hasAsync) {
            return `
        return (async () => {
          try {
            ${code}
            return main();
          } catch (error) {
            throw error;
          }
        })();
      `;
        } else {
            return `
        try {
          return (() => {
            ${code}
            return main();
          })();
        } catch (error) {
          throw error;
        }
      `;
        }
    }
    /**
     * Get current context
     */
    getContext(): Record<string, any> {
        return { ...this.context };
    }

    /**
     * Add safe built-in functions
     */
    addSafeBuiltins(): void {
        this.context = {
            ...this.context,
            console: {
                log: (...args: any[]) =>
                    console.log("[CodeInterpreter]", ...args),
                warn: (...args: any[]) =>
                    console.warn("[CodeInterpreter]", ...args),
                error: (...args: any[]) =>
                    console.error("[CodeInterpreter]", ...args),
            },
        };
    }
}

interface CodeExecutionResult {
    success: boolean;
    result?: any;
    error?: string;
}

const interpreter = new CodeInterpreter({
    datefns,
});
interpreter.addSafeBuiltins();

export const codeInterpreterTool = createToolWrapper({
    description:
        `A simple JS code execution tool. You can use this tool to execute JS code and return the execution result.
  It already has the global variable datefns built-in, you can use this variable to perform date-related operations.
  For example:
  datefns.format(new Date(), 'yyyy-MM-dd')
  
  The result is in JSON format:
  {
    success: boolean,
    result: execution result,
    error: error message
  }

  This environment does not allow the use of window, buffer, import, require, and other methods.
  This environment will automatically execute the main function in your input code and return the main function's execution result. You don't need to call the main function yourself.`,
    inputSchema: z.object({
        code: z.string().describe("JavaScript code to execute"),
    }),
    execute: async ({ code }, options, context) => {
        try {
            const result = await interpreter.execute(code);
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
});

export const webSearchTool = createToolWrapper({
    description:
        "Search the web for information. If the search and question involve geographic location, I don't know the current location information, you need to provide it to me.",
    inputSchema: z.object({
        query: z.string().describe("Search query"),
    }),
    execute: async ({ query }, options, context) => {
        const { localService } = context.services;
        const result = await localService.search({ query });
        return result;
    },
});

export const replyToUserTool = createToolWrapper({
    description:
        `
        - Reply to the user, before calling tools or at the conversation end(complete the user's task). Always use the language of the user's request.
        - Before each tool you call, you should tell the user what you are going to do with this Tool, usually you should call this Tool With other tools together, except the last tool you call.
        `,
    inputSchema: z.object({
        content: z.string().describe(`content to response to the user.
            # Response Style
                - **For non-search tools**: All tool calls and their results are visible to the user. Avoid repeating detailed information in your response; simply acknowledge the action taken and provide necessary context.
                - **For search tools**: Summarize the search results and present them in an organized, readable format. Extract core information and structure it logically for the user.
                - The result information you provide should be accurate and brief.
                - Be warm and conversational, like a helpful family member
                - Keep responses concise but complete
            `),
        // Expected user response
        responseType: z.enum(ReplyType).describe(`
        The type of response to the user:
            1. Use PROGRESS when AI is reporting current status, ongoing operations, or next steps during task execution.
            2. Use COMPLETION when: 1) task execution completes (success or failure), 2) additional user input is required, or 3) user decision or comfirmation is needed to proceed. These messages indicate the current execution flow has terminated and the system will wait for new user input or instructions.`),
    }),
    onInputStart: (input) => {
        const ctx = input.experimental_context as AgentContext;
        const part: TextStreamPart<any> = {
            type: "text-start",
            id: input.toolCallId,
        };
        ctx.report({
            ...part,
            agentName: ctx.getAgentName(),
        });
    },
    onInputDelta: (input) => {
        const ctx = input.experimental_context as AgentContext;
        const agentName = ctx.getAgentName();
        const inputTextDelta = input.inputTextDelta;
        const { inputStringMap, replyTextMap } = ctx;
        inputStringMap[input.toolCallId] =
            (inputStringMap[input.toolCallId] ?? "") + inputTextDelta;
        const accTexxt = inputStringMap[input.toolCallId];
        const inputJson: {
            content?: string;
            isEnd?: boolean;
        } = parse(accTexxt);
        const prevText = replyTextMap[input.toolCallId] ?? "";
        const curText = inputJson.content ?? "";
        const deltaText = curText.replace(prevText, "");
        replyTextMap[input.toolCallId] = inputJson.content ?? "";
        const part: TextStreamPart<any> = {
            type: "text-delta",
            id: input.toolCallId,
            text: deltaText,
        };
        ctx.report({
            ...part,
            agentName: agentName,
        });
    },
    onInputAvailable: (input) => {
        const ctx = input.experimental_context as AgentContext;
        const agentName = ctx.getAgentName();
        const part: TextStreamPart<any> = {
            type: "text-end",
            id: input.toolCallId,
        };
        ctx.report({
            ...part,
            agentName: agentName,
        });
    },
    execute: async ({ content, responseType }, options, context) => {
        return 'continue';
    },
});

export const readUrlTool = createToolWrapper({
    description: "Read the content of a URL(https only)",
    inputSchema: z.object({
        url: z.string().describe("The URL to read(https only)")
    }),
    execute: async ({ url }, options, context) => {
        const { localService } = context.services;
        const result = await localService.readUrl({ url });
        return {
            success:result.success,
            modelVisibleData:{
                content:result.content
            }
        };
    },
});

// export const writeMemoryTool = createToolWrapper({
//     description: `An auxiliary memory/note tool.
//     - If the current task is complex, you can choose to write the current task's todo and plan (currentTask) to this tool, so you can read it later to determine what to do next.
//     - If you understand some user habits or long-term valuable knowledge, you can choose to write these to longMemory.
//     - When writing to longMemory, you should first understand the context about the current longMemory content, then add/modify longMemory to maintain consistency.
//     - You should also note: longMemory is to assist you in making prompts that conform to user habits in the future, it is key and limited content, do not modify it casually.`,
//     inputSchema: z.object({
//         type: z.enum(['currentTask', 'longMemory']).describe("Memory type"),
//         content: z.string().describe("Memory content")
//     }),
//     execute: async ({ content, type }, options, context) => {
//         context.services.systemService.writeMemory(type, content);
//         return {
//             success: true,
//             result: content
//         }
//     }
// })
