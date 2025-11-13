"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatWithTimezone = formatWithTimezone;
exports.clearTimezone = clearTimezone;
exports.utcToTimezoneDate = utcToTimezoneDate;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
/**
 * Use date-fns to convert UTC time string to format with specified timezone (keeping time unchanged)
 * @param {string} utcTime - UTC time string with Z, e.g. '2025-08-01T10:00:00Z'
 * @param {number} timezoneOffset - Timezone offset in hours (e.g. +8 for UTC+8, -5 for UTC-5)
 * @returns {string} Time string with timezone, e.g. '2025-08-01T10:00:00+08:00'
 */
function formatWithTimezone(utcTime, timezoneOffset) {
    const date = (0, date_fns_1.parseISO)(utcTime);
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const hours = Math.abs(timezoneOffset).toString().padStart(2, '0');
    const timezoneStr = `${sign}${hours}:00`;
    const timePart = (0, date_fns_1.format)(date, "yyyy-MM-dd'T'HH:mm:ss");
    return `${timePart}${timezoneStr}`;
}
function clearTimezone(date) {
    return (0, date_fns_1.format)(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}
/**
 * Use formatInTimeZone to convert UTC time to time string in specified timezone
 * @param {string} utcString - UTC time string (e.g. '2025-08-01T10:00:00Z')
 * @param {string} targetTimezone - Target timezone (IANA identifier, e.g. 'Asia/Shanghai')
 * @param {string} [formatStr="yyyy-MM-dd'T'HH:mm:ssXXX"] - Output format
 * @returns {string} Time string in target timezone
 */
function utcToTimezoneDate(utcString, targetTimezone) {
    const timeWithoutTimezone = utcString.replace(/[+-]\d{2}:\d{2}$|Z$/, '');
    const date = (0, date_fns_1.parseISO)(`${timeWithoutTimezone}Z`);
    return (0, date_fns_tz_1.toZonedTime)(date, targetTimezone);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FnZW50L3V0aWxzL2RhdGUtdGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVNBLGdEQU9DO0FBRUQsc0NBRUM7QUFXRCw4Q0FJQztBQW5DRCx1Q0FBNEM7QUFDNUMsNkNBQTREO0FBRTVEOzs7OztHQUtHO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsT0FBYyxFQUFFLGNBQXFCO0lBQ3BFLE1BQU0sSUFBSSxHQUFHLElBQUEsbUJBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUMvQixNQUFNLElBQUksR0FBRyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbkUsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUM7SUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBQSxpQkFBTSxFQUFDLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sR0FBRyxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDdkMsQ0FBQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFVO0lBQ3BDLE9BQU8sSUFBQSxpQkFBTSxFQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFJRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxTQUFnQixFQUFFLGNBQXFCO0lBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RSxNQUFNLElBQUksR0FBRyxJQUFBLG1CQUFRLEVBQUMsR0FBRyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7SUFDakQsT0FBTyxJQUFBLHlCQUFXLEVBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwYXJzZUlTTywgZm9ybWF0IH0gZnJvbSAnZGF0ZS1mbnMnO1xuaW1wb3J0IHsgZm9ybWF0SW5UaW1lWm9uZSwgdG9ab25lZFRpbWUgfSBmcm9tICdkYXRlLWZucy10eic7XG5cbi8qKlxuICogVXNlIGRhdGUtZm5zIHRvIGNvbnZlcnQgVVRDIHRpbWUgc3RyaW5nIHRvIGZvcm1hdCB3aXRoIHNwZWNpZmllZCB0aW1lem9uZSAoa2VlcGluZyB0aW1lIHVuY2hhbmdlZClcbiAqIEBwYXJhbSB7c3RyaW5nfSB1dGNUaW1lIC0gVVRDIHRpbWUgc3RyaW5nIHdpdGggWiwgZS5nLiAnMjAyNS0wOC0wMVQxMDowMDowMFonXG4gKiBAcGFyYW0ge251bWJlcn0gdGltZXpvbmVPZmZzZXQgLSBUaW1lem9uZSBvZmZzZXQgaW4gaG91cnMgKGUuZy4gKzggZm9yIFVUQys4LCAtNSBmb3IgVVRDLTUpXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaW1lIHN0cmluZyB3aXRoIHRpbWV6b25lLCBlLmcuICcyMDI1LTA4LTAxVDEwOjAwOjAwKzA4OjAwJ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0V2l0aFRpbWV6b25lKHV0Y1RpbWU6c3RyaW5nLCB0aW1lem9uZU9mZnNldDpudW1iZXIpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VJU08odXRjVGltZSk7XG4gICAgY29uc3Qgc2lnbiA9IHRpbWV6b25lT2Zmc2V0ID49IDAgPyAnKycgOiAnLSc7XG4gICAgY29uc3QgaG91cnMgPSBNYXRoLmFicyh0aW1lem9uZU9mZnNldCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgIGNvbnN0IHRpbWV6b25lU3RyID0gYCR7c2lnbn0ke2hvdXJzfTowMGA7XG4gICAgY29uc3QgdGltZVBhcnQgPSBmb3JtYXQoZGF0ZSwgXCJ5eXl5LU1NLWRkJ1QnSEg6bW06c3NcIik7XG4gICAgcmV0dXJuIGAke3RpbWVQYXJ0fSR7dGltZXpvbmVTdHJ9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyVGltZXpvbmUoZGF0ZTogRGF0ZSkge1xuICAgIHJldHVybiBmb3JtYXQoZGF0ZSwgXCJ5eXl5LU1NLWRkJ1QnSEg6bW06c3MnWidcIik7XG59XG5cblxuXG4vKipcbiAqIFVzZSBmb3JtYXRJblRpbWVab25lIHRvIGNvbnZlcnQgVVRDIHRpbWUgdG8gdGltZSBzdHJpbmcgaW4gc3BlY2lmaWVkIHRpbWV6b25lXG4gKiBAcGFyYW0ge3N0cmluZ30gdXRjU3RyaW5nIC0gVVRDIHRpbWUgc3RyaW5nIChlLmcuICcyMDI1LTA4LTAxVDEwOjAwOjAwWicpXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0VGltZXpvbmUgLSBUYXJnZXQgdGltZXpvbmUgKElBTkEgaWRlbnRpZmllciwgZS5nLiAnQXNpYS9TaGFuZ2hhaScpXG4gKiBAcGFyYW0ge3N0cmluZ30gW2Zvcm1hdFN0cj1cInl5eXktTU0tZGQnVCdISDptbTpzc1hYWFwiXSAtIE91dHB1dCBmb3JtYXRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRpbWUgc3RyaW5nIGluIHRhcmdldCB0aW1lem9uZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRjVG9UaW1lem9uZURhdGUodXRjU3RyaW5nOnN0cmluZywgdGFyZ2V0VGltZXpvbmU6c3RyaW5nKSB7XG4gICAgY29uc3QgdGltZVdpdGhvdXRUaW1lem9uZSA9IHV0Y1N0cmluZy5yZXBsYWNlKC9bKy1dXFxkezJ9OlxcZHsyfSR8WiQvLCAnJyk7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlSVNPKGAke3RpbWVXaXRob3V0VGltZXpvbmV9WmApO1xuICAgIHJldHVybiB0b1pvbmVkVGltZShkYXRlLCB0YXJnZXRUaW1lem9uZSk7XG59XG4iXX0=