export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
    role: MessageRole;
    content: string;
}

export interface CompletionOptions {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface EmbeddingOptions {
    model: string;
}

export interface LLMProvider {
    getCompletion(messages: Message[], options?: CompletionOptions): Promise<string>;
    getEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]>;
} 