export interface IResponse<T> {
    data?: T|null;
    message: string;
    code: number;
}

export type UUID = string;
export type DateString = string; // YYYY-MM-DD 格式
export type DateTimeString = string; // ISO 8601 格式

export enum IEntityType{
    calendar='calendar',
    task='task',
    recipe='recipe',
    mealPlan='mealPlan',
    shoppingItem='shoppingItem'
}