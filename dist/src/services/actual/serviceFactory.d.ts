import { ICommonContext } from "../../agent/types/agent";
import { CalendarService } from "./calendar";
import { CombinedService } from "./combined";
import { LocalService } from "./localService";
import { MealPlanService } from "./mealPlan";
import { RecipeService } from "./recipe";
import { ShoppingItemService } from "./shoppingItem";
import { TaskService } from "./task";
export declare class ServiceFactory {
    private context;
    private calendarService;
    private taskService;
    private localService;
    private combinedService;
    private recipeService;
    private mealPlanService;
    private shoppingService;
    constructor(context: Omit<ICommonContext, "services">);
    getAllServices(): {
        calendar: CalendarService;
        task: TaskService;
        local: LocalService;
        combined: CombinedService;
        recipe: RecipeService;
        mealPlan: MealPlanService;
        shopping: ShoppingItemService;
    };
    dispose(): void;
}
