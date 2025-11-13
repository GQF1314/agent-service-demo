import { BaseService } from "./base";
import { IResponse } from "./type";
import { IBatchAddRecipesToMealPlansRequest, IBatchCreateMealPlansRequest, IBatchDeleteMealPlanRequest, IBatchMealPlanOperationResult, IBatchUpdateMealPlanRequest } from "../interface/entities/mealPlan";
export declare class MealPlanService extends BaseService {
    deleteMealPlans: (mealPlans: IBatchDeleteMealPlanRequest) => Promise<IResponse<IBatchMealPlanOperationResult>>;
    createMealPlans: (mealPlans: IBatchCreateMealPlansRequest) => Promise<IResponse<IBatchMealPlanOperationResult>>;
    addRecipesToMealPlans: (mealPlans: IBatchAddRecipesToMealPlansRequest) => Promise<IResponse<IBatchMealPlanOperationResult>>;
    updateMealPlans: (mealPlans: IBatchUpdateMealPlanRequest) => Promise<IResponse<IBatchMealPlanOperationResult>>;
}
