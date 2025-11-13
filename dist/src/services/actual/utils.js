"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTime = normalizeTime;
exports.tollmTime = tollmTime;
exports.toLlmData = toLlmData;
const date_fns_tz_1 = require("date-fns-tz");
function normalizeTime(parms) {
    const { start, end, all_day, timeZone } = parms;
    if (all_day) {
        const startDate = start ? (0, date_fns_tz_1.formatInTimeZone)(start, timeZone, "yyyy-MM-dd") : undefined;
        const endDate = end ? (0, date_fns_tz_1.formatInTimeZone)(end, timeZone, "yyyy-MM-dd") : undefined;
        return {
            start_on: startDate,
            end_on: endDate,
            all_day: all_day,
        };
    }
    return {
        start_at: start ? (0, date_fns_tz_1.formatInTimeZone)(start, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
        all_day: all_day,
        end_at: end ? (0, date_fns_tz_1.formatInTimeZone)(end, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
    };
}
function tollmTime(parms) {
    const { all_day, start_on, end_on, start_at, end_at, timeZone } = parms;
    if (!all_day) {
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
function convertToStartOfDay(dateString, timeZone) {
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
function convertToEndOfDay(dateString, timeZone) {
    // Use the date string as-is and create the datetime string directly
    return `${dateString}T23:59:59${getTimezoneOffset(dateString, timeZone)}`;
}
/**
 * Helper function to get the timezone offset for a given date and timezone
 * @param dateString - The date string in format "yyyy-MM-dd"
 * @param timeZone - The timezone string (e.g., "Asia/Shanghai")
 * @returns The timezone offset string (e.g., "+08:00")
 */
function getTimezoneOffset(dateString, timeZone) {
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return (0, date_fns_tz_1.formatInTimeZone)(utcDate, timeZone, "XXX");
}
function toLlmData(parms) {
    const { all_day, start_on, end_on, start_at, end_at, timeZone } = parms;
    if (!all_day) {
        return {
            start: start_at ? (0, date_fns_tz_1.formatInTimeZone)(start_at, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
            end: end_at ? (0, date_fns_tz_1.formatInTimeZone)(end_at, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
            all_day,
        };
    }
    return {
        start: start_on ? convertToStartOfDay(start_on, timeZone) : undefined,
        end: end_on ? convertToEndOfDay(end_on, timeZone) : undefined,
        all_day,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2VydmljZXMvYWN0dWFsL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esc0NBc0JDO0FBR0QsOEJBcUJDO0FBNkNELDhCQXFCQztBQWpIRCw2Q0FBdUQ7QUFDdkQsU0FBZ0IsYUFBYSxDQUFDLEtBSzdCO0lBQ0csTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNoRCxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ1YsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQyxJQUFBLDhCQUFnQixFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUEsQ0FBQyxDQUFBLFNBQVMsQ0FBQztRQUNuRixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUEsQ0FBQyxDQUFDLElBQUEsOEJBQWdCLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQSxDQUFDLENBQUEsU0FBUyxDQUFDO1FBQzdFLE9BQU87WUFDSCxRQUFRLEVBQUUsU0FBUztZQUNuQixNQUFNLEVBQUUsT0FBTztZQUNmLE9BQU8sRUFBRSxPQUFPO1NBQ25CLENBQUM7SUFDTixDQUFDO0lBRUQsT0FBTztRQUNILFFBQVEsRUFBRSxLQUFLLENBQUEsQ0FBQyxDQUFBLElBQUEsOEJBQWdCLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFBLENBQUMsQ0FBQSxTQUFTO1FBQ3ZGLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUEsQ0FBQyxDQUFBLElBQUEsOEJBQWdCLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFBLENBQUMsQ0FBQSxTQUFTO0tBQ3BGLENBQUM7QUFDTixDQUFDO0FBR0QsU0FBZ0IsU0FBUyxDQUFDLEtBT3pCO0lBQ0csTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ3hFLElBQUcsQ0FBQyxPQUFPLEVBQUMsQ0FBQztRQUNULE9BQU87WUFDSCxRQUFRO1lBQ1IsTUFBTTtZQUNOLE9BQU87U0FDVixDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU87UUFDSCxRQUFRLEVBQUUsUUFBUTtRQUNsQixNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU87S0FDVixDQUFDO0FBQ04sQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNGLFNBQVMsbUJBQW1CLENBQUMsVUFBa0IsRUFBRSxRQUFnQjtJQUM5RCxvRUFBb0U7SUFDcEUsT0FBTyxHQUFHLFVBQVUsWUFBWSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztBQUM5RSxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0YsU0FBUyxpQkFBaUIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCO0lBQzVELG9FQUFvRTtJQUNwRSxPQUFPLEdBQUcsVUFBVSxZQUFZLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO0FBQzlFLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUFnQjtJQUMzRCxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3RCxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsT0FBTyxJQUFBLDhCQUFnQixFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUdELFNBQWdCLFNBQVMsQ0FBQyxLQU96QjtJQUNHLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUN4RSxJQUFHLENBQUMsT0FBTyxFQUFDLENBQUM7UUFDVCxPQUFPO1lBQ0gsS0FBSyxFQUFDLFFBQVEsQ0FBQSxDQUFDLENBQUEsSUFBQSw4QkFBZ0IsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixDQUFDLENBQUEsQ0FBQyxDQUFBLFNBQVM7WUFDekYsR0FBRyxFQUFDLE1BQU0sQ0FBQSxDQUFDLENBQUEsSUFBQSw4QkFBZ0IsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixDQUFDLENBQUEsQ0FBQyxDQUFBLFNBQVM7WUFDbkYsT0FBTztTQUNWLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTztRQUNILEtBQUssRUFBRSxRQUFRLENBQUEsQ0FBQyxDQUFBLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQSxDQUFDLENBQUEsU0FBUztRQUNqRSxHQUFHLEVBQUUsTUFBTSxDQUFBLENBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUEsQ0FBQyxDQUFBLFNBQVM7UUFDekQsT0FBTztLQUNWLENBQUM7QUFDTixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZGF0ZS1mbnMsIGV4dHJhY3QgZGF0ZSBmcm9tIElTTyB0aW1lIHN0cmluZywgaWdub3JpbmcgdGltZXpvbmVcbmltcG9ydCB7IHBhcnNlSVNPIH0gZnJvbSBcImRhdGUtZm5zXCI7XG5pbXBvcnQgeyBmb3JtYXRJblRpbWVab25lLCBmb3JtYXQgfSBmcm9tIFwiZGF0ZS1mbnMtdHpcIjtcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVUaW1lKHBhcm1zOiB7XG4gICAgc3RhcnQ/OiBzdHJpbmc7XG4gICAgZW5kPzogc3RyaW5nO1xuICAgIGFsbF9kYXk/OiBib29sZWFuO1xuICAgIHRpbWVab25lOiBzdHJpbmc7XG59KSB7XG4gICAgY29uc3QgeyBzdGFydCwgZW5kLCBhbGxfZGF5LCB0aW1lWm9uZSB9ID0gcGFybXM7XG4gICAgaWYgKGFsbF9kYXkpIHtcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gc3RhcnQ/IGZvcm1hdEluVGltZVpvbmUoc3RhcnQsIHRpbWVab25lLCBcInl5eXktTU0tZGRcIik6dW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBlbmREYXRlID0gZW5kPyBmb3JtYXRJblRpbWVab25lKGVuZCwgdGltZVpvbmUsIFwieXl5eS1NTS1kZFwiKTp1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydF9vbjogc3RhcnREYXRlLFxuICAgICAgICAgICAgZW5kX29uOiBlbmREYXRlLFxuICAgICAgICAgICAgYWxsX2RheTogYWxsX2RheSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydF9hdDogc3RhcnQ/Zm9ybWF0SW5UaW1lWm9uZShzdGFydCwgdGltZVpvbmUsIFwieXl5eS1NTS1kZCdUJ0hIOm1tOnNzWFhYXCIpOnVuZGVmaW5lZCxcbiAgICAgICAgYWxsX2RheTogYWxsX2RheSxcbiAgICAgICAgZW5kX2F0OiBlbmQ/Zm9ybWF0SW5UaW1lWm9uZShlbmQsIHRpbWVab25lLCBcInl5eXktTU0tZGQnVCdISDptbTpzc1hYWFwiKTp1bmRlZmluZWQsXG4gICAgfTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdG9sbG1UaW1lKHBhcm1zOiB7XG4gICAgc3RhcnRfb24/OiBzdHJpbmc7XG4gICAgZW5kX29uPzogc3RyaW5nO1xuICAgIHN0YXJ0X2F0Pzogc3RyaW5nO1xuICAgIGVuZF9hdD86IHN0cmluZztcbiAgICBhbGxfZGF5OiBib29sZWFuO1xuICAgIHRpbWVab25lOiBzdHJpbmc7XG59KSB7XG4gICAgY29uc3QgeyBhbGxfZGF5LCBzdGFydF9vbiwgZW5kX29uLCBzdGFydF9hdCwgZW5kX2F0LCB0aW1lWm9uZSB9ID0gcGFybXM7XG4gICAgaWYoIWFsbF9kYXkpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnRfYXQsXG4gICAgICAgICAgICBlbmRfYXQsXG4gICAgICAgICAgICBhbGxfZGF5LFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydF9hdDogc3RhcnRfYXQsXG4gICAgICAgIGVuZF9hdDogZW5kX2F0LFxuICAgICAgICBhbGxfZGF5LFxuICAgIH07XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkYXRlIHN0cmluZyB3aXRoIHRpbWV6b25lIHRvIHRoZSBzdGFydCBvZiB0aGF0IGRheSBpbiB0aGUgc3BlY2lmaWVkIHRpbWV6b25lXG4gKiBAcGFyYW0gZGF0ZVN0cmluZyAtIFRoZSBkYXRlIHN0cmluZyBpbiBmb3JtYXQgXCJ5eXl5LU1NLWRkXCJcbiAqIEBwYXJhbSB0aW1lWm9uZSAtIFRoZSB0aW1lem9uZSBzdHJpbmcgKGUuZy4sIFwiQXNpYS9TaGFuZ2hhaVwiKVxuICogQHJldHVybnMgSVNPIHN0cmluZyB3aXRoIHRpbWV6b25lIG9mZnNldCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBkYXlcbiAqIFxuICogRXhhbXBsZTpcbiAqIGNvbnZlcnRUb1N0YXJ0T2ZEYXkoXCIyMDI1LTA5LTA0XCIsIFwiQXNpYS9TaGFuZ2hhaVwiKSBcbiAqIHJldHVybnMgXCIyMDI1LTA5LTA0VDAwOjAwOjAwKzA4OjAwXCJcbiAqL1xuIGZ1bmN0aW9uIGNvbnZlcnRUb1N0YXJ0T2ZEYXkoZGF0ZVN0cmluZzogc3RyaW5nLCB0aW1lWm9uZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBVc2UgdGhlIGRhdGUgc3RyaW5nIGFzLWlzIGFuZCBjcmVhdGUgdGhlIGRhdGV0aW1lIHN0cmluZyBkaXJlY3RseVxuICAgIHJldHVybiBgJHtkYXRlU3RyaW5nfVQwMDowMDowMCR7Z2V0VGltZXpvbmVPZmZzZXQoZGF0ZVN0cmluZywgdGltZVpvbmUpfWA7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkYXRlIHN0cmluZyB3aXRoIHRpbWV6b25lIHRvIHRoZSBlbmQgb2YgdGhhdCBkYXkgaW4gdGhlIHNwZWNpZmllZCB0aW1lem9uZVxuICogQHBhcmFtIGRhdGVTdHJpbmcgLSBUaGUgZGF0ZSBzdHJpbmcgaW4gZm9ybWF0IFwieXl5eS1NTS1kZFwiXG4gKiBAcGFyYW0gdGltZVpvbmUgLSBUaGUgdGltZXpvbmUgc3RyaW5nIChlLmcuLCBcIkFzaWEvU2hhbmdoYWlcIilcbiAqIEByZXR1cm5zIElTTyBzdHJpbmcgd2l0aCB0aW1lem9uZSBvZmZzZXQgZm9yIHRoZSBlbmQgb2YgdGhlIGRheSAoMjM6NTk6NTkpXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBjb252ZXJ0VG9FbmRPZkRheShcIjIwMjUtMDktMDRcIiwgXCJBc2lhL1NoYW5naGFpXCIpIFxuICogcmV0dXJucyBcIjIwMjUtMDktMDRUMjM6NTk6NTkrMDg6MDBcIlxuICovXG4gZnVuY3Rpb24gY29udmVydFRvRW5kT2ZEYXkoZGF0ZVN0cmluZzogc3RyaW5nLCB0aW1lWm9uZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBVc2UgdGhlIGRhdGUgc3RyaW5nIGFzLWlzIGFuZCBjcmVhdGUgdGhlIGRhdGV0aW1lIHN0cmluZyBkaXJlY3RseVxuICAgIHJldHVybiBgJHtkYXRlU3RyaW5nfVQyMzo1OTo1OSR7Z2V0VGltZXpvbmVPZmZzZXQoZGF0ZVN0cmluZywgdGltZVpvbmUpfWA7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGdldCB0aGUgdGltZXpvbmUgb2Zmc2V0IGZvciBhIGdpdmVuIGRhdGUgYW5kIHRpbWV6b25lXG4gKiBAcGFyYW0gZGF0ZVN0cmluZyAtIFRoZSBkYXRlIHN0cmluZyBpbiBmb3JtYXQgXCJ5eXl5LU1NLWRkXCJcbiAqIEBwYXJhbSB0aW1lWm9uZSAtIFRoZSB0aW1lem9uZSBzdHJpbmcgKGUuZy4sIFwiQXNpYS9TaGFuZ2hhaVwiKVxuICogQHJldHVybnMgVGhlIHRpbWV6b25lIG9mZnNldCBzdHJpbmcgKGUuZy4sIFwiKzA4OjAwXCIpXG4gKi9cbmZ1bmN0aW9uIGdldFRpbWV6b25lT2Zmc2V0KGRhdGVTdHJpbmc6IHN0cmluZywgdGltZVpvbmU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgW3llYXIsIG1vbnRoLCBkYXldID0gZGF0ZVN0cmluZy5zcGxpdCgnLScpLm1hcChOdW1iZXIpO1xuICAgIGNvbnN0IHV0Y0RhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgMCwgMCwgMCkpO1xuICAgIHJldHVybiBmb3JtYXRJblRpbWVab25lKHV0Y0RhdGUsIHRpbWVab25lLCBcIlhYWFwiKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdG9MbG1EYXRhKHBhcm1zOiB7XG4gICAgc3RhcnRfb24/OiBzdHJpbmc7XG4gICAgZW5kX29uPzogc3RyaW5nO1xuICAgIHN0YXJ0X2F0Pzogc3RyaW5nO1xuICAgIGVuZF9hdD86IHN0cmluZztcbiAgICBhbGxfZGF5PzogYm9vbGVhbjtcbiAgICB0aW1lWm9uZTogc3RyaW5nO1xufSkge1xuICAgIGNvbnN0IHsgYWxsX2RheSwgc3RhcnRfb24sIGVuZF9vbiwgc3RhcnRfYXQsIGVuZF9hdCwgdGltZVpvbmUgfSA9IHBhcm1zO1xuICAgIGlmKCFhbGxfZGF5KXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OnN0YXJ0X2F0P2Zvcm1hdEluVGltZVpvbmUoc3RhcnRfYXQsIHRpbWVab25lLCBcInl5eXktTU0tZGQnVCdISDptbTpzc1hYWFwiKTp1bmRlZmluZWQsXG4gICAgICAgICAgICBlbmQ6ZW5kX2F0P2Zvcm1hdEluVGltZVpvbmUoZW5kX2F0LCB0aW1lWm9uZSwgXCJ5eXl5LU1NLWRkJ1QnSEg6bW06c3NYWFhcIik6dW5kZWZpbmVkLFxuICAgICAgICAgICAgYWxsX2RheSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0X29uP2NvbnZlcnRUb1N0YXJ0T2ZEYXkoc3RhcnRfb24sIHRpbWVab25lKTp1bmRlZmluZWQsXG4gICAgICAgIGVuZDogZW5kX29uP2NvbnZlcnRUb0VuZE9mRGF5KGVuZF9vbiwgdGltZVpvbmUpOnVuZGVmaW5lZCxcbiAgICAgICAgYWxsX2RheSxcbiAgICB9O1xufVxuXG4iXX0=