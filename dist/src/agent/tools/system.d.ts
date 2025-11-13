import { ReplyType } from "./utils";
export declare const codeInterpreterTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    code: string;
}, {
    success: boolean;
    result: any;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    result?: undefined;
}>;
export declare const webSearchTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query: string;
}, {
    success: boolean;
    search_results: {
        title: string;
        url: string;
    }[];
    search_summary: string;
    modelVisibleData: {
        data: {
            search_summary: string;
        };
    };
}>;
export declare const replyToUserTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    content: string;
    responseType: ReplyType;
}, string>;
export declare const readUrlTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    url: string;
}, {
    success: boolean;
    modelVisibleData: {
        content: string;
    };
}>;
