"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectTextFromStream = collectTextFromStream;
exports.collectAllEventsFromStream = collectAllEventsFromStream;
/**
 * 从SSE流中收集所有文本内容
 * 阻塞等待直到流结束，然后返回拼接后的文本
 */
async function collectTextFromStream(stream) {
    const reader = stream.getReader();
    const textChunks = [];
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // value 是 SSE 格式的数据: "data: {...}\n\n"
            // 需要解析出JSON部分
            const lines = value.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const jsonStr = line.substring(6); // 去掉 "data: " 前缀
                        const data = JSON.parse(jsonStr);
                        // 只收集 text-delta 类型的数据，这是实际的文本内容
                        if (data.type === "text-delta" && "text" in data) {
                            textChunks.push(data.text);
                        }
                    }
                    catch (e) {
                        // 忽略解析错误，可能是空行或其他格式
                        continue;
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
    // 拼接所有文本片段
    return textChunks.join("");
}
/**
 * 从SSE流中收集所有事件数据（用于调试或更复杂的处理）
 */
async function collectAllEventsFromStream(stream) {
    const reader = stream.getReader();
    const events = [];
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const lines = value.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const jsonStr = line.substring(6);
                        const data = JSON.parse(jsonStr);
                        events.push(data);
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
    return events;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLXRleHQtY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3N0cmVhbS10ZXh0LWNvbGxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLHNEQXlDQztBQUtELGdFQWlDQztBQW5GRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUscUJBQXFCLENBQ3pDLE1BQThCO0lBRTlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNsQyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7SUFFaEMsSUFBSSxDQUFDO1FBQ0gsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFNUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDVCxNQUFNO1lBQ1IsQ0FBQztZQUVELHVDQUF1QztZQUN2QyxjQUFjO1lBQ2QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxDQUFDO3dCQUNILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7d0JBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFtQixDQUFDO3dCQUVuRCxpQ0FBaUM7d0JBQ2pDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLElBQUksTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDOzRCQUNqRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDN0IsQ0FBQztvQkFDSCxDQUFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ1gsb0JBQW9CO3dCQUNwQixTQUFTO29CQUNYLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztZQUFTLENBQUM7UUFDVCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFdBQVc7SUFDWCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLDBCQUEwQixDQUM5QyxNQUE4QjtJQUU5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbEMsTUFBTSxNQUFNLEdBQXFCLEVBQUUsQ0FBQztJQUVwQyxJQUFJLENBQUM7UUFDSCxPQUFPLElBQUksRUFBRSxDQUFDO1lBQ1osTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU1QyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNULE1BQU07WUFDUixDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxDQUFDO3dCQUNILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFtQixDQUFDO3dCQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixDQUFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ1gsU0FBUztvQkFDWCxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU91dHB1dE1lc3NhZ2UgfSBmcm9tIFwiLi4vYWdlbnQvdHlwZXMvb3V0cHV0LW1lc3NhZ2VcIjtcblxuLyoqXG4gKiDku45TU0XmtYHkuK3mlLbpm4bmiYDmnInmlofmnKzlhoXlrrlcbiAqIOmYu+WhnuetieW+heebtOWIsOa1gee7k+adn++8jOeEtuWQjui/lOWbnuaLvOaOpeWQjueahOaWh+acrFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29sbGVjdFRleHRGcm9tU3RyZWFtKFxuICBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPHN0cmluZz5cbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHJlYWRlciA9IHN0cmVhbS5nZXRSZWFkZXIoKTtcbiAgY29uc3QgdGV4dENodW5rczogc3RyaW5nW10gPSBbXTtcblxuICB0cnkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXG4gICAgICBpZiAoZG9uZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gdmFsdWUg5pivIFNTRSDmoLzlvI/nmoTmlbDmja46IFwiZGF0YTogey4uLn1cXG5cXG5cIlxuICAgICAgLy8g6ZyA6KaB6Kej5p6Q5Ye6SlNPTumDqOWIhlxuICAgICAgY29uc3QgbGluZXMgPSB2YWx1ZS5zcGxpdChcIlxcblwiKTtcblxuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJkYXRhOiBcIikpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QganNvblN0ciA9IGxpbmUuc3Vic3RyaW5nKDYpOyAvLyDljrvmjokgXCJkYXRhOiBcIiDliY3nvIBcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHIpIGFzIElPdXRwdXRNZXNzYWdlO1xuXG4gICAgICAgICAgICAvLyDlj6rmlLbpm4YgdGV4dC1kZWx0YSDnsbvlnovnmoTmlbDmja7vvIzov5nmmK/lrp7pmYXnmoTmlofmnKzlhoXlrrlcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFwidGV4dC1kZWx0YVwiICYmIFwidGV4dFwiIGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgdGV4dENodW5rcy5wdXNoKGRhdGEudGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8g5b+955Wl6Kej5p6Q6ZSZ6K+v77yM5Y+v6IO95piv56m66KGM5oiW5YW25LuW5qC85byPXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gIH1cblxuICAvLyDmi7zmjqXmiYDmnInmlofmnKzniYfmrrVcbiAgcmV0dXJuIHRleHRDaHVua3Muam9pbihcIlwiKTtcbn1cblxuLyoqXG4gKiDku45TU0XmtYHkuK3mlLbpm4bmiYDmnInkuovku7bmlbDmja7vvIjnlKjkuo7osIPor5XmiJbmm7TlpI3mnYLnmoTlpITnkIbvvIlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RBbGxFdmVudHNGcm9tU3RyZWFtKFxuICBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPHN0cmluZz5cbik6IFByb21pc2U8SU91dHB1dE1lc3NhZ2VbXT4ge1xuICBjb25zdCByZWFkZXIgPSBzdHJlYW0uZ2V0UmVhZGVyKCk7XG4gIGNvbnN0IGV2ZW50czogSU91dHB1dE1lc3NhZ2VbXSA9IFtdO1xuXG4gIHRyeSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICAgIGlmIChkb25lKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsaW5lcyA9IHZhbHVlLnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcImRhdGE6IFwiKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBqc29uU3RyID0gbGluZS5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShqc29uU3RyKSBhcyBJT3V0cHV0TWVzc2FnZTtcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGRhdGEpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgfVxuXG4gIHJldHVybiBldmVudHM7XG59XG4iXX0=