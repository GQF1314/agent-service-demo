import { BaseService } from "./base";
import { BatchUpdateTaskItem, CreateTaskRequest, ICreateTask, ICreateTasksRequest, IDeleteTasksRequest, ITask, IUpdateTask, IUpdateTasksRequest, ITaskEntity } from "../interface/entities/task";
export declare class TaskService extends BaseService {
    createTasks: ICreateTasksRequest;
    updateTasks: IUpdateTasksRequest;
    deleteTasks: IDeleteTasksRequest;
    createTasksWrapper: (tasks: ICreateTask[]) => Promise<import("./type").IResponse<import("../interface/entities/task").BatchTaskOperationResult>>;
    updateTasksWrapper: (tasks: IUpdateTask[]) => Promise<import("./type").IResponse<import("../interface/entities/task").BatchTaskOperationResult>>;
    deleteTasksWrapper: (tasks: string[]) => Promise<import("./type").IResponse<import("../interface/entities/task").BatchTaskOperationResult>>;
    transformTaskToITask: (task?: ITaskEntity) => ITask | undefined;
    ICreateTaskToCreateTaskRequest: (task: ICreateTask) => CreateTaskRequest;
    IUpdateTaskToUpdateTaskRequest: (task: IUpdateTask) => BatchUpdateTaskItem;
}
