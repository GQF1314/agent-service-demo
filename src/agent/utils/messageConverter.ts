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