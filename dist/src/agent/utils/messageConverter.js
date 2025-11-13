"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { StepResult } from 'ai';
// import { stringify } from 'json-to-pretty-yaml';
// export function innerLoopToCompressedContent(messages: StepResult<any>[]): string {
//     // 去掉第一条用户消息
//     const slicedMsg = messages.slice(1);
//     const compressedContent = slicedMsg.reduce((prev, cur) => {
//         return `
//         ${prev}
//         <toolsCall>
//         ${stringify(cur.toolCalls)}
//         </toolsCall>
//         <toolsResponse>
//         ${stringify(cur.toolResults)}
//         </toolsResponse>
//         `
//     }, '')
//     return compressedContent;
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZUNvbnZlcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hZ2VudC91dGlscy9tZXNzYWdlQ29udmVydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW1DO0FBQ25DLG1EQUFtRDtBQUNuRCxzRkFBc0Y7QUFDdEYsbUJBQW1CO0FBQ25CLDJDQUEyQztBQUMzQyxrRUFBa0U7QUFDbEUsbUJBQW1CO0FBQ25CLGtCQUFrQjtBQUNsQixzQkFBc0I7QUFDdEIsc0NBQXNDO0FBQ3RDLHVCQUF1QjtBQUN2QiwwQkFBMEI7QUFDMUIsd0NBQXdDO0FBQ3hDLDJCQUEyQjtBQUMzQixZQUFZO0FBQ1osYUFBYTtBQUNiLGdDQUFnQztBQUNoQyxJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHsgU3RlcFJlc3VsdCB9IGZyb20gJ2FpJztcbi8vIGltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJ2pzb24tdG8tcHJldHR5LXlhbWwnO1xuLy8gZXhwb3J0IGZ1bmN0aW9uIGlubmVyTG9vcFRvQ29tcHJlc3NlZENvbnRlbnQobWVzc2FnZXM6IFN0ZXBSZXN1bHQ8YW55PltdKTogc3RyaW5nIHtcbi8vICAgICAvLyDljrvmjonnrKzkuIDmnaHnlKjmiLfmtojmga9cbi8vICAgICBjb25zdCBzbGljZWRNc2cgPSBtZXNzYWdlcy5zbGljZSgxKTtcbi8vICAgICBjb25zdCBjb21wcmVzc2VkQ29udGVudCA9IHNsaWNlZE1zZy5yZWR1Y2UoKHByZXYsIGN1cikgPT4ge1xuLy8gICAgICAgICByZXR1cm4gYFxuLy8gICAgICAgICAke3ByZXZ9XG4vLyAgICAgICAgIDx0b29sc0NhbGw+XG4vLyAgICAgICAgICR7c3RyaW5naWZ5KGN1ci50b29sQ2FsbHMpfVxuLy8gICAgICAgICA8L3Rvb2xzQ2FsbD5cbi8vICAgICAgICAgPHRvb2xzUmVzcG9uc2U+XG4vLyAgICAgICAgICR7c3RyaW5naWZ5KGN1ci50b29sUmVzdWx0cyl9XG4vLyAgICAgICAgIDwvdG9vbHNSZXNwb25zZT5cbi8vICAgICAgICAgYFxuLy8gICAgIH0sICcnKVxuLy8gICAgIHJldHVybiBjb21wcmVzc2VkQ29udGVudDtcbi8vIH0iXX0=