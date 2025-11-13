export interface IResponse<T> {
    data?: T | null;
    message: string;
    code: number;
}
export type UUID = string;
export type DateString = string;
export type DateTimeString = string;
export declare enum IEntityType {
    calendar = "calendar",
    task = "task",
    recipe = "recipe",
    mealPlan = "mealPlan",
    shoppingItem = "shoppingItem"
}
