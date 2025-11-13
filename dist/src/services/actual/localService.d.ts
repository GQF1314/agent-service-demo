import { BaseService } from "./base";
export declare class LocalService extends BaseService {
    search: ({ query }: {
        query: string;
    }) => Promise<{
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
    private extractContent;
    readUrl: ({ url }: {
        url: string;
    }) => Promise<{
        success: boolean;
        content: string;
    }>;
}
