import { IOutputMessage } from "../agent/types/output-message";

/**
 * 从SSE流中收集所有文本内容
 * 阻塞等待直到流结束，然后返回拼接后的文本
 */
export async function collectTextFromStream(
  stream: ReadableStream<string>
): Promise<string> {
  const reader = stream.getReader();
  const textChunks: string[] = [];

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
            const data = JSON.parse(jsonStr) as IOutputMessage;

            // 只收集 text-delta 类型的数据，这是实际的文本内容
            if (data.type === "text-delta" && "text" in data) {
              textChunks.push(data.text);
            }
          } catch (e) {
            // 忽略解析错误，可能是空行或其他格式
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // 拼接所有文本片段
  return textChunks.join("");
}

/**
 * 从SSE流中收集所有事件数据（用于调试或更复杂的处理）
 */
export async function collectAllEventsFromStream(
  stream: ReadableStream<string>
): Promise<IOutputMessage[]> {
  const reader = stream.getReader();
  const events: IOutputMessage[] = [];

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
            const data = JSON.parse(jsonStr) as IOutputMessage;
            events.push(data);
          } catch (e) {
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return events;
}
