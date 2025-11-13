import { generateObject, ModelMessage } from "ai";
import z from "zod";
import config from "config";
import { AppConfig } from "..";
import { ErrorCode, errorStringify } from "../constants";
import { ApiResponse } from "./type";
import { Context } from "hono";
import { IServerContext } from "../types/server";
const secretConfig = config.get<AppConfig['secret']>("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}

export const GenRecipeOutputSchema = z.object({
    name: z.string(),
    cooking_time: z.number().describe('cooking time in minutes'),
    servings: z.number().describe('number of servings'),
    instructions: z.array(z.object({
        // Define according to actual InstructionList structure
        step: z.number(),
        content: z.string(),
        // Other fields...
    })), // Define according to actual InstructionList structure
    ingredients_query: z.array(z.string()).describe(
        "Ingredients in format: quantity unit name. Quantity must be an exact number(integer or float), not ranges or mixed fraction. Good cases: '1 cup flour', '2 eggs'. Bad cases: '1-2 cups flour', '~1 tsp sugar','1 1/2 cups flour'",
    ),
})

export const GenRecipeInputSchema = z.object({
    type: z.enum(['url', 'text', 'image']),
    content: z.string(),
})

const prompt = `
You are a recipe generator. 
You will be given a content of url, text, or image, please generate a recipe based on the content.
Try your best to generate a recipe, even the instructions or ingredients are not complete or not accurate, please try your best to generate the recipe.
Other than the content is not a recipe, please return an error message.
`
export async function genRecipe(c: Context<{ Variables: IServerContext }>, input: z.infer<typeof GenRecipeInputSchema>): Promise<ApiResponse<z.infer<typeof GenRecipeOutputSchema>>> {
    try {
        const parsedResult = GenRecipeInputSchema.safeParse(input);
        if (!parsedResult.success) {
            return {
                message: errorStringify(parsedResult.error),
                code: ErrorCode.INVALID_REQUEST_PARAMS,
                data: null,
            }
        }
        const { type, content } = input;
        let messages: ModelMessage[] = [];
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
            ]
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
            ]
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
            ]
        }
        c.var.logger.info("[gen recipe]: messages: %o", {
            messages,
            type
        });
        const result = await generateObject({
            schema: z.object({
                recipe: GenRecipeOutputSchema.nullable().optional().describe('recipe if the content is a recipe'),
                error: z.string().nullable().optional().describe('error message if the content is not a recipe'),
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
                code: ErrorCode.UNKNOWN_SERVER_ERROR,
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
        }
    } catch (error) {
        c.var.logger.error("[gen recipe]: error: %o", {
            error: errorStringify(error),
            input
        });
        return {
            message: errorStringify(error),
            code: ErrorCode.UNKNOWN_SERVER_ERROR,
            data: null,
        }
    }
}
