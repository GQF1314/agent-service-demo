import { ICommonContext } from "../../agent/types/agent";
import config from "config";
import {
    ErrorCode,
    FamilyIDHeaderKey,
    TimezoneHeaderKey,
    TraceIDHeaderKey,
    UserIDHeaderKey,
} from "../../constants";
import { AppConfig } from "../../index";
const secretConfig = config.get<AppConfig["secret"]>("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}

const BaseUrl = config.get<string>("service.baseUrl");
const ServiceToken = config.get<string>("service.token");

export abstract class BaseService {
    private readonly baseUrl: string = BaseUrl;
    private readonly token: string = ServiceToken;
    constructor(public readonly context: Omit<ICommonContext, "services">) {
        this.context = context;
    }

    /**
     * Mock response generator for testing without real API calls
     */
    private getMockResponse<T>(url: string, method: string, params: any): T {
        this.context.logger.info(`[MOCK] ${method} ${url}`, { params });

        // Mock response for recipe creation
        if (url.includes('/recipes/batch_create')) {
            const items = params.data?.items || [];
            return {
                code: 200,
                data: {
                    recipes: items.map((item: any, index: number) => ({
                        id: `mock-recipe-${Date.now()}-${index}`,
                        name: item.name || "Mock Recipe",
                        cooking_time: item.cooking_time || null,
                        servings: item.servings || null,
                        instructions: item.instructions || [],
                        ingredients: item.ingredients_query || [],
                        note: item.note || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }))
                },
                message: "Mock: Recipes created successfully"
            } as T;
        }

        // Mock response for recipe search
        if (url.includes('/recipes') && method === 'GET') {
            return {
                code: 200,
                data: {
                    recipes: [],
                    total: 0
                },
                message: "Mock: Recipe search completed"
            } as T;
        }

        // Mock response for meal plan creation
        if (url.includes('/meal-plans/batch_create')) {
            return {
                code: 200,
                data: {
                    meal_plans: (params.data?.mealPlans || []).map((plan: any) => ({
                        id: `mock-mealplan-${Date.now()}`,
                        ...plan,
                        created_at: new Date().toISOString(),
                    }))
                },
                message: "Mock: Meal plans created successfully"
            } as T;
        }

        // Default mock success response
        return {
            code: 200,
            data: {},
            message: "Mock: Operation successful"
        } as T;
    }

    request = async <T>(url: string, method: string, params: {
        data?: Record<string, any>;
        query?: Record<string, any>;
    }): Promise<T> => {
        // Check if mock mode is enabled
        const useMock = config.get<boolean>("service.useMock");
        if (useMock) {
            return this.getMockResponse<T>(url, method, params);
        }

        const queryString = new URLSearchParams(params.query).toString();
        const { familyId, userId, timeZone, traceId } = this.context;
        const reqUrl = `${this.baseUrl}${url}${queryString ? `?${queryString}` : ""
            }`;
        const headers = {
            "Content-Type": "application/json",
            [FamilyIDHeaderKey]: familyId,
            [UserIDHeaderKey]: userId,
            [TimezoneHeaderKey]: timeZone,
            [TraceIDHeaderKey]: traceId,
            "Authorization": `Bearer ${this.token}`,
        }

        let response: Response;


        try {
            response = await fetch(
                reqUrl,
                {
                    method,
                    body: JSON.stringify(params.data),
                    headers,
                },
            );
        } catch (fetchError) {
            // 获取更详细的网络错误信息
            const isNetworkError = fetchError instanceof TypeError && 
                (fetchError.message.includes('fetch') || 
                 fetchError.message.includes('network') ||
                 fetchError.message.includes('ECONNREFUSED') ||
                 fetchError.message.includes('ENOTFOUND') ||
                 fetchError.message.includes('ETIMEDOUT'));

            this.context.logger.error(`[api]: fetch request failed: %o`, {
                reqUrl,
                method,
                params,
                headers,
                error: fetchError,
                errorMessage: fetchError instanceof Error
                    ? fetchError.message
                    : String(fetchError),
                errorName: fetchError instanceof Error
                    ? fetchError.name
                    : "Unknown",
                errorStack: fetchError instanceof Error
                    ? fetchError.stack
                    : undefined,
                isNetworkError,
                errorCode: (fetchError as any)?.code,
                errorErrno: (fetchError as any)?.errno,
                errorSyscall: (fetchError as any)?.syscall,
                errorHostname: (fetchError as any)?.hostname,
                errorPort: (fetchError as any)?.port,
                timestamp: new Date().toISOString(),
            });

            // Provide more detailed error information
            const errorMessage = fetchError instanceof Error
                ? `unknown error when request: ${fetchError.message}`
                : `unknown error when request: ${String(fetchError)}`;

            throw {
                code: ErrorCode.UNKNOWN_SERVER_ERROR,
                message: errorMessage,
                originalError: fetchError,
                requestDetails: {
                    url: reqUrl,
                    method,
                    baseUrl: this.baseUrl,
                    endpoint: url,
                },
            };
        }
        const contentType = response.headers.get("content-type");
        const headersObj = Object.fromEntries(response.headers.entries());

        if (contentType?.includes("application/json")) {
            const data = (await response.json()) as any;
            if (![200, 0].includes(data.code)) {
                this.context.logger.error(`[api]: request from tool error: %o`, {
                    reqUrl,
                    method,
                    params,
                    data,
                    headersObj
                });
                throw {
                    code: ErrorCode.UNEXPECTED_RESPONSE_TYPE,
                    message:
                        `unexpected  tool request error: ${data?.message}`,
                };
            }

            this.context.logger.info(`[api]: request from tool success: %o`, {
                reqUrl,
                method,
                params,
                data,
                headersObj
            });
            return data;
        } else {
            const textData = await response.text();
            const headersObj = Object.fromEntries(response.headers.entries());

            this.context.logger.error(`[api]: request from tool error: %o`, {
                reqUrl,
                method,
                params,
                resp: textData,
                respLength: textData.length,
                contentType,
                status: response.status,
                statusText: response.statusText,
                responseOk: response.ok,
                responseType: response.type,
                responseUrl: response.url,
                responseRedirected: response.redirected,
                repHeaders: headersObj,
                hasResponseBody: !!textData,
                timestamp: new Date().toISOString(),
                // 服务器环境信息
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                }
            });
            throw {
                code: ErrorCode.UNEXPECTED_RESPONSE_TYPE,
                message:
                    `unexpected network error`,
            };
        }
    };
}