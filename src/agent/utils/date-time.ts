import { parseISO, format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Use date-fns to convert UTC time string to format with specified timezone (keeping time unchanged)
 * @param {string} utcTime - UTC time string with Z, e.g. '2025-08-01T10:00:00Z'
 * @param {number} timezoneOffset - Timezone offset in hours (e.g. +8 for UTC+8, -5 for UTC-5)
 * @returns {string} Time string with timezone, e.g. '2025-08-01T10:00:00+08:00'
 */
export function formatWithTimezone(utcTime:string, timezoneOffset:number) {
    const date = parseISO(utcTime);
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const hours = Math.abs(timezoneOffset).toString().padStart(2, '0');
    const timezoneStr = `${sign}${hours}:00`;
    const timePart = format(date, "yyyy-MM-dd'T'HH:mm:ss");
    return `${timePart}${timezoneStr}`;
}

export function clearTimezone(date: Date) {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}



/**
 * Use formatInTimeZone to convert UTC time to time string in specified timezone
 * @param {string} utcString - UTC time string (e.g. '2025-08-01T10:00:00Z')
 * @param {string} targetTimezone - Target timezone (IANA identifier, e.g. 'Asia/Shanghai')
 * @param {string} [formatStr="yyyy-MM-dd'T'HH:mm:ssXXX"] - Output format
 * @returns {string} Time string in target timezone
 */
export function utcToTimezoneDate(utcString:string, targetTimezone:string) {
    const timeWithoutTimezone = utcString.replace(/[+-]\d{2}:\d{2}$|Z$/, '');
    const date = parseISO(`${timeWithoutTimezone}Z`);
    return toZonedTime(date, targetTimezone);
}
