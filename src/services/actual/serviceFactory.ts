import { ICommonContext } from "../../agent/types/agent";
import { CalendarService } from "./calendar";
import { CombinedService } from "./combined";
import { LocalService } from "./localService";
import { MealPlanService } from "./mealPlan";
import { RecipeService } from "./recipe";
import { ShoppingItemService } from "./shoppingItem";
import { TaskService } from "./task";

export class ServiceFactory {
    private context: Omit<ICommonContext, "services">;
    private calendarService: CalendarService;
    private taskService: TaskService;
    private localService: LocalService;
    private combinedService: CombinedService;
    private recipeService: RecipeService;
    private mealPlanService: MealPlanService;
    private shoppingService: ShoppingItemService;
    constructor(context: Omit<ICommonContext, "services">) {
        this.context = context;
        this.calendarService = new CalendarService(this.context);
        this.taskService = new TaskService(this.context);
        this.localService = new LocalService(this.context);
        this.recipeService = new RecipeService(this.context);
        this.mealPlanService = new MealPlanService(this.context);
        this.shoppingService = new ShoppingItemService(this.context);
        this.combinedService = new CombinedService(this.context,{
            calendarService: this.calendarService,
            taskService: this.taskService,
            recipeService: this.recipeService,
            mealPlanService: this.mealPlanService,
            shoppingService: this.shoppingService,
        });

    }

    // Get all services as an object
    getAllServices() {
        return {
            calendar: this.calendarService,
            task: this.taskService,
            local: this.localService,
            combined: this.combinedService,
            recipe: this.recipeService,
            mealPlan: this.mealPlanService,
            shopping: this.shoppingService,
        };
    }

    // Cleanup method to release references and prevent memory leaks
    dispose() {
        // @ts-ignore - Clear references to allow garbage collection
        this.calendarService = null;
        // @ts-ignore
        this.taskService = null;
        // @ts-ignore
        this.localService = null;
        // @ts-ignore
        this.combinedService = null;
        // @ts-ignore
        this.recipeService = null;
        // @ts-ignore
        this.mealPlanService = null;
        // @ts-ignore
        this.shoppingService = null;
        // @ts-ignore
        this.context = null;
    }
}

// Export a default instance for convenience
// export const serviceFactory = new ServiceFactory();

// Export test utilities
