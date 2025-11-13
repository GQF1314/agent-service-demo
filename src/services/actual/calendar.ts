import { BaseService } from "./base";
import {
    BatchUpdateEventItemData,
    CreateEventRequestData,
    IEventEntity,
    ICreateEvent,
    ICreateEventsRequest,
    IDeleteEventsRequest,
    IEvent,
    IUpdateEvent,
    IUpdateEventsRequest,
    PrivacyLevel,
    ReminderMethod,
} from "../interface/entities/event";
import { normalizeTime, toLlmData } from "./utils";

export class CalendarService extends BaseService {
    private createEvents: ICreateEventsRequest = async (events) => {
        return this.request("/calendar/batch/events", "POST", {
            data: events,
        });
    };
    private updateEvents: IUpdateEventsRequest = async (events) => {
        return this.request("/calendar/batch/events/update", "POST", {
            data: events,
        });
    };
    private deleteEvents: IDeleteEventsRequest = async (events) => {
        return this.request("/calendar/batch/events/delete", "DELETE", {
            data: events,
        });
    };
    public createEventsWrapper = async (events: ICreateEvent[]) => {
        return this.createEvents({
            events: events.map((event) =>
                this.ICreateEventToCreateEventRequest(event)
            ),
        });
    };
    public updateEventsWrapper = async (events: IUpdateEvent[]) => {
        return this.updateEvents({
            events: events.map((event) =>
                this.IUpdateEventToUpdateEventRequest(event)
            ),
        });
    };
    public deleteEventsWrapper = async (events: string[]) => {
        return this.deleteEvents({ events: events.map((id) => ({ id })) });
    };
    public ICreateEventToCreateEventRequest = (
        event: ICreateEvent,
    ): CreateEventRequestData => {
        // TODO: handle this
        const { default_calendar } = this.context.userBrief.calendar;
        return {
            title: event.title,
            description: event.description,
            location: event.location ? { address: event.location } : undefined,
            rrule: event.rrule,
            attendees: event.attendees?.map((attendee) => ({
                role_id: attendee,
            })),
            use_default_reminders: event.use_default_reminders,
            reminders: event.reminderRule,
            calendar_id: default_calendar?.calendar_id??'',
            privacy_level: PrivacyLevel.Family,
            ...normalizeTime({
                start: event.start,
                end: event.end,
                all_day: !!event.all_day,
                timeZone: this.context.timeZone,
            }),
        };
    };

    public IUpdateEventToUpdateEventRequest = (event: IUpdateEvent) => {
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location ? { address: event.location } : undefined,
            rrule: event.rrule,
            attendees: event.attendees?.map((attendee) => ({
                role_id: attendee,
            })),
            reminders: event.reminderRule,
            status: event.status,
            use_default_reminders: event.use_default_reminders,
            ...normalizeTime({
                start: event.start,
                end: event.end,
                all_day: !!event.all_day,
                timeZone: this.context.timeZone,
            }),
        } as BatchUpdateEventItemData;
    };

    public transformEventToIEvent = (event?: IEventEntity) => {
        if (!event) return undefined;
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location?.address,
            // TODO: confirm this
            // use_default_reminders: event.,
            rrule: event.rrule,
            attendees: event.attendees?.map((attendee) => attendee.role_id),
            reminderRule: event.reminders?.map((reminder) => ({
                method: reminder.method as ReminderMethod,
                minutes_offset: reminder.minutes,
            })),
            ...toLlmData({
                start_on: event.start_on,
                end_on: event.end_on,
                start_at: event.start_at,
                end_at: event.end_at,
                all_day: event.all_day,
                timeZone: this.context.timeZone,
            }),
        } as IEvent;
    };
}
