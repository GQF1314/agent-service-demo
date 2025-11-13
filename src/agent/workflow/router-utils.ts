import { generateObject } from "ai";
import { XMLParser } from "fast-xml-parser";
import { AgentContext } from "../context/model";
import { createSystemMessage } from "./utils";
import { MINI_ROUTER_SYSTEM_PROMPT } from "../prompt/prompts";
import {
    AgentName,
    AgentNameEnum,
    agentNames,
    RouterResult,
} from "../types/agent";
import z from "zod/v4";
import { errorStringify } from "../../constants";

const parser = new XMLParser();

export async function createMiniRouter(
    context: AgentContext,
): Promise<RouterResult> {
    try {
        const message = context.messages;

        context.logger.debug(`createMiniRouter input: %o`, {
            message: message,
        });
        const response = await generateObject({
            schema: z.object({
                route: z.enum(AgentNameEnum).describe(
                    "the agent name to route to",
                ),
                // 这里删掉 self 这条路由之后就没用了
                output: z.string().optional().describe(
                    "Leave it empty if the route is not self",
                ),
            }),
            model: context.miniProvider,
            messages: [
                createSystemMessage(
                    MINI_ROUTER_SYSTEM_PROMPT(context.environmentInfo),
                ),
                ...message,
            ],
        });
    
        const route: AgentName = response.object.route as AgentName;
        
        // 如果result.output为空，则使用response.text
        const output = response.object.output ??
            "Sorry, I can't help with that.";
        if (route === "self" && !response.object.output) {
            context.logger.warn("Self route requires output message, %o", {
                object: response.object,
            });
        }
        return { route, output };
    } catch (error) {
        context.logger.error("Router error:", errorStringify(error));
        throw error;
    }
}

export function validateRouterResult(
    result: RouterResult,
): { isValid: boolean; error?: string } {
    if (!result.route) {
        return { isValid: false, error: "No route specified" };
    }
    
    // 不会再路由到 self 了，这里已经没用了
    if (result.route === "self" && !result.output) {
        return { isValid: false, error: "Self route requires output message" };
    }

    return { isValid: true };
}
