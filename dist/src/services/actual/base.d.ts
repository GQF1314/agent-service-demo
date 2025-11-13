import { ICommonContext } from "../../agent/types/agent";
export declare abstract class BaseService {
    readonly context: Omit<ICommonContext, "services">;
    private readonly baseUrl;
    private readonly token;
    constructor(context: Omit<ICommonContext, "services">);
    /**
     * Mock response generator for testing without real API calls
     */
    private getMockResponse;
    request: <T>(url: string, method: string, params: {
        data?: Record<string, any>;
        query?: Record<string, any>;
    }) => Promise<T>;
}
