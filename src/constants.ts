export enum ErrorCode{
    UNKNOWN_EXECUTION_ERROR=1000,
    ROUTE_ERROR=1001,
    UNKNOWN_ROUTE_ERROR=1002,
    UNKNOWN_SERVER_ERROR=1003,
    INVALID_REQUEST_PARAMS=1004,
    UNEXPECTED_RESPONSE_TYPE=1005,
}


export const errorStringify=(error:unknown)=>{
    if(error instanceof Error){
        return `message:${error.message}\nstack:${error.stack}\nname:${error.name}`;
    }
    try {
        return JSON.stringify(error);
    } catch (error) {
        return String(error);
    }
}


export const FamilyIDHeaderKey = "X-Family-ID"
export const TimezoneHeaderKey = "X-Timezone"
export const UserIDHeaderKey = "X-User-ID"
export const TraceIDHeaderKey = "TraceId"