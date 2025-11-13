import { StreamTextResult, SystemModelMessage, TextStreamPart } from "ai";

export const createSystemMessage = (content: string): SystemModelMessage => {
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

export async function waitStream(
    stream: StreamTextResult<any, any>,
    cb: (part: TextStreamPart<any>) => void,
) {
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
        } catch (error) {
            // 等待消息发送完成
            await new Promise((resolve) => setTimeout(resolve, 300));
            reject(error);
        } finally {
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
