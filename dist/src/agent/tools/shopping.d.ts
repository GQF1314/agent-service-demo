export declare const createShoppingItemTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    items: string[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
        message: string | undefined;
    };
}>;
export declare const updateShoppingItemTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    items: {
        id: string;
        title?: string | null | undefined;
        quantity?: string | null | undefined;
        unit?: string | null | undefined;
    }[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
        message: string | undefined;
    };
}>;
export declare const deleteShoppingItemTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    ids: string[];
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
        message: string | undefined;
    };
}>;
export declare const searchShoppingItemTool: (context: import("./utils").IToolContext) => import("ai").Tool<{
    query?: string | null | undefined;
    ids?: string[] | null | undefined;
}, {
    success: boolean;
    ids: string[];
    entities: import("../../services/interface/entities/shoopingItem").IShoppingItemEntity[];
    modelVisibleData: {
        data: import("../../services/interface/entities/shoopingItem").IShoppingItem[];
    };
}>;
