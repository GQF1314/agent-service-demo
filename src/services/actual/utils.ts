// date-fns, extract date from ISO time string, ignoring timezone
import { parseISO } from "date-fns";
import { formatInTimeZone, format } from "date-fns-tz";
export function normalizeTime(parms: {
    start?: string;
    end?: string;
    all_day?: boolean;
    timeZone: string;
}) {
    const { start, end, all_day, timeZone } = parms;
    if (all_day) {
        const startDate = start? formatInTimeZone(start, timeZone, "yyyy-MM-dd"):undefined;
        const endDate = end? formatInTimeZone(end, timeZone, "yyyy-MM-dd"):undefined;
        return {
            start_on: startDate,
            end_on: endDate,
            all_day: all_day,
        };
    }

    return {
        start_at: start?formatInTimeZone(start, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"):undefined,
        all_day: all_day,
        end_at: end?formatInTimeZone(end, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"):undefined,
    };
}


export function tollmTime(parms: {
    start_on?: string;
    end_on?: string;
    start_at?: string;
    end_at?: string;
    all_day: boolean;
    timeZone: string;
}) {
    const { all_day, start_on, end_on, start_at, end_at, timeZone } = parms;
    if(!all_day){
        return {
            start_at,
            end_at,
            all_day,
        };
    }
    return {
        start_at: start_at,
        end_at: end_at,
        all_day,
    };
}

/**
 * Converts a date string with timezone to the start of that day in the specified timezone
 * @param dateString - The date string in format "yyyy-MM-dd"
 * @param timeZone - The timezone string (e.g., "Asia/Shanghai")
 * @returns ISO string with timezone offset for the start of the day
 * 
 * Example:
 * convertToStartOfDay("2025-09-04", "Asia/Shanghai") 
 * returns "2025-09-04T00:00:00+08:00"
 */
 function convertToStartOfDay(dateString: string, timeZone: string): string {
    // Use the date string as-is and create the datetime string directly
    return `${dateString}T00:00:00${getTimezoneOffset(dateString, timeZone)}`;
}

/**
 * Converts a date string with timezone to the end of that day in the specified timezone
 * @param dateString - The date string in format "yyyy-MM-dd"
 * @param timeZone - The timezone string (e.g., "Asia/Shanghai")
 * @returns ISO string with timezone offset for the end of the day (23:59:59)
 * 
 * Example:
 * convertToEndOfDay("2025-09-04", "Asia/Shanghai") 
 * returns "2025-09-04T23:59:59+08:00"
 */
 function convertToEndOfDay(dateString: string, timeZone: string): string {
    // Use the date string as-is and create the datetime string directly
    return `${dateString}T23:59:59${getTimezoneOffset(dateString, timeZone)}`;
}

/**
 * Helper function to get the timezone offset for a given date and timezone
 * @param dateString - The date string in format "yyyy-MM-dd"
 * @param timeZone - The timezone string (e.g., "Asia/Shanghai")
 * @returns The timezone offset string (e.g., "+08:00")
 */
function getTimezoneOffset(dateString: string, timeZone: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return formatInTimeZone(utcDate, timeZone, "XXX");
}


export function toLlmData(parms: {
    start_on?: string;
    end_on?: string;
    start_at?: string;
    end_at?: string;
    all_day?: boolean;
    timeZone: string;
}) {
    const { all_day, start_on, end_on, start_at, end_at, timeZone } = parms;
    if(!all_day){
        return {
            start:start_at?formatInTimeZone(start_at, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"):undefined,
            end:end_at?formatInTimeZone(end_at, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"):undefined,
            all_day,
        };
    }
    return {
        start: start_on?convertToStartOfDay(start_on, timeZone):undefined,
        end: end_on?convertToEndOfDay(end_on, timeZone):undefined,
        all_day,
    };
}

