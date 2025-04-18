import { Message } from './types';

// Base tokenizer interface
export interface Tokenizer {
    countTokens(text: string): number;
    countMessageTokens(messages: Message[]): number;
}

// OpenAI tokenizer implementation
export class OpenAITokenizer implements Tokenizer {
    private readonly tokensPerChar = 0.25; // Approximate tokens per character for GPT models

    countTokens(text: string): number {
        // Simple approximation based on character count
        // This is a rough estimate - for production use, consider using tiktoken
        return Math.ceil(text.length * this.tokensPerChar);
    }

    countMessageTokens(messages: Message[]): number {
        let totalTokens = 0;
        for (const message of messages) {
            // Add tokens for role and content
            totalTokens += this.countTokens(`role: ${message.role}`);
            totalTokens += this.countTokens(`content: ${message.content}`);
            // Add tokens for message formatting
            totalTokens += 4; // Approximate tokens for message formatting
        }
        return totalTokens;
    }
}

// Gemini tokenizer implementation
export class GeminiTokenizer implements Tokenizer {
    private readonly tokensPerChar = 0.3; // Approximate tokens per character for Gemini models

    countTokens(text: string): number {
        // Simple approximation based on character count
        return Math.ceil(text.length * this.tokensPerChar);
    }

    countMessageTokens(messages: Message[]): number {
        let totalTokens = 0;
        for (const message of messages) {
            // Add tokens for role and content
            totalTokens += this.countTokens(`role: ${message.role}`);
            totalTokens += this.countTokens(`content: ${message.content}`);
            // Add tokens for message formatting
            totalTokens += 3; // Approximate tokens for message formatting
        }
        return totalTokens;
    }
}

// Ollama tokenizer implementation
export class OllamaTokenizer implements Tokenizer {
    private readonly tokensPerChar = 0.2; // Approximate tokens per character for Llama models

    countTokens(text: string): number {
        // Simple approximation based on character count
        return Math.ceil(text.length * this.tokensPerChar);
    }

    countMessageTokens(messages: Message[]): number {
        let totalTokens = 0;
        for (const message of messages) {
            // Add tokens for role and content
            totalTokens += this.countTokens(`role: ${message.role}`);
            totalTokens += this.countTokens(`content: ${message.content}`);
            // Add tokens for message formatting
            totalTokens += 2; // Approximate tokens for message formatting
        }
        return totalTokens;
    }
}

// Tokenizer factory
export class TokenizerFactory {
    private static instance: TokenizerFactory;
    private tokenizers: Map<string, Tokenizer>;

    private constructor() {
        this.tokenizers = new Map();
        this.tokenizers.set('openai', new OpenAITokenizer());
        this.tokenizers.set('gemini', new GeminiTokenizer());
        this.tokenizers.set('ollama', new OllamaTokenizer());
    }

    public static getInstance(): TokenizerFactory {
        if (!TokenizerFactory.instance) {
            TokenizerFactory.instance = new TokenizerFactory();
        }
        return TokenizerFactory.instance;
    }

    public getTokenizer(providerType: string): Tokenizer {
        const tokenizer = this.tokenizers.get(providerType);
        if (!tokenizer) {
            throw new Error(`No tokenizer found for provider type: ${providerType}`);
        }
        return tokenizer;
    }
} 