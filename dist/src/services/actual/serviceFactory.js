"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFactory = void 0;
const calendar_1 = require("./calendar");
const combined_1 = require("./combined");
const localService_1 = require("./localService");
const mealPlan_1 = require("./mealPlan");
const recipe_1 = require("./recipe");
const shoppingItem_1 = require("./shoppingItem");
const task_1 = require("./task");
class ServiceFactory {
    context;
    calendarService;
    taskService;
    localService;
    combinedService;
    recipeService;
    mealPlanService;
    shoppingService;
    constructor(context) {
        this.context = context;
        this.calendarService = new calendar_1.CalendarService(this.context);
        this.taskService = new task_1.TaskService(this.context);
        this.localService = new localService_1.LocalService(this.context);
        this.recipeService = new recipe_1.RecipeService(this.context);
        this.mealPlanService = new mealPlan_1.MealPlanService(this.context);
        this.shoppingService = new shoppingItem_1.ShoppingItemService(this.context);
        this.combinedService = new combined_1.CombinedService(this.context, {
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
exports.ServiceFactory = ServiceFactory;
// Export a default instance for convenience
// export const serviceFactory = new ServiceFactory();
// Export test utilities
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZUZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2VydmljZXMvYWN0dWFsL3NlcnZpY2VGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlDQUE2QztBQUM3Qyx5Q0FBNkM7QUFDN0MsaURBQThDO0FBQzlDLHlDQUE2QztBQUM3QyxxQ0FBeUM7QUFDekMsaURBQXFEO0FBQ3JELGlDQUFxQztBQUVyQyxNQUFhLGNBQWM7SUFDZixPQUFPLENBQW1DO0lBQzFDLGVBQWUsQ0FBa0I7SUFDakMsV0FBVyxDQUFjO0lBQ3pCLFlBQVksQ0FBZTtJQUMzQixlQUFlLENBQWtCO0lBQ2pDLGFBQWEsQ0FBZ0I7SUFDN0IsZUFBZSxDQUFrQjtJQUNqQyxlQUFlLENBQXNCO0lBQzdDLFlBQVksT0FBeUM7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLDBCQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxrQkFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHNCQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSwwQkFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksa0NBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSwwQkFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUM7WUFDcEQsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtTQUN4QyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLGNBQWM7UUFDVixPQUFPO1lBQ0gsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVztZQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQzlCLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYTtZQUMxQixRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDOUIsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlO1NBQ2pDLENBQUM7SUFDTixDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLE9BQU87UUFDSCw0REFBNEQ7UUFDNUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsYUFBYTtRQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLGFBQWE7UUFDYixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixhQUFhO1FBQ2IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsYUFBYTtRQUNiLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLGFBQWE7UUFDYixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixhQUFhO1FBQ2IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsYUFBYTtRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUM7Q0FDSjtBQTNERCx3Q0EyREM7QUFFRCw0Q0FBNEM7QUFDNUMsc0RBQXNEO0FBRXRELHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElDb21tb25Db250ZXh0IH0gZnJvbSBcIi4uLy4uL2FnZW50L3R5cGVzL2FnZW50XCI7XG5pbXBvcnQgeyBDYWxlbmRhclNlcnZpY2UgfSBmcm9tIFwiLi9jYWxlbmRhclwiO1xuaW1wb3J0IHsgQ29tYmluZWRTZXJ2aWNlIH0gZnJvbSBcIi4vY29tYmluZWRcIjtcbmltcG9ydCB7IExvY2FsU2VydmljZSB9IGZyb20gXCIuL2xvY2FsU2VydmljZVwiO1xuaW1wb3J0IHsgTWVhbFBsYW5TZXJ2aWNlIH0gZnJvbSBcIi4vbWVhbFBsYW5cIjtcbmltcG9ydCB7IFJlY2lwZVNlcnZpY2UgfSBmcm9tIFwiLi9yZWNpcGVcIjtcbmltcG9ydCB7IFNob3BwaW5nSXRlbVNlcnZpY2UgfSBmcm9tIFwiLi9zaG9wcGluZ0l0ZW1cIjtcbmltcG9ydCB7IFRhc2tTZXJ2aWNlIH0gZnJvbSBcIi4vdGFza1wiO1xuXG5leHBvcnQgY2xhc3MgU2VydmljZUZhY3Rvcnkge1xuICAgIHByaXZhdGUgY29udGV4dDogT21pdDxJQ29tbW9uQ29udGV4dCwgXCJzZXJ2aWNlc1wiPjtcbiAgICBwcml2YXRlIGNhbGVuZGFyU2VydmljZTogQ2FsZW5kYXJTZXJ2aWNlO1xuICAgIHByaXZhdGUgdGFza1NlcnZpY2U6IFRhc2tTZXJ2aWNlO1xuICAgIHByaXZhdGUgbG9jYWxTZXJ2aWNlOiBMb2NhbFNlcnZpY2U7XG4gICAgcHJpdmF0ZSBjb21iaW5lZFNlcnZpY2U6IENvbWJpbmVkU2VydmljZTtcbiAgICBwcml2YXRlIHJlY2lwZVNlcnZpY2U6IFJlY2lwZVNlcnZpY2U7XG4gICAgcHJpdmF0ZSBtZWFsUGxhblNlcnZpY2U6IE1lYWxQbGFuU2VydmljZTtcbiAgICBwcml2YXRlIHNob3BwaW5nU2VydmljZTogU2hvcHBpbmdJdGVtU2VydmljZTtcbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBPbWl0PElDb21tb25Db250ZXh0LCBcInNlcnZpY2VzXCI+KSB7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlID0gbmV3IENhbGVuZGFyU2VydmljZSh0aGlzLmNvbnRleHQpO1xuICAgICAgICB0aGlzLnRhc2tTZXJ2aWNlID0gbmV3IFRhc2tTZXJ2aWNlKHRoaXMuY29udGV4dCk7XG4gICAgICAgIHRoaXMubG9jYWxTZXJ2aWNlID0gbmV3IExvY2FsU2VydmljZSh0aGlzLmNvbnRleHQpO1xuICAgICAgICB0aGlzLnJlY2lwZVNlcnZpY2UgPSBuZXcgUmVjaXBlU2VydmljZSh0aGlzLmNvbnRleHQpO1xuICAgICAgICB0aGlzLm1lYWxQbGFuU2VydmljZSA9IG5ldyBNZWFsUGxhblNlcnZpY2UodGhpcy5jb250ZXh0KTtcbiAgICAgICAgdGhpcy5zaG9wcGluZ1NlcnZpY2UgPSBuZXcgU2hvcHBpbmdJdGVtU2VydmljZSh0aGlzLmNvbnRleHQpO1xuICAgICAgICB0aGlzLmNvbWJpbmVkU2VydmljZSA9IG5ldyBDb21iaW5lZFNlcnZpY2UodGhpcy5jb250ZXh0LHtcbiAgICAgICAgICAgIGNhbGVuZGFyU2VydmljZTogdGhpcy5jYWxlbmRhclNlcnZpY2UsXG4gICAgICAgICAgICB0YXNrU2VydmljZTogdGhpcy50YXNrU2VydmljZSxcbiAgICAgICAgICAgIHJlY2lwZVNlcnZpY2U6IHRoaXMucmVjaXBlU2VydmljZSxcbiAgICAgICAgICAgIG1lYWxQbGFuU2VydmljZTogdGhpcy5tZWFsUGxhblNlcnZpY2UsXG4gICAgICAgICAgICBzaG9wcGluZ1NlcnZpY2U6IHRoaXMuc2hvcHBpbmdTZXJ2aWNlLFxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8vIEdldCBhbGwgc2VydmljZXMgYXMgYW4gb2JqZWN0XG4gICAgZ2V0QWxsU2VydmljZXMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjYWxlbmRhcjogdGhpcy5jYWxlbmRhclNlcnZpY2UsXG4gICAgICAgICAgICB0YXNrOiB0aGlzLnRhc2tTZXJ2aWNlLFxuICAgICAgICAgICAgbG9jYWw6IHRoaXMubG9jYWxTZXJ2aWNlLFxuICAgICAgICAgICAgY29tYmluZWQ6IHRoaXMuY29tYmluZWRTZXJ2aWNlLFxuICAgICAgICAgICAgcmVjaXBlOiB0aGlzLnJlY2lwZVNlcnZpY2UsXG4gICAgICAgICAgICBtZWFsUGxhbjogdGhpcy5tZWFsUGxhblNlcnZpY2UsXG4gICAgICAgICAgICBzaG9wcGluZzogdGhpcy5zaG9wcGluZ1NlcnZpY2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQ2xlYW51cCBtZXRob2QgdG8gcmVsZWFzZSByZWZlcmVuY2VzIGFuZCBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBDbGVhciByZWZlcmVuY2VzIHRvIGFsbG93IGdhcmJhZ2UgY29sbGVjdGlvblxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZSA9IG51bGw7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy50YXNrU2VydmljZSA9IG51bGw7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZpY2UgPSBudWxsO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuY29tYmluZWRTZXJ2aWNlID0gbnVsbDtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnJlY2lwZVNlcnZpY2UgPSBudWxsO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMubWVhbFBsYW5TZXJ2aWNlID0gbnVsbDtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNob3BwaW5nU2VydmljZSA9IG51bGw7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcbiAgICB9XG59XG5cbi8vIEV4cG9ydCBhIGRlZmF1bHQgaW5zdGFuY2UgZm9yIGNvbnZlbmllbmNlXG4vLyBleHBvcnQgY29uc3Qgc2VydmljZUZhY3RvcnkgPSBuZXcgU2VydmljZUZhY3RvcnkoKTtcblxuLy8gRXhwb3J0IHRlc3QgdXRpbGl0aWVzXG4iXX0=