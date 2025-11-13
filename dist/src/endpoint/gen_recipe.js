"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenRecipeInputSchema = exports.GenRecipeOutputSchema = void 0;
exports.genRecipe = genRecipe;
const ai_1 = require("ai");
const zod_1 = __importDefault(require("zod"));
const config_1 = __importDefault(require("config"));
const constants_1 = require("../constants");
const secretConfig = config_1.default.get("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}
exports.GenRecipeOutputSchema = zod_1.default.object({
    name: zod_1.default.string(),
    cooking_time: zod_1.default.number().describe('cooking time in minutes'),
    servings: zod_1.default.number().describe('number of servings'),
    instructions: zod_1.default.array(zod_1.default.object({
        // Define according to actual InstructionList structure
        step: zod_1.default.number(),
        content: zod_1.default.string(),
        // Other fields...
    })), // Define according to actual InstructionList structure
    ingredients_query: zod_1.default.array(zod_1.default.string()).describe("Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'"),
});
exports.GenRecipeInputSchema = zod_1.default.object({
    type: zod_1.default.enum(['url', 'text', 'image']),
    content: zod_1.default.string(),
});
const prompt = `
You are a recipe generator. 
You will be given a content of url, text, or image, please generate a recipe based on the content.
Try your best to generate a recipe, even the instructions or ingredients are not complete or not accurate, please try your best to generate the recipe.
Other than the content is not a recipe, please return an error message.
`;
async function genRecipe(c, input) {
    try {
        const parsedResult = exports.GenRecipeInputSchema.safeParse(input);
        if (!parsedResult.success) {
            return {
                message: (0, constants_1.errorStringify)(parsedResult.error),
                code: constants_1.ErrorCode.INVALID_REQUEST_PARAMS,
                data: null,
            };
        }
        const { type, content } = input;
        let messages = [];
        if (type === 'url') {
            messages = [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: `
                    The follow content is read from a url, please generate a recipe based on the content of the url.
                     ${content}
                    `,
                }
            ];
        }
        else if (type === 'text') {
            messages = [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: `
                    The follow content is read from a text, please generate a recipe based on the content of the text.
                    ${content}
                    `,
                }
            ];
        }
        else if (type === 'image') {
            messages = [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: [{
                            type: 'image',
                            image: content,
                            mediaType: 'image/jpeg',
                        }, {
                            type: 'text',
                            text: 'Please generate a recipe based on the content of the image.',
                        }],
                }
            ];
        }
        c.var.logger.info("[gen recipe]: messages: %o", {
            messages,
            type
        });
        const result = await (0, ai_1.generateObject)({
            schema: zod_1.default.object({
                recipe: exports.GenRecipeOutputSchema.nullable().optional().describe('recipe if the content is a recipe'),
                error: zod_1.default.string().nullable().optional().describe('error message if the content is not a recipe'),
            }),
            messages,
            model: secretConfig.LLM_FAST_MODEL ?? ''
        });
        const recipe = result.object?.recipe;
        const error = result.object?.error;
        if (!recipe) {
            c.var.logger.info("[gen recipe]: empty result: %o", {
                result,
                input,
                error
            });
            return {
                message: 'empty result',
                code: constants_1.ErrorCode.UNKNOWN_SERVER_ERROR,
                data: null,
            };
        }
        c.var.logger.debug("[gen recipe]: success: %o", {
            recipe,
        });
        return {
            message: 'Success',
            code: 0,
            data: { ...recipe },
        };
    }
    catch (error) {
        c.var.logger.error("[gen recipe]: error: %o", {
            error: (0, constants_1.errorStringify)(error),
            input
        });
        return {
            message: (0, constants_1.errorStringify)(error),
            code: constants_1.ErrorCode.UNKNOWN_SERVER_ERROR,
            data: null,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuX3JlY2lwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lbmRwb2ludC9nZW5fcmVjaXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQXVDQSw4QkEwR0M7QUFqSkQsMkJBQWtEO0FBQ2xELDhDQUFvQjtBQUNwQixvREFBNEI7QUFFNUIsNENBQXlEO0FBSXpELE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFzQixRQUFRLENBQUMsQ0FBQztBQUMvRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFWSxRQUFBLHFCQUFxQixHQUFHLGFBQUMsQ0FBQyxNQUFNLENBQUM7SUFDMUMsSUFBSSxFQUFFLGFBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDaEIsWUFBWSxFQUFFLGFBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUM7SUFDNUQsUUFBUSxFQUFFLGFBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUM7SUFDbkQsWUFBWSxFQUFFLGFBQUMsQ0FBQyxLQUFLLENBQUMsYUFBQyxDQUFDLE1BQU0sQ0FBQztRQUMzQix1REFBdUQ7UUFDdkQsSUFBSSxFQUFFLGFBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDaEIsT0FBTyxFQUFFLGFBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsa0JBQWtCO0tBQ3JCLENBQUMsQ0FBQyxFQUFFLHVEQUF1RDtJQUM1RCxpQkFBaUIsRUFBRSxhQUFDLENBQUMsS0FBSyxDQUFDLGFBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FDM0Msa09BQWtPLENBQ3JPO0NBQ0osQ0FBQyxDQUFBO0FBRVcsUUFBQSxvQkFBb0IsR0FBRyxhQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pDLElBQUksRUFBRSxhQUFDLENBQUMs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SUFBSSxDQUFDLGdDQUFnQyxFQUFFO2dCQUNoRCxNQUFNO2dCQUNOLEtBQUs7Z0JBQ0wsS0FBSzthQUNSLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0gsT0FBTyxFQUFFLGNBQWM7Z0JBQ3ZCLElBQUksRUFBRSxxQkFBUyxDQUFDLG9CQUFvQjtnQkFDcEMsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDO1FBQ04sQ0FBQztRQUNELENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRTtZQUM1QyxNQUFNO1NBQ1QsQ0FBQyxDQUFDO1FBQ0gsT0FBTztZQUNILE9BQU8sRUFBRSxTQUFTO1lBQ2xCLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUU7U0FDdEIsQ0FBQTtJQUNMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFO1lBQzFDLEtBQUssRUFBRSxJQUFBLDBCQUFjLEVBQUMsS0FBSyxDQUFDO1lBQzVCLEtBQUs7U0FDUixDQUFDLENBQUM7UUFDSCxPQUFPO1lBQ0gsT0FBTyxFQUFFLElBQUEsMEJBQWMsRUFBQyxLQUFLLENBQUM7WUFDOUIsSUFBSSxFQUFFLHFCQUFTLENBQUMsb0JBQW9CO1lBQ3BDLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQTtJQUNMLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2VuZXJhdGVPYmplY3QsIE1vZGVsTWVzc2FnZSB9IGZyb20gXCJhaVwiO1xuaW1wb3J0IHogZnJvbSBcInpvZFwiO1xuaW1wb3J0IGNvbmZpZyBmcm9tIFwiY29uZmlnXCI7XG5pbXBvcnQgeyBBcHBDb25maWcgfSBmcm9tIFwiLi5cIjtcbmltcG9ydCB7IEVycm9yQ29kZSwgZXJyb3JTdHJpbmdpZnkgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBcGlSZXNwb25zZSB9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IENvbnRleHQgfSBmcm9tIFwiaG9ub1wiO1xuaW1wb3J0IHsgSVNlcnZlckNvbnRleHQgfSBmcm9tIFwiLi4vdHlwZXMvc2VydmVyXCI7XG5jb25zdCBzZWNyZXRDb25maWcgPSBjb25maWcuZ2V0PEFwcENvbmZpZ1snc2VjcmV0J10+KFwic2VjcmV0XCIpO1xuaWYgKCFzZWNyZXRDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWNyZXRDb25maWcgaXMgbm90IHNldFwiKTtcbn1cblxuZXhwb3J0IGNvbnN0IEdlblJlY2lwZU91dHB1dFNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICBuYW1lOiB6LnN0cmluZygpLFxuICAgIGNvb2tpbmdfdGltZTogei5udW1iZXIoKS5kZXNjcmliZSgnY29va2luZyB0aW1lIGluIG1pbnV0ZXMnKSxcbiAgICBzZXJ2aW5nczogei5udW1iZXIoKS5kZXNjcmliZSgnbnVtYmVyIG9mIHNlcnZpbmdzJyksXG4gICAgaW5zdHJ1Y3Rpb25zOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgLy8gRGVmaW5lIGFjY29yZGluZyB0byBhY3R1YWwgSW5zdHJ1Y3Rpb25MaXN0IHN0cnVjdHVyZVxuICAgICAgICBzdGVwOiB6Lm51bWJlcigpLFxuICAgICAgICBjb250ZW50OiB6LnN0cmluZygpLFxuICAgICAgICAvLyBPdGhlciBmaWVsZHMuLi5cbiAgICB9KSksIC8vIERlZmluZSBhY2NvcmRpbmcgdG8gYWN0dWFsIEluc3RydWN0aW9uTGlzdCBzdHJ1Y3R1cmVcbiAgICBpbmdyZWRpZW50c19xdWVyeTogei5hcnJheSh6LnN0cmluZygpKS5kZXNjcmliZShcbiAgICAgICAgXCJJbmdyZWRpZW50cyBpbiBmb3JtYXQ6IHF1YW50aXR5IHVuaXQgbmFtZS4gUXVhbnRpdHkgbXVzdCBiZSBhbiBleGFjdCBudW1iZXIoaW50ZWdlciBvciBmbG9hdCksIG5vdCByYW5nZXMgb3IgbWl4ZWQgZnJhY3Rpb24uIEdvb2QgY2FzZXM6ICcxIGN1cCBmbG91cicsICcyIGVnZ3MnLiBCYWQgY2FzZXM6ICcxLTIgY3VwcyBmbG91cicsICd+MSB0c3Agc3VnYXInLCcxIDEvMiBjdXBzIGZsb3VyJ1wiLFxuICAgICksXG59KVxuXG5leHBvcnQgY29uc3QgR2VuUmVjaXBlSW5wdXRTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgdHlwZTogei5lbnVtKFsndXJsJywgJ3RleHQnLCAnaW1hZ2UnXSksXG4gICAgY29udGVudDogei5zdHJpbmcoKSxcbn0pXG5cbmNvbnN0IHByb21wdCA9IGBcbllvdSBhcmUgYSByZWNpcGUgZ2VuZXJhdG9yLiBcbllvdSB3aWxsIGJlIGdpdmVuIGEgY29udGVudCBvZiB1cmwsIHRleHQsIG9yIGltYWdlLCBwbGVhc2UgZ2VuZXJhdGUgYSByZWNpcGUgYmFzZWQgb24gdGhlIGNvbnRlbnQuXG5UcnkgeW91ciBiZXN0IHRvIGdlbmVyYXRlIGEgcmVjaXBlLCBldmVuIHRoZSBpbnN0cnVjdGlvbnMgb3IgaW5ncmVkaWVudHMgYXJlIG5vdCBjb21wbGV0ZSBvciBub3QgYWNjdXJhdGUsIHBsZWFzZSB0cnkgeW91ciBiZXN0IHRvIGdlbmVyYXRlIHRoZSByZWNpcGUuXG5PdGhlciB0aGFuIHRoZSBjb250ZW50IGlzIG5vdCBhIHJlY2lwZSwgcGxlYXNlIHJldHVybiBhbiBlcnJvciBtZXNzYWdlLlxuYFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlblJlY2lwZShjOiBDb250ZXh0PHsgVmFyaWFibGVzOiBJU2VydmVyQ29udGV4dCB9PiwgaW5wdXQ6IHouaW5mZXI8dHlwZW9mIEdlblJlY2lwZUlucHV0U2NoZW1hPik6IFByb21pc2U8QXBpUmVzcG9uc2U8ei5pbmZlcjx0eXBlb2YgR2VuUmVjaXBlT3V0cHV0U2NoZW1hPj4+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWRSZXN1bHQgPSBHZW5SZWNpcGVJbnB1dFNjaGVtYS5zYWZlUGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAoIXBhcnNlZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yU3RyaW5naWZ5KHBhcnNlZFJlc3VsdC5lcnJvciksXG4gICAgICAgICAgICAgICAgY29kZTogRXJyb3JDb2RlLklOVkFMSURfUkVRVUVTVF9QQVJBTVMsXG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHR5cGUsIGNvbnRlbnQgfSA9IGlucHV0O1xuICAgICAgICBsZXQgbWVzc2FnZXM6IE1vZGVsTWVzc2FnZVtdID0gW107XG4gICAgICAgIGlmICh0eXBlID09PSAndXJsJykge1xuICAgICAgICAgICAgbWVzc2FnZXMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgVGhlIGZvbGxvdyBjb250ZW50IGlzIHJlYWQgZnJvbSBhIHVybCwgcGxlYXNlIGdlbmVyYXRlIGEgcmVjaXBlIGJhc2VkIG9uIHRoZSBjb250ZW50IG9mIHRoZSB1cmwuXG4gICAgICAgICAgICAgICAgICAgICAke2NvbnRlbnR9XG4gICAgICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgbWVzc2FnZXMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgVGhlIGZvbGxvdyBjb250ZW50IGlzIHJlYWQgZnJvbSBhIHRleHQsIHBsZWFzZSBnZW5lcmF0ZSBhIHJlY2lwZSBiYXNlZCBvbiB0aGUgY29udGVudCBvZiB0aGUgdGV4dC5cbiAgICAgICAgICAgICAgICAgICAgJHtjb250ZW50fVxuICAgICAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnaW1hZ2UnKSB7XG4gICAgICAgICAgICBtZXNzYWdlcyA9IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhVHlwZTogJ2ltYWdlL2pwZWcnLFxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUGxlYXNlIGdlbmVyYXRlIGEgcmVjaXBlIGJhc2VkIG9uIHRoZSBjb250ZW50IG9mIHRoZSBpbWFnZS4nLFxuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgICAgYy52YXIubG9nZ2VyLmluZm8oXCJbZ2VuIHJlY2lwZV06IG1lc3NhZ2VzOiAlb1wiLCB7XG4gICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgIHR5cGVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdlbmVyYXRlT2JqZWN0KHtcbiAgICAgICAgICAgIHNjaGVtYTogei5vYmplY3Qoe1xuICAgICAgICAgICAgICAgIHJlY2lwZTogR2VuUmVjaXBlT3V0cHV0U2NoZW1hLm51bGxhYmxlKCkub3B0aW9uYWwoKS5kZXNjcmliZSgncmVjaXBlIGlmIHRoZSBjb250ZW50IGlzIGEgcmVjaXBlJyksXG4gICAgICAgICAgICAgICAgZXJyb3I6IHouc3RyaW5nKCkubnVsbGFibGUoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdlcnJvciBtZXNzYWdlIGlmIHRoZSBjb250ZW50IGlzIG5vdCBhIHJlY2lwZScpLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgIG1vZGVsOiBzZWNyZXRDb25maWcuTExNX0ZBU1RfTU9ERUwgPz8gJydcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlY2lwZSA9IHJlc3VsdC5vYmplY3Q/LnJlY2lwZTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSByZXN1bHQub2JqZWN0Py5lcnJvcjtcbiAgICAgICAgaWYgKCFyZWNpcGUpIHtcbiAgICAgICAgICAgIGMudmFyLmxvZ2dlci5pbmZvKFwiW2dlbiByZWNpcGVdOiBlbXB0eSByZXN1bHQ6ICVvXCIsIHtcbiAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnZW1wdHkgcmVzdWx0JyxcbiAgICAgICAgICAgICAgICBjb2RlOiBFcnJvckNvZGUuVU5LTk9XTl9TRVJWRVJfRVJST1IsXG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYy52YXIubG9nZ2VyLmRlYnVnKFwiW2dlbiByZWNpcGVdOiBzdWNjZXNzOiAlb1wiLCB7XG4gICAgICAgICAgICByZWNpcGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWVzc2FnZTogJ1N1Y2Nlc3MnLFxuICAgICAgICAgICAgY29kZTogMCxcbiAgICAgICAgICAgIGRhdGE6IHsgLi4ucmVjaXBlIH0sXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjLnZhci5sb2dnZXIuZXJyb3IoXCJbZ2VuIHJlY2lwZV06IGVycm9yOiAlb1wiLCB7XG4gICAgICAgICAgICBlcnJvcjogZXJyb3JTdHJpbmdpZnkoZXJyb3IpLFxuICAgICAgICAgICAgaW5wdXRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclN0cmluZ2lmeShlcnJvciksXG4gICAgICAgICAgICBjb2RlOiBFcnJvckNvZGUuVU5LTk9XTl9TRVJWRVJfRVJST1IsXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICB9XG4gICAgfVxufVxuIl19