import z from "zod";
import { ApiResponse } from "./type";
import { Context } from "hono";
import { IServerContext } from "../types/server";
export declare const GenRecipeOutputSchema: z.ZodObject<{
    name: z.ZodString;
    cooking_time: z.ZodNumber;
    servings: z.ZodNumber;
    instructions: z.ZodArray<z.ZodObject<{
        step: z.ZodNumber;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        step: number;
    }, {
        content: string;
        step: number;
    }>, "many">;
    ingredients_query: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    cooking_time: number;
    servings: number;
    instructions: {
        content: string;
        step: number;
    }[];
    ingredients_query: string[];
}, {
    name: string;
    cooking_time: number;
    servings: number;
    instructions: {
        content: string;
        step: number;
    }[];
    ingredients_query: string[];
}>;
export declare const GenRecipeInputSchema: z.ZodObject<{
    type: z.ZodEnum<["url", "text", "image"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    type: "url" | "text" | "image";
}, {
    content: string;
    type: "url" | "text" | "image";
}>;
export declare function genRecipe(c: Context<{
    Variables: IServerContext;
}>, input: z.infer<typeof GenRecipeInputSchema>): Promise<ApiResponse<z.infer<typeof GenRecipeOutputSchema>>>;
