"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalService = void 0;
const base_1 = require("./base");
const config_1 = __importDefault(require("config"));
const secretConfig = config_1.default.get("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}
const maxLength = 8000;
const maxReadTime = 15;
const maxRequestTime = 20;
class LocalService extends base_1.BaseService {
    search = async ({ query }) => {
        // Set up the API endpoint and headers
        const url = "https://api.perplexity.ai/chat/completions";
        const headers = {
            "Authorization": `Bearer ${secretConfig?.PERPLEXITY_API_KEY}`, // Replace with your actual API key
            "Content-Type": "application/json",
        };
        // Define the request payload
        const payload = {
            model: "sonar",
            messages: [
                { role: "user", content: query },
            ],
        };
        // Make the API call
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
        const data = (await response.json());
        const search_summary = data.choices?.[0]?.message?.content ?? "";
        // 剔除类似 [12] 这样的标注
        const processed_search_summary = (search_summary ?? '').replace(/\[\d+\]/g, '');
        return {
            success: true,
            search_results: (data.search_results ?? []).map(r => {
                return {
                    title: r.title,
                    url: r.url
                };
            }),
            //不给前端展示数据，只用于后续的工具调用
            search_summary: '',
            modelVisibleData: {
                data: {
                    search_summary: processed_search_summary,
                },
            },
        };
    };
    extractContent = (text) => {
        const markdownStart = "Markdown Content:";
        const linksStart = "Links/Buttons:";
        const markdownIdx = text.indexOf(markdownStart);
        const linksIdx = text.indexOf(linksStart);
        // If both markers exist, extract content between them
        if (markdownIdx !== -1 && linksIdx !== -1) {
            const start = markdownIdx + markdownStart.length;
            const end = linksIdx;
            const content = text.slice(start, end).trim();
            return content;
        }
        // If only Markdown Content exists, extract from it to the end
        if (markdownIdx !== -1 && linksIdx === -1) {
            const start = markdownIdx + markdownStart.length;
            const content = text.slice(start).trim();
            return content;
        }
        // If only Links/Buttons exists, extract from beginning to it
        if (markdownIdx === -1 && linksIdx !== -1) {
            const content = text.slice(0, linksIdx).trim();
            return content;
        }
        // If neither exists, return the whole text
        return text.trim();
    };
    readUrl = async ({ url }) => {
        // Use Jina AI API to read URL content
        const jinaUrl = `https://r.jina.ai/${url}`;
        // 创建 AbortController 用于终止请求
        const controller = new AbortController();
        const { signal } = controller;
        // 设置定时器，超时后终止请求
        const timeoutId = setTimeout(() => {
            controller.abort(); // 触发请求终止
        }, maxRequestTime * 1000);
        const headers = {
            "Authorization": `Bearer ${secretConfig?.JINA_API_KEY}`,
            "X-Base": "final",
            "X-Remove-Selector": "header, footer, a, img, button",
            "X-Retain-Images": "none",
            "X-Retain-Links": "gpt-oss",
            "X-Timeout": maxReadTime.toString(),
        };
        try {
            const response = await fetch(jinaUrl, {
                method: "GET",
                headers,
                signal,
            });
            const textData = await response.text();
            // Extract content between markers using the same logic as the Go implementation
            const extractedContent = this.extractContent(textData);
            return {
                success: true,
                content: extractedContent.slice(0, maxLength),
            };
        }
        catch (error) {
            // 捕获超时或其他错误（需区分是否为超时）
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error(`timeout`);
            }
            throw error; // 其他错误原样抛出
        }
        finally {
            // 清除定时器（无论成功/失败都执行）
            clearTimeout(timeoutId);
        }
    };
}
exports.LocalService = LocalService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FjdHVhbC9sb2NhbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUNBQXFDO0FBQ3JDLG9EQUE0QjtBQUc1QixNQUFNLFlBQVksR0FBRyxnQkFBTSxDQUFDLEdBQUcsQ0FBc0IsUUFBUSxDQUFDLENBQUM7QUFDL0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBYSxZQUFhLFNBQVEsa0JBQVc7SUFDbEMsTUFBTSxHQUFHLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBcUIsRUFBRSxFQUFFO1FBQ25ELHNDQUFzQztRQUN0QyxNQUFNLEdBQUcsR0FBRyw0Q0FBNEMsQ0FBQztRQUN6RCxNQUFNLE9BQU8sR0FBRztZQUNaLGVBQWUsRUFBRSxVQUFVLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxFQUFFLG1DQUFtQztZQUNsRyxjQUFjLEVBQUUsa0JBQWtCO1NBQ3JDLENBQUM7UUFFRiw2QkFBNkI7UUFDN0IsTUFBTSxPQUFPLEdBQUc7WUFDWixLQUFLLEVBQUUsT0FBTztZQUNkLFFBQVEsRUFBRTtnQkFDTixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTthQUNuQztTQUNKLENBQUM7UUFFRixvQkFBb0I7UUFDcEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQzlCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9B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QUNwQixZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUVMLENBQUMsQ0FBQztDQUNMO0FBN0hELG9DQTZIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VTZXJ2aWNlIH0gZnJvbSBcIi4vYmFzZVwiO1xuaW1wb3J0IGNvbmZpZyBmcm9tIFwiY29uZmlnXCI7XG5pbXBvcnQgeyBBcHBDb25maWcgfSBmcm9tIFwiLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7IFNlYXJjaENvbXBsZXRpb24gfSBmcm9tIFwiLi4vLi4vdHlwZXMvc2VhcmNoXCI7XG5jb25zdCBzZWNyZXRDb25maWcgPSBjb25maWcuZ2V0PEFwcENvbmZpZ1snc2VjcmV0J10+KFwic2VjcmV0XCIpO1xuaWYgKCFzZWNyZXRDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWNyZXRDb25maWcgaXMgbm90IHNldFwiKTtcbn1cbmNvbnN0IG1heExlbmd0aCA9IDgwMDA7XG5jb25zdCBtYXhSZWFkVGltZSA9IDE1O1xuY29uc3QgbWF4UmVxdWVzdFRpbWUgPSAyMDtcbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZpY2UgZXh0ZW5kcyBCYXNlU2VydmljZSB7XG4gICAgcHVibGljIHNlYXJjaCA9IGFzeW5jICh7IHF1ZXJ5IH06IHsgcXVlcnk6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIC8vIFNldCB1cCB0aGUgQVBJIGVuZHBvaW50IGFuZCBoZWFkZXJzXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9hcGkucGVycGxleGl0eS5haS9jaGF0L2NvbXBsZXRpb25zXCI7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke3NlY3JldENvbmZpZz8uUEVSUExFWElUWV9BUElfS0VZfWAsIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFjdHVhbCBBUEkga2V5XG4gICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZWZpbmUgdGhlIHJlcXVlc3QgcGF5bG9hZFxuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgbW9kZWw6IFwic29uYXJcIixcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcXVlcnkgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTWFrZSB0aGUgQVBJIGNhbGxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRhdGE6IFNlYXJjaENvbXBsZXRpb24gPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyBTZWFyY2hDb21wbGV0aW9uO1xuICAgICAgICBjb25zdCBzZWFyY2hfc3VtbWFyeSA9IGRhdGEuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50ID8/IFwiXCI7XG4gICAgICAgIC8vIOWJlOmZpOexu+S8vCBbMTJdIOi/meagt+eahOagh+azqFxuICAgICAgICBjb25zdCBwcm9jZXNzZWRfc2VhcmNoX3N1bW1hcnkgPSAoc2VhcmNoX3N1bW1hcnkgPz8gJycpLnJlcGxhY2UoL1xcW1xcZCtcXF0vZywgJycpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgc2VhcmNoX3Jlc3VsdHM6IChkYXRhLnNlYXJjaF9yZXN1bHRzID8/IFtdKS5tYXAociA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ci50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgdXJsOnIudXJsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAvL+S4jee7meWJjeerr+WxleekuuaVsOaNru+8jOWPqueUqOS6juWQjue7reeahOW3peWFt+iwg+eUqFxuICAgICAgICAgICAgc2VhcmNoX3N1bW1hcnk6ICcnLFxuICAgICAgICAgICAgbW9kZWxWaXNpYmxlRGF0YToge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoX3N1bW1hcnk6IHByb2Nlc3NlZF9zZWFyY2hfc3VtbWFyeSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHByaXZhdGUgZXh0cmFjdENvbnRlbnQgPSAodGV4dDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgY29uc3QgbWFya2Rvd25TdGFydCA9IFwiTWFya2Rvd24gQ29udGVudDpcIjtcbiAgICAgICAgY29uc3QgbGlua3NTdGFydCA9IFwiTGlua3MvQnV0dG9uczpcIjtcblxuICAgICAgICBjb25zdCBtYXJrZG93bklkeCA9IHRleHQuaW5kZXhPZihtYXJrZG93blN0YXJ0KTtcbiAgICAgICAgY29uc3QgbGlua3NJZHggPSB0ZXh0LmluZGV4T2YobGlua3NTdGFydCk7XG5cbiAgICAgICAgLy8gSWYgYm90aCBtYXJrZXJzIGV4aXN0LCBleHRyYWN0IGNvbnRlbnQgYmV0d2VlbiB0aGVtXG4gICAgICAgIGlmIChtYXJrZG93bklkeCAhPT0gLTEgJiYgbGlua3NJZHggIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IG1hcmtkb3duSWR4ICsgbWFya2Rvd25TdGFydC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBsaW5rc0lkeDtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpLnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgb25seSBNYXJrZG93biBDb250ZW50IGV4aXN0cywgZXh0cmFjdCBmcm9tIGl0IHRvIHRoZSBlbmRcbiAgICAgICAgaWYgKG1hcmtkb3duSWR4ICE9PSAtMSAmJiBsaW5rc0lkeCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gbWFya2Rvd25JZHggKyBtYXJrZG93blN0YXJ0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0LnNsaWNlKHN0YXJ0KS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG9ubHkgTGlua3MvQnV0dG9ucyBleGlzdHMsIGV4dHJhY3QgZnJvbSBiZWdpbm5pbmcgdG8gaXRcbiAgICAgICAgaWYgKG1hcmtkb3duSWR4ID09PSAtMSAmJiBsaW5rc0lkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0LnNsaWNlKDAsIGxpbmtzSWR4KS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG5laXRoZXIgZXhpc3RzLCByZXR1cm4gdGhlIHdob2xlIHRleHRcbiAgICAgICAgcmV0dXJuIHRleHQudHJpbSgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVhZFVybCA9IGFzeW5jICh7IHVybCB9OiB7IHVybDogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgLy8gVXNlIEppbmEgQUkgQVBJIHRvIHJlYWQgVVJMIGNvbnRlbnRcbiAgICAgICAgY29uc3QgamluYVVybCA9IGBodHRwczovL3IuamluYS5haS8ke3VybH1gO1xuICAgICAgICAvLyDliJvlu7ogQWJvcnRDb250cm9sbGVyIOeUqOS6jue7iOatouivt+axglxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB7IHNpZ25hbCB9ID0gY29udHJvbGxlcjtcblxuICAgICAgICAvLyDorr7nva7lrprml7blmajvvIzotoXml7blkI7nu4jmraLor7fmsYJcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KCk7IC8vIOinpuWPkeivt+axgue7iOatolxuICAgICAgICB9LCBtYXhSZXF1ZXN0VGltZSAqIDEwMDApO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtzZWNyZXRDb25maWc/LkpJTkFfQVBJX0tFWX1gLFxuICAgICAgICAgICAgXCJYLUJhc2VcIjogXCJmaW5hbFwiLFxuICAgICAgICAgICAgXCJYLVJlbW92ZS1TZWxlY3RvclwiOiBcImhlYWRlciwgZm9vdGVyLCBhLCBpbWcsIGJ1dHRvblwiLFxuICAgICAgICAgICAgXCJYLVJldGFpbi1JbWFnZXNcIjogXCJub25lXCIsXG4gICAgICAgICAgICBcIlgtUmV0YWluLUxpbmtzXCI6IFwiZ3B0LW9zc1wiLFxuICAgICAgICAgICAgXCJYLVRpbWVvdXRcIjogbWF4UmVhZFRpbWUudG9TdHJpbmcoKSxcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goamluYVVybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0ZXh0RGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcblxuICAgICAgICAgICAgLy8gRXh0cmFjdCBjb250ZW50IGJldHdlZW4gbWFya2VycyB1c2luZyB0aGUgc2FtZSBsb2dpYyBhcyB0aGUgR28gaW1wbGVtZW50YXRpb25cbiAgICAgICAgICAgIGNvbnN0IGV4dHJhY3RlZENvbnRlbnQgPSB0aGlzLmV4dHJhY3RDb250ZW50KHRleHREYXRhKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGV4dHJhY3RlZENvbnRlbnQuc2xpY2UoMCwgbWF4TGVuZ3RoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyDmjZXojrfotoXml7bmiJblhbbku5bplJnor6/vvIjpnIDljLrliIbmmK/lkKbkuLrotoXml7bvvIlcbiAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRpbWVvdXRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycm9yOyAvLyDlhbbku5bplJnor6/ljp/moLfmipvlh7pcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIC8vIOa4hemZpOWumuaXtuWZqO+8iOaXoOiuuuaIkOWKny/lpLHotKXpg73miafooYzvvIlcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG5cbiAgICB9O1xufVxuIl19