import { BaseService } from "./base";
import config from "config";
import { AppConfig } from "../../index";
import { SearchCompletion } from "../../types/search";
const secretConfig = config.get<AppConfig['secret']>("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}
const maxLength = 8000;
const maxReadTime = 15;
const maxRequestTime = 20;
export class LocalService extends BaseService {
    public search = async ({ query }: { query: string }) => {
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

        const data: SearchCompletion = (await response.json()) as SearchCompletion;
        const search_summary = data.choices?.[0]?.message?.content ?? "";
        // 剔除类似 [12] 这样的标注
        const processed_search_summary = (search_summary ?? '').replace(/\[\d+\]/g, '');

        return {
            success: true,
            search_results: (data.search_results ?? []).map(r => {
                return {
                    title:r.title,
                    url:r.url
                }
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
    private extractContent = (text: string): string => {
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

    public readUrl = async ({ url }: { url: string }) => {
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
        } catch (error) {
            // 捕获超时或其他错误（需区分是否为超时）
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error(`timeout`);
            }
            throw error; // 其他错误原样抛出
        } finally {
            // 清除定时器（无论成功/失败都执行）
            clearTimeout(timeoutId);
        }

    };
}
