import { BaseService } from "./base";
import { BatchUpdateTaskItem, CreateTaskRequest, ICreateTask, ICreateTasksRequest, IDeleteTasksRequest, ITask, IUpdateTask, IUpdateTasksRequest, ReminderMethod, ITaskEntity, TaskPrivacyLevel } from "../interface/entities/task";
import { normalizeTime, toLlmData } from "./utils";

export class TaskService extends BaseService {
    public createTasks: ICreateTasksRequest = async (tasks) => {
        return this.request('/task/batch/tasks', 'POST', {
            data: tasks
        });
    }
    public updateTasks: IUpdateTasksRequest = async (tasks) => {
        return this.request('/task/batch/tasks/update', 'POST', {
            data: tasks
        });
    }
    public deleteTasks: IDeleteTasksRequest = async (tasks) => {
        return this.request('/task/batch/tasks', 'DELETE', {
            data: tasks
        });
    }
    public createTasksWrapper = async (tasks: ICreateTask[]) => {
        return this.createTasks({tasks:tasks.map(task => this.ICreateTaskToCreateTaskRequest(task))});
    }
    public updateTasksWrapper = async (tasks: IUpdateTask[]) => {
        return this.updateTasks({tasks:tasks.map(task => this.IUpdateTaskToUpdateTaskRequest(task))});
    }
    public deleteTasksWrapper = async (tasks: string[]) => {
        return this.deleteTasks({tasks:tasks.map(id => ({id}))});
    }

    public transformTaskToITask=(task?: ITaskEntity) =>{
        if (!task) return undefined;
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          location: task.location?.address,
          rrule: task.rrule,
          assignees: task.assignees?.map(assignee => assignee.role_id),
          is_completed: task.is_completed,
          completed_at: task.completed_at,
          completed_by_role: task.completed_by_role,
          list_id: task.list_id,
          reminderRule:task.reminders?.map(reminder => ({
            method: reminder.method as ReminderMethod,
            minutes_offset: reminder.minutes_offset,
          })),
          ...toLlmData({
            start_on: task.start_on,
            end_on: task.end_on,
            start_at: task.start_at,
            end_at: task.end_at,
            all_day: task.all_day,
            timeZone: this.context.timeZone,
          }),
        } as  ITask;
      }
    
      public ICreateTaskToCreateTaskRequest=(task: ICreateTask): CreateTaskRequest =>{
        return {
          title: task.title,
          description: task.description,
          location: task.location ? { address: task.location } : undefined,
          rrule: task.rrule,
          privacy_level: TaskPrivacyLevel.Family,
          //todo 未确定
          use_default_reminders: true,
          assignees: task.assignees?.map(assignee => ({ role_id: assignee })),
          ...normalizeTime({
            end: task.end,
            all_day: !!task.all_day,
            timeZone: this.context.timeZone,
          }),
        } as CreateTaskRequest;
      }
    
      public IUpdateTaskToUpdateTaskRequest=(task: IUpdateTask) =>{
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          location: task.location ? { address: task.location } : undefined,
          rrule: task.rrule,
          assignees: task.assignees?.map(assignee => ({ role_id: assignee })),
          reminders: task.reminderRule,
          is_completed: task.is_completed,
          ...normalizeTime({
            end: task.end,
            all_day: !!task.all_day,
            timeZone: this.context.timeZone,
          }),
        } as BatchUpdateTaskItem;
      }
}