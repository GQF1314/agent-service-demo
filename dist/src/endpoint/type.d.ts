export type ApiResponse<T> = {
    message: string;
    code: number;
    data: T | null;
};
