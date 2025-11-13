"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUrlTool = exports.replyToUserTool = exports.webSearchTool = exports.codeInterpreterTool = void 0;
const v4_1 = require("zod/v4");
const utils_1 = require("./utils");
const datefns = __importStar(require("date-fns"));
const best_effort_json_parser_1 = require("best-effort-json-parser");
class CodeInterpreter {
    context;
    dangerousGlobals = [
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
    constructor(context = {}) {
        this.context = { ...context };
    }
    /**
     * Safely execute JavaScript code
     * @param code Code string to execute
     * @returns Execution result
     */
    async execute(code) {
        try {
            this.validateCode(code);
            const contextKeys = Object.keys(this.context);
            const contextValues = Object.values(this.context);
            const safeCode = this.wrapCodeForSafeExecution(code);
            const func = new Function(...contextKeys, safeCode);
            const result = await func(...contextValues);
            return result;
        }
        catch (error) {
            throw new Error(`Code execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validate code safety
     */
    validateCode(code) {
        for (const dangerous of this.dangerousGlobals) {
            if (code.includes(dangerous)) {
                throw new Error(`Code contains dangerous operation: ${dangerous}`);
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
                throw new Error(`Code contains unsafe operation pattern: ${pattern.source}`);
            }
        }
        if (code.length > 10000) {
            throw new Error("Code length exceeds limit (max 10000 characters)");
        }
    }
    /**
     * Wrap code to support async execution and result return
     */
    wrapCodeForSafeExecution(code) {
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
        }
        else {
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
    getContext() {
        return { ...this.context };
    }
    /**
     * Add safe built-in functions
     */
    addSafeBuiltins() {
        this.context = {
            ...this.context,
            console: {
                log: (...args) => console.log("[CodeInterpreter]", ...args),
                warn: (...args) => console.warn("[CodeInterpreter]", ...args),
                error: (...args) => console.error("[CodeInterpreter]", ...args),
            },
        };
    }
}
const interpreter = new CodeInterpreter({
    datefns,
});
interpreter.addSafeBuiltins();
exports.codeInterpreterTool = (0, utils_1.createToolWrapper)({
    description: `A simple JS code execution tool. You can use this tool to execute JS code and return the execution result.
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
    inputSchema: v4_1.z.object({
        code: v4_1.z.string().describe("JavaScript code to execute"),
    }),
    execute: async ({ code }, options, context) => {
        try {
            const result = await interpreter.execute(code);
            return { success: true, result };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
});
exports.webSearchTool = (0, utils_1.createToolWrapper)({
    description: "Search the web for information. If the search and question involve geographic location, I don't know the current location information, you need to provide it to me.",
    inputSchema: v4_1.z.object({
        query: v4_1.z.string().describe("Search query"),
    }),
    execute: async ({ query }, options, context) => {
        const { localService } = context.services;
        const result = await localService.search({ query });
        return result;
    },
});
exports.replyToUserTool = (0, utils_1.createToolWrapper)({
    description: `
        - Reply to the user, before calling tools or at the conversation end(complete the user's task). Always use the language of the user's request.
        - Before each tool you call, you should tell the user what you are going to do with this Tool, usually you should call this Tool With other tools together, except the last tool you call.
        `,
    inputSchema: v4_1.z.object({
        content: v4_1.z.string().describe(`content to response to the user.
            # Response Style
                - **For non-search tools**: All tool calls and their results are visible to the user. Avoid repeating detailed information in your response; simply acknowledge the action taken and provide necessary context.
                - **For search tools**: Summarize the search results and present them in an organized, readable format. Extract core information and structure it logically for the user.
                - The result information you provide should be accurate and brief.
                - Be warm and conversational, like a helpful family member
                - Keep responses concise but complete
            `),
        // Expected user response
        responseType: v4_1.z.enum(utils_1.ReplyType).describe(`
        The type of response to the user:
            1. Use PROGRESS when AI is reporting current status, ongoing operations, or next steps during task execution.
            2. Use COMPLETION when: 1) task execution completes (success or failure), 2) additional user input is required, or 3) user decision or comfirmation is needed to proceed. These messages indicate the current execution flow has terminated and the system will wait for new user input or instructions.`),
    }),
    onInputStart: (input) => {
        const ctx = input.experimental_context;
        const part = {
            type: "text-start",
            id: input.toolCallId,
        };
        ctx.report({
            ...part,
            agentName: ctx.getAgentName(),
        });
    },
    onInputDelta: (input) => {
        const ctx = input.experimental_context;
        const agentName = ctx.getAgentName();
        const inputTextDelta = input.inputTextDelta;
        const { inputStringMap, replyTextMap } = ctx;
        inputStringMap[input.toolCallId] =
            (inputStringMap[input.toolCallId] ?? "") + inputTextDelta;
        const accTexxt = inputStringMap[input.toolCallId];
        const inputJson = (0, best_effort_json_parser_1.parse)(accTexxt);
        const prevText = replyTextMap[input.toolCallId] ?? "";
        const curText = inputJson.content ?? "";
        const deltaText = curText.replace(prevText, "");
        replyTextMap[input.toolCallId] = inputJson.content ?? "";
        const part = {
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
        const ctx = input.experimental_context;
        const agentName = ctx.getAgentName();
        const part = {
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
exports.readUrlTool = (0, utils_1.createToolWrapper)({
    description: "Read the content of a URL(https only)",
    inputSchema: v4_1.z.object({
        url: v4_1.z.string().describe("The URL to read(https only)")
    }),
    execute: async ({ url }, options, context) => {
        const { localService } = context.services;
        const result = await localService.readUrl({ url });
        return {
            success: result.success,
            modelVisibleData: {
                content: result.content
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FnZW50L3Rvb2xzL3N5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUFvQztBQUNwQyxtQ0FBdUQ7QUFDdkQsa0RBQW9DO0FBR3BDLHFFQUFnRDtBQUVoRCxNQUFNLGVBQWU7SUFDVCxPQUFPLENBQXNCO0lBQzdCLGdCQUFnQixHQUFHO1FBQ3ZCLFNBQVM7UUFDVCxTQUFTO1FBQ1QsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsU0FBUztRQUNULE1BQU07UUFDTixVQUFVO1FBQ1YsWUFBWTtRQUNaLGFBQWE7UUFDYixjQUFjO1FBQ2QsZUFBZTtLQUNsQixDQUFDO0lBRUYsWUFBWSxVQUErQixFQUFFO1FBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFZO1FBQ3RCLElBQUksQ0FBQztZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JELE1BQU0sSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFFNUMsT0FBTyxNQUFNLENBQUM7UUFD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ImltcG9ydCB7IHN1Y2Nlc3MsIHogfSBmcm9tIFwiem9kL3Y0XCI7XG5pbXBvcnQgeyBjcmVhdGVUb29sV3JhcHBlciwgUmVwbHlUeXBlIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCAqIGFzIGRhdGVmbnMgZnJvbSBcImRhdGUtZm5zXCI7XG5pbXBvcnQgeyBBZ2VudENvbnRleHQgfSBmcm9tIFwiLi4vY29udGV4dC9tb2RlbFwiO1xuaW1wb3J0IHsgVGV4dFN0cmVhbVBhcnQgfSBmcm9tIFwiYWlcIjtcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcImJlc3QtZWZmb3J0LWpzb24tcGFyc2VyXCI7XG5cbmNsYXNzIENvZGVJbnRlcnByZXRlciB7XG4gICAgcHJpdmF0ZSBjb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIHByaXZhdGUgZGFuZ2Vyb3VzR2xvYmFscyA9IFtcbiAgICAgICAgXCJwcm9jZXNzXCIsXG4gICAgICAgIFwicmVxdWlyZVwiLFxuICAgICAgICBcImdsb2JhbFwiLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcIm1vZHVsZVwiLFxuICAgICAgICBcImV4cG9ydHNcIixcbiAgICAgICAgXCJldmFsXCIsXG4gICAgICAgIFwiRnVuY3Rpb25cIixcbiAgICAgICAgXCJzZXRUaW1lb3V0XCIsXG4gICAgICAgIFwic2V0SW50ZXJ2YWxcIixcbiAgICAgICAgXCJjbGVhclRpbWVvdXRcIixcbiAgICAgICAgXCJjbGVhckludGVydmFsXCIsXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fSkge1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB7IC4uLmNvbnRleHQgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYWZlbHkgZXhlY3V0ZSBKYXZhU2NyaXB0IGNvZGVcbiAgICAgKiBAcGFyYW0gY29kZSBDb2RlIHN0cmluZyB0byBleGVjdXRlXG4gICAgICogQHJldHVybnMgRXhlY3V0aW9uIHJlc3VsdFxuICAgICAqL1xuICAgIGFzeW5jIGV4ZWN1dGUoY29kZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVDb2RlKGNvZGUpO1xuICAgICAgICAgICAgY29uc3QgY29udGV4dEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNvbnRleHQpO1xuICAgICAgICAgICAgY29uc3QgY29udGV4dFZhbHVlcyA9IE9iamVjdC52YWx1ZXModGhpcy5jb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IHNhZmVDb2RlID0gdGhpcy53cmFwQ29kZUZvclNhZmVFeGVjdXRpb24oY29kZSk7XG4gICAgICAgICAgICBjb25zdCBmdW5jID0gbmV3IEZ1bmN0aW9uKC4uLmNvbnRleHRLZXlzLCBzYWZlQ29kZSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmdW5jKC4uLmNvbnRleHRWYWx1ZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBDb2RlIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgY29kZSBzYWZldHlcbiAgICAgKi9cbiAgICBwcml2YXRlIHZhbGlkYXRlQ29kZShjb2RlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBkYW5nZXJvdXMgb2YgdGhpcy5kYW5nZXJvdXNHbG9iYWxzKSB7XG4gICAgICAgICAgICBpZiAoY29kZS5pbmNsdWRlcyhkYW5nZXJvdXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgQ29kZSBjb250YWlucyBkYW5nZXJvdXMgb3BlcmF0aW9uOiAke2Rhbmdlcm91c31gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvaW1wb3J0XFxzKy4qZnJvbS9naSwgLy8gRVM2IGltcG9ydHNcbiAgICAgICAgICAgIC9yZXF1aXJlXFxzKlxcKC9naSwgLy8gQ29tbW9uSlMgcmVxdWlyZVxuICAgICAgICAgICAgL25ld1xccytGdW5jdGlvbi9naSwgLy8gRHluYW1pYyBmdW5jdGlvbiBjcmVhdGlvblxuICAgICAgICAgICAgL2V2YWxcXHMqXFwoL2dpLCAvLyBldmFsIGNhbGxcbiAgICAgICAgICAgIC9kb2N1bWVudFxcLi9naSwgLy8gRE9NIG9wZXJhdGlvbnNcbiAgICAgICAgICAgIC93aW5kb3dcXC4vZ2ksIC8vIHdpbmRvdyBvYmplY3RcbiAgICAgICAgICAgIC9sb2NhdGlvblxcLi9naSwgLy8gbG9jYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAvZmV0Y2hcXHMqXFwoL2dpLCAvLyBOZXR3b3JrIHJlcXVlc3RzXG4gICAgICAgICAgICAvWE1MSHR0cFJlcXVlc3QvZ2ksIC8vIEFqYXggcmVxdWVzdHNcbiAgICAgICAgICAgIC9XZWJTb2NrZXQvZ2ksIC8vIFdlYlNvY2tldFxuICAgICAgICAgICAgL2xvY2FsU3RvcmFnZS9naSwgLy8gTG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgL3Nlc3Npb25TdG9yYWdlL2dpLCAvLyBTZXNzaW9uIHN0b3JhZ2VcbiAgICAgICAgICAgIC9cXC5jb25zdHJ1Y3Rvci9naSwgLy8gQ29uc3RydWN0b3IgYWNjZXNzXG4gICAgICAgICAgICAvX19wcm90b19fL2dpLCAvLyBQcm90b3R5cGUgY2hhaW4gb3BlcmF0aW9uc1xuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChjb2RlKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYENvZGUgY29udGFpbnMgdW5zYWZlIG9wZXJhdGlvbiBwYXR0ZXJuOiAke3BhdHRlcm4uc291cmNlfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2RlLmxlbmd0aCA+IDEwMDAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2RlIGxlbmd0aCBleGNlZWRzIGxpbWl0IChtYXggMTAwMDAgY2hhcmFjdGVycylcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcmFwIGNvZGUgdG8gc3VwcG9ydCBhc3luYyBleGVjdXRpb24gYW5kIHJlc3VsdCByZXR1cm5cbiAgICAgKi9cbiAgICBwcml2YXRlIHdyYXBDb2RlRm9yU2FmZUV4ZWN1dGlvbihjb2RlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBoYXNBc3luYyA9IC9cXGIoYXN5bmN8YXdhaXQpXFxiLy50ZXN0KGNvZGUpO1xuXG4gICAgICAgIGlmIChoYXNBc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgcmV0dXJuIChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICR7Y29kZX1cbiAgICAgICAgICAgIHJldHVybiBtYWluKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkoKTtcbiAgICAgIGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiAoKCkgPT4ge1xuICAgICAgICAgICAgJHtjb2RlfVxuICAgICAgICAgICAgcmV0dXJuIG1haW4oKTtcbiAgICAgICAgICB9KSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICBgO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGNvbnRleHRcbiAgICAgKi9cbiAgICBnZXRDb250ZXh0KCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICAgICAgICByZXR1cm4geyAuLi50aGlzLmNvbnRleHQgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgc2FmZSBidWlsdC1pbiBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBhZGRTYWZlQnVpbHRpbnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMuY29udGV4dCxcbiAgICAgICAgICAgIGNvbnNvbGU6IHtcbiAgICAgICAgICAgICAgICBsb2c6ICguLi5hcmdzOiBhbnlbXSkgPT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbQ29kZUludGVycHJldGVyXVwiLCAuLi5hcmdzKSxcbiAgICAgICAgICAgICAgICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltDb2RlSW50ZXJwcmV0ZXJdXCIsIC4uLmFyZ3MpLFxuICAgICAgICAgICAgICAgIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbQ29kZUludGVycHJldGVyXVwiLCAuLi5hcmdzKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgQ29kZUV4ZWN1dGlvblJlc3VsdCB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICByZXN1bHQ/OiBhbnk7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmNvbnN0IGludGVycHJldGVyID0gbmV3IENvZGVJbnRlcnByZXRlcih7XG4gICAgZGF0ZWZucyxcbn0pO1xuaW50ZXJwcmV0ZXIuYWRkU2FmZUJ1aWx0aW5zKCk7XG5cbmV4cG9ydCBjb25zdCBjb2RlSW50ZXJwcmV0ZXJUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBgQSBzaW1wbGUgSlMgY29kZSBleGVjdXRpb24gdG9vbC4gWW91IGNhbiB1c2UgdGhpcyB0b29sIHRvIGV4ZWN1dGUgSlMgY29kZSBhbmQgcmV0dXJuIHRoZSBleGVjdXRpb24gcmVzdWx0LlxuICBJdCBhbHJlYWR5IGhhcyB0aGUgZ2xvYmFsIHZhcmlhYmxlIGRhdGVmbnMgYnVpbHQtaW4sIHlvdSBjYW4gdXNlIHRoaXMgdmFyaWFibGUgdG8gcGVyZm9ybSBkYXRlLXJlbGF0ZWQgb3BlcmF0aW9ucy5cbiAgRm9yIGV4YW1wbGU6XG4gIGRhdGVmbnMuZm9ybWF0KG5ldyBEYXRlKCksICd5eXl5LU1NLWRkJylcbiAgXG4gIFRoZSByZXN1bHQgaXMgaW4gSlNPTiBmb3JtYXQ6XG4gIHtcbiAgICBzdWNjZXNzOiBib29sZWFuLFxuICAgIHJlc3VsdDogZXhlY3V0aW9uIHJlc3VsdCxcbiAgICBlcnJvcjogZXJyb3IgbWVzc2FnZVxuICB9XG5cbiAgVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBhbGxvdyB0aGUgdXNlIG9mIHdpbmRvdywgYnVmZmVyLCBpbXBvcnQsIHJlcXVpcmUsIGFuZCBvdGhlciBtZXRob2RzLlxuICBUaGlzIGVudmlyb25tZW50IHdpbGwgYXV0b21hdGljYWxseSBleGVjdXRlIHRoZSBtYWluIGZ1bmN0aW9uIGluIHlvdXIgaW5wdXQgY29kZSBhbmQgcmV0dXJuIHRoZSBtYWluIGZ1bmN0aW9uJ3MgZXhlY3V0aW9uIHJlc3VsdC4gWW91IGRvbid0IG5lZWQgdG8gY2FsbCB0aGUgbWFpbiBmdW5jdGlvbiB5b3Vyc2VsZi5gLFxuICAgIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgICAgIGNvZGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoXCJKYXZhU2NyaXB0IGNvZGUgdG8gZXhlY3V0ZVwiKSxcbiAgICB9KSxcbiAgICBleGVjdXRlOiBhc3luYyAoeyBjb2RlIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludGVycHJldGVyLmV4ZWN1dGUoY29kZSk7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCByZXN1bHQgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG5cbmV4cG9ydCBjb25zdCB3ZWJTZWFyY2hUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIlNlYXJjaCB0aGUgd2ViIGZvciBpbmZvcm1hdGlvbi4gSWYgdGhlIHNlYXJjaCBhbmQgcXVlc3Rpb24gaW52b2x2ZSBnZW9ncmFwaGljIGxvY2F0aW9uLCBJIGRvbid0IGtub3cgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW5mb3JtYXRpb24sIHlvdSBuZWVkIHRvIHByb3ZpZGUgaXQgdG8gbWUuXCIsXG4gICAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbiAgICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoXCJTZWFyY2ggcXVlcnlcIiksXG4gICAgfSksXG4gICAgZXhlY3V0ZTogYXN5bmMgKHsgcXVlcnkgfSwgb3B0aW9ucywgY29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2FsU2VydmljZSB9ID0gY29udGV4dC5zZXJ2aWNlcztcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbG9jYWxTZXJ2aWNlLnNlYXJjaCh7IHF1ZXJ5IH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IHJlcGx5VG9Vc2VyVG9vbCA9IGNyZWF0ZVRvb2xXcmFwcGVyKHtcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgYFxuICAgICAgICAtIFJlcGx5IHRvIHRoZSB1c2VyLCBiZWZvcmUgY2FsbGluZyB0b29scyBvciBhdCB0aGUgY29udmVyc2F0aW9uIGVuZChjb21wbGV0ZSB0aGUgdXNlcidzIHRhc2spLiBBbHdheXMgdXNlIHRoZSBsYW5ndWFnZSBvZiB0aGUgdXNlcidzIHJlcXVlc3QuXG4gICAgICAgIC0gQmVmb3JlIGVhY2ggdG9vbCB5b3UgY2FsbCwgeW91IHNob3VsZCB0ZWxsIHRoZSB1c2VyIHdoYXQgeW91IGFyZSBnb2luZyB0byBkbyB3aXRoIHRoaXMgVG9vbCwgdXN1YWxseSB5b3Ugc2hvdWxkIGNhbGwgdGhpcyBUb29sIFdpdGggb3RoZXIgdG9vbHMgdG9nZXRoZXIsIGV4Y2VwdCB0aGUgbGFzdCB0b29sIHlvdSBjYWxsLlxuICAgICAgICBgLFxuICAgIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoYGNvbnRlbnQgdG8gcmVzcG9uc2UgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAjIFJlc3BvbnNlIFN0eWxlXG4gICAgICAgICAgICAgICAgLSAqKkZvciBub24tc2VhcmNoIHRvb2xzKio6IEFsbCB0b29sIGNhbGxzIGFuZCB0aGVpciByZXN1bHRzIGFyZSB2aXNpYmxlIHRvIHRoZSB1c2VyLiBBdm9pZCByZXBlYXRpbmcgZGV0YWlsZWQgaW5mb3JtYXRpb24gaW4geW91ciByZXNwb25zZTsgc2ltcGx5IGFja25vd2xlZGdlIHRoZSBhY3Rpb24gdGFrZW4gYW5kIHByb3ZpZGUgbmVjZXNzYXJ5IGNvbnRleHQuXG4gICAgICAgICAgICAgICAgLSAqKkZvciBzZWFyY2ggdG9vbHMqKjogU3VtbWFyaXplIHRoZSBzZWFyY2ggcmVzdWx0cyBhbmQgcHJlc2VudCB0aGVtIGluIGFuIG9yZ2FuaXplZCwgcmVhZGFibGUgZm9ybWF0LiBFeHRyYWN0IGNvcmUgaW5mb3JtYXRpb24gYW5kIHN0cnVjdHVyZSBpdCBsb2dpY2FsbHkgZm9yIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIC0gVGhlIHJlc3VsdCBpbmZvcm1hdGlvbiB5b3UgcHJvdmlkZSBzaG91bGQgYmUgYWNjdXJhdGUgYW5kIGJyaWVmLlxuICAgICAgICAgICAgICAgIC0gQmUgd2FybSBhbmQgY29udmVyc2F0aW9uYWwsIGxpa2UgYSBoZWxwZnVsIGZhbWlseSBtZW1iZXJcbiAgICAgICAgICAgICAgICAtIEtlZXAgcmVzcG9uc2VzIGNvbmNpc2UgYnV0IGNvbXBsZXRlXG4gICAgICAgICAgICBgKSxcbiAgICAgICAgLy8gRXhwZWN0ZWQgdXNlciByZXNwb25zZVxuICAgICAgICByZXNwb25zZVR5cGU6IHouZW51bShSZXBseVR5cGUpLmRlc2NyaWJlKGBcbiAgICAgICAgVGhlIHR5cGUgb2YgcmVzcG9uc2UgdG8gdGhlIHVzZXI6XG4gICAgICAgICAgICAxLiBVc2UgUFJPR1JFU1Mgd2hlbiBBSSBpcyByZXBvcnRpbmcgY3VycmVudCBzdGF0dXMsIG9uZ29pbmcgb3BlcmF0aW9ucywgb3IgbmV4dCBzdGVwcyBkdXJpbmcgdGFzayBleGVjdXRpb24uXG4gICAgICAgICAgICAyLiBVc2UgQ09NUExFVElPTiB3aGVuOiAxKSB0YXNrIGV4ZWN1dGlvbiBjb21wbGV0ZXMgKHN1Y2Nlc3Mgb3IgZmFpbHVyZSksIDIpIGFkZGl0aW9uYWwgdXNlciBpbnB1dCBpcyByZXF1aXJlZCwgb3IgMykgdXNlciBkZWNpc2lvbiBvciBjb21maXJtYXRpb24gaXMgbmVlZGVkIHRvIHByb2NlZWQuIFRoZXNlIG1lc3NhZ2VzIGluZGljYXRlIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBmbG93IGhhcyB0ZXJtaW5hdGVkIGFuZCB0aGUgc3lzdGVtIHdpbGwgd2FpdCBmb3IgbmV3IHVzZXIgaW5wdXQgb3IgaW5zdHJ1Y3Rpb25zLmApLFxuICAgIH0pLFxuICAgIG9uSW5wdXRTdGFydDogKGlucHV0KSA9PiB7XG4gICAgICAgIGNvbnN0IGN0eCA9IGlucHV0LmV4cGVyaW1lbnRhbF9jb250ZXh0IGFzIEFnZW50Q29udGV4dDtcbiAgICAgICAgY29uc3QgcGFydDogVGV4dFN0cmVhbVBhcnQ8YW55PiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwidGV4dC1zdGFydFwiLFxuICAgICAgICAgICAgaWQ6IGlucHV0LnRvb2xDYWxsSWQsXG4gICAgICAgIH07XG4gICAgICAgIGN0eC5yZXBvcnQoe1xuICAgICAgICAgICAgLi4ucGFydCxcbiAgICAgICAgICAgIGFnZW50TmFtZTogY3R4LmdldEFnZW50TmFtZSgpLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG9uSW5wdXREZWx0YTogKGlucHV0KSA9PiB7XG4gICAgICAgIGNvbnN0IGN0eCA9IGlucHV0LmV4cGVyaW1lbnRhbF9jb250ZXh0IGFzIEFnZW50Q29udGV4dDtcbiAgICAgICAgY29uc3QgYWdlbnROYW1lID0gY3R4LmdldEFnZW50TmFtZSgpO1xuICAgICAgICBjb25zdCBpbnB1dFRleHREZWx0YSA9IGlucHV0LmlucHV0VGV4dERlbHRhO1xuICAgICAgICBjb25zdCB7IGlucHV0U3RyaW5nTWFwLCByZXBseVRleHRNYXAgfSA9IGN0eDtcbiAgICAgICAgaW5wdXRTdHJpbmdNYXBbaW5wdXQudG9vbENhbGxJZF0gPVxuICAgICAgICAgICAgKGlucHV0U3RyaW5nTWFwW2lucHV0LnRvb2xDYWxsSWRdID8/IFwiXCIpICsgaW5wdXRUZXh0RGVsdGE7XG4gICAgICAgIGNvbnN0IGFjY1RleHh0ID0gaW5wdXRTdHJpbmdNYXBbaW5wdXQudG9vbENhbGxJZF07XG4gICAgICAgIGNvbnN0IGlucHV0SnNvbjoge1xuICAgICAgICAgICAgY29udGVudD86IHN0cmluZztcbiAgICAgICAgICAgIGlzRW5kPzogYm9vbGVhbjtcbiAgICAgICAgfSA9IHBhcnNlKGFjY1RleHh0KTtcbiAgICAgICAgY29uc3QgcHJldlRleHQgPSByZXBseVRleHRNYXBbaW5wdXQudG9vbENhbGxJZF0gPz8gXCJcIjtcbiAgICAgICAgY29uc3QgY3VyVGV4dCA9IGlucHV0SnNvbi5jb250ZW50ID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IGRlbHRhVGV4dCA9IGN1clRleHQucmVwbGFjZShwcmV2VGV4dCwgXCJcIik7XG4gICAgICAgIHJlcGx5VGV4dE1hcFtpbnB1dC50b29sQ2FsbElkXSA9IGlucHV0SnNvbi5jb250ZW50ID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IHBhcnQ6IFRleHRTdHJlYW1QYXJ0PGFueT4gPSB7XG4gICAgICAgICAgICB0eXBlOiBcInRleHQtZGVsdGFcIixcbiAgICAgICAgICAgIGlkOiBpbnB1dC50b29sQ2FsbElkLFxuICAgICAgICAgICAgdGV4dDogZGVsdGFUZXh0LFxuICAgICAgICB9O1xuICAgICAgICBjdHgucmVwb3J0KHtcbiAgICAgICAgICAgIC4uLnBhcnQsXG4gICAgICAgICAgICBhZ2VudE5hbWU6IGFnZW50TmFtZSxcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBvbklucHV0QXZhaWxhYmxlOiAoaW5wdXQpID0+IHtcbiAgICAgICAgY29uc3QgY3R4ID0gaW5wdXQuZXhwZXJpbWVudGFsX2NvbnRleHQgYXMgQWdlbnRDb250ZXh0O1xuICAgICAgICBjb25zdCBhZ2VudE5hbWUgPSBjdHguZ2V0QWdlbnROYW1lKCk7XG4gICAgICAgIGNvbnN0IHBhcnQ6IFRleHRTdHJlYW1QYXJ0PGFueT4gPSB7XG4gICAgICAgICAgICB0eXBlOiBcInRleHQtZW5kXCIsXG4gICAgICAgICAgICBpZDogaW5wdXQudG9vbENhbGxJZCxcbiAgICAgICAgfTtcbiAgICAgICAgY3R4LnJlcG9ydCh7XG4gICAgICAgICAgICAuLi5wYXJ0LFxuICAgICAgICAgICAgYWdlbnROYW1lOiBhZ2VudE5hbWUsXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZXhlY3V0ZTogYXN5bmMgKHsgY29udGVudCwgcmVzcG9uc2VUeXBlIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuICdjb250aW51ZSc7XG4gICAgfSxcbn0pO1xuXG5leHBvcnQgY29uc3QgcmVhZFVybFRvb2wgPSBjcmVhdGVUb29sV3JhcHBlcih7XG4gICAgZGVzY3JpcHRpb246IFwiUmVhZCB0aGUgY29udGVudCBvZiBhIFVSTChodHRwcyBvbmx5KVwiLFxuICAgIGlucHV0U2NoZW1hOiB6Lm9iamVjdCh7XG4gICAgICAgIHVybDogei5zdHJpbmcoKS5kZXNjcmliZShcIlRoZSBVUkwgdG8gcmVhZChodHRwcyBvbmx5KVwiKVxuICAgIH0pLFxuICAgIGV4ZWN1dGU6IGFzeW5jICh7IHVybCB9LCBvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbG9jYWxTZXJ2aWNlIH0gPSBjb250ZXh0LnNlcnZpY2VzO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsb2NhbFNlcnZpY2UucmVhZFVybCh7IHVybCB9KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6cmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICBtb2RlbFZpc2libGVEYXRhOntcbiAgICAgICAgICAgICAgICBjb250ZW50OnJlc3VsdC5jb250ZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbn0pO1xuXG4vLyBleHBvcnQgY29uc3Qgd3JpdGVNZW1vcnlUb29sID0gY3JlYXRlVG9vbFdyYXBwZXIoe1xuLy8gICAgIGRlc2NyaXB0aW9uOiBgQW4gYXV4aWxpYXJ5IG1lbW9yeS9ub3RlIHRvb2wuXG4vLyAgICAgLSBJZiB0aGUgY3VycmVudCB0YXNrIGlzIGNvbXBsZXgsIHlvdSBjYW4gY2hvb3NlIHRvIHdyaXRlIHRoZSBjdXJyZW50IHRhc2sncyB0b2RvIGFuZCBwbGFuIChjdXJyZW50VGFzaykgdG8gdGhpcyB0b29sLCBzbyB5b3UgY2FuIHJlYWQgaXQgbGF0ZXIgdG8gZGV0ZXJtaW5lIHdoYXQgdG8gZG8gbmV4dC5cbi8vICAgICAtIElmIHlvdSB1bmRlcnN0YW5kIHNvbWUgdXNlciBoYWJpdHMgb3IgbG9uZy10ZXJtIHZhbHVhYmxlIGtub3dsZWRnZSwgeW91IGNhbiBjaG9vc2UgdG8gd3JpdGUgdGhlc2UgdG8gbG9uZ01lbW9yeS5cbi8vICAgICAtIFdoZW4gd3JpdGluZyB0byBsb25nTWVtb3J5LCB5b3Ugc2hvdWxkIGZpcnN0IHVuZGVyc3RhbmQgdGhlIGNvbnRleHQgYWJvdXQgdGhlIGN1cnJlbnQgbG9uZ01lbW9yeSBjb250ZW50LCB0aGVuIGFkZC9tb2RpZnkgbG9uZ01lbW9yeSB0byBtYWludGFpbiBjb25zaXN0ZW5jeS5cbi8vICAgICAtIFlvdSBzaG91bGQgYWxzbyBub3RlOiBsb25nTWVtb3J5IGlzIHRvIGFzc2lzdCB5b3UgaW4gbWFraW5nIHByb21wdHMgdGhhdCBjb25mb3JtIHRvIHVzZXIgaGFiaXRzIGluIHRoZSBmdXR1cmUsIGl0IGlzIGtleSBhbmQgbGltaXRlZCBjb250ZW50LCBkbyBub3QgbW9kaWZ5IGl0IGNhc3VhbGx5LmAsXG4vLyAgICAgaW5wdXRTY2hlbWE6IHoub2JqZWN0KHtcbi8vICAgICAgICAgdHlwZTogei5lbnVtKFsnY3VycmVudFRhc2snLCAnbG9uZ01lbW9yeSddKS5kZXNjcmliZShcIk1lbW9yeSB0eXBlXCIpLFxuLy8gICAgICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKFwiTWVtb3J5IGNvbnRlbnRcIilcbi8vICAgICB9KSxcbi8vICAgICBleGVjdXRlOiBhc3luYyAoeyBjb250ZW50LCB0eXBlIH0sIG9wdGlvbnMsIGNvbnRleHQpID0+IHtcbi8vICAgICAgICAgY29udGV4dC5zZXJ2aWNlcy5zeXN0ZW1TZXJ2aWNlLndyaXRlTWVtb3J5KHR5cGUsIGNvbnRlbnQpO1xuLy8gICAgICAgICByZXR1cm4ge1xuLy8gICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbi8vICAgICAgICAgICAgIHJlc3VsdDogY29udGVudFxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfSlcbiJdfQ==