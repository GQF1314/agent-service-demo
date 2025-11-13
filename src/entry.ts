import { AgentContext } from "./agent/context/model";
import {
    getSummaryMessage,
    IMessageReqParams,
    ServerModelMessagesToModelMessages,
} from "./types/presentation-input";
import { ICommonContext } from "./agent/types/agent";
import { PinoLogger } from "hono-pino";
import { ServiceFactory } from "./services/actual/serviceFactory";
import { IHeaderContext } from "./types/server";
import { RequestTimer, AgentTimer } from "./utils/timing-logger";

export class AgentEntry {
    handleSession(input: IMessageReqParams, params: {
        signal: AbortSignal;
        headerContext: IHeaderContext;
        logger: PinoLogger;
        requestTimer: RequestTimer;
    }) {
        const { signal, headerContext, logger, requestTimer } = params;
        const { familyId, userId, timeZone, traceId } = headerContext;

        const agentTimer = new AgentTimer(logger, traceId);
        const initStartTime = Date.now();

        const { agentContext, serviceFactory } = this.initializeAgent(input, {
            familyId,
            userId,
            timeZone,
            traceId,
        }, logger);

        const initDuration = Date.now() - initStartTime;
        agentTimer.logInit(initDuration, {
            servicesInitialized: ["calendar", "task", "recipe", "mealPlan", "shopping", "combined", "local"]
        });
        requestTimer.mark("agent_init_complete");

        // 监听中止信号 - 使用命名函数以便移除
        const abortHandler = () => {
            logger.info("------abort");
            agentContext.abort("USER_ABORT");
        };

        // Use try-catch to ensure cleanup even if addEventListener fails
        try {
            signal.addEventListener("abort", abortHandler);
        } catch (e) {
            logger.error("Failed to add abort listener: %o", { error: e });
        }

        // 在后台执行 (不阻塞),确保清理资源
        agentContext.execute()
            .catch((error: Error) => {
                logger.error("Execute error: %o", { error });
            })
            .finally(() => {
                // 移除监听器,释放闭包引用
                try {
                    signal.removeEventListener("abort", abortHandler);
                } catch (e) {
                    // Ignore cleanup errors
                    logger.warn("Failed to remove abort listener: %o", { error: e });
                }

                // Clean up service factory to break reference chains
                try {
                    serviceFactory.dispose();
                } catch (e) {
                    logger.warn("Failed to dispose service factory: %o", { error: e });
                }

                // 记录请求结束时间和breakdown
                const breakdown = requestTimer.getBreakdown();
                requestTimer.logEnd({ breakdown });
            });

        return agentContext.stream;
    }
    private initializeAgent(
        params: IMessageReqParams,
        headerContext: IHeaderContext,
        logger: PinoLogger,
    ) {
        const { environment, recent_messages } = params;
        const { familyId, userId, timeZone, traceId } = headerContext;
        const {
            chat_info,
            family_info,
            user_brief,
        } = environment;
        const messages = ServerModelMessagesToModelMessages(recent_messages);
        const commonContext: Omit<ICommonContext, "services"> = {
            messages,
            summary: getSummaryMessage(recent_messages),
            familyInfo: family_info ?? {},
            userBrief: user_brief ?? {},
            chatInfo: chat_info ?? {},
            familyId: familyId,
            userId: userId,
            timeZone: timeZone,
            logger: logger,
            traceId: traceId,
        };
        const serviceFactory = new ServiceFactory(commonContext);
        const services = serviceFactory.getAllServices();
        const Contextservices = {
            calendarService: services.calendar,
            taskService: services.task,
            localService: services.local,
            combinedService: services.combined,
            recipeService: services.recipe,
            mealPlanService: services.mealPlan,
            shoppingService: services.shopping,
        };
        const agentContext = new AgentContext({
            ...commonContext,
            services: Contextservices,
        });
        logger.info("✅ Agent initialized successfully");
        return { agentContext, serviceFactory };
    }
}
