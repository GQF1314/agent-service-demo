"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSystemMessage = void 0;
exports.waitStream = waitStream;
const createSystemMessage = (content) => {
    return {
        role: "system",
        content: content,
        providerOptions: {
            openrouter: {
                cache_control: {
                    type: "ephemeral",
                },
            },
        },
    };
};
exports.createSystemMessage = createSystemMessage;
async function waitStream(stream, cb) {
    return new Promise(async (resolve, reject) => {
        const reader = stream.fullStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (value) {
                    cb(value);
                }
                if (done) {
                    break;
                }
            }
            // 等待消息发送完成
            await new Promise((resolve) => setTimeout(resolve, 300));
            resolve(null);
        }
        catch (error) {
            // 等待消息发送完成
            await new Promise((resolve) => setTimeout(resolve, 300));
            reject(error);
        }
        finally {
            // 确保释放 reader 锁
            reader.releaseLock();
            stream.fullStream.cancel();
        }
    });
}
// export const yourGuardrailMiddleware: LanguageModelV2Middleware = {
//   wrapGenerate: async ({ doGenerate }) => {
//     const { content } = await doGenerate();
//     const text = content[0].type;
//     // filtering approach, e.g. for PII or other sensitive information:
//     const cleanedText = text?.replace(/badword/g, '<REDACTED>');
//     return { text: cleanedText, ...rest };
//   },
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYWdlbnQvd29ya2Zsb3cvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZ0JBLGdDQThCQztBQTVDTSxNQUFNLG1CQUFtQixHQUFHLENBQUMsT0FBZSxFQUFzQixFQUFFO0lBQ3ZFLE9BQU87UUFDSCxJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLGVBQWUsRUFBRTtZQUNiLFVBQVUsRUFBRTtnQkFDUixhQUFhLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLFdBQVc7aUJBQ3BCO2FBQ0o7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFaVyxRQUFBLG1CQUFtQix1QkFZOUI7QUFFSyxLQUFLLFVBQVUsVUFBVSxDQUM1QixNQUFrQyxFQUNsQyxFQUF1QztJQUV2QyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDekMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUM7WUFDRCxPQUFPLElBQUksRUFBRSxDQUFDO2dCQUNWLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzVDLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1IsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNkLENBQUM7Z0JBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDUCxNQUFNO2dCQUNWLENBQUM7WUFDTCxDQUFDO1lBQ0QsV0FBVztZQUNYLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixXQUFXO1lBQ1gsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQixDQUFDO2dCQUFTLENBQUM7WUFDUCxnQkFBZ0I7WUFDaEIsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHNFQUFzRTtBQUN0RSw4Q0FBOEM7QUFDOUMsOENBQThDO0FBQzlDLG9DQUFvQztBQUNwQywwRUFBMEU7QUFDMUUsbUVBQW1FO0FBRW5FLDZDQUE2QztBQUM3QyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RyZWFtVGV4dFJlc3VsdCwgU3lzdGVtTW9kZWxNZXNzYWdlLCBUZXh0U3RyZWFtUGFydCB9IGZyb20gXCJhaVwiO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlU3lzdGVtTWVzc2FnZSA9IChjb250ZW50OiBzdHJpbmcpOiBTeXN0ZW1Nb2RlbE1lc3NhZ2UgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJvbGU6IFwic3lzdGVtXCIsXG4gICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgIHByb3ZpZGVyT3B0aW9uczoge1xuICAgICAgICAgICAgb3BlbnJvdXRlcjoge1xuICAgICAgICAgICAgICAgIGNhY2hlX2NvbnRyb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJlcGhlbWVyYWxcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRTdHJlYW0oXG4gICAgc3RyZWFtOiBTdHJlYW1UZXh0UmVzdWx0PGFueSwgYW55PixcbiAgICBjYjogKHBhcnQ6IFRleHRTdHJlYW1QYXJ0PGFueT4pID0+IHZvaWQsXG4pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBzdHJlYW0uZnVsbFN0cmVhbS5nZXRSZWFkZXIoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOetieW+hea2iOaBr+WPkemAgeWujOaIkFxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMzAwKSk7XG4gICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8g562J5b6F5raI5oGv5Y+R6YCB5a6M5oiQXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAzMDApKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAvLyDnoa7kv53ph4rmlL4gcmVhZGVyIOmUgVxuICAgICAgICAgICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICBzdHJlYW0uZnVsbFN0cmVhbS5jYW5jZWwoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBleHBvcnQgY29uc3QgeW91ckd1YXJkcmFpbE1pZGRsZXdhcmU6IExhbmd1YWdlTW9kZWxWMk1pZGRsZXdhcmUgPSB7XG4vLyAgIHdyYXBHZW5lcmF0ZTogYXN5bmMgKHsgZG9HZW5lcmF0ZSB9KSA9PiB7XG4vLyAgICAgY29uc3QgeyBjb250ZW50IH0gPSBhd2FpdCBkb0dlbmVyYXRlKCk7XG4vLyAgICAgY29uc3QgdGV4dCA9IGNvbnRlbnRbMF0udHlwZTtcbi8vICAgICAvLyBmaWx0ZXJpbmcgYXBwcm9hY2gsIGUuZy4gZm9yIFBJSSBvciBvdGhlciBzZW5zaXRpdmUgaW5mb3JtYXRpb246XG4vLyAgICAgY29uc3QgY2xlYW5lZFRleHQgPSB0ZXh0Py5yZXBsYWNlKC9iYWR3b3JkL2csICc8UkVEQUNURUQ+Jyk7XG5cbi8vICAgICByZXR1cm4geyB0ZXh0OiBjbGVhbmVkVGV4dCwgLi4ucmVzdCB9O1xuLy8gICB9LFxuIl19