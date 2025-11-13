/**
 * TypeScript type definitions for AI chat completion response
 */
export interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size: 'low' | 'medium' | 'high';
    cost: {
        input_tokens_cost: number;
        output_tokens_cost: number;
        request_cost: number;
        total_cost: number;
    };
}
export interface SearchResult {
    title: string;
    url: string;
    date: string;
    last_updated: string | null;
    snippet: string;
}
export interface Message {
    role: 'assistant' | 'user' | 'system';
    content: string;
}
export interface MessageDelta {
    role: 'assistant' | 'user' | 'system';
    content: string;
}
export interface Choice {
    index: number;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call';
    message: Message;
    delta: MessageDelta;
}
export interface SearchCompletion {
    id: string;
    model: string;
    created: number;
    usage: Usage;
    citations: string[];
    search_results: SearchResult[];
    object: 'chat.completion';
    choices: Choice[];
}
