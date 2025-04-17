import { LLMProvider } from './types';
import { OpenAIProvider } from './openai/OpenAIProvider';
import { OllamaProvider } from './ollama/OllamaProvider';
import { GeminiProvider } from './gemini/GeminiProvider';
import { LangfuseWrapper } from './LangfuseWrapper';

export type ProviderType = 'openai' | 'ollama' | 'gemini';

export class LLMProviderFactory {
    private static instance: LLMProviderFactory;
    private providers: Map<ProviderType, LLMProvider>;

    private constructor() {
        this.providers = new Map();
    }

    public static getInstance(): LLMProviderFactory {
        if (!LLMProviderFactory.instance) {
            LLMProviderFactory.instance = new LLMProviderFactory();
        }
        return LLMProviderFactory.instance;
    }

    public getProvider(type: ProviderType): LLMProvider {
        if (!this.providers.has(type)) {
            let provider: LLMProvider;
            switch (type) {
                case 'openai':
                    provider = new OpenAIProvider();
                    break;
                case 'ollama':
                    provider = new OllamaProvider();
                    break;
                case 'gemini':
                    provider = new GeminiProvider();
                    break;
                default:
                    throw new Error(`Unknown provider type: ${type}`);
            }
            this.providers.set(type, new LangfuseWrapper(provider, type));
        }
        return this.providers.get(type)!;
    }
} 