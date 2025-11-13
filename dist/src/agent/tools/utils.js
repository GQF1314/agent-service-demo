"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxCreateUpdateDeleteLimit = exports.ReplyType = exports.searchLimit = exports.createToolWrapper = void 0;
exports.genClientToolExecutor = genClientToolExecutor;
exports.padTimezone = padTimezone;
const lodash_1 = require("lodash");
const constants_1 = require("../../constants");
const date_fns_tz_1 = require("date-fns-tz");
const timing_logger_1 = require("../../utils/timing-logger");
const createToolWrapper = (tool) => {
    return (context) => {
        return {
            ...tool,
            toModelOutput: (result) => {
                return {
                    type: "json",
                    value: {
                        ...(0, lodash_1.pick)(result, ["success", "error"]),
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
            execute: async (input, options) => {
                const traceId = context.logger.bindings().traceId || "";
                const toolTimer = new timing_logger_1.ToolTimer(context.logger, traceId, context.toolName);
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
                }
                catch (error) {
                    context.logger.error(`[tool]: error result ${context.toolName} %o`, { error: (0, constants_1.errorStringify)(error) });
                    // 记录工具执行失败的耗时
                    toolTimer.logEnd({
                        success: false,
                        error: (0, constants_1.errorStringify)(error),
                    });
                    let errorMessage = "unknown error when execute tool";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    else if (typeof error === "object" && error !== null) {
                        if ("message" in error && typeof error.message === "string") {
                            errorMessage = error.message;
                        }
                        else if ("code" in error && "message" in error) {
                            errorMessage = `[${error.code}] ${error.message}`;
                        }
                        else {
                            errorMessage = JSON.stringify(error);
                        }
                    }
                    else {
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
        };
    };
};
exports.createToolWrapper = createToolWrapper;
function genClientToolExecutor(params) {
    return async (subParams) => {
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
function padTimezone(date, timezone) {
    if (date.includes("Z")) {
        return date;
    }
    return (0, date_fns_tz_1.formatInTimeZone)(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}
exports.searchLimit = 10;
var ReplyType;
(function (ReplyType) {
    ReplyType["PROGRESS"] = "PROGRESS";
    ReplyType["COMPLETION"] = "COMPLETION";
})(ReplyType || (exports.ReplyType = ReplyType = {}));
//创建/更新/删除操作的最大限制
exports.maxCreateUpdateDeleteLimit = 10;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvdG9vbHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNEhBLHNEQWVDO0FBRUQsa0NBS0M7QUEvSUQsbUNBQThCO0FBQzlCLCtDQUFpRDtBQUNqRCw2Q0FBK0M7QUFDL0MsNkRBQXNEO0FBK0IvQyxNQUFNLGlCQUFpQixHQUFHLENBQy9CLElBQWlDLEVBQ2pDLEVBQUU7SUFDRixPQUFPLENBQUMsT0FBcUIsRUFBRSxFQUFFO1FBQy9CLE9BQU87WUFDTCxHQUFHLElBQUk7WUFDUCxhQUFhLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDaEMsT0FBTztvQkFDTCxJQUFJLEVBQUUsTUFBTTtvQkFDWixLQUFLLEVBQUU7d0JBQ0wsR0FBRyxJQUFBLGFBQUksRUFBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3JDLFlBQVk7d0JBQ1osR0FBRyxNQUFNLENBQUMsZ0JBQWdCO3FCQUMzQjtpQkFDRixDQUFDO1lBQ0osQ0FBQztZQUNELFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQVksRUFBRSxPQUF3QixFQUFFLEVBQUU7Z0JBQ3hELE1BQU0sT0FB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Q0FBQyxDQUFDO0FBckZXLFFBQUEsaUJBQWlCLHFCQXFGNUI7QUFFRixTQUFnQixxQkFBcUIsQ0FBSSxNQUd4QztJQUNDLE9BQU8sS0FBSyxFQUFFLFNBQVksRUFBRSxFQUFFO1FBQzVCLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLE9BQU8sRUFBRSxDQUFDO1FBQ1Ysd0JBQXdCO1FBQ3hCLG9CQUFvQjtRQUNwQixnQ0FBZ0M7UUFDaEMsdUJBQXVCO1FBQ3ZCLHNCQUFzQjtRQUN0QixlQUFlO1FBQ2YsS0FBSztJQUNQLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsSUFBWSxFQUFFLFFBQWdCO0lBQ3hELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELE9BQU8sSUFBQSw4QkFBZ0IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVZLFFBQUEsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUc5QixJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDbkIsa0NBQXFCLENBQUE7SUFDckIsc0NBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUhXLFNBQVMseUJBQVQsU0FBUyxRQUdwQjtBQUdELGlCQUFpQjtBQUNKLFFBQUEsMEJBQTBCLEdBQUcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVG9vbCwgVG9vbENhbGxPcHRpb25zIH0gZnJvbSBcImFpXCI7XG5pbXBvcnQgeyBJT3V0cHV0TWVzc2FnZSB9IGZyb20gXCIuLi90eXBlcy9vdXRwdXQtbWVzc2FnZVwiO1xuaW1wb3J0IHsgSUFnZW50Q29udGV4dCB9IGZyb20gXCIuLi90eXBlcy9hZ2VudFwiO1xuaW1wb3J0IHsgcGljayB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGVycm9yU3RyaW5naWZ5IH0gZnJvbSBcIi4uLy4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZm9ybWF0SW5UaW1lWm9uZSB9IGZyb20gXCJkYXRlLWZucy10elwiO1xuaW1wb3J0IHsgVG9vbFRpbWVyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3RpbWluZy1sb2dnZXJcIjtcblxuZXhwb3J0IHR5cGUgSVJlcG9ydEZuID0gKHBhcmFtczogT21pdDxJT3V0cHV0TWVzc2FnZSwgXCJ0aW1lc3RhbXBcIj4pID0+IGFueTtcblxuZXhwb3J0IGludGVyZmFjZSBJVG9vbENvbnRleHQgZXh0ZW5kcyBJQWdlbnRDb250ZXh0IHtcbiAgdG9vbE5hbWU6IHN0cmluZztcbn1cblxudHlwZSBFeHRlbmRlZFRvb2xFeGVjdXRlRnVuY3Rpb248SU5QVVQsIE9VVFBVVD4gPSAoXG4gIGlucHV0OiBJTlBVVCxcbiAgb3B0aW9uczogVG9vbENhbGxPcHRpb25zLFxuICBjb250ZXh0OiBJVG9vbENvbnRleHQsXG4pID0+IEFzeW5jSXRlcmFibGU8T1VUUFVUPiB8IFByb21pc2VMaWtlPE9VVFBVVD4gfCBPVVRQVVQ7XG5cbi8vIFRoZW4gZGVmaW5lIGV4dGVuZGVkIFRvb2wgdHlwZVxudHlwZSBFeHRlbmRlZFRvb2w8SU5QVVQsIE9VVFBVVD4gPSBPbWl0PFRvb2w8SU5QVVQsIE9VVFBVVD4sIFwiZXhlY3V0ZVwiPiAmIHtcbiAgZXhlY3V0ZTogRXh0ZW5kZWRUb29sRXhlY3V0ZUZ1bmN0aW9uPElOUFVULCBPVVRQVVQ+O1xuICBvbklucHV0U3RhcnQ/OiAoaW5wdXQ6IFRvb2xDYWxsT3B0aW9ucywgY29udGV4dDogSVRvb2xDb250ZXh0KSA9PiB2b2lkO1xuICBvbklucHV0RGVsdGE/OiAoXG4gICAgb3B0aW9uczoge1xuICAgICAgaW5wdXRUZXh0RGVsdGE6IHN0cmluZztcbiAgICB9ICYgVG9vbENhbGxPcHRpb25zLFxuICAgIGNvbnRleHQ6IElUb29sQ29udGV4dCxcbiAgKSA9PiB2b2lkO1xuICBvbklucHV0QXZhaWxhYmxlPzogKFxuICAgIGlucHV0OiBUb29sQ2FsbE9wdGlvbnMgJiB7XG4gICAgICBpbnB1dDogW0lOUFVUXSBleHRlbmRzIFtuZXZlcl0gPyB1bmRlZmluZWQgOiBJTlBVVDtcbiAgICB9LFxuICAgIGNvbnRleHQ6IElUb29sQ29udGV4dCxcbiAgKSA9PiB2b2lkO1xufTtcbmV4cG9ydCBjb25zdCBjcmVhdGVUb29sV3JhcHBlciA9IDxJTlBVVCwgT1VUUFVUPihcbiAgdG9vbDogRXh0ZW5kZWRUb29sPElOUFVULCBPVVRQVVQ+LFxuKSA9PiB7XG4gIHJldHVybiAoY29udGV4dDogSVRvb2xDb250ZXh0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnRvb2wsXG4gICAgICB0b01vZGVsT3V0cHV0OiAocmVzdWx0OiBPVVRQVVQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBcImpzb25cIixcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgLi4ucGljayhyZXN1bHQsIFtcInN1Y2Nlc3NcIiwgXCJlcnJvclwiXSksXG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIC4uLnJlc3VsdC5tb2RlbFZpc2libGVEYXRhLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgb25JbnB1dFN0YXJ0OiAoaW5wdXQpID0+IHtcbiAgICAgICAgdG9vbC5vbklucHV0U3RhcnQ/LihpbnB1dCwgY29udGV4dCk7XG4gICAgICB9LFxuICAgICAgb25JbnB1dERlbHRhOiAoZGVsdGEpID0+IHtcbiAgICAgICAgdG9vbC5vbklucHV0RGVsdGE/LihkZWx0YSwgY29udGV4dCk7XG4gICAgICB9LFxuICAgICAgb25JbnB1dEF2YWlsYWJsZTogKGlucHV0KSA9PiB7XG4gICAgICAgIHRvb2wub25JbnB1dEF2YWlsYWJsZT8uKGlucHV0LCBjb250ZXh0KTtcbiAgICAgIH0sXG4gICAgICBleGVjdXRlOiBhc3luYyAoaW5wdXQ6IElOUFVULCBvcHRpb25zOiBUb29sQ2FsbE9wdGlvbnMpID0+IHtcbiAgICAgICAgY29uc3QgdHJhY2VJZCA9IGNvbnRleHQubG9nZ2VyLmJpbmRpbmdzKCkudHJhY2VJZCBhcyBzdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgY29uc3QgdG9vbFRpbWVyID0gbmV3IFRvb2xUaW1lcihjb250ZXh0LmxvZ2dlciwgdHJhY2VJZCwgY29udGV4dC50b29sTmFtZSk7XG5cbiAgICAgICAgY29udGV4dC5sb2dnZXIuaW5mbyhgW3Rvb2xdOiAgaW5wdXQ6ICR7Y29udGV4dC50b29sTmFtZX0gJW9gLCB7XG4gICAgICAgICAgaW5wdXQsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRvb2wuZXhlY3V0ZShpbnB1dCwgb3B0aW9ucywgY29udGV4dCk7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIuaW5mbyhgW3Rvb2xdOiAgcmVzdWx0OiAke2NvbnRleHQudG9vbE5hbWV9ICVvYCwge1xuICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g6K6w5b2V5bel5YW35omn6KGM5oiQ5Yqf55qE6ICX5pe2XG4gICAgICAgICAgdG9vbFRpbWVyLmxvZ0VuZCh7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgaW5wdXRTaXplOiBKU09OLnN0cmluZ2lmeShpbnB1dCkubGVuZ3RoLFxuICAgICAgICAgICAgb3V0cHV0U2l6ZTogSlNPTi5zdHJpbmdpZnkocmVzdWx0KS5sZW5ndGgsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgYFt0b29sXTogZXJyb3IgcmVzdWx0ICR7Y29udGV4dC50b29sTmFtZX0gJW9gLFxuICAgICAgICAgICAgeyBlcnJvcjogZXJyb3JTdHJpbmdpZnkoZXJyb3IpIH0sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIOiusOW9leW3peWFt+aJp+ihjOWksei0peeahOiAl+aXtlxuICAgICAgICAgIHRvb2xUaW1lci5sb2dFbmQoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IFwidW5rbm93biBlcnJvciB3aGVuIGV4ZWN1dGUgdG9vbFwiO1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIGVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoXCJtZXNzYWdlXCIgaW4gZXJyb3IgJiYgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJjb2RlXCIgaW4gZXJyb3IgJiYgXCJtZXNzYWdlXCIgaW4gZXJyb3IpIHtcbiAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYFske2Vycm9yLmNvZGV9XSAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgLi4uKHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJiBlcnJvciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIFwicmVxdWVzdERldGFpbHNcIiBpbiBlcnJvclxuICAgICAgICAgICAgICA/IHsgcmVxdWVzdERldGFpbHM6IGVycm9yLnJlcXVlc3REZXRhaWxzIH1cbiAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9IGFzIFRvb2w8SU5QVVQsIE9VVFBVVD47XG4gIH07XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuQ2xpZW50VG9vbEV4ZWN1dG9yPFQ+KHBhcmFtczoge1xuICB0b29sTmFtZTogc3RyaW5nO1xuICByZXBvcnQ6IElSZXBvcnRGbjtcbn0pIHtcbiAgcmV0dXJuIGFzeW5jIChzdWJQYXJhbXM6IFQpID0+IHtcbiAgICBjb25zdCB7IHRvb2xOYW1lLCByZXBvcnQgfSA9IHBhcmFtcztcbiAgICByZXR1cm4ge307XG4gICAgLy8gcmV0dXJuIGF3YWl0IHJlcG9ydCh7XG4gICAgLy8gICAgIGlkOiB1dWlkdjQoKSxcbiAgICAvLyAgICAgdHlwZTogJ2NsaWVudF90b29sX2NhbGwnLFxuICAgIC8vICAgICBkYXRhOiBzdWJQYXJhbXMsXG4gICAgLy8gICAgIHN0YWdlOiAnc3RhcnQnLFxuICAgIC8vICAgICB0b29sTmFtZVxuICAgIC8vIH0pXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWRUaW1lem9uZShkYXRlOiBzdHJpbmcsIHRpbWV6b25lOiBzdHJpbmcpIHtcbiAgaWYgKGRhdGUuaW5jbHVkZXMoXCJaXCIpKSB7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdEluVGltZVpvbmUoZGF0ZSwgdGltZXpvbmUsIFwieXl5eS1NTS1kZCdUJ0hIOm1tOnNzWFhYXCIpO1xufVxuXG5leHBvcnQgY29uc3Qgc2VhcmNoTGltaXQgPSAxMDtcblxuXG5leHBvcnQgZW51bSBSZXBseVR5cGUge1xuICBQUk9HUkVTUyA9IFwiUFJPR1JFU1NcIixcbiAgQ09NUExFVElPTiA9IFwiQ09NUExFVElPTlwiLFxufVxuXG5cbi8v5Yib5bu6L+abtOaWsC/liKDpmaTmk43kvZznmoTmnIDlpKfpmZDliLZcbmV4cG9ydCBjb25zdCBtYXhDcmVhdGVVcGRhdGVEZWxldGVMaW1pdCA9IDEwOyJdfQ==