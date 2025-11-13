"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlOff = handlOff;
exports.sayEntry = sayEntry;
const agent_executor_1 = require("./agent-executor");
const router_utils_1 = require("./router-utils");
const constants_1 = require("../../constants");
async function handlOff(context, agentName) {
    const executor = new agent_executor_1.AgentExecutor(context);
    return await executor.executeAgent(agentName);
}
async function sayEntry(context) {
    try {
        const routerResult = await (0, router_utils_1.createMiniRouter)(context);
        const { route, output } = routerResult;
        context.logger.info(`routerResult: %o`, { route, output });
        if (route === 'self') {
            context.replyManual({ content: output, agentName: 'self' });
            // context.reportError({ agentName: 'self', error: { code: ErrorCode.ROUTE_ERROR, message: JSON.stringify({route,output}) } });
            return output;
        }
        // const handOff={
        //     type:'turn.handoff',
        //     id:uuidv4(),
        //     timestamp:Date.now(),
        //     agentName:route,
        // }
        // context.report(handOff);
        await handlOff(context, route);
    }
    catch (error) {
        return context.reportError({ agentName: 'self', error: { code: constants_1.ErrorCode.UNKNOWN_ROUTE_ERROR, message: (0, constants_1.errorStringify)(error) } });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvd29ya2Zsb3cvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSw0QkFHQztBQUNELDRCQXFCQztBQTlCRCxxREFBaUQ7QUFDakQsaURBQWtEO0FBQ2xELCtDQUE0RDtBQUdyRCxLQUFLLFVBQVUsUUFBUSxDQUFDLE9BQXFCLEVBQUUsU0FBb0I7SUFDdEUsTUFBTSxRQUFRLEdBQUcsSUFBSSw4QkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLE9BQU8sTUFBTSxRQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFDTSxLQUFLLFVBQVUsUUFBUSxDQUFDLE9BQXFCO0lBQ2hELElBQUksQ0FBQztRQUNELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSwrQkFBZ0IsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUNyRCxNQUFNLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxHQUFHLFlBQVksQ0FBQztRQUNwQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzNELElBQUksS0FBSyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzdELCtIQUErSDtZQUMvSCxPQUFPLE1BQU8sQ0FBQztRQUNuQixDQUFDO1FBQ0Qsa0JBQWtCO1FBQ2xCLDJCQUEyQjtRQUMzQixtQkFBbUI7UUFDbkIsNEJBQTRCO1FBQzVCLHVCQUF1QjtRQUN2QixJQUFJO1FBQ0osMkJBQTJCO1FBQzNCLE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLHFCQUFTLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLElBQUEsMEJBQWMsRUFBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0SSxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFnZW50Q29udGV4dCB9IGZyb20gXCIuLi9jb250ZXh0L21vZGVsXCI7XG5pbXBvcnQgeyBBZ2VudEV4ZWN1dG9yIH0gZnJvbSBcIi4vYWdlbnQtZXhlY3V0b3JcIjtcbmltcG9ydCB7IGNyZWF0ZU1pbmlSb3V0ZXIgfSBmcm9tIFwiLi9yb3V0ZXItdXRpbHNcIjtcbmltcG9ydCB7IEVycm9yQ29kZSwgZXJyb3JTdHJpbmdpZnkgfSBmcm9tIFwiLi4vLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBZ2VudE5hbWUgfSBmcm9tIFwiLi4vdHlwZXMvYWdlbnRcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsT2ZmKGNvbnRleHQ6IEFnZW50Q29udGV4dCwgYWdlbnROYW1lOiBBZ2VudE5hbWUpIHtcbiAgICBjb25zdCBleGVjdXRvciA9IG5ldyBBZ2VudEV4ZWN1dG9yKGNvbnRleHQpO1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRvci5leGVjdXRlQWdlbnQoYWdlbnROYW1lKTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXlFbnRyeShjb250ZXh0OiBBZ2VudENvbnRleHQpe1xuICAgIHRyeSB7ICAgICAgICBcbiAgICAgICAgY29uc3Qgcm91dGVyUmVzdWx0ID0gYXdhaXQgY3JlYXRlTWluaVJvdXRlcihjb250ZXh0KTtcbiAgICAgICAgY29uc3Qge3JvdXRlLG91dHB1dH0gPSByb3V0ZXJSZXN1bHQ7XG4gICAgICAgIGNvbnRleHQubG9nZ2VyLmluZm8oYHJvdXRlclJlc3VsdDogJW9gLCB7IHJvdXRlLCBvdXRwdXQgfSk7XG4gICAgICAgIGlmIChyb3V0ZSA9PT0gJ3NlbGYnKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcGx5TWFudWFsKHsgY29udGVudDogb3V0cHV0ISwgYWdlbnROYW1lOiAnc2VsZicgfSk7XG4gICAgICAgICAgICAvLyBjb250ZXh0LnJlcG9ydEVycm9yKHsgYWdlbnROYW1lOiAnc2VsZicsIGVycm9yOiB7IGNvZGU6IEVycm9yQ29kZS5ST1VURV9FUlJPUiwgbWVzc2FnZTogSlNPTi5zdHJpbmdpZnkoe3JvdXRlLG91dHB1dH0pIH0gfSk7XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0ITtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zdCBoYW5kT2ZmPXtcbiAgICAgICAgLy8gICAgIHR5cGU6J3R1cm4uaGFuZG9mZicsXG4gICAgICAgIC8vICAgICBpZDp1dWlkdjQoKSxcbiAgICAgICAgLy8gICAgIHRpbWVzdGFtcDpEYXRlLm5vdygpLFxuICAgICAgICAvLyAgICAgYWdlbnROYW1lOnJvdXRlLFxuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGNvbnRleHQucmVwb3J0KGhhbmRPZmYpO1xuICAgICAgICBhd2FpdCBoYW5kbE9mZihjb250ZXh0LCByb3V0ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQucmVwb3J0RXJyb3IoeyBhZ2VudE5hbWU6ICdzZWxmJywgZXJyb3I6IHsgY29kZTogRXJyb3JDb2RlLlVOS05PV05fUk9VVEVfRVJST1IsIG1lc3NhZ2U6IGVycm9yU3RyaW5naWZ5KGVycm9yKSB9IH0pO1xuICAgIH1cbn1cblxuIl19