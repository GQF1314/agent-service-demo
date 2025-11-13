export declare enum ErrorCode {
    UNKNOWN_EXECUTION_ERROR = 1000,
    ROUTE_ERROR = 1001,
    UNKNOWN_ROUTE_ERROR = 1002,
    UNKNOWN_SERVER_ERROR = 1003,
    INVALID_REQUEST_PARAMS = 1004,
    UNEXPECTED_RESPONSE_TYPE = 1005
}
export declare const errorStringify: (error: unknown) => string;
export declare const FamilyIDHeaderKey = "X-Family-ID";
export declare const TimezoneHeaderKey = "X-Timezone";
export declare const UserIDHeaderKey = "X-User-ID";
export declare const TraceIDHeaderKey = "TraceId";
