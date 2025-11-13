import { BaseService } from "./base";
import { BatchUpdateEventItemData, CreateEventRequestData, IEventEntity, ICreateEvent, IEvent, IUpdateEvent } from "../interface/entities/event";
export declare class CalendarService extends BaseService {
    private createEvents;
    private updateEvents;
    private deleteEvents;
    createEventsWrapper: (events: ICreateEvent[]) => Promise<import("./type").IResponse<import("../interface/entities/event").BatchOperationResult>>;
    updateEventsWrapper: (events: IUpdateEvent[]) => Promise<import("./type").IResponse<import("../interface/entities/event").BatchOperationResult>>;
    deleteEventsWrapper: (events: string[]) => Promise<import("./type").IResponse<import("../interface/entities/event").BatchOperationResult>>;
    ICreateEventToCreateEventRequest: (event: ICreateEvent) => CreateEventRequestData;
    IUpdateEventToUpdateEventRequest: (event: IUpdateEvent) => BatchUpdateEventItemData;
    transformEventToIEvent: (event?: IEventEntity) => IEvent | undefined;
}
