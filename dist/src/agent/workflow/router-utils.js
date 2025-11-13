"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiniRouter = createMiniRouter;
exports.validateRouterResult = validateRouterResult;
const ai_1 = require("ai");
const fast_xml_parser_1 = require("fast-xml-parser");
const utils_1 = require("./utils");
const prompts_1 = require("../prompt/prompts");
const agent_1 = require("../types/agent");
const v4_1 = __importDefault(require("zod/v4"));
const constants_1 = require("../../constants");
const parser = new fast_xml_parser_1.XMLParser();
async function createMiniRouter(context) {
    try {
        const message = context.messages;
        context.logger.debug(`createMiniRouter input: %o`, {
            message: message,
        });
        const response = await (0, ai_1.generateObject)({
            schema: v4_1.default.object({
                route: v4_1.default.enum(agent_1.AgentNameEnum).describe("the agent name to route to"),
                // 这里删掉 self 这条路由之后就没用了
                output: v4_1.default.string().optional().describe("Leave it empty if the route is not self"),
            }),
            model: context.miniProvider,
            messages: [
                (0, utils_1.createSystemMessage)((0, prompts_1.MINI_ROUTER_SYSTEM_PROMPT)(context.environmentInfo)),
                ...message,
            ],
        });
        const route = response.object.route;
        // 如果result.output为空，则使用response.text
        const output = response.object.output ??
            "Sorry, I can't help with that.";
        if (route === "self" && !response.object.output) {
            context.logger.warn("Self route requires output message, %o", {
                object: response.object,
            });
        }
        return { route, output };
    }
    catch (error) {
        context.logger.error("Router error:", (0, constants_1.errorStringify)(error));
        throw error;
    }
}
function validateRouterResult(result) {
    if (!result.route) {
        return { isValid: false, error: "No route specified" };
    }
    // 不会再路由到 self 了，这里已经没用了
    if (result.route === "self" && !result.output) {
        return { isValid: false, error: "Self route requires output message" };
    }
    return { isValid: true };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FnZW50L3dvcmtmbG93L3JvdXRlci11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQWdCQSw0Q0EyQ0M7QUFFRCxvREFhQztBQTFFRCwyQkFBb0M7QUFDcEMscURBQTRDO0FBRTVDLG1DQUE4QztBQUM5QywrQ0FBOEQ7QUFDOUQsMENBS3dCO0FBQ3hCLGdEQUF1QjtBQUN2QiwrQ0FBaUQ7QUFFakQsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQkFBUyxFQUFFLENBQUM7QUFFeEIsS0FBSyxVQUFVLGdCQUFnQixDQUNsQyxPQUFxQjtJQUVyQixJQUFJLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBRWpDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFO1lBQy9DLE9BQU8sRUFBRSxPQUFPO1NBQ25CLENBQUMsQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSxtQkFBYyxFQUFDO1lBQ2xDLE1BQU0sRUFBRSxZQUFDLENBQUMsTUFBTSxDQUFDO2dCQUNiLEtBQUssRUFBRSxZQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFhLENBQUMsQ0FBQyxRQUFRLENBQ2pDLDRCQUE0QixDQUMvQjtnQkFDRCx1QkFBdUI7Z0JBQ3ZCLE1BQU0sRUFBRSxZQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUNsQyx5Q0FBeUMsQ0FDNUM7YUFDSixDQUFDO1lBQ0YsS0FBSyxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQzNCLFFBQVEsRUFBRTtnQkFDTixJQUFBLDJCQUFtQixFQUNmLElBQUEsbUNBQXlCLEVBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUNyRDtnQkFDRCxHQUFHLE9BQU87YUFDYjtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFjLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBa0IsQ0FBQztRQUU1RCxxQ0FBcUM7UUFDckMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ2pDLGdDQUFnQyxDQUFDO1FBQ3JDLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLEVBQUU7Z0JBQzFELE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTthQUMxQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxJQUFBLDBCQUFjLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLEtBQUssQ0FBQztJQUNoQixDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQWdCLG9CQUFvQixDQUNoQyxNQUFvQjtJQUVwQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxDQUFDO0lBQzNELENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsb0NBQW9DLEVBQUUsQ0FBQztJQUMzRSxDQUFDO0lBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2VuZXJhdGVPYmplY3QgfSBmcm9tIFwiYWlcIjtcbmltcG9ydCB7IFhNTFBhcnNlciB9IGZyb20gXCJmYXN0LXhtbC1wYXJzZXJcIjtcbmltcG9ydCB7IEFnZW50Q29udGV4dCB9IGZyb20gXCIuLi9jb250ZXh0L21vZGVsXCI7XG5pbXBvcnQgeyBjcmVhdGVTeXN0ZW1NZXNzYWdlIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IE1JTklfUk9VVEVSX1NZU1RFTV9QUk9NUFQgfSBmcm9tIFwiLi4vcHJvbXB0L3Byb21wdHNcIjtcbmltcG9ydCB7XG4gICAgQWdlbnROYW1lLFxuICAgIEFnZW50TmFtZUVudW0sXG4gICAgYWdlbnROYW1lcyxcbiAgICBSb3V0ZXJSZXN1bHQsXG59IGZyb20gXCIuLi90eXBlcy9hZ2VudFwiO1xuaW1wb3J0IHogZnJvbSBcInpvZC92NFwiO1xuaW1wb3J0IHsgZXJyb3JTdHJpbmdpZnkgfSBmcm9tIFwiLi4vLi4vY29uc3RhbnRzXCI7XG5cbmNvbnN0IHBhcnNlciA9IG5ldyBYTUxQYXJzZXIoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU1pbmlSb3V0ZXIoXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0LFxuKTogUHJvbWlzZTxSb3V0ZXJSZXN1bHQ+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gY29udGV4dC5tZXNzYWdlcztcblxuICAgICAgICBjb250ZXh0LmxvZ2dlci5kZWJ1ZyhgY3JlYXRlTWluaVJvdXRlciBpbnB1dDogJW9gLCB7XG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZU9iamVjdCh7XG4gICAgICAgICAgICBzY2hlbWE6IHoub2JqZWN0KHtcbiAgICAgICAgICAgICAgICByb3V0ZTogei5lbnVtKEFnZW50TmFtZUVudW0pLmRlc2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBhZ2VudCBuYW1lIHRvIHJvdXRlIHRvXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAvLyDov5nph4zliKDmjokgc2VsZiDov5nmnaHot6/nlLHkuYvlkI7lsLHmsqHnlKjkuoZcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJMZWF2ZSBpdCBlbXB0eSBpZiB0aGUgcm91dGUgaXMgbm90IHNlbGZcIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtb2RlbDogY29udGV4dC5taW5pUHJvdmlkZXIsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIGNyZWF0ZVN5c3RlbU1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgIE1JTklfUk9VVEVSX1NZU1RFTV9QUk9NUFQoY29udGV4dC5lbnZpcm9ubWVudEluZm8pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgLi4ubWVzc2FnZSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICBjb25zdCByb3V0ZTogQWdlbnROYW1lID0gcmVzcG9uc2Uub2JqZWN0LnJvdXRlIGFzIEFnZW50TmFtZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenHJlc3VsdC5vdXRwdXTkuLrnqbrvvIzliJnkvb/nlKhyZXNwb25zZS50ZXh0XG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHJlc3BvbnNlLm9iamVjdC5vdXRwdXQgPz9cbiAgICAgICAgICAgIFwiU29ycnksIEkgY2FuJ3QgaGVscCB3aXRoIHRoYXQuXCI7XG4gICAgICAgIGlmIChyb3V0ZSA9PT0gXCJzZWxmXCIgJiYgIXJlc3BvbnNlLm9iamVjdC5vdXRwdXQpIHtcbiAgICAgICAgICAgIGNvbnRleHQubG9nZ2VyLndhcm4oXCJTZWxmIHJvdXRlIHJlcXVpcmVzIG91dHB1dCBtZXNzYWdlLCAlb1wiLCB7XG4gICAgICAgICAgICAgICAgb2JqZWN0OiByZXNwb25zZS5vYmplY3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyByb3V0ZSwgb3V0cHV0IH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29udGV4dC5sb2dnZXIuZXJyb3IoXCJSb3V0ZXIgZXJyb3I6XCIsIGVycm9yU3RyaW5naWZ5KGVycm9yKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUm91dGVyUmVzdWx0KFxuICAgIHJlc3VsdDogUm91dGVyUmVzdWx0LFxuKTogeyBpc1ZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgICBpZiAoIXJlc3VsdC5yb3V0ZSkge1xuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6IFwiTm8gcm91dGUgc3BlY2lmaWVkXCIgfTtcbiAgICB9XG4gICAgXG4gICAgLy8g5LiN5Lya5YaN6Lev55Sx5YiwIHNlbGYg5LqG77yM6L+Z6YeM5bey57uP5rKh55So5LqGXG4gICAgaWYgKHJlc3VsdC5yb3V0ZSA9PT0gXCJzZWxmXCIgJiYgIXJlc3VsdC5vdXRwdXQpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiBcIlNlbGYgcm91dGUgcmVxdWlyZXMgb3V0cHV0IG1lc3NhZ2VcIiB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbn1cbiJdfQ==