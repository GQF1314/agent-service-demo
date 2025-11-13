/**
 * Use date-fns to convert UTC time string to format with specified timezone (keeping time unchanged)
 * @param {string} utcTime - UTC time string with Z, e.g. '2025-08-01T10:00:00Z'
 * @param {number} timezoneOffset - Timezone offset in hours (e.g. +8 for UTC+8, -5 for UTC-5)
 * @returns {string} Time string with timezone, e.g. '2025-08-01T10:00:00+08:00'
 */
export declare function formatWithTimezone(utcTime: string, timezoneOffset: number): string;
export declare function clearTimezone(date: Date): string;
/**
 * Use formatInTimeZone to convert UTC time to time string in specified timezone
 * @param {string} utcString - UTC time string (e.g. '2025-08-01T10:00:00Z')
 * @param {string} targetTimezone - Target timezone (IANA identifier, e.g. 'Asia/Shanghai')
 * @param {string} [formatStr="yyyy-MM-dd'T'HH:mm:ssXXX"] - Output format
 * @returns {string} Time string in target timezone
 */
export declare function utcToTimezoneDate(utcString: string, targetTimezone: string): Date;
